// This is a simple in-memory model for demonstration
// In a real application, you'd use a database

import db from "../database.ts";

export enum AccountType {
  Checking = "checking",
  Savings = "savings",
  Both = "both",
}

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  accountNumber: string;
  balance: number;
  createdAt: Date;
}

const client = db.getClient();

export const AccountModel = {
  create: async (
    accountData: Omit<Account, "id" | "createdAt">,
  ): Promise<Account> => {
    const newAccount: Account = {
      ...accountData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Check if user already exists
    const accounts = await client.execute(
      "SELECT * FROM accounts WHERE id = ?",
      [newAccount.id],
    );

    if (accounts.rows == undefined) {
      console.log("SQL Query Error");
      return newAccount;
    }
    if (accounts.rows.length > 0) {
      console.log("Account already exists");
      return accounts.rows[0] as Account;
    }

    await client.execute(
      "INSERT INTO accounts (id, userId, type, accountNumber, balance, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [
        newAccount.id,
        newAccount.userId,
        newAccount.type,
        newAccount.accountNumber,
        newAccount.balance,
        newAccount.createdAt,
      ],
    );

    return newAccount;
  },

  findById: async (id: string): Promise<Account | undefined> => {
    const accounts = await client.execute(
      "SELECT * FROM accounts WHERE id = ?",
      [id],
    );

    if (accounts.rows == undefined) {
      throw new Error("Account not found");
    }

    return accounts.rows.length > 0 ? accounts.rows[0] : undefined;
  },

  findByUserId: async (userId: string): Promise<Account[]> => {
    const accounts = await client.execute(
      "SELECT * FROM accounts WHERE userId = ?",
      [userId],
    );

    if (accounts.rows == undefined) {
      return [];
    }

    return accounts.rows as Account[];
  },

  updateBalance: async (
    id: string,
    newBalance: number,
  ): Promise<Account | undefined> => {
    await client.execute(
      "UPDATE accounts SET balance = ? WHERE id = ?",
      [newBalance, id],
    );

    return AccountModel.findById(id);
  },
};
