// @ts-types="npm:@types/express"
import express from "express";
import { authController } from "../controllers/authController.ts";

const router = express.Router();

// Test route
router.get("/register", (_req: express.Request, res: express.Response) => {
  res.redirect("/register");
});

// Registration endpoint
router.post("/register", async (req: express.Request, res: express.Response) => {
  await authController.register(req, res);
});

// Login endpoint
// post does not take async functions
router.post("/login", async (req: express.Request, res: express.Response) => {
  await authController.login(req, res);
});

// Logout endpoint
router.post("/logout", authController.logout);

export default router;
