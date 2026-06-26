# Drop your art here

This folder is where you put the real images for the Aqours tribute page.
Everything else (sun, clouds, waves, silhouettes) is drawn with CSS/SVG and needs
no files. Only **logos / emblems** and **member portraits** are real images.

Files placed in `public/` are served from the site root, so a file at
`public/assets/logo/aqours-logo.png` is reachable at `/assets/logo/aqours-logo.png`.

After you drop files in (using the recommended names below), tell me and I'll
wire them into the page — I'll swap each placeholder slot / silhouette for the
real image automatically.

---

## 1. Group logo  →  `logo/`

| What | Recommended filename | Notes |
|------|----------------------|-------|
| Aqours group logo (hero) | `logo/aqours-logo.png` | Shown in the hero. Slot is **300 × 116 px** (fits via `object-fit: contain`). Transparent PNG or SVG ideal. |

## 2. Member emblems  →  `members/` (optional)

One small emblem/logo per member, shown above each portrait. **Optional** — if you
skip these, the dashed placeholder stays. Slot is **full-width × 116 px**.

| # | Member | Recommended filename |
|---|--------|----------------------|
| 01 | Chika Takami    | `members/01-chika-emblem.png` |
| 02 | Riko Sakurauchi | `members/02-riko-emblem.png` |
| 03 | Kanan Matsuura  | `members/03-kanan-emblem.png` |
| 04 | Dia Kurosawa    | `members/04-dia-emblem.png` |
| 05 | You Watanabe    | `members/05-you-emblem.png` |
| 06 | Yoshiko Tsushima| `members/06-yoshiko-emblem.png` |
| 07 | Hanamaru Kunikida| `members/07-hanamaru-emblem.png` |
| 08 | Mari Ohara      | `members/08-mari-emblem.png` |
| 09 | Ruby Kurosawa   | `members/09-ruby-emblem.png` |

## 3. Member portraits  →  `members/` (optional)

If you have licensed character art, drop one square image per member to replace
the white silhouette stand-in. **Square images** work best (the frame is 1:1,
`border-radius: 38px`, cropped via `object-fit: cover`).

| # | Member | Recommended filename |
|---|--------|----------------------|
| 01 | Chika Takami    | `members/01-chika.png` |
| 02 | Riko Sakurauchi | `members/02-riko.png` |
| 03 | Kanan Matsuura  | `members/03-kanan.png` |
| 04 | Dia Kurosawa    | `members/04-dia.png` |
| 05 | You Watanabe    | `members/05-you.png` |
| 06 | Yoshiko Tsushima| `members/06-yoshiko.png` |
| 07 | Hanamaru Kunikida| `members/07-hanamaru.png` |
| 08 | Mari Ohara      | `members/08-mari.png` |
| 09 | Ruby Kurosawa   | `members/09-ruby.png` |

---

## Format / size tips
- **Format:** PNG (transparent) or SVG for logos; PNG/JPG/WebP for portraits.
- **Portraits:** aim for ~600 × 600 px or larger, square.
- **Logos/emblems:** transparent background looks best against the page.
- Filenames are only *recommendations* — if you use different names, just tell me
  and I'll match them.

## Rights reminder
This is a fan tribute. Official Aqours character art and logos are
rights-reserved — only add art you have the right to use. If you leave a slot
empty, the page keeps the clearly-marked placeholder, which is the intended
default.
