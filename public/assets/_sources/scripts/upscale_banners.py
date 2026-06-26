"""
Upscale the member feature banners 2x for crisp display on large / hi-DPI
screens. Pure resample (LANCZOS) + light sharpen — there is no higher-res
source to re-derive from, so this just doubles the pixel grid cleanly.

Reads:  ../../banner/*.webp            (current 1600x800 banners)
Writes: ../../banner/*.webp            (2x, sharpened, re-encoded WebP)
Backup: ../../banner/_orig/*.webp      (untouched originals, first run only)

Run from this folder:  python upscale_banners.py
"""
from PIL import Image, ImageFilter
import glob
import os

HERE = os.path.dirname(os.path.abspath(__file__))
BANNER_DIR = os.path.join(HERE, "..", "..", "banner")
BACKUP_DIR = os.path.join(BANNER_DIR, "_orig")

SCALE = 2
WEBP_QUALITY = 82  # visually lossless-ish for photographic art, keeps size sane

os.makedirs(BACKUP_DIR, exist_ok=True)

files = sorted(glob.glob(os.path.join(BANNER_DIR, "*.webp")))
if not files:
    raise SystemExit("No banner .webp files found.")

for path in files:
    name = os.path.basename(path)
    backup = os.path.join(BACKUP_DIR, name)

    # Re-derive from the pristine original if we've already backed it up, so
    # re-running never compounds resampling artifacts.
    src_path = backup if os.path.exists(backup) else path
    img = Image.open(src_path).convert("RGB")

    # First run: stash the pristine original before overwriting.
    if not os.path.exists(backup):
        Image.open(path).save(backup)

    w, h = img.size
    big = img.resize((w * SCALE, h * SCALE), Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=1.4, percent=80, threshold=2))

    before_kb = os.path.getsize(path) / 1024
    big.save(path, "WEBP", quality=WEBP_QUALITY, method=6)
    after_kb = os.path.getsize(path) / 1024
    print(f"{name}: {w}x{h} -> {big.width}x{big.height}  "
          f"({before_kb:.0f}KB -> {after_kb:.0f}KB)")

print("done.")
