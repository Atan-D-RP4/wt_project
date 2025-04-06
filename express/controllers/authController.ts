// File: controllers/authController.ts
// @ts-types="npm:@types/bcryptjs"
// @ts-types="npm:@types/express"
import { Request, Response } from "express";

import { UserModel } from "../models/user.ts";
import { AccountModel } from "../models/account.ts";
import * as bcrypt from "bcryptjs";
import { Request } from "../../../../../.cache/deno/npm/registry.npmjs.org/undici-types/6.20.0/fetch.d.ts";

export const authController = {
  register: async (req: Request, res: Response) => {
    console.log("Registering user...");
    try {
      const {
        fullName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        username,
        password,
        accountType,
      } = req.body;

      // Validate input
      if (!fullName || !email || !password || !username) {
        return res.status().json({ error: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

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
        password: hashedPassword,
        accountType,
      });

      // Create accounts based on accountType
      await AccountModel.create({
        userId: user.id,
        type: accountType,
        balance: 0,
      });

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
      console.log("Logging in user...");
      const { username, password } = req.body;

      // Find user
      let user = await UserModel.findByUsername(username);
      if (!user) {
        user = await UserModel.findByEmail(username);
        if (!user) {
          console.log("User not found");
          return res.status(401).json({ error: "Invalid credentials" });
        }
      }

      // Verify password (should use proper comparison in real implementation)
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch === false) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      console.log("Session ID:", req.session.id, "\nUser ID:", user.id);

      res.status(200).json({
        message: "Login successful",
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error during login" });
    }
  },

  logout: (req: Request, res: Response) => {
    // Destroy the session
    console.log(req.session);
    req.session.destroy((err: Error) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Server error during logout" });
      }
      // Clear the session cookie (using the default name "connect.sid")
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
    console.log("Session destroyed");
  },
};
