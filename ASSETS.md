# Assets

## Hero network

The hero is drawn live with Three.js by `src/components/hero/networkScene.ts`. Nothing is generated at runtime and no external service is called.

The stills that paint before the scene loads, and the ones used elsewhere, are rendered from that same scene by `scripts/build-posters.mjs`:

| File | Used for |
| --- | --- |
| `public/hero-network/poster-landscape-{960,1600,2400}.{webp,jpg}` | Hero poster on landscape screens |
| `public/hero-network/poster-portrait-{640,1080}.{webp,jpg}` | Hero poster on portrait screens |
| `public/hero-network/closing-1280.webp` | Decorative still behind the contact section, from deep inside the network |
| `public/og.jpg` | Social card, 1200 × 630 |

To regenerate them after changing the scene:

```bash
npm run build && npm run hero:posters && npm run build
```

## Figures

`public/figures/brats-framework-*` are built from `media-src/figures/brats-framework.jpg` (the framework figure from the BraTS-METS 2026 paper) by `npm run figures:build`.

## Earlier version

An earlier draft of this design used a generated glass-brain still and camera clip as the hero. Those files are not part of this repository and are no longer used.
