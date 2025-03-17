// File: routes/dashboard.ts
import express from "express";
import { dashboardController } from "../controllers/dashboardController.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = express.Router();

router.use((req, res, next) => {
  console.log("Authenticating dashboard");
  authMiddleware(req, res, next);
});

// Dashboard data endpoint (dynamic data for UI)
router.get("/", async (req, res) => {
  await dashboardController.getDashboardData(req, res);
  if (res.statusCode === 500) {
    res.redirect("/login");
  }
});

export default router;
