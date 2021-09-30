import {
  copy,
  FaktoryClient,
  FaktoryJob,
  listenAndServe,
  readerFromStreamReader,
} from "./deps.ts";

const addr = ":8080";

const client = new FaktoryClient(
  Deno.env.get("FAKTORY_HOST") || "localhost",
  7419,
);
await client.connect();

async function upload(file: File) {
  const streamReader = file.stream().getReader();
  const reader = readerFromStreamReader(streamReader);
  const tmpDirectory = await Deno.makeTempDir({ dir: "uploads" });
  const tmpFilePath = `${tmpDirectory}/${file.name}`;
  const tmpFileWriter = await Deno.open(tmpFilePath, {
    write: true,
    create: true,
  });
  await copy(reader, tmpFileWriter);
  return { dir: tmpDirectory, path: tmpFilePath };
}

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);

  if (url.pathname === "/upload") {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tmpFile = await upload(file);
    const job = new FaktoryJob("validate", [tmpFile]);
    await client.push(job);

    return new Response(JSON.stringify(job), {
      headers: new Headers({ "Content-Type": "application/json" }),
    });
  }

  const body = `
    <form action="/upload" enctype="multipart/form-data" method="post">
      <div><input type="file" name="file"/></div>
      <input type="submit" value="Upload" />
    </form>
  `;

  return new Response(body, {
    status: 200,
    headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
  });
};

console.log(`Listening on http://localhost${addr}`);
await listenAndServe(addr, handler);
