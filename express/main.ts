import { Buffer } from "node:buffer";
import * as fs from "node:fs";

import { users } from "./models/user.ts";

import express from "npm:express";
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
// Routes
import accountRoutes from "./routes/accounts.ts";
import authRoutes from "./routes/auth.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const client = await new Client().connect({
    hostname: "127.0.0.1",
    username: "root",
    password: "password",
  });
  console.log("Connected to the database", client);
  client.execute(`CREATE DATABASE IF NOT EXISTS dbname`);
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));

  // Route setup
  app.use("/auth", authRoutes);
  app.use("/accounts", accountRoutes);

  app.get("/users", (req: express.Request, res: express.Response) => {
    console.log(users);
    res.send();
  });

  app.get("/", (_req: express.Request, res: express.Response) => {
    res.redirect("/login");
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

  // Login page
  app.get("/login.html", (_req: express.Request, res: express.Response) => {
    res.redirect("/login");
  });

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

  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
