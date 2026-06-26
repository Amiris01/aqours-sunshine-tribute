"""
Normalize raw character cut-outs into uniform square portrait files.

Reads:  ../characters/NN-name.(webp|png)
Writes: ../../members/NN-name.png   (1000x1000, figure bottom-anchored, centered)

Steps per source:
  1. Load RGBA, trim to the figure's alpha bounding box.
  2. Scale the figure to a uniform height (keeps aspect ratio; falls back to
     width-fit for very wide poses so nothing overflows the canvas).
  3. Paste onto a square transparent canvas, centered, anchored to the bottom.

Run from this folder:  python portraits.py
"""
from PIL import Image
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "characters")
OUT = os.path.join(HERE, "..", "..", "members")

# member-number -> source filename (in ../characters/)
SOURCES = {
    "01": "01-chika.webp",
    "02": "02-riko.png",
    "03": "03-kanan.webp",
    "04": "04-dia.webp",
    "05": "05-you.webp",
    "06": "06-yoshiko.webp",
    "07": "07-hanamaru.webp",
    "08": "08-mari.webp",
    "09": "09-ruby.webp",
}

CANVAS = 1000          # output square size (px)
FIG_HEIGHT = 940       # figure height within canvas (leaves ~3% headroom)
BOTTOM_MARGIN = 6      # px gap below figure

for num, fname in SOURCES.items():
    im = Image.open(os.path.join(SRC, fname)).convert("RGBA")

    fig = im.crop(im.getbbox())                       # 1. trim

    scale = FIG_HEIGHT / fig.height                   # 2. scale by height
    new_w, new_h = round(fig.width * scale), FIG_HEIGHT
    if new_w > CANVAS:                                # wide pose -> fit width
        scale = CANVAS / fig.width
        new_w, new_h = CANVAS, round(fig.height * scale)
    fig = fig.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))   # 3. place
    x = (CANVAS - new_w) // 2
    y = max(0, CANVAS - new_h - BOTTOM_MARGIN)
    canvas.paste(fig, (x, y), fig)

    out_name = fname.rsplit(".", 1)[0] + ".png"
    canvas.save(os.path.join(OUT, out_name))
    print(f"{out_name:16} from {fname:18} fig {new_w}x{new_h}")

print("done")
