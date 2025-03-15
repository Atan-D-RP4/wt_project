// File: accounts.ts
import express from "express";
import { accountController } from "../controllers/accountController.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = express.Router();

// Apply auth middleware to all account routes
router.use(async (req, res, next) => {
  await authMiddleware(req, res, next);
});

// Get account details
router.get("/:accountId", async (req, res) => {
  await accountController.getAccount(req, res);
});

// Get account transactions
router.get("/:accountId/transactions", async (req, res) => {
  await accountController.getTransactions(req, res);
});

// Create a transaction
router.post("/:accountId/transactions", async (req, res) => {
  await accountController.createTransaction(req, res);
});

// New transfer endpoint
router.post("/:accountId/transfer", async (req, res) => {
  // Make sure middleware is applied
  await authMiddleware(req, res, async () => {
    await accountController.createTransfer(req, res);
  });
});

export default router;

