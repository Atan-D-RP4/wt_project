// This is a simple in-memory model for demonstration
// In a real application, you'd use a database

import { AccountModel, AccountType } from "./account.ts";

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

const admin = {
  id: "admin-id",
  fullName: "Admin User",
  email: "admin@gmail.com",
  phone: "123-456-7890",
  address: "123 Admin St",
  city: "Adminville",
  state: "CA",
  zipCode: "12345",
  username: "admin",
  password: "password",
  createdAt: new Date(),
  accountType: AccountType.Both,
};

// In-memory storage
export const users: User[] = [admin];

export const UserModel = {
  create: async (userData: Omit<User, "id" | "createdAt">): Promise<User> => {
    const newUser: User = {
      ...userData,
      accountType: userData.accountType as AccountType,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Add user to users array if user.id not in users
    if (!users.find((user) => user.id === newUser.id)) {
      users.push(newUser);
    }
    client.execute(
      `INSERT INTO users (id, fullName, email, phone, address, city, state, zipCode, username, password, createdAt, accountType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    return newUser;
  },

  findByEmail: async (email: string): Promise<User | undefined> => {
    return users.find((user) => user.email === email);
  },

  findByUsername: async (username: string): Promise<User | undefined> => {
    console.log(users);
    return users.find((user) => user.username === username);
  },

  findById: async (id: string): Promise<User | undefined> => {
    return users.find((user) => user.id === id);
  },
};
