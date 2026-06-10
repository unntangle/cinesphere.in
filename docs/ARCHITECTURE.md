# CineSphere — Architecture

> "The Journey of Sound" — one continuous cinematic scroll through ten chapters.

## 1. Core principle: DOM over WebGL

The site is two synchronized layers stacked in the z-axis:

```
┌─────────────────────────────────────────────┐
│  DOM OVERLAY  (scrolls)        z-index: 10    │  ← copy, CTAs, footer, nav
│  ─ one <section> per scene (full viewport)    │
│  ─ creates the scroll height                  │
├─────────────────────────────────────────────┤
│  WEBGL CANVAS (fixed)          z-index: 0     │  ← the "film"
│  ─ never unmounts                             │
│  ─ camera moves as you scroll                 │
└─────────────────────────────────────────────┘
```

The DOM provides scroll length and crisp, accessible text. The canvas provides
the cinematic 3D. They never fight: the canvas is `position: fixed` with
`pointer-events: none` (re-enabled per-scene only where interaction is needed,
e.g. Scene 07's clickable exhibits).

## 2. The data flow (one direction)

```
Lenis scroll  ──▶  store.setProgress(0–1)  ──▶  derived activeScene
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
   CameraRig         SceneManager        DOM (Framer
   (lerps camera     (mounts active       useScroll per
   keyframes)        scene ±1)            section)
```

- **Single source of truth for scroll:** `useExperience` (Zustand). Written once
  per frame by `SmoothScroll`; read by the camera, scene manager, lighting,
  preloader and chapter indicator.
- **Single source of truth for the story:** `src/lib/constants.ts` → `SCENES[]`.
  Each entry holds the chapter's copy, camera keyframe (`position` + `lookAt`),
  and a `mood` scalar that modulates lighting/bloom.

This means re-ordering or re-timing the journey is a data edit, not a refactor.

## 3. Module responsibilities

| Module | Layer | Responsibility |
|---|---|---|
| `SmoothScroll` | DOM | Lenis ↔ GSAP ticker; publishes progress to store |
| `Preloader` | DOM | Wordmark + progress; reveals on asset-warm |
| `Navigation` / `ScrollProgress` | DOM | Fixed chrome + chapter indicator |
| `Overlay` → `SceneSection` | DOM | Scroll height + per-chapter copy fades |
| `Experience` | WebGL | The single `<Canvas>`, dpr caps, adaptive perf |
| `CameraRig` | WebGL | Damped interpolation through camera keyframes |
| `Lighting` | WebGL | Champagne key + cool fill; intensity tracks `mood` |
| `Effects` | WebGL | Bloom · DOF · Vignette · Noise (off in reduced-motion) |
| `SceneManager` | WebGL | Mounts active scene ±1; unmounts the rest |
| `SceneNN…` | WebGL | The actual 3D for each chapter |
| `LoadBridge` | WebGL | Pipes drei `useProgress` → store for the preloader |

## 4. Scene contract

Every scene is a component receiving `{ active: boolean }`. Convention:

- Read scroll via `useExperience` + `localProgress()` for *within-chapter* `0–1`.
- Do heavy work in `useFrame`; throttle or skip when `!active` (kept warm only
  for crossfades).
- Keep transforms relative to the camera keyframe defined in `constants.ts`.

This uniform contract is why `SceneManager` can treat all ten interchangeably.

## 5. Rendering & performance

- One canvas, one RAF loop (GSAP ticker drives Lenis; R3F drives its own
  internal loop — both capped, no duplicate timers).
- `dpr={[1, 1.8]}` + `AdaptiveDpr` + `AdaptiveEvents`: resolution drops during
  fast scroll, restores at rest.
- `SceneManager` bounds the live scene graph to 2–3 scenes → predictable draw
  calls regardless of total chapter count.
- Post-processing fully disabled under `prefers-reduced-motion`.
- 3D assets lazy-load per scene (see `public/README.md`).

## 6. Responsive strategy (summary)

Desktop = full cinematic camera + post FX. Mobile keeps the journey but:
reduces particle counts, simplifies/disables DOF, uses `touchMultiplier` tuning
in Lenis, and relies on the `align`-aware `SceneSection` so copy reflows cleanly.
Detail in `docs/IMPLEMENTATION_PLAN.md` §Responsive.
