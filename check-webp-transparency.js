#!/usr/bin/env node
/**
 * check-webp-transparency.js
 * --------------------------------------------------------------------------
 * Scans a folder of .webp files and reports which ones have NO real
 * transparency (alpha) channel.
 *
 * Why this matters: the About brands wall forces every logo white with the
 * CSS filter `brightness-0 invert`. That works only if the file is
 * transparent. A file with an opaque background (white OR black) gets flooded
 * to a solid WHITE BOX instead of a clean logo. This script finds those.
 *
 * Usage (from anywhere):
 *   node check-webp-transparency.js "D:\unntangle\Client Websites\cinesphere\public\brands\white"
 *
 * Or drop it inside the folder and run:
 *   node check-webp-transparency.js
 *
 * Zero dependencies — it parses the WebP header directly.
 * --------------------------------------------------------------------------
 */
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || process.cwd();

function inspect(buf) {
  if (buf.length < 25) return { format: 'too-small', alpha: null };
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP')
    return { format: 'not-a-webp', alpha: null };

  const fourcc = buf.toString('ascii', 12, 16);

  // Simple lossy WebP — the format can never carry an alpha channel.
  if (fourcc === 'VP8 ') return { format: 'lossy', alpha: false };

  // Lossless WebP — alpha_is_used is bit 28 of the bitstream header.
  if (fourcc === 'VP8L') return { format: 'lossless', alpha: ((buf[24] >> 4) & 1) === 1 };

  // Extended WebP — the feature flags byte (offset 20), alpha = 0x10.
  if (fourcc === 'VP8X') return { format: 'extended', alpha: (buf[20] & 0x10) !== 0 };

  return { format: fourcc.trim() || 'unknown', alpha: null };
}

let files;
try {
  files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.webp')).sort();
} catch (err) {
  console.error(`\nCould not read folder: ${dir}\n${err.message}\n`);
  process.exit(1);
}

if (files.length === 0) {
  console.log(`\nNo .webp files found in:\n${dir}\n`);
  process.exit(0);
}

console.log(`\nScanning ${files.length} .webp file(s) in:\n${dir}\n`);

const badFiles = [];
for (const f of files) {
  const buf = fs.readFileSync(path.join(dir, f));
  const { format, alpha } = inspect(buf);
  let verdict;
  if (alpha === false) {
    verdict = 'NO ALPHA  ->  renders as a WHITE BOX, re-export this one';
    badFiles.push(f);
  } else if (alpha === true) {
    verdict = 'transparent (OK)';
  } else {
    verdict = `could not read (${format})`;
  }
  console.log(`  ${f.padEnd(26)} ${String(format).padEnd(10)} ${verdict}`);
}

console.log('\n' + '='.repeat(60));
if (badFiles.length === 0) {
  console.log('All files are transparent. Nothing to re-export.');
} else {
  console.log(`${badFiles.length} file(s) lack transparency and render as a WHITE BOX:`);
  for (const f of badFiles) console.log(`   >>>  ${f}`);
  console.log('\nRe-export the file(s) above as WebP with the alpha channel preserved.');
}
console.log('='.repeat(60) + '\n');
