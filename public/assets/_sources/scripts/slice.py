"""
Slice the combined 3x3 emblem sheet into nine tight-cropped emblems.

Reads:  ../emblems/emblems-sheet.png
Writes: ../../members/NN-name-emblem.png

Each grid cell is cropped, then tight-cropped to its non-transparent art with a
small transparent pad.

Run from this folder:  python slice.py
"""
from PIL import Image
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "emblems", "emblems-sheet.png")
OUT = os.path.join(HERE, "..", "..", "members")

img = Image.open(SRC).convert("RGBA")
W, H = img.size
cols, rows = 3, 3
cw, ch = W / cols, H / rows

# Grid cell (row, col) -> output filename, by motif/color.
MAP = {
    (0, 0): "01-chika-emblem.png",     # mikan
    (0, 1): "02-riko-emblem.png",      # piano
    (0, 2): "05-you-emblem.png",       # sailboat
    (1, 0): "07-hanamaru-emblem.png",  # flower
    (1, 1): "09-ruby-emblem.png",      # lollipop
    (1, 2): "06-yoshiko-emblem.png",   # bat
    (2, 0): "08-mari-emblem.png",      # star
    (2, 1): "03-kanan-emblem.png",     # dolphin
    (2, 2): "04-dia-emblem.png",       # plum
}

PAD = 6

for (r, c), name in MAP.items():
    x0, y0 = round(c * cw), round(r * ch)
    x1, y1 = round((c + 1) * cw), round((r + 1) * ch)
    cell = img.crop((x0, y0, x1, y1))

    bbox = cell.getbbox()
    if bbox:
        bx0, by0, bx1, by1 = bbox
        cell = cell.crop((
            max(0, bx0 - PAD), max(0, by0 - PAD),
            min(cell.width, bx1 + PAD), min(cell.height, by1 + PAD),
        ))

    cell.save(os.path.join(OUT, name))
    print(f"{name:24} {cell.size}")

print("done")
