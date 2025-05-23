// File: main.ts
// @ts-types="npm:@types/express"
import express from "express";
import session from "express-session";
import cors from "cors";

// Routes
import accountRoutes from "./routes/accounts.ts";
import authRoutes from "./routes/auth.ts";
import dashboardRoutes from "./routes/dashboard.ts";
import transactionRoutes from "./routes/transactions.ts";

// Auth
import { authMiddleware } from "./middleware/auth.ts";
import { UserModel } from "./models/user.ts";
import { AccountModel } from "./models/account.ts";
import { accountController } from "./controllers/accountController.ts";

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
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 4, // 4 hours
    }, // Set to true in production with HTTPS
  }));
  app.use(cors({
    origin: "http://localhost:3000", // specific origin or '*' for all
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }));

  // Static files and view engine
  app.use(express.static("public"));
  app.set("view engine", "ejs");

  // Route setup
  app.use("/auth", authRoutes);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // Index page
  app.get("/", (_req: express.Request, res: express.Response) => {
    res.redirect("/dashboard");
  });

  // Login page
  app.get("/login", (_req: express.Request, res: express.Response) => {
    res.render("login");
  });

  app.get("/register", (_req: express.Request, res: express.Response) => {
    res.render("register");
  });

  // Protected routes
  app.use(authMiddleware);
  app.get("/dashboard", (req: express.Request, res: express.Response) => {
    res.render("dashboard", { user: req.user?.username });
  });

  app.get("/details", async (req: express.Request, res: express.Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).send("Unauthorized");
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const accounts = await AccountModel.findByUserId(userId);
    res.render("details", { user: user, accounts: accounts });
  });

  app.get("/transfer", (_req: express.Request, res: express.Response) => {
    res.render("transfer");
  });

  app.get("/deposit", (req: express.Request, res: express.Response) => {
    res.render(
      "deposit",
      accounts = accountController.getAllAccounts(req, res),
    );
  });

  app.post("/deposit/:accountId", async (req, res) => {
    console.log("Account ID:", req.params.accountId);
    await accountController.deposit(req, res);
  });

  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
