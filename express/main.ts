// @ts-types="npm:@types/node"
import * as fs from "node:fs";
import { Buffer } from "node:buffer";

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

  // Route setup
  app.use("/auth", authRoutes);
  app.use("/accounts", accountRoutes);
  app.use("/dashboard", dashboardRoutes);

  // Index page
  app.get("/", (_req: express.Request, res: express.Response) => {
    res.redirect("/login");
  });


  // Login page
  app.get("/login.html", (_req: express.Request, res: express.Response) => {
    res.redirect("/login");
  });

  // Re-direct to login page
  app.get("/login", (_req: express.Request, res: express.Response) => {
    fs.readFile(
      "./views/login.html",
      (err: NodeJS.ErrnoException | null, data: Buffer<ArrayBufferLike>) => {
        if (err) throw err;
        res.contentType("html");
        res.send(data);
      },
    );
  });

  app.get("/register", (_req: express.Request, res: express.Response) => {
    fs.readFile(
      "./views/register.html",
      (err: NodeJS.ErrnoException | null, data: Buffer<ArrayBufferLike>) => {
        if (err) throw err;
        res.contentType("html");
        res.send(data);
      },
    );
  });

  app.get("/dashboard.html", (_req: express.Request, res: express.Response) => {
    res.redirect("/dashboard");
  });

  app.get("/dashboard", (_req: express.Request, res: express.Response) => {
    fs.readFile(
      "./views/dashboard.html",
      (err: NodeJS.ErrnoException | null, data: Buffer<ArrayBufferLike>) => {
        if (err) throw err;
        res.contentType("html");
        res.send(data);
      },
    );
  });

  app.get("/users", (_req: express.Request, res: express.Response) => {
    res.send();
  });

  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
