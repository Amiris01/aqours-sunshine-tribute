# Aqours Tribute — V2

The V2 redesign ("Oceanic night", music-first) of the Aqours fan tribute. It is a
standalone app; V1 at the repo root is unchanged.

Spec: `../docs/superpowers/specs/2026-09-23-v2-revamp-design.md`

## Run

```bash
cd v2
npm install
npm run dev        # http://localhost:5173/aqours-sunshine-tribute/v2/
npm test           # vitest
npm run build      # type-check + build to v2/dist
npm run preview    # serve the build at /aqours-sunshine-tribute/v2/
```

## Notes

- Content lives in `src/content/` (verified data; see the spec for sources).
- Assets in `public/assets/` are copies of V1's; edit V2's copies only.
  Member portraits and the hero logo are resized WebP versions for performance.
- Deployment is intentionally not wired up yet — it will be added to
  `.github/workflows/deploy.yml` (building `v2/` into `dist/v2`) on request.

Fan-made, non-commercial tribute. Love Live! Sunshine!!, Aqours, its characters,
logos and music belong to their respective rights holders.
