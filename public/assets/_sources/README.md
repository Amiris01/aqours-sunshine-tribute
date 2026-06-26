# `_sources/` — original, unedited assets (reference only)

These are the **raw, unedited** assets as originally supplied. **Nothing here is
loaded by the page** — they are kept only so the page-facing images can be
re-derived later. The live page uses the processed files in
`../members/` and `../logo/`.

> The leading underscore keeps this folder sorted first and signals "not used at
> runtime". It is also excluded from the production build (see
> `vite.config.js` → `publicDir` copy ignore), so it won't bloat `dist/`.

## Folder map

```
_sources/
├── characters/   raw full-body character cut-outs (transparent bg)
├── emblems/      the combined 3x3 emblem sheet
└── logo/         the original untrimmed Aqours logo
```

## Characters → processed portraits

Each raw cut-out was trimmed to the figure, scaled to a uniform height, centered,
and bottom-anchored onto a 1000×1000 transparent square.

| # | Source file (this folder)        | Original filename            | → Page portrait (`../members/`) |
|---|----------------------------------|------------------------------|---------------------------------|
| 01| `characters/01-chika.webp`       | `Takami_Chika_29.webp`       | `01-chika.png` |
| 02| `characters/02-riko.png`         | `Sakurauchi Riko.png`        | `02-riko.png` |
| 03| `characters/03-kanan.webp`       | `Kanan_05_01.webp`           | `03-kanan.png` |
| 04| `characters/04-dia.webp`         | `Kurosawa_Dia_29.webp`       | `04-dia.png` |
| 05| `characters/05-you.webp`         | `Watanabe_You_29.webp`       | `05-you.png` |
| 06| `characters/06-yoshiko.webp`     | `Tsushima_Yoshiko_29.webp`   | `06-yoshiko.png` |
| 07| `characters/07-hanamaru.webp`    | `Hanamaru_05_01.webp`        | `07-hanamaru.png` |
| 08| `characters/08-mari.webp`        | `Ohara_Mari_29.webp`         | `08-mari.png` |
| 09| `characters/09-ruby.webp`        | `Kurosawa_Ruby_29.webp`      | `09-ruby.png` |

## Emblems → processed emblems

`emblems/emblems-sheet.png` (original `members-logo.png`) is a **3×3 grid** of the
nine member emblems. It was sliced cell-by-cell, each tight-cropped to its art,
producing `../members/NN-name-emblem.png`:

| Grid cell (row, col) | Emblem | → Page file |
|----------------------|--------|-------------|
| (0,0) | mikan      | `01-chika-emblem.png` |
| (0,1) | piano      | `02-riko-emblem.png` |
| (0,2) | sailboat   | `05-you-emblem.png` |
| (1,0) | flower     | `07-hanamaru-emblem.png` |
| (1,1) | lollipop   | `09-ruby-emblem.png` |
| (1,2) | bat        | `06-yoshiko-emblem.png` |
| (2,0) | star       | `08-mari-emblem.png` |
| (2,1) | dolphin    | `03-kanan-emblem.png` |
| (2,2) | plum       | `04-dia-emblem.png` |

## Logo → processed logo

`logo/aqours-logo.png` is the **original untrimmed** logo (1024×576, lots of
transparent padding). It was upscaled 2× (Lanczos + mild sharpen) and trimmed to
produce `../logo/aqours-logo.png` (2038×760), used as the hero wordmark.

---

## Favicon

The browser tab icon is derived from the Chika mikan emblem
(`../members/01-chika-emblem.png`), placed on a sunny rounded-square gradient.
Generated files (in `../../`, i.e. `public/`): `favicon.ico` (16/32/48),
`favicon-32.png`, `apple-touch-icon.png` (180×180). Linked from `index.html`.

---

### Re-deriving the page assets
The processing scripts (Python + Pillow) used, in `scripts/`:
- `portraits.py` — trim + normalize characters into square portraits
- `slice.py` — cut the emblem sheet into 9 tight-cropped emblems
- `upscale.py` — upscale + trim the logo
- `favicon.py` — build the favicon set from the Chika emblem

Run each from the `scripts/` folder: `python <name>.py`

If you replace any source here, re-run the matching step to regenerate the
page-facing file with the same name.
