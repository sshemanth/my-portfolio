#!/usr/bin/env node
/** Tiny static server for the exported site: `npm run preview` → http://localhost:4173 */
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../out");
const port = Number(process.env.PORT ?? 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".avif": "image/avif", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain" };

createServer((req, res) => {
  let file = path.join(root, path.normalize(decodeURIComponent(req.url.split("?")[0])));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!existsSync(file)) return res.writeHead(404, { "content-type": "text/html" }).end("Not found");
  const immutable = /\/(_next\/static|hero)\//.test(file);
  res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream", "content-length": statSync(file).size, "cache-control": immutable ? "public, max-age=31536000, immutable" : "no-cache" });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving out/ at http://localhost:${port}`));
