// File: models/user.ts
// This is a simple in-memory model for demonstration
// In a real application, you'd use a database

import { AccountModel, AccountType } from "./account.ts";
import db from "../database.ts";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  username: string;
  password: string;
  createdAt: Date;
  accountType: AccountType;
}

const client = db.getClient();

export const UserModel = {
  create: async (userData: Omit<User, "id" | "createdAt">): Promise<User> => {
    // Check if user already exists
    const users = await client.execute(
      "SELECT * FROM users WHERE email = ? or username = ?",
      [
        userData.email,
        userData.username,
      ],
    );

    if (users.rows == undefined) {
      console.log("SQL Query Error");
      throw new Error("SQL Query Error");
    }
    if (users.rows.length > 0) {
      console.log("User already exists");
      return users.rows[0] as User;
    }

    let id = 0;
    const count = await client.query(
      "SELECT COUNT(*) FROM users",
    );
    if (count.rows !== undefined) {
      id = count.rows[0]["COUNT(*)"] + 1;
    }
    const newUser: User = {
      ...userData,
      accountType: userData.accountType as AccountType,
      id: String(id),
      createdAt: new Date(),
    };

    await client.execute(
      "INSERT INTO users (id, fullName, email, phone, address, city, state, zipCode, username, password, createdAt, accountType) \
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        newUser.id,
        newUser.fullName,
        newUser.email,
        newUser.phone,
        newUser.address,
        newUser.city,
        newUser.state,
        newUser.zipCode,
        newUser.username,
        newUser.password,
        newUser.createdAt,
        newUser.accountType,
      ],
    );

    // Add an account for the user
    await AccountModel.create({
      userId: newUser.id,
      type: newUser.accountType,
      balance: 1000.0,
    });

    return newUser;
  },

  findByEmail: async (email: string): Promise<User | undefined> => {
    const users = await client.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.rows == undefined) {
      return undefined;
    }

    return users.rows.length > 0 ? users.rows[0] : undefined;
  },

  findByUsername: async (username: string): Promise<User | undefined> => {
    const users = await client.execute(
      "SELECT * FROM users WHERE username = ?",
      [
        username,
      ],
    );
    if (users.rows == undefined) {
      return undefined;
    }
    return users.rows[0] as User;
  },

  findById: async (id: string): Promise<User | undefined> => {
    const users = await client.execute("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    if (users.rows == undefined) {
      return undefined;
    }
    return users.rows[0] as User;
  },
};
