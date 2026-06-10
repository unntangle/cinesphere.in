# Asset pipeline

Drop production assets here. Suggested layout:

```
public/
├─ models/        # .glb / .gltf — speakers, theatre, villa, brand products
│  └─ draco/      # Draco decoder if using compressed GLTF
├─ hdri/          # .hdr environment maps for reflections (drei <Environment>)
├─ textures/      # carbon fibre, fabric, metal maps (.webp / .ktx2)
├─ brand/         # logo (SVG + PNG), brand marks for Scene 07
└─ og/            # social share image
```

## Guidelines (for the 90+ Lighthouse target)

- **Models:** export GLTF, run through `gltf-transform` + Draco/Meshopt. Keep
  each model under ~2–3 MB where possible. Lazy-load per scene with
  `useGLTF` + `<Suspense>`; the `SceneManager` already mounts only nearby
  scenes so models won't all load at once.
- **Textures:** prefer `.ktx2` (Basis) for GPU-friendly compressed textures,
  or `.webp`. Cap base maps at 2K unless a hero surface needs more.
- **HDRI:** a single 1–2K `.hdr` gives premium reflections across all scenes;
  reuse it via drei `<Environment>` rather than per-scene maps.
- **Logo morph (Scene 10):** export the logo path as SVG; sample points from
  it to build the particle convergence target.

Nothing here is required to run the scaffold — every scene currently uses
procedural placeholder geometry.
