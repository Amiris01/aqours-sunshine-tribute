# Aqours Tribute Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Aqours fan-tribute page to be bolder/editorial and grounded in Aqours' real identity ("from zero, by hand, together"), with a Three.js WebGL hero, while preserving all content, assets, Spotify playback, and accessibility.

**Architecture:** React 18 + Vite, hand-written CSS in `src/index.css`. A new `WaterBackground` component renders a hero-only Three.js canvas that gracefully falls back to the existing CSS sky under reduced-motion / WebGL failure. Members become a character-driven varied grid (equal weight, no featured star) that collapses to well-paced stacked cards on mobile. The page palette deepens from sky to deep water as you scroll; a translucent blue-feather motif is the signature.

**Tech Stack:** React 18.3, Vite 5.4, `three` (new), plain CSS.

## Global Constraints

- **Data fixed:** read `members` / `subunits` / `discs` from `src/data.js`; never add/remove/rename content or profile fields.
- **Assets fixed:** reference existing `public/assets/` paths; no rename or re-slice.
- **Stack fixed:** React + Vite + plain CSS in `src/index.css`; only new dependency permitted is `three` (explicitly approved).
- **Playback load-bearing:** `NowPlayingBar` drives a *clipped* (not `display:none`) Spotify iframe via `.np-hidden-host`; preserve this mechanism exactly.
- **Accessibility:** every motion gated behind `prefers-reduced-motion: reduce`; keep `focus-visible`, semantic headings; tap targets ≥44px.
- **No single star:** members are equal-weight; do NOT add a featured/lead hierarchy.
- **Fan tribute:** keep the footer disclaimer text.
- **Verification model:** there is NO test runner. Each task verifies via `npm run build` (must exit 0, no errors) and a stated visual check in `npm run dev` (default http://localhost:5173). Commits are skipped — this is not a git repo.

---

### Task 1: Add Three.js dependency

**Files:**
- Modify: `package.json` (dependencies)

**Interfaces:**
- Produces: `three` importable as `import * as THREE from 'three'` in later tasks.

- [ ] **Step 1: Install three**

Run: `npm install three`
Expected: `package.json` gains `"three": "^0.16x"` under `dependencies`; install exits 0.

- [ ] **Step 2: Verify the build still works**

Run: `npm run build`
Expected: exits 0, `dist/` produced, no errors.

- [ ] **Step 3: Verify import resolves**

Create a throwaway check: add `import * as THREE from 'three'; console.log(THREE.REVISION)` temporarily to `src/main.jsx`, run `npm run dev`, confirm the revision number logs in the browser console, then remove the temporary lines.
Expected: a revision number (e.g. `16x`) logs; no resolve error.

---

### Task 2: CSS depth-palette tokens + editorial pacing utilities

**Files:**
- Modify: `src/index.css` (add a `:root` token block near the top, after the existing `.page` rule; add pacing utility classes)

**Interfaces:**
- Produces: CSS custom properties `--surface`, `--shallow`, `--mid`, `--deep`, `--deepest` (sky→deep-water ramp), `--feather` (translucent blue), and utility classes `.pace-tight`, `.pace-wide`, `.pace-bleed` controlling section vertical padding / max-width.

- [ ] **Step 1: Add the depth tokens**

In `src/index.css`, add after the `.page` block:

```css
/* --- Depth palette: sky surface -> deep water (scroll descent) ---------- */
:root {
  --surface: #eaf8ff;   /* hero / top */
  --shallow: #d8f1fe;
  --mid:     #9fd6f2;
  --deep:    #2f6f93;
  --deepest: #143a4e;   /* footer ink-blue */
  --feather: rgba(110, 180, 230, 0.5); /* earned blue-feather motif */
}
```

- [ ] **Step 2: Add editorial pacing utilities**

Add to `src/index.css`:

```css
/* --- Editorial pacing: tight -> wide -> full-bleed --------------------- */
.pace-tight { max-width: 760px;  margin-inline: auto; padding-block: 88px;  padding-inline: 24px; }
.pace-wide  { max-width: 1200px; margin-inline: auto; padding-block: 128px; padding-inline: 24px; }
.pace-bleed { max-width: none;   width: 100%;        padding-block: 160px; padding-inline: 0; }

@media (max-width: 760px) {
  .pace-tight, .pace-wide { padding-block: 64px; padding-inline: 18px; }
  .pace-bleed { padding-block: 88px; }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0, no CSS errors.

- [ ] **Step 4: Apply tight pacing to the About section (pacing only — no copy change)**

In `src/App.jsx`, the About `<section className="section">` (~line 138) sets the "tight" beat. Add the pacing class to its inner reveal wrapper container so the column narrows — do NOT change any text/lead copy (data is fixed). Change:

```jsx
      <section className="section">
        <div ref={aboutRef} className={`reveal${aboutShown ? ' in' : ''}`}>
```

to:

```jsx
      <section className="section pace-tight">
        <div ref={aboutRef} className={`reveal${aboutShown ? ' in' : ''}`}>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exits 0, no CSS errors.

- [ ] **Step 6: Visual check**

Run `npm run dev`; confirm the About block now sits in a narrower (≈760px) tight column versus the wider sections; all copy unchanged; rest of page renders normally.
Expected: About reads as the "tight" pacing beat; no content change.

---

### Task 3: WaterBackground component (Three.js hero canvas)

**Files:**
- Create: `src/components/WaterBackground.jsx`
- Test: none (visual)

**Interfaces:**
- Consumes: `three` (Task 1).
- Produces: default-exported React component `<WaterBackground active />` where `active` (bool) controls whether the rAF loop runs. Renders a `<canvas className="hero-gl">` absolutely filling its parent. Renders nothing (returns `null` after mount cleanup) and sets `data-gl="off"` on itself when `prefers-reduced-motion` is set or WebGL init throws, so CSS can show the fallback.

- [ ] **Step 1: Write the component**

Create `src/components/WaterBackground.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Hero-only WebGL surface: gentle water plane + sun bloom + drifting blue
 * feathers. Falls back to CSS (parent shows .hero-fallback) under
 * prefers-reduced-motion or when WebGL is unavailable. Pauses when the tab is
 * hidden or `active` is false (parent unmounts/disables on scroll-past).
 */
export default function WaterBackground({ active = true }) {
  const hostRef = useRef(null)
  const [ok, setOk] = useState(true) // false => CSS fallback

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setOk(false); return }

    const host = hostRef.current
    if (!host) return

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch (e) {
      setOk(false)
      return
    }

    const w = () => host.clientWidth
    const h = () => host.clientHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // DPR cap
    renderer.setSize(w(), h())
    host.appendChild(renderer.domElement)
    renderer.domElement.className = 'hero-gl'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, w() / h(), 0.1, 100)
    camera.position.set(0, 1.6, 5)
    camera.lookAt(0, 0, 0)

    // Water: a wide plane with vertex ripple in the animation loop.
    const geo = new THREE.PlaneGeometry(40, 24, 60, 36)
    const mat = new THREE.MeshStandardMaterial({
      color: 0x6fc5f4, metalness: 0.35, roughness: 0.4, transparent: true, opacity: 0.9,
    })
    const water = new THREE.Mesh(geo, mat)
    water.rotation.x = -Math.PI / 2.2
    water.position.y = -1.2
    scene.add(water)

    // Sun light + ambient.
    const sun = new THREE.PointLight(0xffd24d, 2.2, 60)
    sun.position.set(3, 4, 3)
    scene.add(sun)
    scene.add(new THREE.AmbientLight(0xeaf8ff, 0.8))

    // Drifting translucent blue feathers (simple billboards).
    const feathers = []
    const fmat = new THREE.MeshBasicMaterial({ color: 0x9fd6f2, transparent: true, opacity: 0.5 })
    for (let i = 0; i < 6; i++) {
      const fg = new THREE.PlaneGeometry(0.5, 1.1)
      const f = new THREE.Mesh(fg, fmat)
      f.position.set((Math.random() - 0.5) * 10, Math.random() * 5, (Math.random() - 0.5) * 4)
      f.rotation.z = Math.random() * Math.PI
      f.userData.speed = 0.15 + Math.random() * 0.2
      scene.add(f); feathers.push(f)
    }

    const base = geo.attributes.position.array.slice()
    let raf, t = 0, running = true

    const onResize = () => {
      renderer.setSize(w(), h())
      camera.aspect = w() / h(); camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    const onVis = () => { running = !document.hidden }
    document.addEventListener('visibilitychange', onVis)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!running) return
      t += 0.016
      const pos = geo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1]
        pos.setZ(i, Math.sin(x * 0.4 + t) * 0.25 + Math.cos(y * 0.5 + t * 0.8) * 0.2)
      }
      pos.needsUpdate = true
      feathers.forEach((f) => {
        f.position.y -= f.userData.speed * 0.016 * 4
        f.rotation.z += 0.003
        if (f.position.y < -2) f.position.y = 5
      })
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      geo.dispose(); mat.dispose(); fmat.dispose()
      feathers.forEach((f) => f.geometry.dispose())
      renderer.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])

  // Pause loop responsiveness to `active` via a data attr the loop reads is
  // overkill here; parent simply unmounts when inactive. Keep simple.
  useEffect(() => {}, [active])

  return <div ref={hostRef} className="hero-gl-host" data-gl={ok ? 'on' : 'off'} />
}
```

- [ ] **Step 2: Add canvas host CSS**

Add to `src/index.css`:

```css
.hero-gl-host { position: absolute; inset: 0; z-index: 0; }
.hero-gl-host[data-gl="off"] { display: none; } /* CSS sky fallback shows instead */
.hero-gl { display: block; width: 100%; height: 100%; }
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0; `three` bundles without error.

- [ ] **Step 4: Defer visual check**

Component isn't wired into the hero yet (Task 4). No visual check here; build success is the gate.

---

### Task 4: Wire WaterBackground into the hero + asymmetric wordmark + CSS fallback retained

**Files:**
- Modify: `src/App.jsx` (hero block, lines ~117-135)
- Modify: `src/index.css` (hero layout: asymmetric wordmark, keep existing sky/sun/cloud rules as the fallback)

**Interfaces:**
- Consumes: `WaterBackground` (Task 3); depth tokens (Task 2).
- Produces: hero renders the GL canvas with the existing `.sky/.sun/.cloud` markup kept as the fallback layer (shown only when `[data-gl="off"]`).

- [ ] **Step 1: Add the import and mount the canvas**

In `src/App.jsx`, add at top with other component imports:

```jsx
import WaterBackground from './components/WaterBackground'
```

Replace the hero's background layers. Change the hero opening from:

```jsx
      <div className="hero">
        <div className="sky" />
        <div className="sun" ref={sunRef}>
          <div className="sun-core" />
        </div>
        <div className="cloud c1" />
        <div className="cloud c2" />
        <div className="cloud c3" />
        <div className="hero-content" ref={heroContentRef}>
          <div className="hero-eyebrow">Love Live! Sunshine!! · Fan Tribute</div>
          <img className="hero-logo-img" src="/assets/logo/aqours-logo.png" alt="Aqours" />
          <div className="tagline">Shine with us — here, now, by the sea.</div>
        </div>
```

to:

```jsx
      <div className="hero">
        <WaterBackground active />
        {/* CSS fallback (shown when WebGL off / reduced-motion) */}
        <div className="hero-fallback">
          <div className="sky" />
          <div className="sun" ref={sunRef}>
            <div className="sun-core" />
          </div>
          <div className="cloud c1" />
          <div className="cloud c2" />
          <div className="cloud c3" />
        </div>
        <div className="hero-content asym" ref={heroContentRef}>
          <div className="hero-eyebrow">Love Live! Sunshine!! · Fan Tribute</div>
          <img className="hero-logo-img" src="/assets/logo/aqours-logo.png" alt="Aqours" />
          <div className="tagline">Shine with us — here, now, by the sea.</div>
        </div>
```

- [ ] **Step 2: Make the fallback show only when GL is off**

Add to `src/index.css`:

```css
/* Fallback sky stack: hidden when WebGL is running, shown when it isn't. */
.hero-fallback { position: absolute; inset: 0; z-index: 0; }
.hero-gl-host[data-gl="on"] ~ .hero-fallback { display: none; }
@media (prefers-reduced-motion: reduce) {
  .hero-fallback { display: block !important; }
}
```

- [ ] **Step 3: Asymmetric wordmark**

Add to `src/index.css`:

```css
.hero-content.asym {
  position: relative; z-index: 2;
  width: 100%; max-width: 1200px; margin-inline: auto;
  display: flex; flex-direction: column; align-items: flex-end;
  text-align: right; padding-inline: clamp(20px, 6vw, 80px);
}
.hero-content.asym .hero-logo-img {
  width: min(78vw, 720px);
  margin-right: clamp(-60px, -6vw, 0px); /* bleed off the right edge */
}
@media (max-width: 760px) {
  .hero-content.asym { align-items: center; text-align: center; }
  .hero-content.asym .hero-logo-img { width: 82vw; margin-right: 0; }
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 5: Visual check — GL on**

Run `npm run dev`. In the hero: confirm animated water + drifting feathers render, wordmark sits right/bleeds off-edge, eyebrow→logo→tagline stagger still plays, scroll cue + waves intact.
Expected: living WebGL hero, no console errors.

- [ ] **Step 6: Visual check — fallback**

In DevTools, emulate `prefers-reduced-motion: reduce` (Rendering tab) and reload.
Expected: WebGL canvas hidden; original CSS sky/sun/clouds show; no animation loop running.

- [ ] **Step 7: Unmount-on-scroll-past**

In `src/App.jsx`, gate the canvas so it stops when the hero leaves the viewport. Add a reveal-style boolean using the existing `useReveal` pattern is not suitable (it latches true); instead add a small inline IntersectionObserver on the hero element that toggles a `heroInView` state, and render `<WaterBackground active={heroInView} />` only while `heroInView` is true OR the page hasn't scrolled past. Minimal version: conditionally render the canvas only when `window.scrollY < window.innerHeight` tracked in the existing scroll handler via a `useState`. Implement by adding `const [heroVisible, setHeroVisible] = useState(true)` and in the existing `onScroll` (App.jsx ~55) add `setHeroVisible(window.scrollY < window.innerHeight)`, then render `{heroVisible && <WaterBackground active />}`.
Run `npm run dev`, scroll past the hero, confirm in the Performance/FPS meter that rAF work stops (canvas removed from DOM).
Expected: canvas unmounts after scrolling one viewport down; scrolling back up remounts it.

---

### Task 5: Members — character-driven varied grid (desktop) + stacked cards (mobile)

**Files:**
- Modify: `src/App.jsx` (define a `VARIANTS` map in the view layer; pass `variant` to each `MemberSection`; wrap the `members.map` in a `.members-grid` container)
- Modify: `src/components/MemberSection.jsx` (accept a `variant` prop, apply as class; oversized numeral, emblem-as-watermark)
- Modify: `src/index.css` (grid layout, per-variant sizing, mobile stacked cards)

**`data.js` MUST NOT be modified** — the layout `variant` is a purely presentational hint and lives in the view layer (decided with the human; honors the "data fixed" constraint literally).

**Interfaces:**
- Consumes: `members` (existing data, unchanged), `--c` per member.
- Produces: `MemberSection` accepts a `variant` prop ∈ `'wide' | 'tall' | 'std' | 'small'` and applies it as a class `msec--{variant}`.

- [ ] **Step 1: Define the VARIANTS map in App.jsx (NOT data.js)**

In `src/App.jsx`, near the top-level `CONFIG` constant, add a presentational variant map keyed by member `num`:

```js
// Layout-only hint (NOT data): drives the varied member grid. Equal weight,
// no featured star — size reflects each girl's character, not rank.
const VARIANTS = {
  '01': 'wide',  // Chika — leader energy, wide
  '02': 'std',   // Riko
  '03': 'tall',  // Kanan — diver, vertical
  '04': 'std',   // Dia
  '05': 'wide',  // You — sporty, wide
  '06': 'tall',  // Yoshiko/Yohane — dramatic, tall dark
  '07': 'small', // Hanamaru — gentle, small
  '08': 'wide',  // Mari — loud, bleeds wide
  '09': 'small', // Ruby — shy, small
}
```

`data.js` is NOT touched.

- [ ] **Step 2: Apply the variant in MemberSection (via prop)**

In `src/components/MemberSection.jsx`, accept a `variant` prop (default `'std'`) and add it to the `<section>` className. Change the function signature:

```jsx
const MemberSection = forwardRef(function MemberSection({ m, idx, variant = 'std' }, sectionRef) {
```

and the className:

```jsx
      className={`msec msec--${variant} reveal${shown ? ' in' : ''}`}
```

- [ ] **Step 3: Wrap members in a grid container**

In `src/App.jsx`, wrap the `{members.map(...)}` block:

```jsx
      <div className="members-grid">
        {members.map((m, i) => (
          <MemberSection
            key={m.num}
            m={m}
            idx={i}
            variant={VARIANTS[m.num] || 'std'}
            ref={(el) => {
              memberRefs.current[i] = el
            }}
          />
        ))}
      </div>
```

- [ ] **Step 4: Grid + variant CSS (desktop) and stacked cards (mobile)**

Add to `src/index.css`:

```css
/* --- Members: character-driven varied grid (equal weight, no star) ----- */
.members-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 28px;
  max-width: 1280px;
  margin: 0 auto 96px;
  padding-inline: 24px;
}
.msec { grid-column: span 3; min-height: 380px; }      /* std */
.msec--wide  { grid-column: span 6; }
.msec--tall  { grid-column: span 3; min-height: 520px; }
.msec--small { grid-column: span 2; }

/* oversized numeral as graphic anchor */
.msec .num {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(80px, 12vw, 220px);
  line-height: 0.8; color: var(--c); opacity: 0.16;
  position: absolute; top: -0.1em; left: -0.04em; z-index: 0; pointer-events: none;
}
/* emblem as low-opacity watermark behind info */
.msec .emblem.logo-slot { opacity: 0.9; }

/* MOBILE: collapse to well-paced stacked cards, equal full-width */
@media (max-width: 760px) {
  .members-grid { grid-template-columns: 1fr; gap: 20px; padding-inline: 16px; }
  .msec, .msec--wide, .msec--tall, .msec--small {
    grid-column: 1 / -1; min-height: 0;
  }
  .msec .num { font-size: clamp(64px, 22vw, 120px); }
}
```

NOTE: the existing `.mwrap`/`.flip` zigzag rules still apply inside each card; keep them. They now operate within a grid cell rather than full-width bands.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 6: Visual check — desktop**

Run `npm run dev` at ≥1200px. Confirm: members form a varied grid (Chika/You/Mari wide; Kanan/Yoshiko tall; Hanamaru/Ruby small), oversized numerals anchor each, no single member is "featured/biggest" disproportionately — all read as equal-weight peers.
Expected: editorial varied grid, dot-rail still tracks members.

- [ ] **Step 7: Visual check — mobile**

Resize to 375px. Confirm: every member is a full-width stacked card, readable, tap targets ≥44px, no horizontal scroll, numerals scaled down.
Expected: clean stacked cards, no overflow.

---

### Task 6: Deep-water descent palette + restyle SubUnits / Discography / Footer

**Files:**
- Modify: `src/index.css` (`.page` background ramp; section backgrounds; sub-units deepest band; footer deep blue; feather motif in footer)
- Modify: `src/components/SubUnits.jsx` (only if a class hook is needed; structure unchanged)

**Interfaces:**
- Consumes: depth tokens (Task 2).
- Produces: visual descent; no API changes.

- [ ] **Step 1: Page descent background**

In `src/index.css`, replace the `.page` background line with the depth ramp:

```css
  background: linear-gradient(180deg,
    var(--surface) 0%,
    var(--shallow) 22%,
    var(--mid) 55%,
    var(--deep) 82%,
    var(--deepest) 100%);
```

- [ ] **Step 2: Sub-units as the deepest "together" band**

Add to `src/index.css` (adjust existing `.subunits`/section selector to layer a deep wash + light text):

```css
.subunits { background: color-mix(in srgb, var(--deep) 22%, transparent); }
.subunits .h2, .subunits .lead { color: #f3fbff; }
```

- [ ] **Step 3: Footer deep blue + feather settle**

Add to `src/index.css`:

```css
.foot { background: var(--deepest); color: #dbeefb; }
.foot-mark { color: #fff; }
.foot::before { /* settling blue feather */
  content: ""; position: absolute; right: 6%; top: 10%;
  width: 120px; height: 220px; opacity: 0.18;
  background: radial-gradient(closest-side, var(--feather), transparent);
  transform: rotate(18deg); pointer-events: none;
}
@media (prefers-reduced-motion: no-preference) {
  .foot::before { animation: featherDrift 9s ease-in-out infinite; }
}
@keyframes featherDrift {
  0%,100% { transform: translateY(0) rotate(18deg); }
  50%     { transform: translateY(-14px) rotate(12deg); }
}
```

- [ ] **Step 4: Ensure footer is a positioning context**

Confirm `.foot` has `position: relative;` (add it if absent) so `::before` anchors correctly.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 6: Visual check**

Run `npm run dev`, scroll top→bottom. Confirm: palette deepens sky→deep water; sub-units read as a deeper band with legible light text; footer is deep blue with a subtle drifting feather glow; disclaimer text present and legible (contrast).
Expected: coherent descent; reduced-motion disables the feather animation.

---

### Task 7: Redesign chrome (scroll-progress + dot-rail) as the feather's path; verify playback + mobile NowPlayingBar

**Files:**
- Modify: `src/index.css` (`.progress`, `.dots`/`.dot`, NowPlayingBar mobile sizing)
- Modify: `src/components/NowPlayingBar.jsx` (only mobile tap-target tweaks if needed; do NOT touch iframe mechanism)

**Interfaces:**
- Consumes: existing progress/dot DOM in `App.jsx` (unchanged markup).
- Produces: restyled chrome; playback mechanism untouched.

- [ ] **Step 1: Restyle progress bar as feather-blue path**

In `src/index.css`, replace the `.progress` background:

```css
  background: linear-gradient(90deg, #9fd6f2, #6fc5f4, #2f6f93);
```

- [ ] **Step 2: Restyle dot-rail**

Add/adjust in `src/index.css` so dots read as a vertical "flight path" (keep the `--c` theming and active scale already driven by `App.jsx`):

```css
.dots { gap: 14px; }
.dot { width: 11px; height: 11px; border-radius: 50%; background: var(--c); opacity: 0.45; transition: transform .25s, opacity .25s; }
.dot.on { opacity: 1; transform: scale(1.6); box-shadow: 0 0 10px var(--c); }
```

- [ ] **Step 3: Mobile NowPlayingBar tap targets**

In `src/index.css`, ensure NowPlayingBar controls are ≥44px on mobile:

Actual control classes in `NowPlayingBar.jsx` are `.np-play`, `.np-skip`, `.np-close` inside `.np-bar` (the clipped iframe host is `.np-hidden-host` — do NOT touch it):

```css
@media (max-width: 760px) {
  .np-play, .np-skip, .np-close { min-width: 44px; min-height: 44px; }
  .np-inner { padding-inline: 12px; }
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 5: Verify playback still works (critical)**

Run `npm run dev`. Click an album tile → it docks in the NowPlayingBar → audio plays via the clipped Spotify iframe; play/pause and scrubber work. Inspect DOM: the iframe host is clipped (real height, `overflow:hidden`), NOT `display:none`.
Expected: playback functional; mechanism intact.

- [ ] **Step 6: Mobile check 360–420px**

Resize to 360px and 420px. Confirm: disc grid usable, NowPlayingBar thumb-reachable with ≥44px controls, scrubber draggable, no overflow.
Expected: playback + chrome work at mobile widths.

---

### Task 8: Final full-page verification pass

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `npm run build` then `npm run preview`.
Expected: build exits 0; preview serves the production bundle.

- [ ] **Step 2: Full desktop walkthrough**

At ≥1200px in preview: hero WebGL → about (tight) → members varied grid (wide/tall/small, equal weight) → sub-units (deep band) → discography + working playback → footer (deep blue + feather). No console errors.

- [ ] **Step 3: Full mobile walkthrough**

At 375px: stacked member cards, thumb-reachable NowPlayingBar, no horizontal scroll, dot-rail hidden as before below 760px.

- [ ] **Step 4: Reduced-motion pass**

Emulate `prefers-reduced-motion: reduce`: WebGL hero shows CSS fallback (no loop), feather/reveal animations disabled, page fully usable and legible.

- [ ] **Step 5: Constraint audit**

Confirm: `data.js` content unchanged (only derived `variant` added); no asset renamed; only new dep is `three`; Spotify iframe clipped-not-hidden; disclaimer present; focus-visible + semantic headings intact.
Expected: all global constraints satisfied.
