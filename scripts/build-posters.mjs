// Renders the stills of the hero network from the real scene, so the poster that paints before
// JavaScript loads matches the live 3D network exactly.
//
//   npm run build && npm run hero:posters
//
// Needs Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`).
// Writes public/hero-network/ (posters, closing still) and public/og.jpg. Rebuild afterwards.
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import sharp from "sharp";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}

const OUT = resolve("out");
const DEST = resolve("public/hero-network");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".webp": "image/webp", ".txt": "text/plain" };

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path.endsWith("/")) path += "index.html";
  try {
    const body = await readFile(join(OUT, path));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const url = `http://127.0.0.1:${server.address().port}/?still`;

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

/** Opens the page at a viewport, waits for the scene, freezes it at `p` and returns a PNG of the network. */
async function still(width, height, p, scale = 1) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.goto(url);
  await page.waitForFunction(() => window.__heroScene, null, { timeout: 30000 });
  await page.addStyleTag({
    content: `.site-header,.hero-copy,.hero-veil,.hero-poster,.hero-ticks,.hero-cue{display:none!important}
      .hero-media{position:fixed!important;inset:0!important;height:100vh!important;-webkit-mask-image:none!important;mask-image:none!important}
      .hero-net{opacity:1!important;transition:none!important}`,
  });
  await page.evaluate((v) => new Promise((r) => requestAnimationFrame(() => { window.__heroScene.still(v); requestAnimationFrame(r); })), p);
  await page.waitForTimeout(300);
  const png = await page.locator(".hero-net").screenshot();
  await page.close();
  return png;
}

await mkdir(DEST, { recursive: true });
const write = async (png, name, width) => {
  const img = sharp(png).flatten({ background: "#fafafd" }).resize({ width });
  await img.clone().webp({ quality: 82 }).toFile(join(DEST, `${name}.webp`));
  await img.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(join(DEST, `${name}.jpg`));
};

const landscape = await still(1600, 900, 0, 1.5);
for (const w of [960, 1600, 2400]) await write(landscape, `poster-landscape-${w}`, w);
const portrait = await still(540, 460, 0, 2);
for (const w of [640, 1080]) await write(portrait, `poster-portrait-${w}`, w);
const closing = await still(1280, 720, 1);
await sharp(closing).flatten({ background: "#fafafd" }).webp({ quality: 80 }).toFile(join(DEST, "closing-1280.webp"));

// Social card: the landscape still with the name set on the calm left side.
const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const bg = (await sharp(landscape).resize(1200, 630, { fit: "cover", position: "right" }).jpeg().toBuffer()).toString("base64");
await card.setContent(`<body style="margin:0;width:1200px;height:630px;background:#fafafd url(data:image/jpeg;base64,${bg}) center/cover;font-family:Georgia,serif;color:#0b1220">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(250,250,253,.97) 0%,rgba(250,250,253,.85) 42%,rgba(250,250,253,0) 70%)"></div>
  <div style="position:absolute;left:72px;top:200px">
    <div style="font:500 22px system-ui,sans-serif;color:#5d6778">Medical image analysis</div>
    <div style="font-size:64px;line-height:1.02;margin-top:18px;letter-spacing:-1px">Sri Sai Hemanth<br>Bollepalli</div>
    <div style="font-size:30px;font-style:italic;color:#1257b8;margin-top:18px">Medical AI researcher</div>
  </div></body>`);
await sharp(await card.screenshot()).jpeg({ quality: 84, mozjpeg: true }).toFile(resolve("public/og.jpg"));

await browser.close();
server.close();
console.log("Wrote public/hero-network/ and public/og.jpg");
