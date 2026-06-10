# CineSphere — Design System

> One canvas, one accent, total restraint. The luxury is in what's *absent*.

## Palette

All tokens live in `tailwind.config.ts` and `globals.css`.

| Role | Token | Hex | Use |
|---|---|---|---|
| Canvas | `piano` | `#050505` | Page background, infinite space |
| Surface | `carbon` | `#121214` | Panels, props, theatre surfaces |
| Surface step | `piano-700/600` | `#16161a` / `#1d1d22` | Elevation layers |
| Primary text | `ivory` | `#f4f1ea` | Headings, body (never pure white) |
| Muted text | `ivory-muted` | `#b8b4ab` | Supporting copy |
| Faint text | `ivory-faint` | `#6f6c66` | Captions, legal |
| **Accent** | `champagne` | `#cba47a` | The one precious colour |
| Accent light | `champagne-light` | `#e6cfa8` | Gradients, hovers |
| Accent glow | `champagne-glow` | `#ffdca8` | Emissive lights, particles, bloom |

**Rule:** champagne is the *only* chroma. Everything else is black→ivory.
Nothing competes with the gold. If a second accent feels needed, the design is
wrong.

## Typography

Wired via `next/font` in `app/layout.tsx`:

- **Display — Cormorant Garamond** (`--font-display`, `font-display`): the
  cinematic "voice". Large, light weights, generous leading. Used for all scene
  titles and the wordmark.
- **Sans — Inter** (`--font-sans`, `font-sans`): the "interface". Body, eyebrows,
  buttons, captions.

Helpers in `globals.css`:

- `.display` — display serif, tight leading, ligatures on.
- `.eyebrow` — Inter, uppercase, `tracking-luxe` (0.22em), champagne.
- `.text-gold` — champagne gradient clipped to text.

Tracking scale: `tracking-luxe` (0.22em) for eyebrows/CTAs, `tracking-wide`
(0.12em) for the wordmark. Body stays default tracking.

## Surfaces & effects

- `.glass` — floating glass panel: hairline white border, 4% white fill,
  `backdrop-blur-glass` (14px), soft inset highlight. Used for nav, automation
  UI, cards.
- `bg-carbon-weave` — procedural carbon-fibre texture for prop surfaces.
- `bg-piano-fade` — radial vignette background.
- `.vignette` — fixed film-grade edge falloff over the whole viewport.
- Shadows: `shadow-glass` (depth) and `shadow-gold` (accent glow).

## Motion language

- **Signature easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out). Slow,
  confident, never bouncy. Used in Framer transitions and the Lenis curve.
- **Durations:** UI 0.5s; copy reveals ~1.1s; preloader exit ~0.9s. Luxury is
  unhurried.
- **Camera:** critically damped follow (see `CameraRig`) — it *settles*, never
  snaps.
- **Keyframes** (`tailwind.config.ts`): `fade-up`, `gold-shift`, `breathe`.
- Everything degrades under `prefers-reduced-motion` (CSS + the store flag).

## Components

- **`Button`** — two variants only: `gold` (filled champagne sheen) and `ghost`
  (hairline champagne outline). Pill shape, uppercase, `tracking-luxe`, 0.5s
  transitions.
- **`SceneSection`** — the copy frame. Respects `align` from the storyboard and
  fades copy in/out on its own scroll band.

## Spacing & layout

- Page gutters: `px-6` mobile, up to `px-16` desktop.
- Copy max width: `max-w-3xl` for headings, `max-w-xl` for body.
- Generous vertical rhythm — each chapter owns a full viewport; never crowd.

## Do / Don't

- ✅ Do lead with darkness; reveal with light.
- ✅ Do let single lines of serif breathe.
- ❌ Don't add a second accent colour.
- ❌ Don't use pure `#fff` or pure `#000` for text/surfaces.
- ❌ Don't speed up the motion to feel "snappy" — it should feel *composed*.
