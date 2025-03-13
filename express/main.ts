// @ts-types="npm:@types/express"
import express from "npm:express";

// Routes
import accountRoutes from "./routes/accounts.ts";
import authRoutes from "./routes/auth.ts";
import dashboardRoutes from "./routes/dashboard.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.set("view engine", "ejs");

  // Route setup
  app.use("/auth", authRoutes);
  app.use("/accounts", accountRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // Index page
  app.get("/", (_req: express.Request, res: express.Response) => {
    res.redirect("/login");
  });

  // Login page
  app.get("/login", (_req: express.Request, res: express.Response) => {
    res.render("login");
  });

  app.get("/register", (_req: express.Request, res: express.Response) => {
    res.render("register");
  });

  app.get("/dashboard", (_req: express.Request, res: express.Response) => {
    res.render("dashboard");
  });

  app.get("/transfer", (_req: express.Request, res: express.Response) => {
      res.render("transfer");
  });

  app.get("/users", (_req: express.Request, res: express.Response) => {
    res.send();
  });

  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
