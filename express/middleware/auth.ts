// File: middleware/auth.ts
// @ts-types="npm:@types/express-session"
// @ts-types="npm:@types/express"
import { NextFunction, Request, Response } from "express";

// In your auth.ts middleware file
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}

// Extend express-session
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      email: string;
    };
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if user is logged in
  if (!req.session?.user) {
    // Send a message to the user and then redirect to login page
    console.log("Redirect");
    return res.status(300).redirect("/login");
  }

  // Pass the user object to the next middleware
  req.user = req.session.user; // No need for casting now

  console.log("Passed Authentication");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Frame-Options", "DENY");
  next();
};
