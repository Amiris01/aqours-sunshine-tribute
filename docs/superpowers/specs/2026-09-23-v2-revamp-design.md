# Aqours Tribute V2 — Revamp Design

**Date:** 2026-09-23
**Status:** Design approved in chat; written spec pending review

## Goal

Build a **V2** of the Aqours fan tribute that is more modern, more premium, and
a more *accurate* representation of Aqours — with **music front and center**.
Content scope stays the same as V1 (members, sub-units, discography, EN/JP),
plus one small verified "journey" timeline. Presentation changes completely.

### Hard constraints

- **V1 is not modified.** No edits to `src/`, `public/`, `index.html`,
  `vite.config.js`, root `package.json`, or V1 docs. V2 imports nothing from V1.
- **No push, no deploy** until the owner explicitly instructs. Local commits only.
- V2 must build to static files servable from GitHub Pages under
  `/aqours-sunshine-tribute/v2/`.
- `prefers-reduced-motion` disables all scroll-driven/3D motion.
- Fan-tribute disclaimer retained.

### Success criteria

1. V2 runs locally (`cd v2 && npm run dev`) and builds with zero type errors.
2. Visually reads as a clear generation ahead of V1 ("Oceanic night").
3. All member/sub-unit/discography facts match the verified data below.
4. Music is playable from the first screen and the player persists page-wide.
5. Lighthouse (desktop) Performance ≥ 85, Accessibility ≥ 95.
6. Works at 375px width with no horizontal scroll.

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + TypeScript (strict) on Vite |
| Styling | Tailwind CSS v4 + CSS custom-property design tokens |
| UI motion | Motion (`motion/react`) — layout / shared-element transitions, gestures |
| Scroll choreography | GSAP ScrollTrigger + Lenis smooth scroll |
| 3D | React Three Fiber + drei (lazy-loaded) |
| Accessible primitives | Radix UI (Dialog, Slider, Tooltip, ToggleGroup) |
| State | Zustand (player, language) |
| Tests | Vitest + Testing Library (logic/components), Playwright smoke (optional) |

## Repository layout

```
/                     V1 — untouched
└── v2/               self-contained app, own package.json + lockfile
    ├── index.html
    ├── vite.config.ts        base: '/aqours-sunshine-tribute/v2/'
    ├── public/assets/        COPIED from V1 public/assets (excluding _sources, banner/_orig)
    └── src/
        ├── main.tsx, App.tsx
        ├── content/          members.ts, subunits.ts, discography.ts, timeline.ts, i18n/{en,ja}.ts
        ├── store/            player.ts, lang.ts
        ├── features/
        │   ├── layout/       TopBar, LangSwitch, Footer, SmoothScroll provider
        │   ├── hero/         Hero, SeaScene (R3F, lazy), HeroFallback
        │   ├── about/        About
        │   ├── members/      Roster, MemberCard, MemberView (full-screen)
        │   ├── subunits/     SubUnits
        │   ├── music/        Discography, ReleaseShelf, Vinyl, Player, spotifyBridge.ts
        │   └── journey/      Timeline
        ├── motion/           reducedMotion.ts, gsap.ts (lazy registration), variants.ts
        └── styles/           index.css (Tailwind entry + tokens)
```

Deploy wiring (later, only on instruction): add V2 build steps to
`.github/workflows/deploy.yml` so `v2/dist` is copied to `dist/v2` before the
Pages upload. This is the single shared file that will change, and only then.

## Visual direction — "Oceanic night"

- **Base:** deep-sea navy (`--bg #06101f`, surfaces `#0b1a2e` / `#10233d`),
  soft text `#e8f1fb`, muted `#8aa3bf`.
- **Group accent:** Aqours aqua (`--aqua #3fd6ff`) — a design token, not a
  claimed official hex.
- **Member colors** (official image colors) used as glows, rims, gradients,
  never as large flat fills behind text.
- **Type:** a display serif/grotesk pairing for editorial headlines
  (e.g. *Fraunces* or *Instrument Serif* + *Inter*/*Manrope*), *Noto Sans JP*
  for Japanese. Large, tight headline tracking; generous whitespace.
- **Texture:** subtle film grain overlay, light caustic gradients, no glass
  overload.
- Contrast: body text ≥ 4.5:1 on all surfaces; member colors never carry text
  meaning alone.

## Page flow

1. **TopBar** (sticky, blurred): mark, anchor links (Members, Units, Music,
   Journey), EN/JP toggle, compact now-playing pill once a track is active.
2. **Hero:** R3F night sea — moonlit water shader + drifting particles in the
   nine member colors. Big set type tagline; primary CTA **▶ Play Aqours**
   (queues the discography from track 1). Static gradient/image fallback when
   WebGL unavailable or reduced motion. Canvas unmounts off-screen.
3. **About:** V1 copy as an editorial statement; words brighten as they scroll
   into view (scrubbed on desktop, simple fade on mobile).
4. **The Nine:** roster grid of portrait cards (member-color glow on hover/focus).
   Click/Enter opens **MemberView** — full-screen Radix Dialog with a Motion
   shared-element transition (portrait → banner). Shows all profile fields,
   signature, blurb; prev/next buttons + arrow keys; Esc closes; focus returns
   to the originating card. Replaces V1's pinned slideshow.
5. **Sub-units:** three large panels (CYaRon!, AZALEA, Guilty Kiss) with logo,
   members (emblems), tagline, official unit color wash.
6. **Music (centerpiece):** horizontal release shelf (drag/scroll/keys), a
   large vinyl that spins behind the active cover, year scrubber, expanded
   detail for the active release (title, year, type, blurb) with Play.
7. **Global Player:** docked bottom bar, tinted by the active release's accent;
   play/pause, prev/next, seek (Radix Slider), auto-advance, minimize to TopBar
   pill. Persists across the whole page.
8. **Journey:** compact horizontal timeline of verified milestones 2015 → 2025.
9. **Footer:** V1 footer copy + disclaimer over a calm horizon.

## Content — verified data (V2 source of truth)

### Members

| # | Name | JP | CV | Birthday | Sign | Year | Height | Blood | Unit | Color |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | Chika Takami | 高海千歌 | Anju Inami | Aug 1 | Leo | 2nd | 157 cm | B | CYaRon! | Mikan Orange `#FF9547` |
| 02 | Riko Sakurauchi | 桜内梨子 | Rikako Aida | Sep 19 | Virgo | 2nd | 160 cm | A | Guilty Kiss | Sakura Pink `#FF9EAC` |
| 03 | Kanan Matsuura | 松浦果南 | Nanaka Suwa | Feb 10 | Aquarius | 3rd | 162 cm | O | AZALEA | Emerald Green `#27C1B7` |
| 04 | Dia Kurosawa | 黒澤ダイヤ | Arisa Komiya | Jan 1 | Capricorn | 3rd | 162 cm | A | AZALEA | Red `#DB0839` |
| 05 | You Watanabe | 渡辺曜 | Shuka Saito | Apr 17 | Aries | 2nd | 157 cm | AB | CYaRon! | Light Blue `#66C0FF` |
| 06 | Yoshiko Tsushima | 津島善子 | Aika Kobayashi | Jul 13 | Cancer | 1st | 156 cm | O | Guilty Kiss | White `#C1CAD4` |
| 07 | Hanamaru Kunikida | 国木田花丸 | Kanako Takatsuki | Mar 4 | Pisces | 1st | 152 cm | O | AZALEA | Yellow `#FFD010` |
| 08 | Mari Ohara | 小原鞠莉 | Aina Suzuki | Jun 13 | Gemini | 3rd | 163 cm | AB | Guilty Kiss | Violet `#C252C6` |
| 09 | Ruby Kurosawa | 黒澤ルビィ | Ai Furihata | Sep 21 | Virgo | 1st | 154 cm | A | CYaRon! | Pink `#FF6FBE` |

Ages, trademarks, blurbs, JP CV names and display order are ported from V1
(display order `01,05,02,09,07,06,04,03,08`).

### Sub-units

- **CYaRon!** — Chika, You, Ruby — orange
- **AZALEA** — Kanan, Dia, Hanamaru — **pink** (V1 incorrectly used teal)
- **Guilty Kiss** — Riko, Yoshiko, Mari — purple

Taglines ported from V1 i18n.

### Discography

Ported from V1 (titles, Spotify embeds, covers) with corrections:
- **KU-RU-KU-RU Cruller!** → **2021** (released 2021-09-22; V1 said 2025).
- **Eikyuu hours** → 2024 (2024-12-18; Finale LoveLive! theme; Oricon #1).
- Each release gets a `type` (single / insert song / theme) and short blurb;
  every date is re-verified during implementation, any unverifiable field is
  omitted rather than guessed.
- Each release gets an `accent` color used to tint the player.

### Journey timeline (verified)

- **Apr 2015** — Project Love Live! Sunshine!! begins.
- **Oct 2015** — First single "Kimi no Kokoro wa Kagayaiteru kai?".
- **Jul 2016** — TV anime season 1 (Uranohoshi Girls' Academy, Uchiura, Numazu).
- **Oct 2017** — TV anime season 2.
- **Nov 2018** — 4th LoveLive! at Tokyo Dome.
- **Dec 2018** — Special performance at NHK Kōhaku Uta Gassen.
- **Jan 2019** — Film *Over the Rainbow*.
- **2019** — First Love Live! Asia tour; 5th LoveLive! at MetLife Dome.
- **Jun 2023** — Spin-off anime *Yohane the Parhelion*.
- **Jun 21–22, 2025** — Finale LoveLive! ~Eikyuu stage~, Belluna Dome.

Copy stays neutral about the group's status after the finale.

### i18n

EN/JP dictionaries ported from V1 into typed modules; new strings (CTA,
player, timeline, member view labels) added in both languages. Missing keys
fail type-checking.

## Data flow

- `content/*` are typed static modules — the only data source.
- `store/player.ts` (Zustand): `queue`, `index`, `status` (idle/loading/playing/
  paused), `position`, `duration`, actions `playAt`, `toggle`, `next`, `prev`,
  `seek`, `close`. UI reads from the store; only `spotifyBridge` talks to Spotify.
- `music/spotifyBridge.ts` wraps the Spotify IFrame API (script loaded once,
  lazily on first play). It maps store actions → controller calls and
  playback_update events → store updates, and handles auto-advance.
- `store/lang.ts`: current language persisted to `localStorage` (try/catch),
  `<html lang>` kept in sync.

## Motion, performance, accessibility

- **Reduced motion:** one `useReducedMotion()` gate. When set: no Lenis, no
  GSAP import, no R3F canvas, Motion transitions become instant/opacity-only.
- **Lazy chunks:** R3F/three, GSAP, Spotify API are loaded on demand. Target
  initial JS ≤ ~120 KB gzip.
- **Images:** existing webp banners; portraits lazy-loaded with explicit sizes.
- **Keyboard/a11y:** every interactive element reachable and visibly focused;
  MemberView is a proper modal (focus trap, labelled); shelf navigable by
  arrow keys; player controls have labels; `aria-live` announces the track
  change politely.
- **Mobile:** no pinning; shelf is swipeable; MemberView full-screen sheet;
  player compact.

## Error handling

- WebGL/context-loss → fallback hero, no error surfaced.
- Spotify script blocked/failed or autoplay refused → player shows an
  "Open in Spotify" link and a retry; the page keeps working.
- Missing asset → card still renders with emblem/name.
- CSP meta for V2 mirrors V1's (Spotify, Google Fonts) — nothing broader.

## Testing

- **Vitest:** content integrity (9 members, unique nums, every unit has 3
  members, all colors valid hex, every disc has year/title), player store
  transitions (next/prev wrap, auto-advance, close), i18n key parity EN↔JA.
- **Testing Library:** MemberView open/close/prev/next + focus return;
  LangSwitch toggles text.
- **Manual/browser:** run dev server, check desktop + 375px, reduced-motion,
  WebGL-off fallback, player playback; production build + `vite preview` under
  the `/v2/` base.

## Out of scope

- Any change to V1, or fixing V1's data errors (can be a separate task).
- Deployment (awaits instruction).
- New content areas beyond the journey timeline (lyrics, per-song pages, etc.).
