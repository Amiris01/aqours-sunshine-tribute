# Handoff: Aqours Tribute — Editorial Redesign

## Overview
A bolder, more editorial redesign of the single-page **Love Live! Sunshine!! / Aqours**
fan-tribute site. It keeps the warm Numazu-seaside identity (sky/sun/waves, Fredoka +
Nunito, the nine-color member palette, Spotify-driven now-playing dock) but breaks the
monotony of nine identical mirrored member bands, gives the page an art-directed spine
with varied pacing, and rebuilds the mobile experience around a sticky color-tab
navigator and a thumb-reachable player.

## About the design files
**These are not throwaway HTML mockups — the `src/` folder contains real, production-ready
React + plain-CSS source** authored to match the existing stack (React 18 + Vite, hand-written
CSS in `src/index.css`, no framework). The intended path is to **drop these files into the
existing repo** in place of the current ones, NOT to re-derive them from a screenshot.

- `src/index.css` — full rewrite (drop-in replacement).
- `src/App.jsx`, `src/components/MemberSection.jsx`, `SubUnits.jsx`, `DiscCard.jsx` — updated.
- `src/components/NowPlayingBar.jsx`, `Waves.jsx` — unchanged from the original (included for completeness).
- `src/hooks.js` — `useReveal` + `useCountUp`. The original repo already has a `hooks.js`;
  **diff against yours and keep your version if it differs** — this one is provided only so the
  bundle is self-contained.
- `src/data.js` — **unchanged content** (the brief froze it). Included only for reference; do not overwrite yours.

The `preview/` folder holds `Aqours.dc.html` — a self-contained visual reference of the redesign
(open it in a browser). It is a *design prototype only*; ignore its internal markup conventions
and use the real `src/` files as the source of truth. In the preview, portraits/emblems render as
striped placeholders because `public/assets/` was not part of this bundle — they are wired to the
correct paths in the real JSX.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, layout, motion, and responsive behavior are
all specified in `src/index.css`. Implement pixel-for-pixel by using the provided files.

## Hard constraints carried over from the original brief (do NOT break)
1. **Data is fixed** — read from `src/data.js` (`members`, `subunits`, `discs`). Do not add/remove
   members, units, tracks, or profile fields.
2. **Assets are fixed** — portraits/emblems/logo live in `public/assets/`; reference existing paths
   (`/assets/members/0X-name.png`, `/assets/members/0X-name-emblem.png`, `/assets/logo/aqours-logo.png`).
3. **Stack is fixed** — React + Vite + plain CSS in `src/index.css`. No CSS framework, no new deps.
4. **Playback is load-bearing** — `NowPlayingBar` drives a *clipped (0-height), not `display:none`*
   Spotify iframe via the IFrame API. Preserve the `.np-hidden-host` mechanism exactly.
5. **Accessibility** — keep `prefers-reduced-motion`, `:focus-visible` states, semantic headings.
6. It is a **fan tribute** — keep the footer disclaimer.

---

## Page structure (top → bottom)

| # | Section | Component | What changed |
|---|---------|-----------|--------------|
| 1 | Hero | `App.jsx` | Now **asymmetric / left-anchored**. Sun moved to the right; height capped at `min(92vh, 880px)` so it never wastes a full viewport. Adds a **nine-color signature chip strip** under the tagline. |
| 2 | About / intro | `App.jsx` | **Two-column editorial layout**: copy left, oversized rule-divided stats stacked right (`9` Members / `3` Sub-units / `2016` Debut). Count-up retained on 9 & 3. |
| 3 | Members header | `App.jsx` | Left-aligned (was centered). |
| 3b | **Mobile member tabs** | `App.jsx` | NEW. Sticky horizontal strip of nine numbered color chips (phones only); tap to jump to a member; active chip auto-centers. |
| 4 | Member bands ×9 | `MemberSection.jsx` | **The core redesign** — see below. |
| 5 | Sub-units | `SubUnits.jsx` | Dark **color-flooded headers** with emblem watermark; member rows with end swatch. |
| 6 | Discography | `DiscCard.jsx` | Lead album (`feature`) **spans two columns**; bigger play targets. Playback unchanged. |
| 7 | Now-playing dock | `NowPlayingBar.jsx` | Restyled via CSS only (edge-to-edge on mobile, ≥44px targets). JS unchanged. |
| 8 | Footer | `App.jsx` | Unchanged structure incl. disclaimer. |
| — | Desktop spine | `App.jsx` `.dots` | Right-side rail restyled as a **numbered nine-color tide line**; same scroll function. |

---

## The member-band system (most important change)

Instead of nine structurally identical mirror bands, each band is assigned one of three
**variants** by index, producing a tight → wide → full-bleed rhythm. The mapping lives in
`MemberSection.jsx`:

```js
const VARIANTS = ['flood','wide','tight','wide','flood','tight','wide','flood','wide']
//                  01      02     03      04     05      06     07      08     09
```

- **`flood`** — the member color floods the whole band (radial + linear gradient toward a dark
  mix), text goes white. Used for Chika (01, the "featured lead") and as accent breaks (05, 08).
- **`wide`** — roomy, generous padding, larger tint.
- **`tight`** — condensed padding, lighter tint, 2-column profile grid.

Plus, on every band:
- An **oversized numeral** (`.bignum`, `clamp(180px, 32vw, 420px)`) in the member hue bleeds off
  the leading edge (left, or right when `flip`).
- The **emblem becomes a large rotated watermark** (`.watermark`, ~8% opacity, 16% on flood).
- `flip` (from `data.js`, odd index) mirrors the portrait/info columns.

Each band sets `--c: <member.color>` on the `<section>`; all theming derives from it via
`color-mix(in srgb, var(--c) …)`.

### Member band layout
- Container `.mwrap`: CSS grid, `clamp(260px,34vw,400px) 1fr` (media | info); `.flip` swaps order.
- `.media`: column — `.portrait` then `.emblem-badge`.
- `.portrait`: `aspect-ratio: .86`, radius 34px, gradient bg from `--c`, large colored drop-shadow,
  bottom vignette (`::after`), hover lift + image scale. Renders `.portrait-img` if a portrait
  exists, else the `.sil-head` / `.sil-body` silhouette fallback. `.flood` portraits get a white
  inset outline.
- `.minfo`: `.m-index` ("Member 01") → `.m-name` (`clamp(34px,5.6vw,76px)`, balanced wrap) →
  `.m-jp` → `.chips` (unit + oshi color) → `.m-blurb` → `.pgrid` (4-col, 2-col on `tight`/mobile).

---

## Design tokens

**Root variables** (`:root` in `index.css`):
```
--ink: #143a4e;  --ink-soft: #3a6173;  --cream: #fff9ef;
--sky-deep: #0a6fa0;  --spotify: #1db954;  --maxw: 1180px;
```

**Member colors** (from `data.js`, applied as `--c`):
`#ff7d2e` Chika · `#f2799f` Riko · `#16b6a8` Kanan · `#e23b4b` Dia · `#36b6f0` You ·
`#8e8bb5` Yoshiko · `#f3c52b` Hanamaru · `#a673c4` Mari · `#ff7bb0` Ruby.

**Sky gradient:** `#6fc5f4 → #a4ddf9 → #d8f1fe → #eaf8ff`. **Page bg:** `#eaf8ff → #fff9ef`.

**Typography:** `Fredoka` (400/500/600/700) for all display/headings + UI labels; `Nunito`
(400/600/700/800) for body. Fluid `clamp()` throughout — e.g. `.h2` `clamp(34px,5.4vw,66px)`,
`.m-name` `clamp(34px,5.6vw,76px)`, `.bignum` `clamp(180px,32vw,420px)`.

**Radius:** portrait 34px · cards 20–26px · chips/pills 99px · memtab 14px · disc-art 22px.
**Shadows:** soft long-throw, e.g. `0 36px 70px -34px var(--c)` on portraits;
`0 24px 60px -20px rgba(20,58,78,.55)` on the dock.

**Motion:** scroll-reveal (`.reveal` → `.reveal.in`, fade-up + slight scale), count-up stats,
hero stagger (`hero-rise`), portrait/disc hover lifts, equalizer (`eq`), wave loop (`waveX`),
sun bob (`bob`), cloud drift (`drift`), bounce arrow. **All disabled under
`@media (prefers-reduced-motion: reduce)`** (see end of `index.css`).

---

## Responsive behavior

- **`@media (max-width: 1000px)`** — About collapses to one column; `.pgrid` → 2-col.
- **`@media (max-width: 760px)`** — desktop spine (`.dots`) hidden; sticky `.memtabs` shown;
  member bands stack (`.mwrap` → single column); `.media` becomes a row (portrait `44vw`, capped
  220px, + emblem); numerals shrink to `clamp(120px,40vw,220px)` but still bleed off-edge; dock
  goes edge-to-edge, hides the cover/title label, keeps ≥44px transport buttons.
- **`@media (max-width: 460px)`** — `.media` becomes a column (portrait on top, `min(64vw,260px)`);
  dock hides duration label; signature chips shrink.

Verified visually at 360px and 414px. Tap targets: memtab 46px, np-play 52px, np-skip/np-close 44px.

---

## State management (`App.jsx`)
- `activeDot` (number) — current member; set by an `IntersectionObserver` (`rootMargin -45% 0 -45%`)
  over the member `<section>`s. Drives both the desktop spine and the mobile tab highlight, and the
  effect that auto-centers the active mobile tab (`strip.scrollTo`, **no `scrollIntoView`**).
- `playingIndex` (number, -1 = closed) — docked track; passed to `NowPlayingBar`.
- Reveal/count-up state via `useReveal` / `useCountUp` (`hooks.js`).
- Scroll handler writes hero parallax + progress-bar `scaleX` directly to refs (no re-render).
- `CONFIG = { dotNav, parallax }` at the top of `App.jsx` toggles the spine and parallax intensity.

## Assets
No new assets introduced. Uses the existing `public/assets/` logo, 9 portraits, 9 emblems, and
sub-unit emblems, plus remote Spotify cover URLs already in `data.js`. Fonts: Google Fonts
`Fredoka` + `Nunito` (loaded the same way the project already loads them).

## Files in this bundle
```
src/index.css                      ← full rewrite (drop-in)
src/App.jsx                        ← updated
src/hooks.js                       ← reference (keep yours if it differs)
src/data.js                        ← unchanged (reference only)
src/components/MemberSection.jsx   ← updated (variant system, numerals, watermark)
src/components/SubUnits.jsx        ← updated
src/components/DiscCard.jsx        ← updated (feature prop)
src/components/NowPlayingBar.jsx   ← unchanged
src/components/Waves.jsx           ← unchanged
preview/Aqours.dc.html             ← visual reference prototype (open in a browser)
preview/support.js                 ← runtime for the preview only
```

## Implementation checklist
1. Replace `src/index.css` and the updated JSX files; diff `hooks.js`/`data.js` rather than overwriting.
2. Confirm the new `feature` prop on `DiscCard` and the `VARIANTS` mapping in `MemberSection` are present.
3. Verify Spotify playback still works (clipped iframe intact) and the dock is reachable on mobile.
4. Check the sticky mobile tab strip and desktop numbered spine both jump correctly.
5. Re-test `prefers-reduced-motion` and `:focus-visible` on tabs, dots, disc tiles, and dock buttons.
