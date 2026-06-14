/**
 * Optimize the brand logos in /public/brands → small WebP files.
 *
 * The Brands dropdown (Navigation.tsx → BRAND_ITEMS) references the WebP
 * outputs this script produces (bo.webp, jbl.webp, …). Run it once after
 * adding / changing any logo in /public/brands:
 *
 *     node scripts/optimize-brands.mjs
 *
 * Requires `sharp` (Next.js usually already has it). If not installed:
 *     npm i -D sharp
 *
 * Logos render in ~150px tiles, so we cap the longest edge at 320px
 * (crisp on retina) and encode WebP at quality 82 — this turns the heavy
 * B&W.png / JBL.png (≈0.75 MB each) into ~20-40 KB files.
 */

import sharp from 'sharp';
import { statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'brands');

// source filename (as on disk) -> output webp filename used by the site
const MAP = {
  'B&O.jpg': 'bo.webp',
  'B&W.png': 'bw.webp',
  'JBL.png': 'jbl.webp',
  'klipsch.png': 'klipsch.webp',
  'M&K.png': 'mk.webp',
  'QSC.png': 'qsc.webp',
  'sonus-faber-.png': 'sonus-faber.webp',
};

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

let saved = 0;
for (const [src, out] of Object.entries(MAP)) {
  const srcPath = path.join(dir, src);
  const outPath = path.join(dir, out);
  if (!existsSync(srcPath)) {
    console.warn(`! skipped (not found): ${src}`);
    continue;
  }
  try {
    const before = statSync(srcPath).size;
    await sharp(srcPath)
      .resize({ width: 320, height: 320, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);
    const after = statSync(outPath).size;
    saved += before - after;
    console.log(`\u2713 ${src} (${kb(before)})  \u2192  ${out} (${kb(after)})`);
  } catch (err) {
    console.error(`\u2717 ${src}: ${err.message}`);
  }
}

console.log(`\nDone \u2014 saved ${kb(saved)} total.`);
console.log('The original B&O/B&W/JBL/etc. files can now be deleted if you like.');
