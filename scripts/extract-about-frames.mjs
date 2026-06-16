/**
 * extract-about-frames.mjs — turn the About hero clip into a scroll-scrubbed
 * frame sequence.
 *
 * The About page hero (src/components/dom/AboutHero.tsx) does NOT stream the
 * raw 100 MB QuickTime file — instead, exactly like the homepage hero, it
 * draws a pre-extracted image sequence onto a <canvas> and swaps frames by
 * scroll position. Frame swaps are synchronous, so the scrub stays perfectly
 * smooth at any scroll speed and works in every browser (a .mov won't).
 *
 * This script reads:
 *     public/hero/about-hero.mov
 * and writes:
 *     public/hero/about-frames/frame-0001.jpg, frame-0002.jpg, …  (+ .webp)
 *
 * It targets ~200 frames regardless of the clip's length, scaled to 1600px
 * wide — plenty for a buttery three-screen scrub without a heavy payload.
 *
 * Requirements:
 *   • ffmpeg + ffprobe on your PATH   (https://ffmpeg.org/download.html)
 *   • sharp  (already a devDependency) — only needed for the .webp pass
 *
 * Usage (from the project root):
 *   node scripts/extract-about-frames.mjs
 *   node scripts/extract-about-frames.mjs --force        # re-extract
 *   node scripts/extract-about-frames.mjs --frames 240   # target frame count
 *
 * After it finishes, reload /about — the hero switches from the poster
 * placeholder to the live scroll-scrubbed sequence automatically.
 */

import { spawnSync } from 'node:child_process';
import { mkdir, readdir, rm, readFile, stat } from 'node:fs/promises';
import { dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const SOURCE = join(root, 'public', 'hero', 'about-hero.mov');
const OUT_DIR = join(root, 'public', 'hero', 'about-frames');

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const framesArgIdx = argv.indexOf('--frames');
const TARGET_FRAMES =
  framesArgIdx !== -1 ? Number(argv[framesArgIdx + 1]) || 200 : 200;
const WIDTH = 1600; // scaled width; height keeps aspect (-2 = even number)
const JPEG_Q = 4; // ffmpeg -qscale:v (2 = best … 31 = worst); 4 is crisp + light
const WEBP_Q = 80; // sharp webp quality for the lighter .webp twins

function run(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: 'utf8' });
  if (res.error) throw res.error;
  return res;
}

function hasBinary(cmd) {
  const probe = spawnSync(cmd, ['-version'], { encoding: 'utf8' });
  return !probe.error;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // 0) Pre-flight ------------------------------------------------------------
  if (!(await exists(SOURCE))) {
    console.error(`✗ Source clip not found:\n    ${SOURCE}`);
    process.exit(1);
  }
  if (!hasBinary('ffmpeg') || !hasBinary('ffprobe')) {
    console.error(
      '✗ ffmpeg / ffprobe not found on PATH.\n' +
        '  Install from https://ffmpeg.org/download.html, then re-run.',
    );
    process.exit(1);
  }

  // Already extracted? Skip unless --force.
  if (!force && (await exists(OUT_DIR))) {
    const existing = (await readdir(OUT_DIR)).filter((f) =>
      f.endsWith('.jpg'),
    );
    if (existing.length > 0) {
      console.log(
        `✓ ${existing.length} frame(s) already in public/hero/about-frames/.\n` +
          '  Pass --force to re-extract.',
      );
      return;
    }
  }

  // 1) Probe the clip's duration so we can hit ~TARGET_FRAMES ----------------
  const probe = run('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    SOURCE,
  ]);
  const duration = parseFloat((probe.stdout || '').trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    console.error('✗ Could not read clip duration from ffprobe.');
    process.exit(1);
  }

  // fps tuned to land near the target frame count, clamped to a sane range.
  const fps = Math.min(30, Math.max(8, Math.round(TARGET_FRAMES / duration)));
  console.log(
    `Clip: ${duration.toFixed(1)}s → extracting at ${fps} fps ` +
      `(~${Math.round(duration * fps)} frames @ ${WIDTH}px wide)…`,
  );

  // 2) Fresh output directory ------------------------------------------------
  if (force && (await exists(OUT_DIR))) await rm(OUT_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  // 3) ffmpeg extraction -----------------------------------------------------
  const ff = run('ffmpeg', [
    '-i',
    SOURCE,
    '-vf',
    `fps=${fps},scale=${WIDTH}:-2:flags=lanczos`,
    '-qscale:v',
    String(JPEG_Q),
    join(OUT_DIR, 'frame-%04d.jpg'),
  ]);
  if (ff.status !== 0) {
    console.error(ff.stderr || 'ffmpeg failed.');
    process.exit(1);
  }

  const jpgs = (await readdir(OUT_DIR))
    .filter((f) => extname(f).toLowerCase() === '.jpg')
    .sort();
  console.log(`✓ Extracted ${jpgs.length} JPEG frame(s).`);

  // 4) Optional .webp twins (smaller payload; the hero prefers them) ---------
  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    console.warn(
      '! sharp not available — skipping .webp pass (JPEGs work fine).\n' +
        '  Run `npm i -D sharp` then re-run with --force for the lighter set.',
    );
  }

  if (sharp) {
    let done = 0;
    let bytesIn = 0;
    let bytesOut = 0;
    for (const file of jpgs) {
      const input = join(OUT_DIR, file);
      const output = join(OUT_DIR, `${basename(file, '.jpg')}.webp`);
      try {
        const buf = await readFile(input);
        const info = await sharp(buf)
          .webp({ quality: WEBP_Q, effort: 4 })
          .toFile(output);
        bytesIn += buf.length;
        bytesOut += info.size;
        done += 1;
      } catch (err) {
        console.error(`  ✗ ${file} → webp failed: ${err.message}`);
      }
    }
    const mb = (n) => (n / 1024 / 1024).toFixed(2);
    const saved = bytesIn ? (100 * (1 - bytesOut / bytesIn)).toFixed(1) : '0';
    console.log(
      `✓ Wrote ${done} .webp twin(s)  (${mb(bytesIn)} MB → ${mb(bytesOut)} MB, −${saved}%).`,
    );
  }

  console.log(
    '\nDone. Reload /about — the hero now scrubs the live frame sequence.',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
