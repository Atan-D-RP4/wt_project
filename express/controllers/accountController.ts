import { Request, Response } from "npm:express@^4.21.2";
import { AccountModel } from "../models/account.ts";
import { TransactionModel } from "../models/transaction.ts";

export const accountController = {
  getAccount: async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const userId = (req as any).user.id; // From auth middleware

      const account = await AccountModel.findById(accountId);

      // Check if account exists and belongs to user
      if (!account || account.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }

      res.status(200).json({ account });
    } catch (error) {
      console.error("Get account error:", error);
      res.status(500).json({ error: "Server error retrieving account" });
    }
  },

  getTransactions: async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const userId = (req as any).user.id; // From auth middleware

      const account = await AccountModel.findById(accountId);

      // Check if account exists and belongs to user
      if (!account || account.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }

      const transactions = await TransactionModel.findByAccountId(accountId);

      res.status(200).json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Server error retrieving transactions" });
    }
  },

  createTransaction: async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const { type, amount, description } = req.body;
      const userId = (req as any).user.id; // From auth middleware

      // Validate input
      if (!type || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid transaction details" });
      }

      const account = await AccountModel.findById(accountId);

      // Check if account exists and belongs to user
      if (!account || account.userId !== userId) {
        return res.status(404).json({ error: "Account not found" });
      }

      // Handle deposits and withdrawals
      if (type === "withdrawal" && account.balance < amount) {
        return res.status(400).json({ error: "Insufficient funds" });
      }

      // Update account balance
      const newBalance = type === "deposit"
        ? account.balance + amount
        : account.balance - amount;

      await AccountModel.updateBalance(accountId, newBalance);

      // Create transaction record
      const transaction = await TransactionModel.create({
        accountId,
        type,
        amount,
        description,
        balance: newBalance,
        date: new Date(),
      });

      res.status(201).json({
        message: "Transaction completed successfully",
        transaction,
        newBalance,
      });
    } catch (error) {
      console.error("Transaction error:", error);
      res.status(500).json({ error: "Server error processing transaction" });
    }
  },

  createTransfer: async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params; // Sender account
      const { toAccountId, amount, description } = req.body;
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

      // Update sender balance
      const newSenderBalance = senderAccount.balance - amount;
      await AccountModel.updateBalance(accountId, newSenderBalance);

      // Update receiver balance
      const newReceiverBalance = receiverAccount.balance + amount;
      await AccountModel.updateBalance(toAccountId, newReceiverBalance);

      // Create transaction record for sender (transfer out)
      const senderTransaction = await TransactionModel.create({
        accountId,
        type: "transfer",
        amount,
        description: description || `Transfer to account ${toAccountId}`,
        balance: newSenderBalance,
        date: new Date(),
        to_accountId: toAccountId,
      });

      // Create transaction record for receiver (transfer in)
      const receiverTransaction = await TransactionModel.create({
        accountId: toAccountId,
        type: "deposit", // or "transfer" based on your business logic
        amount,
        description: description || `Transfer from account ${accountId}`,
        balance: newReceiverBalance,
        date: new Date(),
      });

      res.status(201).json({
        message: "Transfer completed successfully",
        senderTransaction,
        receiverTransaction,
        newSenderBalance,
        newReceiverBalance,
      });
    } catch (error) {
      console.error("Transfer error:", error);
      res.status(500).json({ error: "Server error processing transfer" });
    }
  },
};
