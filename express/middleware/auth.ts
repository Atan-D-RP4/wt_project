// File: middleware/auth.ts
import { NextFunction, Request, Response } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Authenticating user...");
  // Check if user is logged in
  if (!req.session?.user) {
    // Send a message to the user and then redirect to login page
    return res.status(300).redirect("/login");
  }

  // Pass the user object to the next middleware
  (req as any).user = req.session.user;

  next();
};

