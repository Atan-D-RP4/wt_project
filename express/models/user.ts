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
  id: 'admin-id',
  fullName: 'Admin User',
  email: 'admin@gmail.com',
  phone: '123-456-7890',
  address: '123 Admin St',
  city: 'Adminville',
  state: 'CA',
  zipCode: '12345',
  username: 'admin',
  password: 'password',
  createdAt: new Date(),
  accountType: AccountType.Both,
}

// In-memory storage
const users: User[] = [admin];

export const UserModel = {
  create: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const type = userData.accountType as AccountType;
    console.log(type);
    const newUser: User = {
      ...userData,
      accountType: type,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Create accounts based on accountType
    AccountModel.create({
      userId: newUser.id,
      type: userData.accountType,
      balance: 0,
      accountNumber: crypto.randomUUID(),
    });

    users.push(newUser);
    return newUser;
  },

  findByEmail: async (email: string): Promise<User | undefined> => {
    return users.find(user => user.email === email);
  },

  findByUsername: async (username: string): Promise<User | undefined> => {
    console.log(users);
    return users.find(user => user.username === username);
  },

  findById: async (id: string): Promise<User | undefined> => {
    return users.find(user => user.id === id);
  }
};
