"""
Upscale + trim the original Aqours logo for crisp display in the hero.

Reads:  ../logo/aqours-logo.png        (original, untrimmed, ~1024x576)
Writes: ../../logo/aqours-logo.png     (2x, sharpened, trimmed)

Run from this folder:  python upscale.py
"""
from PIL import Image, ImageFilter
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ORIG = os.path.join(HERE, "..", "logo", "aqours-logo.png")
OUT  = os.path.join(HERE, "..", "..", "logo", "aqours-logo.png")

SCALE = 2
PAD = 16  # in upscaled pixel space

img = Image.open(ORIG).convert("RGBA")
print("original", img.size)

big = img.resize((img.width * SCALE, img.height * SCALE), Image.LANCZOS)
big = big.filter(ImageFilter.UnsharpMask(radius=1.6, percent=90, threshold=2))

bbox = big.getbbox()
x0, y0, x1, y1 = bbox
big = big.crop((
    max(0, x0 - PAD), max(0, y0 - PAD),
    min(big.width, x1 + PAD), min(big.height, y1 + PAD),
))

big.save(OUT)
print("saved", big.size)
