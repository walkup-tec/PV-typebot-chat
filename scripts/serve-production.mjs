import { createServer } from "node:http";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";

const salesRoot = fileURLToPath(new URL("../", import.meta.url));
const { default: serverEntry } = await import(pathToFileURL(join(salesRoot, "dist/server/server.js")).href);

const port = Number(process.env.PORT ?? "3000");
const host = process.env.HOST ?? "0.0.0.0";

const toRequestBody = (req) => {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  return Readable.toWeb(req);
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: toRequestBody(req),
      duplex: "half",
    });
    const response = await serverEntry.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    if (!response.body) {
      res.end();
      return;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    console.error("[sales] request failed", error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Erro interno ao carregar a página de vendas.");
  }
});

server.listen(port, host, () => {
  console.log(`[sales] listening on http://${host}:${port}`);
});
