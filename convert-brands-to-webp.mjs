// convert-brands-to-webp.mjs
// Converts raster images (.png/.jpg/.jpeg) in public/brands to .webp using sharp.
// SVGs are left untouched (vector). Existing .webp files are skipped.
// Originals are KEPT by default. Set DELETE_ORIGINALS = true to remove them after conversion.
//
// Run from the cinesphere project root:
//   node convert-brands-to-webp.mjs

import sharp from "sharp";
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Folder to process (recurses into subfolders).
const TARGET_DIR = path.join(__dirname, "public", "brands");

// ---- Options -------------------------------------------------
const RECURSIVE = true;          // also process subfolders (e.g. /white)
const DELETE_ORIGINALS = false;  // set true to delete the .png/.jpg after a successful convert
const PNG_LOSSLESS = true;       // lossless webp for PNG logos (crisp flat colors + transparency)
const JPG_QUALITY = 85;          // quality for jpg/jpeg sources
// --------------------------------------------------------------

const RASTER_EXT = new Set([".png", ".jpg", ".jpeg"]);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (RECURSIVE) yield* walk(full);
    } else {
      yield full;
    }
  }
}

async function main() {
  let converted = 0;
  let skipped = 0;

  for await (const file of walk(TARGET_DIR)) {
    const ext = path.extname(file).toLowerCase();
    if (!RASTER_EXT.has(ext)) {
      skipped++;
      continue;
    }

    const out = file.slice(0, -ext.length) + ".webp";

    const options =
      ext === ".png"
        ? { lossless: PNG_LOSSLESS }
        : { quality: JPG_QUALITY };

    try {
      const beforeBytes = (await stat(file)).size;
      await sharp(file).webp(options).toFile(out);
      const afterBytes = (await stat(out)).size;

      const pct = (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1);
      console.log(
        `✓ ${path.relative(TARGET_DIR, file)} -> ${path.basename(out)}  ` +
          `(${(beforeBytes / 1024).toFixed(1)}KB -> ${(afterBytes / 1024).toFixed(1)}KB, ${pct}% smaller)`
      );

      if (DELETE_ORIGINALS) {
        await unlink(file);
        console.log(`   deleted original ${path.basename(file)}`);
      }
      converted++;
    } catch (err) {
      console.error(`✗ Failed on ${file}: ${err.message}`);
    }
  }

  console.log(`\nDone. Converted ${converted} file(s), skipped ${skipped} non-raster file(s).`);
  if (!DELETE_ORIGINALS && converted > 0) {
    console.log("Originals were kept. Set DELETE_ORIGINALS = true and re-run to remove them.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
