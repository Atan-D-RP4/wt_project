// @ts-types="npm:@types/node@^22.13.5"
// @ts-types="npm:@types/express@^5.0.0"
import * as os from "node:os";
import express from "npm:express@^4.18.2";

export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
  console.log("OS Platform:", os.platform());
  os.cpus().forEach((cpu: os.CpuInfo, index: number) => {
    console.log(`CPU ${index + 1}:`, cpu.model);
  });
}

const app = express();

app.get("/", (req: express.Request, res: express.Response) => {
  console.log("Request received:", req);
  res.send("Welcome to our E-Bank Site");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
