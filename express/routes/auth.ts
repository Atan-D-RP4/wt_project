import express from "npm:express@^4.18.2";
import { authController } from "../controllers/authController.ts";

const router = express.Router();

// Registration endpoint
router.post("/register", authController.register);

// Login endpoint
router.post("/login", authController.login);

// Logout endpoint
router.post("/logout", authController.logout);

export default router;
