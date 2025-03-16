// File: routes/auth.ts
// @ts-types="npm:@types/express"

import express from "express";
import { authController } from "../controllers/authController.ts";

const router = express.Router();

// Registration endpoint
router.post("/register", async (req: express.Request, res: express.Response) => {
    await authController.register(req, res);
});

// Login endpoint
router.post("/login", async (req: express.Request, res: express.Response) => {
  await authController.login(req, res);
});

// Logout endpoint
router.post("/logout", authController.logout);

export default router;
