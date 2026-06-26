# Scroll Presentation Design — Cinematic member showcase + tailored section animations

**Date:** 2026-06-26
**Status:** Approved (design), pending implementation plan

## Goal

Make the page feel like a smooth, intentional presentation as the user scrolls.
The centerpiece is a **pinned, cinematic member showcase** (slideshow-style
crossfade between the nine girls). Every other section gets a **tailored**
scroll animation suited to its content — not one blanket effect — so the whole
page reads as a cohesive, varied presentation rather than a templated default.

Hard constraints carried from the existing site:

- `prefers-reduced-motion` MUST disable all scroll-driven motion and fall back
  to static / simple-fade rendering. No scrubbing, no pinning under it.
- `data.js` stays the source of truth; member ordering and content untouched.
- Initial bundle stays lean: any animation library is **lazy-loaded** (like
  Three.js already is), not in the initial chunk.
- Mobile tuning (100svh hero, address-bar handling, existing breakpoints) is
  preserved. Pinning is **desktop-only**; mobile uses lighter reveals.

## Dependency

Add **`gsap`** (bundles `ScrollTrigger`). Justification: buttery pinning and
scrubbed timelines are hard to get right by hand; GSAP is the industry standard
and `ScrollTrigger.matchMedia` cleanly handles the desktop-vs-mobile and
reduced-motion branching plus resize re-measurement.

- GSAP is **lazy-loaded** via dynamic `import()` inside an effect, so it is code
  split out of the initial bundle and only fetched when the relevant sections
  approach. The reduced-motion / mobile-fallback path does NOT load GSAP at all.
- ~50KB min (~23KB gzip), isolated in its own chunk.

## Architecture overview

A single new orchestration hook plus one new wrapper component:

1. **`useGsapContext()`** (new, `src/hooks.js` or `src/anim/useGsap.js`) — lazy
   loads GSAP + ScrollTrigger once, registers the plugin, exposes a ready flag
   and a `matchMedia` helper. Tears everything down on unmount. Used by all
   animated sections so GSAP loads exactly once.

2. **`MemberShowcase`** (new, `src/components/MemberShowcase.jsx`) — wraps the
   nine `MemberSection`s and owns the pinned timeline.

3. **Section-level animation wiring** — small, self-contained effects attached
   to existing sections (About, Roster, Sub-units, Discography, Footer) via a
   shared lightweight helper. Hero parallax is left exactly as-is.

The existing `useReveal` hook stays and becomes the reduced-motion / mobile
fallback mechanism for every section.

### Branching strategy (single source of truth)

All scroll motion is gated through one `gsap.matchMedia()` instance:

- `(min-width: 900px) and (prefers-reduced-motion: no-preference)` → **full
  desktop experience**: pinned member showcase + scrubbed section timelines.
- `(max-width: 899px) and (prefers-reduced-motion: no-preference)` → **mobile
  experience**: NO pinning. Members + sections use enter-once reveals (fade +
  slide/scale), driven by GSAP `ScrollTrigger` (no scrub) OR the existing
  `useReveal` — see Mobile section.
- `(prefers-reduced-motion: reduce)` → **no GSAP**: static layout, only the
  existing CSS `.reveal` opacity fade (or nothing). GSAP is never imported here.

`matchMedia` auto-disposes the wrong-branch animations on resize/preference
change and re-runs setup for the new branch, and calls `ScrollTrigger.refresh()`
after fonts/images settle.

## Member showcase (the centerpiece)

### Desktop — pinned crossfade slideshow

- The `MemberShowcase` container is **pinned** for a scroll distance of roughly
  `N × ~85vh` (N = 9). Each member "owns" an equal slice of that distance.
- A single scrubbed timeline maps scroll progress → member index. For the
  transition between member *i* and *i+1*:
  - Outgoing banner: `scale 1 → ~1.08` + `opacity 1 → 0`.
  - Outgoing info card: slide out toward its card side + fade.
  - Incoming banner: `scale ~1.08 → 1` + `opacity 0 → 1` (fade up underneath).
  - Incoming info card: slide in from its card side + fade in.
  - Incoming signature: fade/draw in slightly after the card settles (stagger).
- Only the active + adjacent members are visible (others `opacity 0`,
  `visibility hidden` for paint cost). Banners use the already-optimized webp.
- After the last member, the pin releases and normal flow resumes (Sub-units).

### Mobile — reveal on scroll (no pin)

- Members render in normal vertical flow (current layout).
- Each `MemberSection` reveals on entry: banner fades + subtle scale-down to
  rest, info card slides in from its `card-side`, signature fades in. Enter-once
  (no scrub) to stay smooth on touch and respect native momentum scrolling.
- This is essentially the current `useReveal` behavior, enhanced. No GSAP pin.

### `MemberSection` changes

- Minimal. It already forwards a ref, sets `--c`, and exposes `.msec-banner`,
  `.minfo`, `.m-sign` as targetable nodes.
- Expose refs (or stable class hooks) for banner / info / signature so the
  showcase timeline can target them per member. Keep the existing CSS `:hover`
  zoom for the mobile/fallback path.
- No content or data changes.

### Removed: dot rail + roster "jump to member" during showcase

Per decision, the **right-side dot rail is removed** for now (it does not map
cleanly onto a pinned timeline). Specifically:

- `CONFIG.dotNav` set to `false` / the dots markup + its IntersectionObserver
  removed from `App.jsx`.
- The roster carousel's **"jump to member" click** (`scrollToMember`) is
  simplified: on mobile it scrolls to the member's section as today; on desktop,
  because members are pinned, a precise jump is out of scope — the roster
  remains a visual browse strip and its click is either disabled on desktop or
  scrolls to the start of the showcase. (Roster cards still animate in — see
  below.) This avoids the fiddliest pinned-offset math.

## Tailored per-section animations

Each section gets an effect matched to its content. All are enter-once on mobile
and may be lightly scrubbed on desktop where noted. All gated by the matchMedia
branching; all no-op under reduced-motion (fall back to current `.reveal`).

| Section | Animation |
|---|---|
| **Hero** | Unchanged. Existing parallax (sun / content / cue) and progress bar stay exactly as-is. |
| **About / Intro** | Eyebrow + h2 + lead **stagger up** on entry (line by line). Stat numbers keep the existing count-up (`useCountUp`), triggered when the block enters. |
| **Roster carousel** | The nine cards **deal in** left→right with a small stagger + fade + slight rise as the strip enters view. |
| **Members** | **Pinned crossfade slideshow** (desktop) / reveal-on-scroll (mobile) — see above. |
| **Sub-units** | The three unit cards **scale + fade in** with a subtle flip/tilt and staggered timing; unit logos settle last. |
| **Discography** | The vinyl watermark **rotates in** (spin-up to rest) as the section enters; disc cards **cascade** in with a stagger. |
| **Footer** | The foot wave **rises** into place and the mark/sub/note **fade up** together. |

Implementation note: prefer one small reusable helper (e.g. `revealStagger(el,
children, opts)`) over bespoke code per section, so the section effects stay
short and consistent. The member showcase is the only bespoke timeline.

## Integration points in `App.jsx`

- Replace the `members.map(<MemberSection/>)` block (current lines ~252–261)
  with `<MemberShowcase members={members} />`.
- Remove the dot-rail block (lines ~127–139) and its IntersectionObserver effect
  (lines ~87–100); set `CONFIG.dotNav = false` or delete it.
- `scrollToMember` simplified per the roster note above.
- Attach section animations to About, Roster, Sub-units, Discography, Footer via
  the shared helper / `useGsapContext`.
- Hero parallax effect and progress bar effect: **unchanged**. The progress bar
  math reads `document.documentElement.scrollHeight`, which naturally includes
  the added pin distance — no change needed.

## Reduced-motion & accessibility

- Under `prefers-reduced-motion: reduce`: GSAP is never loaded; sections render
  with the existing static `.reveal` fade (or fully static). Members render in
  normal flow, fully visible. No pinning, no scrub, no scroll-jacking.
- Pinning never traps the user: it is a finite scroll distance that releases;
  there is no infinite or blocking scroll-jack. Keyboard scrolling (space /
  arrows / page-down) advances through the pinned distance normally.
- Focus order is unaffected (DOM order unchanged).

## Performance

- GSAP lazy-loaded in its own chunk; not in initial load; not loaded at all
  under reduced-motion.
- Pinned members: only active ± neighbor painted; others hidden.
- Animate only `transform` and `opacity` (compositor-friendly); no layout
  thrash. `will-change` applied sparingly to the active banner/card.
- `ScrollTrigger.refresh()` after fonts + banner images load to fix measurement.

## Testing / verification

- Manual: desktop pinned slideshow scrubs smoothly forward AND backward through
  all nine; releases cleanly to sub-units; no jump/flicker at pin boundaries.
- Manual: mobile (narrow viewport) shows reveal-on-scroll, native momentum
  scroll intact, no sticky/laggy pin.
- Manual: with OS "reduce motion" on, no GSAP network request, page fully
  static-readable, all members visible.
- Resize desktop↔mobile widths: animations tear down/rebuild without leftover
  pinned spacers or stuck transforms.
- `npm run build` passes; GSAP appears as a separate lazy chunk, initial chunk
  size not materially increased.
- Spotify player / NowPlayingBar still functions (unrelated, but verify no
  z-index / pin-overflow regression).

## Out of scope

- Right-side dot rail (removed for now; may return later with pinned-aware
  active state).
- Precise desktop roster "jump to specific member" within the pinned timeline.
- Hero redesign (parallax kept as-is).
- Any `data.js` / content / ordering changes.
