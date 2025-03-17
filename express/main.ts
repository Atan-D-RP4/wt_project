// File: main.ts
// @ts-types="npm:@types/express"
import express from "express";
import session from "express-session";

// Routes
import accountRoutes from "./routes/accounts.ts";
import authRoutes from "./routes/auth.ts";
import dashboardRoutes from "./routes/dashboard.ts";
import transactionRoutes from "./routes/transactions.ts";

// Auth
import { authMiddleware } from "./middleware/auth.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(session({
    secret: "yourSecretKey", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production with HTTPS
  }));

  app.use(express.static("public"));
  app.set("view engine", "ejs");

  // Route setup
  app.use("/auth", authRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // Index page
  app.get("/", (req: express.Request, res: express.Response) => {
    res.redirect("/dashboard");
  });

  // Login page
  app.get("/login", (_req: express.Request, res: express.Response) => {
    res.render("login");
  });

  app.get("/register", (_req: express.Request, res: express.Response) => {
    res.render("register");
  });

  // Create a dashboard route protected by auth middleware
  app.get("/dashboard", (req: express.Request, res: express.Response) => {
    authMiddleware(req, res, () => {
      res.render("dashboard", { user: (req as any).user.username });
    });
  });

  app.get("/transfer", (req: express.Request, res: express.Response) => {
    authMiddleware(req, res, () => {
      res.render("transfer");
    });
  });

  app.get("/users", (_req: express.Request, res: express.Response) => {
    res.send();
  });

  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
