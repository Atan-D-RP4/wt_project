import { NextFunction, Request, Response } from "express";

import { UserModel } from "../models/user.ts";
import { tokenService } from "../tokenService.ts";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // In a real app, verify JWT token
    // For this demo, we'll simulate by looking up a user
    // This is NOT secure and only for demonstration

    const decoded = tokenService.verifyToken(token) as {
      id: string;
      username: string;
    };
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Invalid authentication" });
    }

    // Attach user to request
    // deno-lint-ignore no-explicit-any
    (req as any).user = { id: user.id, username: user.username };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
    res.redirect("/login");
  }
};
