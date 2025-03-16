// File: models/account.ts

import db from "../database.ts";
import { Transaction } from "./transaction.ts";

export enum AccountType {
  Checking = "checking",
  Savings = "savings",
  Both = "both",
}

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  balance: number;
  createdAt: Date;
}

const client = db.getClient();

export const AccountModel = {
  create: async (
    accountData: Omit<Account, "id" | "createdAt">,
  ): Promise<Account | undefined> => {
    try {
      const count = await client.execute(
        "SELECT COUNT(*) FROM accounts",
      );
      if (count.rows == undefined) {
        throw new Error("SQL Query Error");
      }
      const id = count.rows[0]["COUNT(*)"] + 1;

      const newAccount: Account = {
        ...accountData,
        id,
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
        "INSERT INTO accounts (id, userId, type, balance, createdAt) VALUES (?, ?, ?, ?, ?)",
        [
          newAccount.id,
          newAccount.userId,
          newAccount.type,
          newAccount.balance,
          newAccount.createdAt,
        ],
      );
      console.log("Account created");

      return newAccount;
    } catch (error) {
      console.error("Create account error:", error);
      throw new Error("Server error creating account");
    }
  },

  listAll: async (): Promise<Account[]> => {
    const accounts = await client.execute("SELECT * FROM accounts");

    if (accounts.rows == undefined) {
      return [];
    }

    return accounts.rows as Account[];
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

  findTransactions: async (id: string): Promise<Transaction[]> => {
    const transactions = await client.execute(
      "SELECT * FROM transactions WHERE fromId = ?",
      [id],
    );

    if (transactions.rows == undefined) {
      return [];
    }

    return transactions.rows as Transaction[];
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
