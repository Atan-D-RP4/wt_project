import { NextFunction, Request, Response } from "npm:express@^4.18.2";
import { UserModel } from "../models/user.ts";

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

    // In a real app with JWT:
    // const decoded = jwt.verify(token, 'your-secret-key');
    // const user = await UserModel.findById(decoded.userId);

    // For demo purposes only:
    const userId = "sample-user-id";
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid authentication" });
    }

    // Attach user to request
    (req as any).user = { id: user.id, username: user.username };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};
