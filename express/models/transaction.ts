// File: models/transaction.ts

import db from "../database.ts";

export enum TransactionType {
  Deposit = "deposit",
  Withdrawal = "withdrawal",
  Transfer = "transfer",
}

export interface Transaction {
  id: string;
  fromId: string;
  toId: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  description: string;
  balance: number;
  createdAt: Date;
}

// In-memory storage
const client = db.getClient();

export const TransactionModel = {
  create: async (
    transactionData: Omit<Transaction, "id" | "createdAt">,
  ): Promise<Transaction> => {
    let id = 0;
    const count = await client.execute(
      "SELECT COUNT(*) FROM transactions",
    );
    if (count.rows !== undefined) {
      id = count.rows[0]["COUNT(*)"] + 1;
    }

    const newTransaction: Transaction = {
      ...transactionData,
      createdAt: new Date(),
      id: String(id),
    };

    await client.execute(
      "INSERT INTO transactions (id, toId, fromId, type, amount, description, balance, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        newTransaction.id,
        newTransaction.fromId,
        newTransaction.toId,
        newTransaction.type,
        newTransaction.amount,
        newTransaction.description,
        newTransaction.balance,
        newTransaction.createdAt,
      ],
    );
    return newTransaction;
  },

  findById: async (id: string): Promise<Transaction | undefined> => {
    const transactions = await client.execute(
      "SELECT * FROM transactions WHERE id = ?",
      [id],
    );
    if (transactions.rows == undefined) {
      throw new Error("Account not found");
    }

    return transactions.rows.length > 0 ? transactions.rows[0] : undefined;
  },

  findByUserId: async (userId: string): Promise<Transaction[]> => {
    const transactions = await client.execute(
      "SELECT * FROM transactions WHERE userId = ?",
      [userId],
    );

    if (transactions.rows == undefined) {
      throw new Error("Account not found");
    }

    return transactions.rows as Transaction[];
  },

  findByAccountId: async (accountId: string): Promise<Transaction[]> => {
    const transactions = await client.execute(
      "SELECT * FROM transactions WHERE fromId = ?",
      [accountId],
    );
    if (transactions.rows == undefined) {
      throw new Error("Account not found");
    }

    return transactions.rows as Transaction[];
  },
};
