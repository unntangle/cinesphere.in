# CineSphere — Implementation Plan

This scaffold is **Phase 0–1 complete**: the full architecture, design system,
scroll/camera/canvas pipeline, all ten chapters wired, and three functional
reference scenes (01, 02, 10). What follows turns it into the Awwwards-grade
finished piece.

## Current status

| Area | State |
|---|---|
| Project + tooling | ✅ Next 15, TS, Tailwind, all deps declared |
| Design system | ✅ Tokens, type, motion, components |
| Scroll pipeline | ✅ Lenis ↔ GSAP ↔ store |
| Camera system | ✅ Keyframe interpolation, damped |
| Scene management | ✅ Active ±1 mount/unmount, crossfade-ready |
| Post-processing | ✅ Bloom/DOF/Vignette/Noise, reduced-motion aware |
| Preloader | ✅ Real asset progress via drei |
| Scenes 01 / 02 / 10 | ✅ Functional (particles, spectrum, convergence) |
| Scenes 03–09 | 🟡 Structured stubs w/ placeholder geometry + TODOs |
| Real 3D assets | ⬜ Not yet sourced (procedural placeholders in place) |
| Audio reactivity | ⬜ Optional, planned |

## Phase 2 — Flesh out the scenes (priority order)

Each scene file has inline `TODO`s. The highest-impact sequence:

1. **Scene 03 Home Theatre** — replace primitive room with a modeled theatre;
   stagger the assembly (walls → panels → seats → projector → speakers) on a
   GSAP timeline keyed to `localProgress`. Add projector volumetric + screen glow.
2. **Scene 07 Brand Vault** — load real product GLTFs per brand, per-pedestal
   spotlights, hover-lift, click → focused showcase camera + exploded view.
3. **Scene 04 Dolby Atmos** — swap emissive spheres for drei `<Trail>` ribbons;
   anchor channel paths to Scene 03's speaker positions; add billboarded labels.
4. **Scene 06 Automation** — render live control dashboards onto panels with
   drei `<Html transform occlude>`; pointer parallax; champagne edge-glow shader.
5. **Scene 05 Smart Villa** — sectioned villa model + camera fly-through; pulse
   driven by camera position; per-room audio-node glyphs light on arrival.
6. **Scene 08 Projects** — stylized Chennai skyline; beams mapped to real project
   coords; hover `<Html>` project cards; connecting network lines; fly-through.
7. **Scene 09 Why Choose Us** — count-up the DOM stats on enter (GSAP), optional
   particle-field morph into neighbouring scenes for seamless transitions.
8. **Scene 10 Finale** — replace the glowing core with a **logo morph**: sample
   the CineSphere logo SVG into particle targets; final bloom swell + camera push.

## Phase 3 — Assets & polish

- Source/commission GLTF models (speakers, theatre, villa, products). Optimize
  per `public/README.md` (Draco/Meshopt, KTX2, <3MB each).
- Add a single 1–2K HDRI via drei `<Environment>` for consistent premium
  reflections across all scenes.
- Real fonts confirmed/licensed; finalize OG share image.
- Sound design (optional): muted demo track + `AnalyserNode` driving Scene 02's
  spectrum and Scene 04's motion for true audio-reactive visuals.

## Phase 4 — Responsive

- **Desktop:** full cinematic camera + all post FX.
- **Tablet/Mobile:**
  - Cut particle counts (gate the `COUNT` constants behind a viewport/`dpr`
    check or the `reducedMotion` flag).
  - Disable or soften DepthOfField (expensive on mobile GPUs).
  - Tune Lenis `touchMultiplier`; ensure momentum feels right on iOS.
  - `SceneSection` already reflows copy via `align`; verify type scale at
    `text-4xl` floor and check tap targets on CTAs.
  - Consider a simplified camera path on small screens (less Z travel).
- Test on a mid-range Android (the real performance floor), not just desktop.

## Phase 5 — Performance & QA (the 90+ Lighthouse target)

- Verify lazy scene/asset loading; confirm `SceneManager` keeps draw calls bounded.
- Profile with React DevTools + `r3f-perf` (add in dev only).
- Check Lighthouse: LCP (preloader → first paint), CLS (fixed canvas = none),
  TBT (keep main thread free; heavy work stays on GPU/useFrame).
- Cross-browser: Chrome, Safari (WebGL quirks), Firefox. Test reduced-motion path.
- Accessibility: ensure all copy is real DOM text (it is), focus states on CTAs,
  `prefers-reduced-motion` disables FX, color contrast on ivory/champagne.

## Phase 6 — Content & launch

- Replace placeholder `STATS`, `BRANDS`, contact details in `constants.ts`.
- Real project data for Scene 08; real product lineup for Scene 07.
- Wire CTAs (Schedule Consultation / Book Demo / Start Your Dream Theatre) to a
  form or booking flow.
- Analytics, sitemap/robots, final metadata + OG.

## A note on scope

A finished piece at this tier is weeks of specialist work — most of the
remaining effort is 3D asset creation and per-scene art-direction, which depend
on real models and brand assets. This scaffold is built so that work slots in
**incrementally**: every scene is independent, the storyboard is data-driven,
and nothing here needs restructuring to reach the finish line.
