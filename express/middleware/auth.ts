// File: auth.ts
import { NextFunction, Request, Response } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Authenticating user...");
  // Check if user is logged in
  if (!req.session?.user) {
    console.log("User not logged in")
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Pass the user object to the next middleware
  (req as any).user = req.session.user;

  next();
};

