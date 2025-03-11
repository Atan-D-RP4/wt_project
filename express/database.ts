import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

class Database {
  private static instance: Database;
  private client: Client;

  private constructor() {
    this.client = new Client();
  }

  public static async getInstance(): Promise<Database> {
    if (!Database.instance) {
      Database.instance = new Database();
      await Database.instance.connect();
    }
    return Database.instance;
  }

  private async connect() {
    await this.client.connect({
      hostname: "127.0.0.1",
      username: "root",
      password: "password",
      db: "project",
      poolSize: 3,
    });
  }

  public getClient(): Client {
    return this.client;
  }
}

export default await Database.getInstance();
