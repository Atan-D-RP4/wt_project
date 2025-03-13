import jwt from "jsonwebtoken";
import process from "node:process";

// In-memory token blacklist
const tokenBlacklist = new Set<string>();

// Secret key for signing tokens
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Token expiration time
const TOKEN_EXPIRATION = "1h";

interface TokenPayload {
  id: string;
  username: string;
}

export const tokenService = {
  // Generate a new JWT
  generateToken: (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
  },

  // Verify the validity of a JWT
  verifyToken: (token: string): TokenPayload | null => {
    try {
      // Check if the token is blacklisted
      if (tokenBlacklist.has(token)) {
        throw new Error("Token is blacklisted");
      }
      // Verify the token
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  },

  // Invalidate a JWT by adding it to the blacklist
  invalidateToken: (token: string): void => {
    tokenBlacklist.add(token);
    console.log(tokenBlacklist)
  },
};
