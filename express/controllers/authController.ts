import { Request, Response } from "npm:express@^4.21.2";
import { UserModel } from "../models/user.ts";
import { AccountModel } from "../models/account.ts";

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const {
        id,
        fullName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        username,
        password,
        createdAt,
      } = req.body;

      // Validate input
      if (!fullName || !email || !password || !username) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create user
      const user = await UserModel.create({
        fullName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        username,
        password, // Should be hashed in a real implementation
      });

      // Create accounts based on accountType
      if (accountType === "checking" || accountType === "both") {
        await AccountModel.create({
          userId: user.id,
          type: "checking",
          balance: 0,
          accountNumber: generateAccountNumber(),
        });
      }

      if (accountType === "savings" || accountType === "both") {
        await AccountModel.create({
          userId: user.id,
          type: "savings",
          balance: 0,
          accountNumber: generateAccountNumber(),
        });
      }

      // Return success response
      res.status(201).json({
        message: "Account created successfully",
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error during registration" });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password (should use proper comparison in real implementation)
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate session/JWT token here
      const token = "sample-jwt-token"; // Placeholder for real JWT implementation

      res.status(200).json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error during login" });
    }
  },

  logout: (req: Request, res: Response) => {
    // Implement logout logic (invalidate token, etc.)
    res.status(200).json({ message: "Logged out successfully" });
  },
};

// Helper function to generate account numbers
function generateAccountNumber(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}
