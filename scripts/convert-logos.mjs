/**
 * convert-logos.mjs — normalize client logos to trimmed WebP.
 *
 * For every .png / .jpg / .jpeg / .webp in public/clients-logo, this trims the
 * surrounding transparent/solid whitespace and writes an optimized .webp of
 * the same name — so each logo fills its card instead of floating inside the
 * padding baked into the source file. PNG/JPG originals are kept (you can
 * delete them once you're happy); existing .webp files are trimmed in place.
 *
 * Usage (from the project root):
 *   npm install --save-dev sharp
 *   node scripts/convert-logos.mjs
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, '..', 'public', 'clients-logo');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const files = await readdir(dir);
const targets = files.filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()));

if (targets.length === 0) {
  console.log('No image files found in', dir);
  process.exit(0);
}

let done = 0;
for (const file of targets) {
  const input = join(dir, file);
  const output = join(dir, `${basename(file, extname(file))}.webp`);
  try {
    // Read into a buffer first so trimming a .webp can safely overwrite itself.
    const buf = await readFile(input);
    await sharp(buf)
      // Crop the transparent/solid border baked into many logo files so the
      // mark fills its card instead of floating in whitespace.
      .trim()
      // quality 90 is crisp for logos while keeping files small; bump to
      // { lossless: true } if any logo shows compression artifacts.
      .webp({ quality: 90 })
      .toFile(output);
    done += 1;
    console.log('\u2713', file, '\u2192', basename(output));
  } catch (err) {
    console.error('\u2717 failed:', file, '-', err.message);
  }
}

console.log(
  `\nProcessed ${done}/${targets.length} logo(s) \u2192 trimmed WebP in public/clients-logo.`,
);
