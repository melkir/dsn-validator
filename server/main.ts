import { copy, FaktoryClient, readerFromStreamReader } from "./deps.ts";

const client = new FaktoryClient({
  host: Deno.env.get("FAKTORY_HOST") || "localhost",
  port: 7419,
});

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

// Start listening on port 8080 of localhost.
const server = Deno.listen({ port: 8080 });
console.log(`HTTP webserver running.  Access it at:  http://localhost:8080/`);

// Connections to the server will be yielded up as an async iterable.
for await (const conn of server) {
  // In order to not be blocking, we need to handle each connection individually
  // without awaiting the function
  serveHttp(conn);
}

async function serveHttp(conn: Deno.Conn) {
  // This "upgrades" a network connection into an HTTP connection.
  const httpConn = Deno.serveHttp(conn);
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const { request, respondWith } of httpConn) {
    const url = new URL(request.url);

    if (url.pathname === "/upload") {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const tmpFile = await upload(file);
      const job = client.job("validate", tmpFile);
      await job.push();

      return respondWith(
        new Response(JSON.stringify(job), {
          headers: new Headers({ "Content-Type": "application/json" }),
        }),
      );
    }
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const body = `
      <form action="/upload" enctype="multipart/form-data" method="post">
        <div><input type="file" name="file"/></div>
        <input type="submit" value="Upload" />
      </form>
    `;
    // The requestEvent's `.respondWith()` method is how we send the response
    // back to the client.
    respondWith(
      new Response(body, {
        status: 200,
        headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
      }),
    );
  }
}
