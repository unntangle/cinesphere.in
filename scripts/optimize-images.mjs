/**
 * optimize-images.mjs
 * -------------------
 * Convert the heavy About-page source images to WebP.
 *
 *   brands-wireframe.png  (2.81 MB)  → brands-wireframe.webp
 *   brands-mesh.png       (2.25 MB)  → brands-mesh.webp
 *   auditorium-dark.jpg   (0.75 MB)  → auditorium-dark.webp
 *
 * Output is written ALONGSIDE the originals under new .webp names, so nothing
 * is overwritten and the step is fully reversible. The component references
 * have already been pointed at the .webp files, so the page picks them up as
 * soon as this runs. Transparency on the two speaker renders is preserved.
 *
 * Usage (from the project root):
 *   node scripts/optimize-images.mjs
 *
 * (`sharp` is already a devDependency, so there is nothing extra to install.)
 * Re-running is safe — it just re-creates the .webp files.
 */

import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.resolve(__dirname, '..', 'public', 'images');

/** [input, output, max width (px), webp quality]. */
const JOBS = [
  ['brands-wireframe.png', 'brands-wireframe.webp', 1600, 84],
  ['brands-mesh.png', 'brands-mesh.webp', 1600, 84],
  ['auditorium-dark.jpg', 'auditorium-dark.webp', 2000, 78],
];

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

let saved = 0;
for (const [input, output, maxWidth, quality] of JOBS) {
  const inPath = path.join(IMG_DIR, input);
  const outPath = path.join(IMG_DIR, output);
  try {
    const before = (await fs.stat(inPath)).size;
    const buf = await sharp(inPath)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality, effort: 5, alphaQuality: 90 })
      .toBuffer();
    await fs.writeFile(outPath, buf);
    saved += before - buf.length;
    console.log(
      `\u2713 ${input.padEnd(22)} ${mb(before).padStart(9)} \u2192 ${mb(
        buf.length,
      ).padStart(9)}   ${output}`,
    );
  } catch (err) {
    console.error(`\u2717 ${input}: ${err.message}`);
  }
}

console.log(`\nTotal saved: ${mb(saved)}`);
console.log(
  'Originals left untouched \u2014 delete the .png/.jpg once the .webp look right.',
);
