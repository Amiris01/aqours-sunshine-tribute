# Scroll Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the page scroll like a presentation — a pinned cinematic crossfade slideshow for the nine members on desktop, plus tailored enter animations for every other section — all gated by viewport + reduced-motion.

**Architecture:** Add GSAP (lazy-loaded, own chunk) driven through a single `gsap.matchMedia()` that branches desktop (pinned showcase + scrubbed section reveals) vs mobile (enter-once reveals) vs reduced-motion (no GSAP, existing CSS `.reveal` only). A new `useGsap()` hook loads GSAP once; a new `MemberShowcase` component owns the pinned member timeline; a small shared `gsapReveal` helper wires the other sections.

**Tech Stack:** React 18, Vite 5, GSAP 3 + ScrollTrigger (lazy), existing CSS in `src/index.css`.

## Global Constraints

- `prefers-reduced-motion: reduce` → GSAP MUST NOT be imported; sections render via existing CSS `.reveal` (opacity fade) or fully static; members fully visible in normal flow; no pin, no scrub.
- GSAP is lazy-loaded via dynamic `import()` so it is a separate chunk, never in the initial bundle.
- `src/data.js` content and member ordering are NOT changed.
- Pinning is desktop-only: breakpoint `min-width: 900px`. Below 900px = mobile reveal path.
- Animate only `transform` and `opacity`. No layout-thrashing properties.
- Mobile tuning (100svh hero, address-bar handling, existing breakpoints) preserved; hero parallax + progress bar left exactly as-is.
- No test runner exists in this repo. "Verification" = `npm run build` passing + manual browser check at the stated viewport/setting. Each task says exactly what to look for.
- Dev server: `npm run dev -- --port 5188` → `http://localhost:5188/aqours-sunshine-tribute/`.
- Do NOT commit unless the plan step says to. (User asked work stay uncommitted until they say otherwise — every "Commit" step below is OPTIONAL and must be confirmed with the user before running.)

---

## File Structure

- **Create** `src/anim/useGsap.js` — lazy-loads + registers GSAP/ScrollTrigger once; exposes readiness. Single GSAP entry point.
- **Create** `src/anim/gsapReveal.js` — small reusable helpers (`gsapReveal`, `gsapStagger`) for section enter animations + the matchMedia branch predicate.
- **Create** `src/components/MemberShowcase.jsx` — wraps the nine `MemberSection`s; owns the pinned desktop timeline + mobile reveal.
- **Modify** `src/components/MemberSection.jsx` — expose banner/info/sign nodes for targeting; accept showcase-driven props.
- **Modify** `src/App.jsx` — swap members map → `<MemberShowcase>`; remove dot rail; wire section animations.
- **Modify** `src/components/SubUnits.jsx`, `src/components/DiscCard.jsx` — opt into the shared reveal where it improves on the current `useReveal`.
- **Modify** `src/index.css` — showcase pin/stage styles; section animation base states; reduced-motion guards.
- **Modify** `package.json` / `package-lock.json` — add `gsap` dependency.

---

## Task 1: Add GSAP dependency + lazy loader hook

**Files:**
- Modify: `package.json`
- Create: `src/anim/useGsap.js`

**Interfaces:**
- Produces: `useGsap()` → `{ gsap, ScrollTrigger, ready }` where `gsap`/`ScrollTrigger` are `null` until loaded and `ready` is a boolean. Loads + registers exactly once per app, lazily.
- Produces: `prefersReducedMotion()` → boolean (reads `matchMedia('(prefers-reduced-motion: reduce)').matches`).

- [ ] **Step 1: Install GSAP**

Run: `npm install gsap@^3.12.5`
Expected: `gsap` appears under `dependencies` in `package.json`; lockfile updated; no peer warnings that fail install.

- [ ] **Step 2: Create the lazy loader hook**

Create `src/anim/useGsap.js`:

```js
import { useEffect, useState } from 'react'

// Module-level cache so GSAP + ScrollTrigger load and register exactly once,
// no matter how many components ask for them.
let cached = null
let loadPromise = null

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function loadGsap() {
  if (cached) return Promise.resolve(cached)
  if (loadPromise) return loadPromise
  loadPromise = Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]).then(([gsapMod, stMod]) => {
    const gsap = gsapMod.gsap || gsapMod.default
    const ScrollTrigger = stMod.ScrollTrigger || stMod.default
    gsap.registerPlugin(ScrollTrigger)
    cached = { gsap, ScrollTrigger }
    return cached
  })
  return loadPromise
}

/**
 * Lazy-loads GSAP + ScrollTrigger on mount UNLESS the user prefers reduced
 * motion (then it never loads). Returns nulls until ready.
 */
export function useGsap() {
  const [state, setState] = useState(
    cached ? { ...cached, ready: true } : { gsap: null, ScrollTrigger: null, ready: false }
  )

  useEffect(() => {
    if (prefersReducedMotion()) return // never load GSAP under reduced motion
    if (cached) {
      setState({ ...cached, ready: true })
      return
    }
    let alive = true
    loadGsap().then((mods) => {
      if (alive) setState({ ...mods, ready: true })
    })
    return () => {
      alive = false
    }
  }, [])

  return state
}
```

- [ ] **Step 3: Verify build + lazy chunk**

Run: `npm run build`
Expected: build succeeds; output lists a separate `gsap`/`ScrollTrigger` chunk (e.g. `assets/ScrollTrigger-*.js` or a chunk containing gsap) distinct from `index-*.js`. The main `index-*.js` gzip size is not materially larger than before (GSAP is split out).

- [ ] **Step 4 (OPTIONAL — confirm with user first): Commit**

```bash
git add package.json package-lock.json src/anim/useGsap.js
git commit -m "Add GSAP (lazy-loaded) + useGsap hook"
```

---

## Task 2: Shared section-reveal helper

**Files:**
- Create: `src/anim/gsapReveal.js`
- Modify: `src/index.css` (add base hidden states for GSAP-driven reveals)

**Interfaces:**
- Consumes: `useGsap()` from Task 1 (caller passes the loaded `gsap`/`ScrollTrigger`).
- Produces: `gsapReveal(gsap, ScrollTrigger, el, opts)` → returns a cleanup function. Animates `el` (and optionally staggered children) from a hidden base state to visible when it enters the viewport. `opts`: `{ children?: NodeList|Element[], y?: number, stagger?: number, start?: string, scrub?: boolean }`.
- Produces: `DESKTOP_QUERY = '(min-width: 900px)'` and `MOBILE_QUERY = '(max-width: 899px)'` constants.

- [ ] **Step 1: Create the helper**

Create `src/anim/gsapReveal.js`:

```js
export const DESKTOP_QUERY = '(min-width: 900px)'
export const MOBILE_QUERY = '(max-width: 899px)'

/**
 * Reveal `el` (and optional staggered `children`) on scroll-in using GSAP.
 * Returns a cleanup fn. Animates transform+opacity only.
 */
export function gsapReveal(gsap, ScrollTrigger, el, opts = {}) {
  if (!el) return () => {}
  const {
    children = null,
    y = 40,
    stagger = 0.08,
    start = 'top 82%',
    scrub = false,
  } = opts

  const targets = children && children.length ? children : el
  const tween = gsap.fromTo(
    targets,
    { autoAlpha: 0, y, scale: 0.985 },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: 'power3.out',
      stagger: children && children.length ? stagger : 0,
      scrollTrigger: {
        trigger: el,
        start,
        end: scrub ? 'top 40%' : undefined,
        scrub: scrub ? 0.6 : false,
        toggleActions: scrub ? undefined : 'play none none none',
      },
    }
  )

  return () => {
    if (tween.scrollTrigger) tween.scrollTrigger.kill()
    tween.kill()
  }
}
```

- [ ] **Step 2: Add CSS guard so GSAP-targeted nodes don't flash before JS runs (desktop+no-reduced-motion only)**

In `src/index.css`, after the existing `.reveal.in` block (around line 856), add:

```css
/* GSAP-driven sections start hidden (autoAlpha) only where GSAP will run:
   wide viewport AND motion allowed. Elsewhere they stay fully visible so the
   CSS .reveal path (or static render) governs instead. */
@media (min-width: 900px) and (prefers-reduced-motion: no-preference) {
  .gsap-hide { visibility: hidden; opacity: 0; }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds, no new warnings.

- [ ] **Step 4 (OPTIONAL — confirm with user first): Commit**

```bash
git add src/anim/gsapReveal.js src/index.css
git commit -m "Add shared gsapReveal helper + reveal CSS guard"
```

---

## Task 3: MemberSection — expose nodes for the showcase

**Files:**
- Modify: `src/components/MemberSection.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `MemberSection` renders stable, queryable class hooks `.msec-banner`, `.minfo`, `.m-sign` (already present) AND accepts an optional `showcase` boolean prop. When `showcase` is true the component does NOT apply the `reveal/in` classes (the showcase timeline controls visibility instead); when false/absent it behaves exactly as today.

- [ ] **Step 1: Add the `showcase` prop and gate the reveal classes**

In `src/components/MemberSection.jsx`, change the signature and className. Replace the `forwardRef(function MemberSection({ m, idx }, sectionRef)` line with:

```jsx
const MemberSection = forwardRef(function MemberSection({ m, idx, showcase = false }, sectionRef) {
```

Then replace the `<section ... className={...}>` line (currently):

```jsx
      className={`msec reveal${shown ? ' in' : ''}${banner ? ' has-banner' : ''} card-${cardSide}`}
```

with:

```jsx
      className={`msec${showcase ? ' showcase-slide' : ` reveal${shown ? ' in' : ''}`}${banner ? ' has-banner' : ''} card-${cardSide}`}
```

Rationale: in showcase mode the slide visibility is driven by GSAP via `.showcase-slide`, not the IntersectionObserver `reveal`.

- [ ] **Step 2: Verify non-showcase rendering unchanged**

Run: `npm run dev -- --port 5188` (if not already running), open the site.
Expected: With no code yet passing `showcase`, every member still renders and reveals exactly as before (this prop defaults false). No visual change.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4 (OPTIONAL — confirm with user first): Commit**

```bash
git add src/components/MemberSection.jsx
git commit -m "MemberSection: add showcase mode prop"
```

---

## Task 4: MemberShowcase — desktop pinned crossfade + mobile reveal

**Files:**
- Create: `src/components/MemberShowcase.jsx`
- Modify: `src/index.css` (showcase stage + slide styles)

**Interfaces:**
- Consumes: `useGsap()` (Task 1), `DESKTOP_QUERY`/`MOBILE_QUERY` (Task 2), `MemberSection` with `showcase` prop (Task 3).
- Produces: `<MemberShowcase members={members} />` — renders all nine member sections. Desktop: pins the stage and scrubs a crossfade+zoom between consecutive members. Mobile: normal flow, each member reveals on entry. Reduced-motion: normal flow, all members visible (no GSAP).

- [ ] **Step 1: Create the component**

Create `src/components/MemberShowcase.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import MemberSection from './MemberSection'
import { useGsap, prefersReducedMotion } from '../anim/useGsap'
import { DESKTOP_QUERY, MOBILE_QUERY } from '../anim/gsapReveal'

/**
 * The nine member bands as a presentation.
 *  - Desktop (>=900px, motion ok): the stage pins and a scrubbed timeline
 *    crossfades + zooms from one member to the next (slideshow).
 *  - Mobile (<900px, motion ok): normal flow; each member reveals on entry.
 *  - Reduced motion: normal flow, all visible, no GSAP.
 */
export default function MemberShowcase({ members }) {
  const { gsap, ScrollTrigger, ready } = useGsap()
  const stageRef = useRef(null)
  const reduce = prefersReducedMotion()

  useEffect(() => {
    if (reduce || !ready || !gsap || !ScrollTrigger) return
    const stage = stageRef.current
    if (!stage) return
    const slides = Array.from(stage.querySelectorAll('.showcase-slide'))
    if (!slides.length) return

    const mm = gsap.matchMedia()

    // ---- Desktop: pinned crossfade slideshow ----
    mm.add(DESKTOP_QUERY, () => {
      // All slides stacked; only the first visible at rest.
      gsap.set(slides, { position: 'absolute', inset: 0, autoAlpha: 0 })
      gsap.set(slides[0], { autoAlpha: 1 })

      const perSlide = 0.9 // viewport-heights of scroll budget per member
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * perSlide * slides.length}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      slides.forEach((slide, i) => {
        if (i === 0) return
        const prev = slides[i - 1]
        const banner = slide.querySelector('.msec-banner')
        const info = slide.querySelector('.minfo')
        const sign = slide.querySelector('.m-sign')
        const cardRight = slide.classList.contains('card-right')
        const dir = cardRight ? 80 : -80

        // Outgoing prev: zoom + fade.
        tl.to(prev, { autoAlpha: 0, duration: 0.5 }, i)
        tl.to(prev.querySelector('.msec-banner'), { scale: 1.1, duration: 0.6 }, i)
        // Incoming: fade up, banner settles from slight zoom, card slides in.
        tl.fromTo(slide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, i + 0.15)
        if (banner) tl.fromTo(banner, { scale: 1.1 }, { scale: 1, duration: 0.7 }, i + 0.15)
        if (info) tl.fromTo(info, { x: dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 }, i + 0.2)
        if (sign) tl.fromTo(sign, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4 }, i + 0.35)
      })

      return () => {
        // matchMedia revert restores inline styles set above.
        gsap.set(slides, { clearProps: 'all' })
      }
    })

    // ---- Mobile: enter-once reveal per member, normal flow ----
    mm.add(MOBILE_QUERY, () => {
      const tweens = slides.map((slide) => {
        const banner = slide.querySelector('.msec-banner')
        const info = slide.querySelector('.minfo')
        const cardRight = slide.classList.contains('card-right')
        const dir = cardRight ? 60 : -60
        const tl = gsap.timeline({
          scrollTrigger: { trigger: slide, start: 'top 78%', toggleActions: 'play none none none' },
        })
        tl.fromTo(slide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0)
        if (banner) tl.fromTo(banner, { scale: 1.08 }, { scale: 1, duration: 0.9 }, 0)
        if (info) tl.fromTo(info, { x: dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6 }, 0.1)
        return tl
      })
      return () => tweens.forEach((t) => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill() })
    })

    // Re-measure after banner images / fonts settle.
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const tid = setTimeout(refresh, 600)

    return () => {
      window.removeEventListener('load', refresh)
      clearTimeout(tid)
      mm.revert()
    }
  }, [reduce, ready, gsap, ScrollTrigger])

  return (
    <div className="member-showcase" ref={stageRef}>
      {members.map((m, i) => (
        <MemberSection key={m.num} m={m} idx={i} showcase />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add showcase CSS**

In `src/index.css`, after the `.msec.has-banner` block (around line 564), add:

```css
/* ===== Member showcase (pinned cinematic slideshow) ===================== */
.member-showcase { position: relative; }

/* Desktop pinned mode: the stage is one viewport tall; slides stack absolutely
   (set by GSAP). The wrapper reserves a viewport so pin has somewhere to sit. */
@media (min-width: 900px) and (prefers-reduced-motion: no-preference) {
  .member-showcase { height: 100vh; height: 100svh; overflow: hidden; }
  .member-showcase .showcase-slide {
    min-height: 100vh; min-height: 100svh;
    will-change: transform, opacity;
  }
}

/* Mobile / reduced-motion: members are normal full-flow bands (existing look). */
```

- [ ] **Step 3: Verify mobile + reduced-motion paths render all members**

Run dev server. In browser DevTools, set a narrow viewport (e.g. 390px wide).
Expected: all nine members render stacked in normal flow, each fading/sliding in on scroll; native scroll feels normal (no stick).
Then enable "Emulate prefers-reduced-motion: reduce" in DevTools Rendering tab and reload.
Expected: all nine members fully visible, no animation, no GSAP request in Network tab (filter for `gsap`/`ScrollTrigger`).

NOTE: At this step `MemberShowcase` is not yet mounted in `App.jsx` — verification happens after Task 5. State here: "build passes; component compiles."

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4 (OPTIONAL — confirm with user first): Commit**

```bash
git add src/components/MemberShowcase.jsx src/index.css
git commit -m "Add MemberShowcase: pinned desktop slideshow + mobile reveal"
```

---

## Task 5: Wire MemberShowcase into App + remove dot rail

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `MemberShowcase` (Task 4).
- Produces: App renders `<MemberShowcase members={members} />` in place of the members map; dot rail removed; `scrollToMember` simplified (roster jump scrolls to showcase top).

- [ ] **Step 1: Import MemberShowcase**

In `src/App.jsx`, after the `import MemberSection from './components/MemberSection'` line (line 6), add:

```jsx
import MemberShowcase from './components/MemberShowcase'
```

(Leave the `MemberSection` import — `MemberShowcase` uses it; if App no longer references `MemberSection` directly the lint may warn it's unused, so remove the now-unused `MemberSection` import from App in this step.)

Replace line 6 `import MemberSection from './components/MemberSection'` by deleting it (MemberShowcase imports MemberSection itself).

- [ ] **Step 2: Replace the members map with the showcase**

Replace the block (current lines ~251–261):

```jsx
      {/* --- Member sections: full-width bands, alternating L/R --- */}
      {members.map((m, i) => (
        <MemberSection
          key={m.num}
          m={m}
          idx={i}
          ref={(el) => {
            memberRefs.current[i] = el
          }}
        />
      ))}
```

with:

```jsx
      {/* --- Member showcase: pinned cinematic slideshow (desktop) --- */}
      <MemberShowcase members={members} />
```

- [ ] **Step 3: Remove the dot rail markup**

Delete the dot-rail block (current lines ~127–139):

```jsx
      {dotNav && (
        <div className="dots">
          {members.map((m, i) => (
            <button
              key={m.num}
              className={`dot${activeDot === i ? ' on' : ''}`}
              style={{ '--c': m.color }}
              aria-label={m.name}
              onClick={() => scrollToMember(i)}
            />
          ))}
        </div>
      )}
```

- [ ] **Step 4: Remove dot-rail state + observer + config**

In `src/App.jsx`:
- Delete `const [activeDot, setActiveDot] = useState(-1)` (line ~49).
- Delete the entire "Dot rail active state" `useEffect` (lines ~87–100).
- In `CONFIG` (lines ~21–24) remove the `dotNav: true,` line; update the destructure `const { dotNav, parallax } = CONFIG` (line 38) to `const { parallax } = CONFIG`.
- Remove the now-unused `memberRefs` ref (line 47) and the `scrollToMember` references to it — see Step 5.

- [ ] **Step 5: Simplify scrollToMember + roster click**

Replace `scrollToMember` (lines ~102–109) with a version that scrolls to the showcase top (roster becomes a browse strip; precise per-member desktop seek is out of scope):

```jsx
  const showcaseRef = useRef(null)
  const scrollToMember = () => {
    const el = showcaseRef.current
    if (el)
      window.scrollTo({
        top: window.scrollY + el.getBoundingClientRect().top - 70,
        behavior: 'smooth',
      })
  }
```

Update the roster buttons (lines ~219–239) `onClick={() => scrollToMember(i)}` → `onClick={scrollToMember}`.

Attach the ref to the showcase by wrapping it: change Step 2's insert to

```jsx
      {/* --- Member showcase: pinned cinematic slideshow (desktop) --- */}
      <div ref={showcaseRef}>
        <MemberShowcase members={members} />
      </div>
```

- [ ] **Step 6: Verify end-to-end**

Run dev server, open `http://localhost:5188/aqours-sunshine-tribute/`.

Desktop (>=900px) expected:
- Scrolling into the members zone PINS the stage; continued scroll crossfades + zooms member→member through all nine; backward scroll reverses cleanly; after the ninth the page releases to Sub-units; no flicker at the pin boundary.
- No dot rail on the right.
- Clicking a roster card scrolls to the start of the showcase.

Mobile (<900px, DevTools) expected:
- Members in normal flow, each reveals on entry, native scroll smooth, no pin.

Reduced-motion expected:
- All members visible, static, no GSAP network request.

Run: `npm run build`
Expected: succeeds with no unused-import errors (confirm `MemberSection`, `activeDot`, `dotNav`, `memberRefs` removals are consistent — grep for each name in App.jsx and ensure no dangling references remain).

- [ ] **Step 7 (OPTIONAL — confirm with user first): Commit**

```bash
git add src/App.jsx
git commit -m "Wire MemberShowcase into App; remove dot rail"
```

---

## Task 6: About + Roster tailored animations

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `useGsap()`, `gsapReveal` (Tasks 1–2).
- Produces: About block lines stagger up on entry (count-up preserved); roster cards deal in L→R.

- [ ] **Step 1: Add GSAP-driven reveals for About + Roster**

In `src/App.jsx`, add near the other hooks:

```jsx
  const { gsap, ScrollTrigger, ready: gsapReady } = useGsap()
```

(import at top: `import { useGsap } from './anim/useGsap'` and `import { gsapReveal } from './anim/gsapReveal'`.)

Add refs: `const aboutAnimRef = useRef(null)` and `const rosterAnimRef = useRef(null)`. Attach `aboutAnimRef` to the About inner reveal `div` (line ~176, the one with `ref={aboutRef}` — give it a second ref via a combiner OR add the GSAP animation to the existing `aboutRef.current`). Simplest: add a dedicated effect that reads the existing DOM nodes by ref.

Add this effect:

```jsx
  useEffect(() => {
    if (!gsapReady || !gsap || !ScrollTrigger) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cleanups = []
    // About: stagger the eyebrow/h2/lead.
    const aboutEl = aboutRef.current
    if (aboutEl) {
      const kids = aboutEl.querySelectorAll('.eyebrow, .h2, .lead')
      cleanups.push(gsapReveal(gsap, ScrollTrigger, aboutEl, { children: kids, stagger: 0.12 }))
    }
    // Roster: deal the cards in L->R.
    const track = rosterTrackRef.current
    if (track) {
      const cards = track.querySelectorAll('.roster-item')
      cleanups.push(gsapReveal(gsap, ScrollTrigger, track, { children: cards, stagger: 0.06, y: 30 }))
    }
    return () => cleanups.forEach((fn) => fn())
  }, [gsapReady, gsap, ScrollTrigger])
```

NOTE: Because `useReveal` already adds `.reveal/.in` to the About block, to avoid double-handling under GSAP, the GSAP path animates the inner children (`.eyebrow/.h2/.lead`) which start visible via CSS; the outer `.reveal` still fades the container. This is acceptable — the stagger reads on top. If a flash appears, add `gsap-hide` class to the children in JSX guarded by the desktop media query. Keep `useCountUp` as-is (count still triggers on `aboutShown`).

- [ ] **Step 2: Verify**

Run dev server. Desktop: About heading lines stagger up as the section enters; stat numbers still count up. Roster cards deal in left→right.
Reduced-motion: no GSAP, static.

Run: `npm run build` → succeeds.

- [ ] **Step 3 (OPTIONAL — confirm with user first): Commit**

```bash
git add src/App.jsx
git commit -m "Animate About (stagger) + Roster (deal-in)"
```

---

## Task 7: Sub-units tailored animation

**Files:**
- Modify: `src/components/SubUnits.jsx`

**Interfaces:**
- Consumes: `useGsap()`, `gsapReveal`.
- Produces: the three unit cards scale + fade in with a tilt and stagger; existing `useReveal` remains the reduced-motion/mobile fallback.

- [ ] **Step 1: Add a GSAP stagger for the unit grid**

In `src/components/SubUnits.jsx`, in the `SubUnits` default export, add:

```jsx
import { useEffect, useRef } from 'react'
import { useGsap } from '../anim/useGsap'
```

Add a ref to the grid `<div className="unit-grid">` → `<div className="unit-grid" ref={gridRef}>` with `const gridRef = useRef(null)`, and:

```jsx
  const { gsap, ScrollTrigger, ready } = useGsap()
  useEffect(() => {
    if (!ready || !gsap || !ScrollTrigger) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const grid = gridRef.current
    if (!grid) return
    const cards = grid.querySelectorAll('.unit-card')
    const tween = gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 50, scale: 0.92, rotateZ: -1.5 },
      {
        autoAlpha: 1, y: 0, scale: 1, rotateZ: 0,
        duration: 0.7, ease: 'back.out(1.4)', stagger: 0.12,
        scrollTrigger: { trigger: grid, start: 'top 80%', toggleActions: 'play none none none' },
      }
    )
    return () => { if (tween.scrollTrigger) tween.scrollTrigger.kill(); tween.kill() }
  }, [ready, gsap, ScrollTrigger])
```

NOTE: `UnitCard` keeps its `useReveal` for the reduced-motion/mobile fallback. When GSAP runs it sets `autoAlpha`, overriding the CSS — acceptable; if a flash occurs, the GSAP `fromTo` start state wins on first paint after load.

- [ ] **Step 2: Verify**

Desktop: the three unit cards pop in with a slight tilt + stagger as the sub-units section enters. Reduced-motion: cards static/visible.

Run: `npm run build` → succeeds.

- [ ] **Step 3 (OPTIONAL — confirm with user first): Commit**

```bash
git add src/components/SubUnits.jsx
git commit -m "Animate sub-unit cards (scale + tilt stagger)"
```

---

## Task 8: Discography (vinyl spin-in + card cascade) + Footer

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css` (vinyl transform origin if needed)

**Interfaces:**
- Consumes: `useGsap()`.
- Produces: vinyl watermark rotates in on entry; disc cards cascade in; footer mark/sub/note fade up + wave rises.

- [ ] **Step 1: Add discography + footer effects**

In the same GSAP effect added in Task 6 (or a sibling effect) in `src/App.jsx`, extend the cleanups:

```jsx
    // Discography: spin the vinyl in + cascade the disc tiles.
    const vinyl = document.querySelector('.disc-vinyl')
    if (vinyl) {
      const t = gsap.fromTo(
        vinyl,
        { autoAlpha: 0, rotate: -90, scale: 0.8 },
        { autoAlpha: 0.85, rotate: 0, scale: 1, duration: 1.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.disc-section', start: 'top 75%', toggleActions: 'play none none none' } }
      )
      cleanups.push(() => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill() })
    }
    const discGrid = document.querySelector('.disc')
    if (discGrid) {
      const tiles = discGrid.querySelectorAll('.disc-tile')
      cleanups.push(gsapReveal(gsap, ScrollTrigger, discGrid, { children: tiles, stagger: 0.07, y: 40 }))
    }
    // Footer: mark/sub/note rise together.
    const foot = document.querySelector('.foot .reveal') || document.querySelector('.foot')
    if (foot) {
      const kids = foot.querySelectorAll('.foot-mark, .foot-sub, .foot-note')
      cleanups.push(gsapReveal(gsap, ScrollTrigger, foot, { children: kids, stagger: 0.1 }))
    }
```

NOTE: `.disc-vinyl` opacity at rest is 0.85 per the redesign — the tween animates to `0.85`, matching. Confirm by grepping `.disc-vinyl` opacity in `index.css` and matching the end value; if it differs, set the tween's end `autoAlpha`/opacity to that value so the rest state is unchanged.

- [ ] **Step 2: Confirm vinyl rest opacity matches**

Run: grep `.disc-vinyl` in `src/index.css`; read its `opacity`. Set the tween's end opacity to that exact value (replace `0.85` if different).

- [ ] **Step 3: Verify**

Desktop: scrolling to discography spins the vinyl watermark into place and cascades the album tiles; footer text rises in. Reduced-motion: all static/visible.

Run: `npm run build` → succeeds.

- [ ] **Step 4 (OPTIONAL — confirm with user first): Commit**

```bash
git add src/App.jsx src/index.css
git commit -m "Animate discography (vinyl spin + tile cascade) + footer rise"
```

---

## Task 9: Cross-cutting verification pass

**Files:** none (verification only).

- [ ] **Step 1: Desktop full scroll-through**

Open desktop width. Scroll top→bottom slowly, then bottom→top.
Expected: hero parallax intact; About stagger + count-up; roster deal-in; members PIN and crossfade through all nine then release; sub-units pop; discography vinyl spins + tiles cascade; footer rises. No stuck pins, no leftover blank space, no flicker. Progress bar reaches 100% at true page bottom.

- [ ] **Step 2: Resize stress test**

Resize the window across the 900px boundary several times while scrolled at various points.
Expected: matchMedia swaps desktop↔mobile cleanly; no leftover pinned spacer, no stuck transform, members always end visible. (GSAP `mm.revert()` + `ScrollTrigger.refresh()` handle this.)

- [ ] **Step 3: Mobile + reduced-motion**

Narrow viewport: reveals, native scroll, no pin. Then reduced-motion: fully static, no `gsap`/`ScrollTrigger` request in Network tab.

- [ ] **Step 4: Spotify regression**

Click a disc tile; confirm the NowPlayingBar appears and plays, and that pinning/overflow on the showcase didn't clip or hide it (z-index intact).

- [ ] **Step 5: Build + chunk check**

Run: `npm run build`
Expected: succeeds; GSAP is a separate lazy chunk; initial `index-*.js` gzip not materially larger than the pre-feature baseline.

- [ ] **Step 6 (OPTIONAL — confirm with user first): Final commit / report**

Summarize results to the user; commit only if they approve.

---

## Self-Review notes

- **Spec coverage:** GSAP lazy dep (T1) ✓; matchMedia branching incl. reduced-motion no-load (T1/T4) ✓; pinned desktop crossfade+zoom (T4) ✓; mobile reveal (T4) ✓; dot-rail removal (T5) ✓; roster jump simplification (T5) ✓; per-section tailored animations — hero unchanged (untouched), About (T6), roster (T6), sub-units (T7), discography + footer (T8) ✓; reduced-motion static fallback throughout ✓; performance/transform-opacity-only + lazy chunk (T1/T4/T9) ✓; preserve mobile tuning + hero/progress bar (T5 notes) ✓.
- **Placeholder scan:** every code step shows actual code; NOTEs flag the two spots needing a value confirmed against existing CSS (vinyl opacity — T8 Step 2) with explicit instruction.
- **Type/name consistency:** `useGsap()` returns `{ gsap, ScrollTrigger, ready }` used consistently; `gsapReveal(gsap, ScrollTrigger, el, opts)` signature consistent across T2/T6/T8; `.showcase-slide`, `.member-showcase`, `DESKTOP_QUERY`/`MOBILE_QUERY` consistent across T2–T5.
- **Commit gating:** every commit step marked OPTIONAL pending user go-ahead, per the user's "no commit yet" instruction.
