import express from "npm:express@^4.18.2";
import { accountController } from "../controllers/accountController.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = express.Router();

// Apply auth middleware to all account routes
router.use(authMiddleware);

// Get account details
router.get("/:accountId", accountController.getAccount);

// Get account transactions
router.get("/:accountId/transactions", accountController.getTransactions);

// Create a transaction
router.post("/:accountId/transactions", accountController.createTransaction);

export default router;
