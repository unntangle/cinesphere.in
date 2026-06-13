/**
 * convert-to-webp.mjs — batch-convert photo folders to optimized WebP.
 *
 * Converts every .jpg / .jpeg / .png in:
 *   - public/hero/frames   (the scroll-scrubbed hero frame sequence)
 *   - public/gallery       (the project gallery photos)
 * to a .webp of the same base name, written alongside the original.
 *
 * Unlike convert-logos.mjs this does NOT trim — these are full-bleed photos,
 * not logos floating in padding. Originals are kept (delete them once you've
 * confirmed the WebPs look right). Re-runs are fast: any .webp that is already
 * newer than its source is skipped.
 *
 * Usage (from the project root):
 *   npm install --save-dev sharp   # already a devDependency in this project
 *   node scripts/convert-to-webp.mjs
 *
 * Options:
 *   node scripts/convert-to-webp.mjs --force   # re-convert even if up to date
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const force = process.argv.includes('--force');

const SOURCE_EXTS = new Set(['.jpg', '.jpeg', '.png']);

// Folders to process, with a quality tuned to their content. The hero frames
// are a fast-scrubbing sequence, so a slightly lower quality keeps the total
// payload small; gallery photos are viewed at full size, so a touch higher.
const FOLDERS = [
  { rel: ['public', 'hero', 'frames'], quality: 80 },
  { rel: ['public', 'gallery'], quality: 82 },
];

async function mtimeOrZero(path) {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return 0;
  }
}

let totalDone = 0;
let totalSkipped = 0;
let totalFailed = 0;
let bytesIn = 0;
let bytesOut = 0;

for (const folder of FOLDERS) {
  const dir = join(root, ...folder.rel);
  const label = folder.rel.join('/');

  let files;
  try {
    files = await readdir(dir);
  } catch {
    console.warn(`! Skipping ${label} — folder not found.`);
    continue;
  }

  const targets = files
    .filter((f) => SOURCE_EXTS.has(extname(f).toLowerCase()))
    .sort();

  if (targets.length === 0) {
    console.log(`(no source images in ${label})`);
    continue;
  }

  console.log(`\nConverting ${targets.length} image(s) in ${label} …`);

  for (const file of targets) {
    const input = join(dir, file);
    const output = join(dir, `${basename(file, extname(file))}.webp`);

    if (!force) {
      const [inT, outT] = await Promise.all([
        mtimeOrZero(input),
        mtimeOrZero(output),
      ]);
      if (outT >= inT && outT > 0) {
        totalSkipped += 1;
        continue;
      }
    }

    try {
      const buf = await readFile(input);
      const info = await sharp(buf)
        .webp({ quality: folder.quality, effort: 4 })
        .toFile(output);
      bytesIn += buf.length;
      bytesOut += info.size;
      totalDone += 1;
      console.log(`  \u2713 ${file} \u2192 ${basename(output)}`);
    } catch (err) {
      totalFailed += 1;
      console.error(`  \u2717 failed: ${file} — ${err.message}`);
    }
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log('\n──────────────────────────────────────────');
console.log(`Converted: ${totalDone}   Skipped (up to date): ${totalSkipped}   Failed: ${totalFailed}`);
if (totalDone > 0) {
  const saved = bytesIn > 0 ? (100 * (1 - bytesOut / bytesIn)).toFixed(1) : '0';
  console.log(`Size: ${mb(bytesIn)} MB \u2192 ${mb(bytesOut)} MB WebP  (saved ~${saved}%)`);
}
console.log('Originals were left in place — delete them once the WebPs look right.');
