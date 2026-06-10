# CineSphere — The Journey of Sound

A luxury cinematic 3D web experience for a premium AV, Home Theatre, Smart Home
& Automation integrator based in Chennai. The entire site is **one continuous
scroll** — a film, not a set of pages — moving the camera through ten chapters
("scenes") that trace how a single sound becomes a luxury living experience.

> **Status:** Architectural scaffold + design system + working scroll/canvas
> pipeline. Scenes 01, 02 and 10 are functional reference implementations;
> scenes 03–09 are structured, visually distinct stubs with clear `TODO`s for
> swapping in real models and refining motion. See `docs/IMPLEMENTATION_PLAN.md`.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Three.js · React Three
Fiber · drei · @react-three/postprocessing · GSAP + ScrollTrigger · Lenis ·
Framer Motion · React Spring · Zustand.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`,
`npm run typecheck`.

> Requires Node 18.18+ (Node 20 LTS recommended).

## How it works (the 60-second tour)

1. **`SmoothScroll`** (Lenis) runs off GSAP's ticker and writes global scroll
   progress `0→1` into a Zustand store on every frame.
2. **`Experience`** is a single fixed WebGL `<Canvas>` behind the DOM. It never
   unmounts.
3. **`CameraRig`** reads progress and interpolates the camera through each
   scene's keyframe — this is the continuous "dolly through environments".
4. **`SceneManager`** mounts only the active scene ±1 neighbour (memory-safe),
   crossfading between them.
5. **`Overlay`** is the scrolling DOM: one full-viewport `<section>` per scene
   that creates scroll height and presents each chapter's copy.

The single source of truth for the storyboard — copy, camera keyframes, moods,
brands, stats — is **`src/lib/constants.ts`**. Edit the journey there.

## Project structure

```
src/
├─ app/                  # Next App Router: layout, page (entry), globals.css
├─ lib/                  # constants (storyboard), gsap setup, utils
├─ store/                # zustand experience store (scroll ↔ webgl bridge)
├─ hooks/                # reduced-motion sync
└─ components/
   ├─ dom/               # SmoothScroll, Preloader, Nav, Overlay, SceneSection…
   ├─ ui/                # Button
   └─ canvas/            # Experience, CameraRig, Lighting, Effects, SceneManager
      └─ scenes/         # Scene01…Scene10
```

## What to do next

Read `docs/IMPLEMENTATION_PLAN.md` for the phased build-out and
`docs/DESIGN_SYSTEM.md` for tokens, type and motion rules. Drop production 3D
assets into `public/models/` and wire them per the `TODO`s in each scene file.
