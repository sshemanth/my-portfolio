# Assets

## Background network

The background network is drawn live with Three.js by `src/components/hero/networkScene.ts`. Nothing is generated at runtime and no external service is called.

Two stills are rendered from that same scene by `scripts/build-posters.mjs`:

| File | Used for |
| --- | --- |
| `public/hero-network/poster-landscape-1600.{webp,jpg}` | Background when WebGL is unavailable or the connection is slow |
| `public/og.jpg` | Social card, 1200 × 630 |

To regenerate them after changing the scene:

```bash
npm run build && npm run hero:posters && npm run build
```

## Figures

`public/figures/brats-framework-*` are built from `media-src/figures/brats-framework.jpg` (the framework figure from the BraTS-METS 2026 paper) by `npm run figures:build`.

## Earlier version

An earlier draft of this design used a generated glass-brain still and camera clip as the hero. Those files are not part of this repository and are no longer used.
