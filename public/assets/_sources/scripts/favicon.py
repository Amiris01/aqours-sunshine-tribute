"""
Generate the favicon set from the Chika mikan emblem.

Reads:  ../../members/01-chika-emblem.png
Writes: public/favicon.ico        (16/32/48 multi-size)
        public/favicon-32.png
        public/apple-touch-icon.png   (180x180)

The emblem is line-art on transparent bg, so it's placed on a soft sunny
gradient rounded square so it stays legible on any tab background.

Run from this folder:  python favicon.py
"""
from PIL import Image, ImageDraw
import os

HERE = os.path.dirname(os.path.abspath(__file__))
EMBLEM = os.path.join(HERE, "..", "..", "members", "01-chika-emblem.png")
# scripts/ -> _sources/ -> assets/ -> public/  (three levels up = public root)
ROOT = os.path.join(HERE, "..", "..", "..")  # public/ (served at site root)

# --- build a high-res master, then downscale -------------------------------
M = 512
master = Image.new("RGBA", (M, M), (0, 0, 0, 0))

# soft vertical sunny gradient (cream -> mikan orange)
top = (255, 244, 222)
bot = (255, 154, 64)
grad = Image.new("RGB", (M, M))
gp = grad.load()
for y in range(M):
    t = y / (M - 1)
    gp_row = tuple(round(top[i] * (1 - t) + bot[i] * t) for i in range(3))
    for x in range(M):
        gp[x, y] = gp_row
grad = grad.convert("RGBA")

# rounded-square mask
mask = Image.new("L", (M, M), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, M - 1, M - 1], radius=int(M * 0.22), fill=255)
master = Image.composite(grad, master, mask)

# place the emblem, trimmed and centered, at ~64% of the canvas
em = Image.open(EMBLEM).convert("RGBA")
em = em.crop(em.getbbox())
target = int(M * 0.64)
scale = target / max(em.width, em.height)
em = em.resize((round(em.width * scale), round(em.height * scale)), Image.LANCZOS)
ex = (M - em.width) // 2
ey = (M - em.height) // 2
master.alpha_composite(em, (ex, ey))

# --- export ----------------------------------------------------------------
master.resize((180, 180), Image.LANCZOS).save(os.path.join(ROOT, "apple-touch-icon.png"))
master.resize((32, 32), Image.LANCZOS).save(os.path.join(ROOT, "favicon-32.png"))
master.save(
    os.path.join(ROOT, "favicon.ico"),
    sizes=[(16, 16), (32, 32), (48, 48)],
)
print("wrote favicon.ico, favicon-32.png, apple-touch-icon.png")
