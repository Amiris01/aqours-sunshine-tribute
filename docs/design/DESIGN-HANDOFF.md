# Aqours Tribute — Redesign Handoff

A brief for redesigning the **Love Live! Sunshine!! / Aqours** fan-tribute page.
Hand this whole file (plus the prompt at the bottom) to Claude Design.

---

## 1. What this is

A single-page React (Vite) fan tribute to **Aqours**, the nine-member school
idol group from *Love Live! Sunshine!!*. Sunny seaside identity (Numazu coast):
blue sky, sun, animated waves, warm "mikan orange" accents. Each girl has an
**image color** that themes her section.

**Stack:** React 18 + Vite, hand-written CSS in `src/index.css` (no framework,
no Tailwind). Fonts: `Nunito` (body) + `Fredoka` (display). Assets live in
`public/assets/` (logo, 9 portraits, 9 emblems, sub-unit emblems).

**Goal of this redesign:** keep the warm Aqours seaside identity, but push it
**bolder / more editorial** (bigger swings in layout, art direction, hierarchy —
less "templated") **and meaningfully improve the mobile / responsive
experience**. This is a refinement *with ambition*, not a rebrand. Do **not**
change the content, the nine members, the color system, or the asset pipeline.

---

## 2. Current structure (top → bottom)

| # | Section | Component | Notes |
|---|---------|-----------|-------|
| 1 | **Hero** | `App.jsx` | Full-viewport sky gradient, bobbing sun, drifting clouds, animated SVG waves at the bottom. Eyebrow → logo image → tagline, staggered fade-up. Scroll cue. Scroll parallax on sun + content. |
| 2 | **About / intro** | `App.jsx` | Eyebrow, big `h2`, lead paragraph, 3 count-up stats (9 Members / 3 Sub-units / 2016 Debut). |
| 3 | **Members header** | `App.jsx` | Centered eyebrow + `h2` + lead. |
| 4 | **Member sections ×9** | `components/MemberSection.jsx` | One full-width band per member, themed to `--c` (her color). Zigzag layout (`flip` on odd index): portrait + emblem on one side, info on the other. Info = accent bar, name (EN + JP), unit/oshi chips, blurb, 2-col profile grid (CV, birthday, zodiac, grade, age, height, blood, trademark). Portrait has hover zoom + bottom vignette + giant number badge. |
| 5 | **Sub-units** | `components/SubUnits.jsx` | 3 themed cards (CYaRon!, AZALEA, Guilty Kiss): top color bar, name, tagline, member list with emblems. |
| 6 | **Discography** | `components/DiscCard.jsx` | Grid of square album-art tiles (Spotify covers). Hover lifts + zooms art, reveals a green play button. Clicking a tile docks it in the now-playing bar. |
| 7 | **Now-playing bar** | `components/NowPlayingBar.jsx` | Fixed bottom dock, frosted glass. Cover + title, prev/play/next, custom scrubber, equalizer. Drives a clipped (0-height) Spotify iframe for real playback. |
| 8 | **Footer** | `App.jsx` | Wave divider, gradient "Shine!!" wordmark, fan-disclaimer note. |

**Persistent chrome:** top scroll-progress bar (rainbow gradient); right-side
**dot rail** (one dot per member, themed, active dot scales up on scroll).

---

## 3. Design language today (the baseline to evolve)

- **Palette:** sky blues (`#6fc5f4`→`#eaf8ff`), cream `#fff9ef`, ink `#143a4e`,
  member accents (orange `#ff7d2e`, pink, aqua, crimson, sky, grey-purple,
  yellow, purple, ruby-pink). Spotify green `#1db954` for playback.
- **Type:** `Fredoka` for all display/headings (rounded, friendly, bold);
  `Nunito` for body. Big fluid `clamp()` headings (up to ~66px h2, hero logo art).
- **Motion:** scroll-reveal (fade-up + slight scale) via `useReveal`; count-up
  stats; hero stagger; portrait/disc hover lifts; equalizer; wave loops; sun
  bob; cloud drift. **All gated behind `prefers-reduced-motion: reduce`** — keep
  this discipline.
- **Shape:** very rounded (radius 16–38px), soft long-throw shadows, color-mix
  tints per member.

**What reads as "templated" right now (fair game to push):**
- The 9 member bands are structurally identical (alternating L/R) — visually
  monotonous over a long scroll.
- Hero is pretty but conventional (centered logo + tagline over a gradient).
- The About stats row is a generic 3-up.
- Section rhythm is uniform `128px` vertical padding throughout — no editorial
  pacing or contrast.

---

## 4. Redesign direction (priorities, in order)

### A. Bolder / more editorial
- Give the page a stronger **art-directed spine**. Consider: an asymmetric or
  overlapping hero; a member showcase that varies (e.g. a featured/lead
  treatment for Chika, sub-unit-grouped clusters, or scale/rotation variety)
  instead of nine identical mirror bands; oversized numerals, type that bleeds
  off-edge, layered emblems as graphic elements.
- Introduce **editorial pacing**: vary section width/density/background so the
  scroll has rhythm (tight → wide → full-bleed), not one constant column.
- Lean into the **nine-color system** as the page's signature — let color drive
  composition, not just tint backgrounds.

### B. Mobile / responsive (must improve)
- Current mobile collapses member bands to stacked columns and hides the dot
  rail below 760px — functional but flat. Design **mobile-first** moments: a
  better member-browsing pattern on phones (swipe carousel? sticky color tabs?),
  a thumb-reachable now-playing bar, hero that doesn't waste a full viewport.
- Verify the now-playing bar, scrubber, and disc grid all work at 360–420px.
- Keep tap targets ≥44px; keep the Spotify iframe playback mechanism intact
  (it must stay rendered, just clipped — see `index.css` `.np-hidden-host`).

### C. Keep the vibe & the rails
- Same warmth, same seaside Aqours identity, same fonts/palette as the starting
  point (evolve, don't replace).
- Preserve: the 9 members + all profile data, the 3 sub-units, the discography +
  Spotify playback, scroll-progress + dot-rail concepts (redesign their *look*,
  keep their *function*), and `prefers-reduced-motion` support.

---

## 5. Hard constraints (do not break)

1. **Data is fixed.** Read from `src/data.js` — don't invent or remove members,
   units, tracks, or profile fields. `members`, `subunits`, `discs` are the
   sources of truth.
2. **Assets are fixed.** Portraits/emblems/logo are in `public/assets/`. Don't
   rename or re-slice; reference existing paths.
3. **Stack is fixed.** React + Vite + plain CSS in `src/index.css`. No CSS
   framework, no new heavy deps without calling it out.
4. **Playback must keep working.** The `NowPlayingBar` Spotify-iframe approach
   (clipped, not display:none) is load-bearing — preserve the mechanism.
5. **Accessibility:** keep `prefers-reduced-motion`, focus-visible states, and
   semantic headings; improve contrast where the redesign allows.
6. It's a **fan tribute** — keep the disclaimer in the footer.

---

## 6. Deliverable

Redesigned `src/index.css` + updated component JSX (`App.jsx`,
`MemberSection.jsx`, `SubUnits.jsx`, `DiscCard.jsx`, `NowPlayingBar.jsx`,
`Waves.jsx`) as needed. Explain the art-direction decisions and the mobile
strategy. Don't touch `data.js` content or the asset files.
