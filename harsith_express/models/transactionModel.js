const db = require("../database.js");

const client = db;

const TransactionModel = {
  create: async (
    transactionData,
  ) => {
    let id = 0;
    const count = await client.query(
      "SELECT COUNT(*) FROM transactions",
    );
    if (count.rows !== undefined) {
      id = count.rows[0]["COUNT(*)"] + 1;
    }

    const newTransaction = {
      ...transactionData,
      createdAt: new Date(),
      id,
    };

    await client.query(
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

  findById: async (id) => {
    const transactions = await client.query(
      "SELECT * FROM transactions WHERE id = ?",
      [id],
    );
    if (transactions.rows == undefined) {
      throw new Error("Account not found");
    }

    return transactions.rows.length > 0 ? transactions.rows[0] : undefined;
  },

  findByUserId: async (userId) => {
    const transactions = await client.query(
      "SELECT * FROM transactions WHERE userId = ?",
      [userId],
    );

    if (transactions.rows == undefined) {
      throw new Error("Account not found");
    }

    return transactions.rows;
  },

  findByAccountId: async (accountId) => {
    const transactions = await client.query(
      "SELECT * FROM transactions WHERE fromId = ?",
      [accountId],
    );
    if (transactions.rows == undefined) {
      throw new Error("Account not found");
    }

    return transactions.rows;
  },
};

module.exports = { TransactionModel };
