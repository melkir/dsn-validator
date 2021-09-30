import { FaktoryClient, FaktoryWorker } from "./deps.ts";
import { Validator } from "./validator.ts";

const PORT = 7419;
const client = new FaktoryClient(
  Deno.env.get("FAKTORY_HOST") || "localhost",
  PORT,
);
await client.connect();

console.log(`Listening on http://localhost:${PORT}`);

const worker = new FaktoryWorker(client);
const validator = new Validator({ version: "validator-202106231017" });

interface JobParams {
  dir: string;
  path: string;
}

worker.register("validate", async (job: [JobParams]) => {
  console.log(job);
  const xml = await validator.run(job[0]);
  console.log(xml.length);
});

await worker.run(true);
