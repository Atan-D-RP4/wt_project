// File: init-db.ts
import db from "./database.ts";

const client = db.getClient();

await client.execute(`CREATE DATABASE IF NOT EXISTS project`);
await client.execute(`USE project`);

await client.execute(
  `CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  fullName VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address VARCHAR(100),
  city VARCHAR(50),
  state VARCHAR(50),
  zipCode VARCHAR(10),
  username VARCHAR(50),
  password VARCHAR(100),
  createdAt DATETIME,
  accountType ENUM('checking', 'savings', 'both')
  )`,
);

await client.execute(
  `CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36),
  type ENUM('checking', 'savings', 'both'),
  balance DECIMAL(10, 2),
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
  )`,
);

await client.execute(
  `CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  fromId VARCHAR(36),
  toId VARCHAR(36),
  type ENUM('deposit', 'withdrawal', 'transfer'),
  amount DECIMAL(10, 2),
  description TEXT,
  balance DECIMAL(10, 2),
  createdAt DATETIME,
  FOREIGN KEY (fromId) REFERENCES accounts(id),
  FOREIGN KEY (toId) REFERENCES accounts(id)
  )`,
);

console.log("Database initialized");
client.close();
