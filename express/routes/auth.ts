import express from "express";
import { authController } from "../controllers/authController.ts";

const router = express.Router();

// Test route
router.get("/register", (_req: express.Request, res: express.Response) => {
  res.redirect("/register");
});

// Registration endpoint
router.post("/register", authController.register);

// Login endpoint
router.post("/login", authController.login);

// Logout endpoint
router.post("/logout", authController.logout);

export default router;
