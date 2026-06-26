# Aqours Tribute — Redesign Design Spec

**Date:** 2026-06-25
**Scope:** Bolder, more editorial redesign of the single-page Aqours fan tribute,
grounded in Aqours' actual identity, with a WebGL (Three.js) hero. Refinement
with ambition — not a rebrand. Companion to `DESIGN-HANDOFF.md`.

---

## 1. Concept: "From zero, by hand, together."

The redesign is rooted in what Aqours *means*, not generic "sunny seaside":

- **"Aqua" + "ours"** — water that belongs to *us*. Collective, not individual stars.
- **Zero → creation.** Aqours start from nothing in a fading seaside school and
  build their radiance by hand. The page should feel **earned and handmade**, not
  corporate-polished.
- **The sea, not the sky.** μ's are gods in the sky (unreachable light); Aqours
  are in the water, earning their *own* radiance. The **blue feather** is earned,
  not blessed; the **blue bird** (water + light fused) is the radiance they make.
- **Nine vulnerable individuals → strength through each other.** This is the
  "human" thesis: flawed people who shine by supporting one another. **No single
  star** — explicitly *not* a featured-Chika hierarchy.

Three motifs express this throughout:

1. **The sea, not the sky (depth, not backdrop).** Scroll *down into water*: bright
   surface at the hero → palette deepens toward discography/footer. The waves are
   the threshold between borrowed sky-light and Aqours' own earned water.
2. **"Ours" — collective over star treatment.** Members shown as a varied editorial
   grid where all nine carry **equal weight but distinct personality**, scale/density
   driven by *character* (from `data.js`), never by rank.
3. **The blue feather / blue bird as earned signature.** A recurring translucent
   blue feather motif (introduced in the WebGL hero, settles in the footer) replaces
   generic rainbow chrome with something meaningful. Scroll-progress + dot-rail are
   reframed as the feather's path / bird's flight (function preserved, look redesigned).

---

## 2. Decisions locked during brainstorming

| Decision | Choice | Rationale |
|---|---|---|
| Member showcase (desktop) | **Editorial varied grid, equal weight, character-driven** | "Ours" thesis — no single star. (Revised away from "featured Chika" after research.) |
| Member showcase (mobile) | **Well-paced stacked cards** (one polished full card each, no carousel JS) | Bulletproof; avoids scroll-snap × Spotify-iframe risk. |
| Hero + pacing | **Asymmetric hero, full editorial pacing** (tight → wide → full-bleed) | Breaks the templated centered-column look. |
| WebGL library | **`npm install three`** (bundled, pinned, tree-shaken) | Idiomatic Vite; offline dev. (Consciously overrides "no heavy deps" — called out.) |
| WebGL scope | **Hero only**, single canvas, unmounts on scroll-past | Biggest "wow" up front; keeps perf/mobile sane. |

---

## 3. Architecture & components

Stack unchanged: React 18 + Vite + hand-written CSS in `src/index.css`. New
dependency: `three`. No CSS framework. `data.js` content and `public/assets/`
are untouched.

| Component | Change |
|---|---|
| `App.jsx` | Rework hero JSX to host `<WaterBackground>`; asymmetric wordmark; reframed progress bar + dot-rail (feather-path look); editorial pacing wrappers around sections. |
| `components/WaterBackground.jsx` | **New.** Three.js hero canvas: animated water surface, sun light/bloom, drifting blue feathers. Owns its rAF loop, resize, visibility pause, reduced-motion + WebGL-failure fallback, and unmount-on-scroll-past. |
| `components/MembersGrid.jsx` | **New (or refactor of the `members.map` block).** Owns the desktop varied grid layout + per-member character variants; renders `MemberSection` cards. |
| `components/MemberSection.jsx` | Restyled: oversized numeral, emblem-as-watermark, `--c` structural spine, character-driven variant via a `variant`/size prop. Mobile = full stacked card. |
| `components/SubUnits.jsx` | Restyled as the deepest-color "together" cluster band. Structure intact. |
| `components/DiscCard.jsx` | Restyled to match deeper-water palette. Playback trigger unchanged. |
| `components/NowPlayingBar.jsx` | Restyled (frosted, thumb-reachable on mobile). **Spotify-iframe mechanism preserved exactly** (clipped host, not `display:none`). |
| `components/Waves.jsx` | May gain a deeper color variant for the threshold; SVG approach intact. |
| `src/index.css` | Major rework: tokens for depth gradient + feather motif; editorial pacing utilities; varied-grid layout; mobile stacked-card rules; restyled chrome. **CSS hero fallback (current sky/sun/clouds) kept, not deleted.** |
| `src/hooks.js` | Possibly add a small hook for in-view canvas mounting; existing `useReveal`/`useCountUp` unchanged. |

---

## 4. Section-by-section

### Hero — WebGL "surface"
Single Three.js canvas behind the hero (replaces static CSS sky/sun/clouds for the
GL path; waves SVG stays as bottom threshold):
- Animated water surface (low-poly/shader plane), mikan-orange + sky-blue specular,
  gentle calmed swell.
- Sun as light source / bloom sprite, bobbing (echoes current `bob`).
- 3–6 instanced **translucent blue feathers** drifting (earned-signature motif intro).
- **Asymmetric wordmark:** logo offset, oversized, bleeding off the right edge.
  Eyebrow → logo → tagline stagger preserved.
- **Degradation:** `prefers-reduced-motion` OR WebGL-init failure → fall back to the
  *existing* CSS sky+sun+clouds (retained in stylesheet). Canvas pauses on
  `document.hidden`; unmounts after scroll-past via IntersectionObserver.

### About — "from zero"
Tight column (the *tight* pacing beat). Lead leans into "started from zero, by the
sea." Count-up stats **9 / 3 / 2016 stay** (data fixed). Gradient descent into
deeper blue begins.

### Members — "ours" (varied grid)
CSS Grid, all nine **equal-weight but character-driven**: scale/density/offset themed
per girl using real `data.js` fields (e.g. You wide/sporty, Yoshiko/Yohane
dark/dramatic, Hanamaru small/gentle, Mari bleeding off-edge/loud). Oversized
numerals, emblem-as-watermark, her `--c` as structural spine.
**Mobile:** collapses to well-paced stacked cards — one polished full card per
member, ≥44px tap targets, no carousel JS.

### Sub-units / Discography / Footer — "deep water"
- **Sub-units:** 3 cluster cards, deepest-color band — the "together" payoff.
- **Discography:** album-art grid; **NowPlayingBar Spotify-iframe mechanism
  preserved exactly**. Thumb-reachable bar/scrubber verified at 360–420px.
- **Footer:** deepest blue; blue feather settles / blue bird as the made radiance.
  Disclaimer kept.

---

## 5. Data flow

- `data.js` → `App` → `MembersGrid` → `MemberSection` (unchanged read path; grid adds
  a per-member `variant` derived from index/character, not new data).
- `discs` → `DiscCard` (trigger) → `App` `playingIndex` state → `NowPlayingBar` →
  clipped Spotify iframe (mechanism unchanged).
- `WaterBackground` is presentational, no app data; self-contained GL state.

---

## 6. Motion & accessibility

- **All** new motion (WebGL loop, feather drift, pacing reveals) gated behind
  `prefers-reduced-motion: reduce`. WebGL path renders a single static frame or
  defers entirely to the CSS fallback under reduced motion.
- Keep `focus-visible` states, semantic headings, ≥44px tap targets.
- Improve contrast where the deeper-water palette allows (light text on deep blue).

---

## 7. Hard constraints honored

1. **Data fixed** — read `members` / `subunits` / `discs` from `data.js`; no content
   added/removed.
2. **Assets fixed** — reference existing `public/assets/` paths; no rename/re-slice.
3. **Stack** — React + Vite + plain CSS; only new dep is `three` (explicitly approved).
4. **Playback** — NowPlayingBar Spotify-iframe (clipped, not `display:none`) preserved.
5. **A11y** — `prefers-reduced-motion`, focus-visible, semantic headings preserved.
6. **Fan tribute** — footer disclaimer kept.

---

## 8. Risks & mitigations

- **Three.js perf on low-end mobile** → hero-only + unmount-on-scroll-past + DPR cap
  + visibility pause. Reduced-motion users never start the loop.
- **WebGL unavailable / context-lost** → CSS sky/sun/clouds fallback retained and used.
- **Bundle size (+three)** → tree-shaken import (only used modules); accepted trade-off.
- **Varied grid reflow on resize** → grid built mobile-first; desktop variants layered
  via min-width media queries so the stacked baseline always works.
- **Scroll-snap × iframe** avoided by choosing stacked cards (no snap) on mobile.

---

## 9. Out of scope

- No change to `data.js` content, asset files, or the asset pipeline.
- No CSS framework, no router, no backend.
- No featured/lead member hierarchy (deliberately rejected).
- No full-page WebGL (hero-only by decision).
