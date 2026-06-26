# Handoff: Aqours — Love Live! Sunshine!! Fan Tribute Page

## Overview
A single, long-scroll promotional landing page celebrating **Aqours**, the nine-member school-idol group from *Love Live! Sunshine!!*. The page opens with an animated seaside hero (sun, drifting clouds, rolling ocean waves, parallax), introduces the group, then presents each of the nine members in a full profile panel **color-themed to her own image color**, followed by a discography grid and a footer. The mood is bright, sunny, coastal, and idol-pop.

This is a **fan tribute**. It uses no official character art — member portraits are stylized colored silhouette stand-ins, and all logos are explicit placeholder slots for the implementer/user to drop their own art into. Aqours, its characters, and its music are property of their respective rights holders; keep that attribution in the footer.

## About the Design Files
The file in this bundle (`Aqours Sunshine.dc.html`) is a **design reference created in HTML** — a working prototype that demonstrates the intended look, layout, motion, and content. **It is not production code to copy verbatim.** It is authored in a proprietary "Design Component" format (custom `<x-dc>`, `<sc-for>`, `<helmet>` tags plus a `support.js` runtime), so it will not run as plain HTML outside that environment.

The task is to **recreate this design in the target codebase's existing environment** (React, Vue, Svelte, SwiftUI, plain HTML/CSS/JS, etc.) using that project's established patterns, component library, and conventions. If no codebase exists yet, choose the most appropriate framework (a static site or a single React/Vue component tree is plenty — there is no backend) and implement it there. This README is self-sufficient: you can rebuild the page from it alone without opening the prototype, though the prototype is the source of truth for exact spacing/feel.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, motion timings, and copy are specified below and should be reproduced closely. The one deliberately "rough" element is the set of **placeholder slots** (logos) — those are meant to look like empty drop targets and should remain placeholders until the user supplies real assets.

---

## Layout & Sections (top to bottom)

The whole page is one vertical scroll. Max content width for text sections is **1120px**, centered, with ~26px side padding. Page background is a vertical gradient from pale sky `#eaf8ff` (top) to warm cream `#fff9ef` (from ~36% down). `overflow-x: hidden` globally.

### 1. Hero (full viewport)
- `height: 100vh`, `min-height: 620px`, content centered, `overflow: hidden`.
- **Sky** (`absolute inset:0`, z0): vertical gradient `#6fc5f4 → #a4ddf9 (40%) → #d8f1fe (72%) → #eaf8ff (100%)`.
- **Sun** (z1): a 150×150px circle, `top: 11%`, horizontally centered. Fill = `radial-gradient(circle at 50% 42%, #fff7d6, #ffd24d 58%, #ffb733)`, glow `box-shadow: 0 0 90px 26px rgba(255,206,80,.5)`. Inner core gently bobs (see Animations). The sun **parallax-rises** on scroll.
- **Clouds** (z1): three soft white blurred ellipses (`radial-gradient(closest-side, rgba(255,255,255,.95), transparent)`, `filter: blur(2px)`), sizes ~260×120 / 200×92 / 150×78px, positioned upper area, each slowly drifting horizontally.
- **Hero content** (z3, centered, parallax-fades on scroll):
  - **Logo placeholder slot** — striped dashed box, `min(300px,72vw)` × 116px, centered, label text `[ Aqours group logo ]`. (See "Placeholder Slot" style.)
  - **Eyebrow**: `Love Live! Sunshine!! · Fan Tribute` — Fredoka 500, uppercase, letter-spacing .26em, color `#0a6fa0`, ~11–15px.
  - **Wordmark**: the word **Aqours** — Fredoka 600, `font-size: clamp(74px, 17vw, 232px)`, line-height .92, letter-spacing -.015em. Fill is a clipped animated gradient text: `linear-gradient(100deg, #ff7a59, #ffcf3f, #36b6f0, #9b72b0, #ff7a59)`, `background-size: 220% auto`, `-webkit-background-clip:text; color:transparent`, `drop-shadow(0 10px 24px rgba(20,58,78,.18))`. The gradient pans continuously (sheen).
  - **Tagline**: `Shine with us — here, now, by the sea.` — Fredoka 400, `clamp(18px,2.6vw,30px)`, color `#155e80`.
- **Scroll cue** (z3, `bottom:118px`, centered): small uppercase `Scroll to dive in` + a bouncing `↓` arrow. Fades out as you scroll.
- **Waves** (z2, bottom, height 190px, pointer-events none): three stacked SVG wave layers spanning `width:200%`, each translating horizontally in a seamless loop at different speeds/opacities to read as ocean depth. Fills back→front: `#0077b6` (opacity .5), `#00a6e6` (opacity .65), `#cdeefb` (front). Wave path (viewBox `0 0 2880 200`, `preserveAspectRatio="none"`), back/mid layer: `M0,120 C360,166 1080,166 1440,120 C1800,166 2520,166 2880,120 L2880,200 L0,200 Z`; front layer baseline at 128 instead of 120. The path is periodic every 1440 units so a `translateX(-50%)` loop tiles seamlessly.

### 2. About / Intro (`.section`, padding 128px 26px)
- Eyebrow `School Idol Project`; H2 `Nine girls, one shining sea.`
- Lead paragraph (exact copy):
  > Aqours is the school idol group of Uranohoshi Girls' High School in Numazu, on Japan's sun-soaked Shizuoka coast. Refusing to watch their school quietly fade away, nine friends chase a single radiant dream — to shine, here and now, with everything they've got.
- **Stats row** (flex, gap ~34–60px): three stat blocks. Numbers are Fredoka 600, `clamp(44px,6vw,78px)`, gradient-clipped text.
  - `9` **Members** — gradient `linear-gradient(120deg,#ff7a59,#ffcf3f)`. **Counts up 0→9** when scrolled into view.
  - `3` **Sub-units** — gradient `linear-gradient(120deg,#36b6f0,#0077b6)`. **Counts up 0→3.**
  - `2016` **Debut Year** — static (orange gradient).

### 3. Members showcase
- **Header block** (`.members-head`, centered, max 1100px): eyebrow `Meet Aqours`; H2 `Nine hearts, nine colors.`; lead `Each member shines in her own hue — every profile below is themed to her image color. Scroll through to meet all nine.`
- Then **nine full-width member sections**, each themed to that member's color (the per-member color is exposed as a CSS custom property `--c` on the section; everything inside derives from it).
  - **Section** (`.msec`): padding `clamp(64px,8vw,108px) 26px`; background `linear-gradient(180deg, color-mix(in srgb, var(--c) 12%, #fffdf8), color-mix(in srgb, var(--c) 4%, #fffdf8))` — i.e. a soft tint of the member color. Each section **fades/slides up into view** on scroll (reveal).
  - **Inner wrap** (`.mwrap`, max 1100px, flex, gap `clamp(30px,4.5vw,60px)`, align-items flex-start). **Odd-indexed members are reversed** (`flex-direction: row-reverse`) to create a left/right zigzag rhythm.
  - **Media column** (`flex: 0 0 clamp(240px,30vw,350px)`, flex column, gap 18px):
    1. **Member logo placeholder slot** — striped dashed box, full width × 116px, label `[ <FirstName> · emblem ]` (e.g. `[ Chika · emblem ]`). Border tinted to `--c`.
    2. **Portrait** — square (`aspect-ratio:1`), `border-radius:38px`, `overflow:hidden`. Background `linear-gradient(155deg, color-mix(in srgb, var(--c) 52%, #fff), var(--c))`, `box-shadow: 0 32px 64px -30px var(--c)`. Contains:
       - A large translucent number (`.num`) top-left: the member's `01`–`09`, Fredoka 600, `clamp(56px,8vw,92px)`, `rgba(255,255,255,.55)`.
       - A soft radial white glow (`.glow`) centered.
       - A simple white idol **silhouette** built from two shapes: a head = circle ~30% width at `top:23%`, and a body = `width:74%; height:45%; border-radius:46% 46% 0 0` anchored to the bottom, both `rgba(255,255,255,.92)`. (This is the colored stand-in for real character art.)
  - **Info column** (`.minfo`, flex:1):
    - **Accent bar** (`.accent`): 60×7px rounded, `background: var(--c)`, margin-bottom 18px.
    - **Name** (`.m-name`): English name, Fredoka 600, `clamp(30px,4.4vw,54px)`, line-height 1, letter-spacing -.015em.
    - **JP name** (`.m-jp`): Japanese name, 700, `clamp(15px,1.8vw,19px)`, color `#6a8a9a`.
    - **Chips row** (`.chips`): two pills —
      - **Sub-unit** chip (`.chip.unit`): white background, 1.5px border `color-mix(in srgb, var(--c) 45%, #fff)`, text `#2a5061`.
      - **Oshi color** chip (`.chip.oshi`): background `color-mix(in srgb, var(--c) 16%, #fff)`, text `color-mix(in srgb, var(--c) 72%, #2a4a40)`, border `color-mix(in srgb, var(--c) 34%, #fff)`, with a 13px round **swatch** filled solid `var(--c)` before the color name.
    - **Blurb** (`.m-blurb`): one-sentence description, `clamp(16px,1.9vw,21px)`, line-height 1.6, color `#3a6173`, max-width 52ch.
    - **Profile grid** (`.pgrid`): 2-column grid (`repeat(2, minmax(0,1fr))`, gap `16px 30px`), separated from the blurb by a top border `1.5px color-mix(in srgb, var(--c) 24%, #e7eef2)`, padding-top 24px. Eight cells, each a **label** (`.plabel`: Fredoka 600, 11px, uppercase, letter-spacing .13em, color `color-mix(in srgb, var(--c) 68%, #3a6173)`) over a **value** (`.pval`: 17px, weight 700, color `#22414e`):
      `Voice (CV)` · `Birthday` · `Zodiac` · `Grade` · `Age` · `Height` · `Blood Type` · `Trademark`.

### 4. Discography (`.section`)
- Eyebrow `Discography`; H2 `Songs that shine.`
- **Grid** (`.disc`): `repeat(auto-fill, minmax(268px, 1fr))`, gap 20px. Cards (`.disc-card`): white, 1px border `#e7f1f6`, `border-radius:26px`, padding `30px 28px`, `box-shadow: 0 24px 50px -34px rgba(20,58,78,.5)`. Each card lifts on hover (`translateY(-8px)` + stronger shadow, transition .35s). Each card **fades up** on scroll. Card content: year (Fredoka 600, 15px, `#00a6e6`, letter-spacing .08em), title (Fredoka 600, 23px), and a tag pill (`.disc-tag`: 12px, 700, `#5a7a8a` on `#f1f7fa`, rounded). See Content Data for the six entries.

### 5. Footer (`.foot`)
- `margin-top:50px`, padding `150px 26px 90px`, centered, background `linear-gradient(180deg,#d8f1fe,#9bdbf8)`, `overflow:hidden`.
- **Top wave divider** (`.foot-wave`, absolute top, height 90px): an SVG filled with the page cream `#fff9ef` that curves the cream section down into the blue footer. Path (viewBox `0 0 1440 100`, `preserveAspectRatio="none"`): `M0,0 L1440,0 L1440,42 C1080,92 360,-8 0,42 Z`.
- **Mark** (`.foot-mark`): `Shine!!` — Fredoka 600, `clamp(44px,9vw,104px)`, same rainbow gradient-clip as the wordmark (without the 5th stop).
- **Sub** (`.foot-sub`): `Aqours, forever sunshine.` — Fredoka, `clamp(17px,2.3vw,25px)`, color `#0a5a80`.
- **Note** (`.foot-note`, max 62ch, 13px, `#3f7a98`): `A fan-made tribute celebrating Aqours from Love Live! Sunshine!! Aqours, its characters, and music are the property of their respective rights holders. Made with love, by the sea.`

### Global fixed UI
- **Scroll progress bar** (`.progress`): fixed top, full width, 5px, `transform-origin:0 50%`, `transform: scaleX(scrollProgress)`, background `linear-gradient(90deg,#ff7a59,#ffcf3f,#36b6f0)`, z60. Updated on scroll.
- **Member dot rail** (`.dots`): fixed, right 22px, vertically centered, column of nine dots (one per member), gap 14px, z40. Each dot is 13px, round, `background: var(--c)` (its member color), `opacity:.45`. The dot for the member currently centered in the viewport gets `.on`: `opacity:1`, `transform: scale(1.7)`, ring `box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 22%, transparent)`. Clicking a dot smooth-scrolls to that member section (offset ~90px). **Hidden on ≤760px.** This whole rail is toggleable (see Tweakable Options).

---

## Placeholder Slot style (`.slot`)
Used for the hero logo and each member emblem. A drop-target look:
- `border-radius:16px`; `border: 2px dashed color-mix(in srgb, var(--c, #9fb6c0) 50%, #cfdde4)` (tints to member color where `--c` exists, neutral grey-blue in the hero).
- Background diagonal stripes: `repeating-linear-gradient(45deg, #fff, #fff 9px, #eef4f7 9px, #eef4f7 18px)`.
- Centered monospace label: `font-family: ui-monospace, SFMono-Regular, Menlo, monospace`, 11.5px, color `#6d8a97`, letter-spacing .04em.
These should stay as placeholders. When the user provides real logo/emblem art, replace the slot contents with an `<img>` (keep the same box size; `object-fit: contain`).

---

## Content Data (exact)

### Members (index order = section order = number badge)
For each: number, English name, Japanese name, CV (voice actress, EN + JP), birthday, zodiac, grade, age, height, blood type, sub-unit, oshi/image color name, trademark, image-color hex (`--c`), blurb.

1. **01 — Chika Takami** / 高海千歌 · CV: Anju Inami (伊波杏樹) · Aug 1 · Leo · 2nd Year · 16 · 157 cm · O · **CYaRon!** · Mikan Orange · Trademark: Mikan obsession · `--c: #ff7d2e` · *"The boundlessly cheerful leader who turned one small wish into Aqours."*
2. **02 — Riko Sakurauchi** / 桜内梨子 · CV: Rikako Aida (逢田梨香子) · Sep 19 · Virgo · 2nd Year · 16 · 160 cm · A · **Guilty Kiss** · Sakura Pink · Trademark: Piano & books · `--c: #f2799f` · *"A graceful pianist from Tokyo who found her courage beside the sea."*
3. **03 — Kanan Matsuura** / 松浦果南 · CV: Nanaka Suwa (諏訪ななか) · Feb 10 · Aquarius · 3rd Year · 17 · 159 cm · O · **AZALEA** · Aqua Green · Trademark: Scuba diving · `--c: #16b6a8` · *"The warm, level-headed diver who keeps everyone steady and grounded."*
4. **04 — Dia Kurosawa** / 黒澤ダイヤ · CV: Arisa Komiya (小宮有紗) · Jan 1 · Capricorn · 3rd Year · 17 · 162 cm · A · **AZALEA** · Crimson Red · Trademark: Secret idol mania · `--c: #e23b4b` · *"The dignified council president hiding a deeply idol-loving heart."*
5. **05 — You Watanabe** / 渡辺曜 · CV: Shuka Saito (斉藤朱夏) · Apr 17 · Aries · 2nd Year · 16 · 159 cm · A · **CYaRon!** · Sky Blue · Trademark: "Yousoro!" salute · `--c: #36b6f0` · *"Sporty and sunny — happiest on the water or stitching new costumes."*
6. **06 — Yoshiko Tsushima** / 津島善子 · CV: Aika Kobayashi (小林愛香) · Jul 13 · Cancer · 1st Year · 15 · 157 cm · O · **Guilty Kiss** · Twilight Grey · Trademark: Fallen angel "Yohane" · `--c: #8e8bb5` · *"A self-proclaimed fallen angel with an irresistible flair for drama."*
7. **07 — Hanamaru Kunikida** / 国木田花丸 · CV: Kanako Takatsuki (高槻かなこ) · Mar 4 · Pisces · 1st Year · 15 · 154 cm · B · **AZALEA** · Sunshine Yellow · Trademark: "…zura" · `--c: #f3c52b` · *"A gentle bookworm opening up to a whole new world, zura."*
8. **08 — Mari Ohara** / 小原鞠莉 · CV: Aina Suzuki (鈴木愛奈) · Jun 13 · Gemini · 3rd Year · 17 · 162 cm · AB · **Guilty Kiss** · Royal Purple · Trademark: "Shiny!" · `--c: #a673c4` · *"The free-spirited heiress who lives loud and shines even louder."*
9. **09 — Ruby Kurosawa** / 黒澤ルビィ · CV: Ai Furihata (降幡愛) · Sep 21 · Virgo · 1st Year · 15 · 150 cm · O · **CYaRon!** · Ruby Pink · Trademark: "Ganbaruby!" · `--c: #ff7bb0` · *"The shy youngest who blossoms brightest under the stage lights."*

> Note: profile facts (CV, birthday, height, etc.) are commonly cited *Love Live! Sunshine!!* character details. Treat them as fan-reference data and verify against an official source if exactness matters.

### Discography (six cards, in order)
1. **2015** — *Kimi no Kokoro wa Kagayaiteru ka?* — tag: Debut Single
2. **2016** — *Aozora Jumping Heart* — tag: Anime Opening
3. **2016** — *Koi ni Naritai Aquarium* — tag: 2nd Single
4. **2017** — *HAPPY PARTY TRAIN* — tag: Single
5. **2017** — *WONDERFUL STORIES* — tag: 1st Album
6. **2017** — *WATER BLUE NEW WORLD* — tag: Single

---

## Interactions & Behavior
- **Scroll-reveal**: elements with a reveal treatment start `opacity:0; transform: translateY(46px) scale(.985)` and animate to `opacity:1; transform:none` via `transition: opacity .9s ease, transform 1s cubic-bezier(.2,.85,.25,1)`. Triggered once when ~16% of the element enters the viewport (IntersectionObserver, `rootMargin: 0px 0px -7% 0px`, then unobserve). Applied to: about block, member-head, each member section, each discography card, footer block.
- **Count-up stats**: when the about block reveals, any number with a target (`9`, `3`) animates from 0 to target over ~1100ms with an ease-out cubic (`1 - (1-t)^3`). Run once.
- **Hero parallax** (scroll listener, `passive`): sun `translateY(scrollY * 0.28)`, hero content `translateY(scrollY * 0.42)` and `opacity: max(0, 1 - scrollY/560)`, scroll cue `opacity: max(0, 1 - scrollY/240)`. Multiply the sun/content translate factors by a strength value (Strong=1, Subtle=0.45, Off=0) — see Tweakable Options. Opacity fades stay regardless.
- **Progress bar**: `scaleX = scrollY / (documentScrollHeight - innerHeight)` updated on scroll.
- **Dot rail active state**: a second IntersectionObserver on the member sections with `rootMargin: -45% 0px -45% 0px, threshold: 0` — whichever section straddles the vertical middle of the viewport marks its dot `.on`.
- **Dot click**: smooth-scroll to that member section, `window.scrollTo({ top: sectionTop - 90, behavior:'smooth' })`.
- **Disc card hover**: `translateY(-8px)` + deeper shadow.
- **Continuous ambient animations** (CSS keyframes, infinite): sun core bob (6s, ±14px), cloud drift (18–27s, ±42px horizontal), wordmark/footer gradient sheen (7s, background-position pan), scroll-cue arrow bounce (1.6s, ±9px), three wave layers translateX 0→-50% (19s / 13s reverse / 9s). Respect `prefers-reduced-motion` in the rebuild if you want — original does not, but it's a good addition.

## Responsive behavior
- Single breakpoint at **760px**:
  - Member `.mwrap` (and its flipped variant) stack to a column; media column becomes full width (max 380px, centered); portrait fills width.
  - Profile grid stays 2 columns; info text center-aligns; chips center.
  - Dot rail **hidden**.
  - Section padding reduces to `80px 22px`.
- All type uses `clamp()` so it scales fluidly between mobile and desktop.

## State Management
Minimal — no backend, no data fetching. Member list and discography are static arrays. Runtime state is purely view/scroll driven:
- Scroll position → parallax transforms + progress bar (no React state needed; direct style writes or a rAF loop).
- IntersectionObserver booleans → reveal `.in` class, count-up "has run" flag, active dot index.
- Two config flags (see below) if you expose them.

## Tweakable Options (optional, exposed in the prototype)
- **`dotNav`** (boolean, default true): show/hide the right-side member dot rail.
- **`parallax`** (enum: `Strong` | `Subtle` | `Off`, default `Strong`): scales hero parallax intensity (1 / 0.45 / 0).

---

## Design Tokens

**Colors**
- Page bg: `#eaf8ff` → `#fff9ef`; card surface `#fff`; off-white `#fffdf8`.
- Sky gradient: `#6fc5f4`, `#a4ddf9`, `#d8f1fe`, `#eaf8ff`.
- Sea/brand blues: `#36b6f0`, `#00a6e6`, `#0077b6`, `#cdeefb`; accent ocean text `#155e80`, `#0a6fa0`, `#0a5a80`.
- Sun: `#fff7d6`, `#ffd24d`, `#ffb733`; warm accents `#ff7a59` (coral), `#ffcf3f` (sun-yellow).
- Footer gradient: `#d8f1fe` → `#9bdbf8`.
- Text: primary `#143a4e` / `#22414e`; secondary `#3a6173` / `#5a7a8a` / `#6a8a9a`; placeholder mono `#6d8a97`.
- Member image colors (`--c`): Chika `#ff7d2e`, Riko `#f2799f`, Kanan `#16b6a8`, Dia `#e23b4b`, You `#36b6f0`, Yoshiko `#8e8bb5`, Hanamaru `#f3c52b`, Mari `#a673c4`, Ruby `#ff7bb0`.
- Per-member tints are derived at runtime with CSS `color-mix(in srgb, var(--c) N%, …)` — reproduce with `color-mix` (modern browsers) or precompute equivalents in your styling system if you prefer.

**Typography**
- Display/headings/UI accents: **Fredoka** (Google Fonts), weights 400/500/600/700.
- Body: **Nunito** (Google Fonts), weights 400/600/700/800.
- Monospace (placeholder labels only): system `ui-monospace, SFMono-Regular, Menlo, monospace`.
- Scale (clamped): wordmark `clamp(74px,17vw,232px)`; H2 `clamp(34px,5.4vw,66px)`; member name `clamp(30px,4.4vw,54px)`; stat number `clamp(44px,6vw,78px)`; lead `clamp(17px,2vw,22px)`; body/blurb `clamp(16px,1.9vw,21px)`; small labels 11–15px.

**Radius**: cards 26px; portrait 38px; slots 16px; pills/chips 99px (full); dots/swatch 50%.

**Shadow**: cards `0 24px 50px -34px rgba(20,58,78,.5)`; portrait `0 32px 64px -30px var(--c)`; sun glow `0 0 90px 26px rgba(255,206,80,.5)`.

**Spacing**: section padding `clamp(64–128px) 26px`; content max-width 1120/1100px; member gap `clamp(30px,4.5vw,60px)`; profile grid gap `16px 30px`.

**Motion**: reveal `opacity .9s ease, transform 1s cubic-bezier(.2,.85,.25,1)`; hover `.35s ease`; count-up ~1100ms ease-out-cubic; ambient loops 1.6–27s.

## Assets
- **No bundled image assets.** All imagery is either CSS/SVG (sun, clouds, waves, silhouettes) or explicit placeholder slots.
- **Fonts**: Fredoka + Nunito from Google Fonts (swap to your app's font pipeline / self-host as preferred).
- **To be supplied by the user**: the Aqours group logo (hero slot) and each member's emblem (nine member slots). Drop into the `.slot` boxes as `<img>` when available.
- **Out of scope / not included (rights-reserved)**: official Aqours character art, official logos, and any audio. Keep portraits as colored silhouettes unless the user supplies licensed art.

## Files
- `redesign-snapshot/Aqours-Sunshine.dc.html` — the design reference prototype (Design Component format; reference for exact spacing, motion, and structure). The full template, the member/discography data arrays, and all animation/observer logic live in this one file.
