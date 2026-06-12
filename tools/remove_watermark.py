"""
Remove the Gemini/Veo sparkle watermark from the hero frame sequence.

Uses OpenCV inpainting (TELEA) to reconstruct the background underneath
the watermark region — much cleaner than blurring or covering it.

Usage (from the project root):
  pip install opencv-python
  python tools/remove_watermark.py preview   # writes _watermark_preview.jpg — check the red box covers the sparkle
  python tools/remove_watermark.py apply     # backs up originals to frames-original/, cleans all frames in place

If the red box in the preview doesn't cover the sparkle, tweak CX / CY
(watermark centre as a fraction of frame width/height) and BW / BH
(box size as a fraction) below and re-run preview.
"""

import os
import shutil
import sys
import glob

import cv2
import numpy as np

# ---------------------------------------------------------------------------
# Config — watermark region as fractions of the frame size, so it works at
# any resolution. Defaults target the Gemini sparkle (bottom-right area).
# ---------------------------------------------------------------------------
FRAMES_DIR = os.path.join("public", "hero", "frames")
BACKUP_DIR = os.path.join("public", "hero", "frames-original")
PREVIEW_FILE = os.path.join("public", "hero", "_watermark_preview.jpg")

CX, CY = 0.936, 0.775   # watermark centre (fraction of width, height)
BW, BH = 0.080, 0.150   # inpaint box size (fraction of width, height)
JPEG_QUALITY = 90


def roi(img):
    h, w = img.shape[:2]
    x0 = int((CX - BW / 2) * w)
    x1 = int((CX + BW / 2) * w)
    y0 = int((CY - BH / 2) * h)
    y1 = int((CY + BH / 2) * h)
    return max(0, x0), max(0, y0), min(w, x1), min(h, y1)


def preview():
    frames = sorted(glob.glob(os.path.join(FRAMES_DIR, "frame-*.jpg")))
    if not frames:
        sys.exit(f"No frames found in {FRAMES_DIR}")
    # Use a middle frame — watermark is static, any frame works.
    img = cv2.imread(frames[len(frames) // 2])
    x0, y0, x1, y1 = roi(img)
    boxed = img.copy()
    cv2.rectangle(boxed, (x0, y0), (x1, y1), (0, 0, 255), 3)
    cv2.imwrite(PREVIEW_FILE, boxed, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
    print(f"Preview written to {PREVIEW_FILE}")
    print(f"Box: x {x0}-{x1}, y {y0}-{y1} on a {img.shape[1]}x{img.shape[0]} frame")
    print("Open it — the red box must fully cover the sparkle (with a little margin).")
    print("If it's off, adjust CX/CY/BW/BH at the top of this script and re-run preview.")


def apply():
    frames = sorted(glob.glob(os.path.join(FRAMES_DIR, "frame-*.jpg")))
    if not frames:
        sys.exit(f"No frames found in {FRAMES_DIR}")

    # One-time backup of the originals.
    if not os.path.isdir(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        for f in frames:
            shutil.copy2(f, os.path.join(BACKUP_DIR, os.path.basename(f)))
        print(f"Originals backed up to {BACKUP_DIR}")

    for i, path in enumerate(frames, 1):
        img = cv2.imread(path)
        x0, y0, x1, y1 = roi(img)
        mask = np.zeros(img.shape[:2], dtype=np.uint8)
        mask[y0:y1, x0:x1] = 255
        cleaned = cv2.inpaint(img, mask, inpaintRadius=4, flags=cv2.INPAINT_TELEA)
        cv2.imwrite(path, cleaned, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
        if i % 40 == 0 or i == len(frames):
            print(f"  {i}/{len(frames)} frames cleaned")

    if os.path.exists(PREVIEW_FILE):
        os.remove(PREVIEW_FILE)
    print("Done — all frames cleaned in place. Refresh localhost:3000.")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "preview"
    if mode == "apply":
        apply()
    else:
        preview()
