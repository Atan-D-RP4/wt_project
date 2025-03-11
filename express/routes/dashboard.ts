import express from "express";
import { dashboardController } from "../controllers/dashboardController.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = express.Router();

router.use(async (req, res, next) => {
  await authMiddleware(req, res, next);
});

// Dashboard data endpoint (dynamic data for UI)
router.get("/", async (req, res) => {
  // Make sure middleware is applied
  await authMiddleware(req, res, async () => {
    await dashboardController.getDashboardData(req, res);
  });
});

export default router;
