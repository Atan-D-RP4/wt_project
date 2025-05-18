// File: controllers/accountController.ts
// @ts-tpes="npm:@types/node"
import { Request, Response } from "npm:express@^4.21.2";
import { AccountModel } from "../models/account.ts";
import { TransactionModel } from "../models/transaction.ts";

export const accountController = {
  createAccount: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id; // From auth middleware
      const { type } = req.body;

      console.log("Creating an account");
      if (!type) {
        console.log("Type are required");
        return res.status(400).json({ error: "Name and type are required" });
      }

      const account = await AccountModel.create({
        userId,
        type,
        balance: 1000.0,
      });
      console.log("Account created:", account);

      res.status(201).json({ account });
    } catch (error) {
      console.error("Create account error:", error);
      res.status(500).json({
        error: "Server error creating account",
        details: (error as Error).message,
      });
    }
  },

  getAllAccounts: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id; // From auth middleware
      const accounts = await AccountModel.findByUserId(userId);

      if (!accounts || accounts.length === 0) {
        return res.status(200).json({ accounts: [] });
      }

      res.status(200).json({ accounts });
    } catch (error) {
      console.error("Get accounts error:", error);
      res.status(500).json({
        error: "Server error retrieving accounts",
        details: (error as Error).message,
      });
    }
  },

  getAccount: async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const userId = (req as any).user.id; // From auth middleware

      if (!accountId) {
        return res.status(400).json({ error: "Account ID is required" });
      }

      const account = await AccountModel.findById(accountId);

      // Check if account exists and belongs to user
      if (!account || account.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }

      res.status(200).json({ account });
    } catch (error) {
      console.error("Get account error:", error);
      res.status(500).json({
        error: "Server error retrieving account",
        details: (error as Error).message,
      });
    }
  },

  getTransactions: async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const userId = (req as any).user.id; // From auth middleware

      if (!accountId) {
        return res.status(400).json({ error: "Account ID is required" });
      }

      const account = await AccountModel.findById(accountId);

      // Check if account exists and belongs to user
      if (!account || account.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }

      const transactions = await AccountModel.findTransactions(accountId);

      res.status(200).json({ transactions });
    } catch (error) {
      console.error("Get account transactions error:", error);
      res.status(500).json({
        error: "Server error retrieving account transactions",
        details: (error as Error).message,
      });
    }
  },

  deposit: async (req: Request, res: Response) => {
    const { accountId } = req.params;
    const { amount } = req.body;
    const userId = (req as any).user.id; // From auth middleware
    console.log("Deposit request:", { accountId, amount });
    if (!accountId || !amount) {
      return res.status(400).json({
        error: "Account ID and amount are required",
      });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    try {
      const account = await AccountModel.findById(accountId);
      // Check if account exists and belongs to user
      if (!account || account.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }
      if (account.balance + amount < 0) {
        return res.status(400).json({ error: "Insufficient funds" });
      }
      const updatedAccount = await AccountModel.updateBalance(
        accountId,
        amount,
      );
      if (!updatedAccount) {
        return res.status(404).json({ error: "Account not found" });
      }
      const transaction = await TransactionModel.create({
        fromId: accountId,
        toId: accountId,
        type: "deposit",
        amount,
        description: `Deposit of ${amount} to account ${accountId}`,
        balance: updatedAccount.balance,
      });
      if (!transaction) {
        return res.status(500).json({ error: "Transaction creation failed" });
      }
      res.status(200).json({
        message: "Deposit successful",
        account: updatedAccount,
        transaction,
      });
    } catch (error) {
      console.error("Deposit error:", error);
      res.status(500).json({
        error: "Server error processing deposit",
        details: (error as Error).message,
      });
    }
  },
};
