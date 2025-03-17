// File: routes/transaction.ts
import express from "express";
import { authMiddleware } from "../middleware/auth.ts";
import { transactionController } from "../controllers/transactionController.ts";

const router = express.Router();

// Apply auth middleware to all transaction routes
router.use((req, res, next) => {
  console.log("Authenticating new transaction");
  authMiddleware(req, res, next);
});

router.post("/", async (req, res) => {
  await transactionController.createTransaction(req, res);
});

router.post("/history", async (req, res) => {
  await transactionController.getTransactionHistory(req, res);
});

router.post("/:accountId", async (req, res) => {
  await transactionController.getTransactions(req, res);
});

export default router;
