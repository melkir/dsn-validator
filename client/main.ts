import { FaktoryWorker } from "./deps.ts";
import { Validator } from "./validator.ts";

const PORT = 7419;
const worker = new FaktoryWorker({
  host: Deno.env.get("FAKTORY_HOST") || "localhost",
  port: PORT,
});

console.log(`Listening on http://localhost:${PORT}`);

const validator = new Validator({ version: "validator-202106231017" });

interface JobParams {
  dir: string;
  path: string;
}

worker.register("validate", async (job) => {
  console.log(job);
  const xml = await validator.run(job as JobParams);
  console.log(xml.length);
});

try {
  await worker.work();
} catch (error: unknown) {
  console.error(`worker failed to start: ${error}`);
  Deno.exit(1);
}
