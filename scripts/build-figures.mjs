#!/usr/bin/env node
/** Resizes paper figures in media-src/figures into public/figures (WebP + JPEG, 800 and 1600 px). */
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "media-src/figures"), out = path.join(root, "public/figures");
mkdirSync(out, { recursive: true });

for (const file of readdirSync(src).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const name = path.parse(file).name;
  for (const w of [800, 1600]) {
    const img = sharp(path.join(src, file)).resize({ width: w, withoutEnlargement: true });
    await img.clone().webp({ quality: 82 }).toFile(path.join(out, `${name}-${w}.webp`));
    await img.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(out, `${name}-${w}.jpg`));
  }
  console.log(`figure: ${name}`);
}
