// File: routes/accounts.ts
import express from "express";
import { authMiddleware } from "../middleware/auth.ts";
import { accountController } from "../controllers/accountController.ts";

const router = express.Router();

// Apply auth middleware to all account routes
router.use((req, res, next) => {
  authMiddleware(req, res, next);
});

router.get("/", async (req, res) => {
  await accountController.getAllAccounts(req, res);
});

router.get("/create", async (req, res) => {
  await accountController.createAccount(req, res);
});

// Get account details
router.get("/:accountId", async (req, res) => {
  await accountController.getAccount(req, res);
});

// Get account transactions
router.get("/:accountId/transactions", async (req, res) => {
  await accountController.getTransactions(req, res);
});

export default router;
