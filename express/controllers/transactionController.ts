// File: controllers/transactionController.ts
// @ts-tpes="npm:@types/node"
import { Request, Response } from "npm:express@^4.21.2";
import { AccountModel } from "../models/account.ts";
import { TransactionModel } from "../models/transaction.ts";
import db from "../database.ts";

export const accountController = {
  getTransactions: async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      // deno-lint-ignore no-explicit-any
      const userId = (req as any).user.id; // From auth middleware

      if (!accountId) {
        return res.status(400).json({ error: "Account ID is required" });
      }

      const account = await AccountModel.findById(accountId);

      // Check if account exists and belongs to user
      if (!account || account.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }

      const transactions = await TransactionModel.findByAccountId(accountId);

      res.status(200).json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({
        error: "Server error retrieving transactions",
        details: (error as Error).message,
      });
    }
  },

  getTransactionHistory: async (req: Request, res: Response) => {
    const client = db.getClient();
    try {
      const userId = (req as any).user.id;
      const transactions = await client.query(
        `SELECT * FROM transactions
       WHERE accountId IN (SELECT id FROM accounts WHERE userId = ?)
       AND type = 'transfer'`,
        [userId],
      );
      res.json({ transactions });
    } catch (error) {
      // Handle error
      console.error("Transaction history error:", error);
    }
  },

  createTransaction: async (req: Request, res: Response) => {
    const client = db.getClient();
    try {
      const { accountId } = req.params; // Sender account
      const { toAccountId, amount, description } = req.body;
      // deno-lint-ignore no-explicit-any
      const userId = (req as any).user.id; // From auth middleware

      // Validate input
      if (!toAccountId || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid transfer details" });
      }

      // Get sender account and check ownership
      const senderAccount = await AccountModel.findById(accountId);
      if (!senderAccount || senderAccount.userId !== userId) {
        return res.status(404).json({ error: "Sender account not found" });
      }

      // Get receiver account
      const receiverAccount = await AccountModel.findById(toAccountId);
      if (!receiverAccount) {
        return res.status(404).json({ error: "Receiver account not found" });
      }

      // Check for sufficient funds
      if (senderAccount.balance < amount) {
        return res.status(400).json({
          error: "Insufficient funds for transfer",
        });
      }

      client.execute("START TRANSACTION");
      // Update sender balance
      const newSenderBalance = senderAccount.balance - amount;
      await AccountModel.updateBalance(accountId, newSenderBalance);

      // Update receiver balance
      const newReceiverBalance = receiverAccount.balance + amount;
      await AccountModel.updateBalance(toAccountId, newReceiverBalance);

      // Create a new transaction
      const Transaction = await TransactionModel.create({
        fromId: accountId,
        toId: toAccountId,
        type: "transfer",
        amount,
        description,
        balance: newSenderBalance,
      });

      res.status(201).json({
        message: "Transfer completed successfully",
        Transaction,
        newSenderBalance,
        newReceiverBalance,
      });
    } catch (error) {
      client.execute("ROLLBACK");
      console.error("Transfer error:", error);
      res.status(500).json({ error: "Server error processing transfer" });
    }
  },
};
