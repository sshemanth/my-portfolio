# Sri Sai Hemanth Bollepalli · Portfolio

A single-page research portfolio with a scroll-driven 3D hero: a neural network of glass nodes that the camera travels through as you scroll. Static export: no server, no runtime AI calls, no credentials.

**Stack:** Next.js 16 (App Router, static export) · React 19 · TypeScript · Three.js · GSAP ScrollTrigger · plain CSS with design tokens.

## Commands

```bash
npm install
```

```bash
npm run dev
```

Development server at http://localhost:3000.

```bash
npm run build
```

Production build, written to `out/` as static files.

```bash
npm run preview
```

Serves the built `out/` folder at http://localhost:4173.

```bash
npm run check
```

Type check, lint and build in one go.

Requires Node 20.9 or newer. `npm run hero:posters` additionally needs Playwright with Chromium.

## Where to edit

| To change | Edit |
| --- | --- |
| Any text, links, results, chart numbers | `src/content/site.ts` (the only file with copy) |
| Colours, type scale, spacing | the `:root` tokens at the top of `src/app/globals.css` |
| Scroll timing: pinned distance, when each block of copy appears, camera easing, smoothing | `src/components/hero/hero.config.ts` |
| The network: layers, colours, camera path, number of signals | `src/components/hero/networkScene.ts` |
| Hero stills (poster, closing image, social card) | `npm run build && npm run hero:posters`, then build again |
| Paper figures | add to `media-src/figures/`, then `npm run figures:build` |
| Fonts | `src/app/layout.tsx` and `src/app/fonts/` |

## How the hero works

`src/components/hero/HeroSequence.tsx` is a tall section containing a sticky full-height stage. One GSAP timeline is scrubbed by that section's scroll progress (0 to 1). The same timeline moves the camera through the network and fades the three blocks of copy, so they stay in step in both directions, after a resize, a reload mid-page or a jump.

- **The network.** `networkScene.ts` builds fourteen layers of translucent glass nodes with Three.js, seeded so the layout is identical on every visit. Signals travel from layer to layer and nodes pulse when one arrives. The camera follows the pointer slightly and moves forward through the layers as the hero scrolls.
- **Poster first.** A still of the same scene is in the HTML and paints immediately. Three.js loads only when the hero is near the viewport, and the live scene fades in over its own still.
- **Light on devices.** The scene renders only while it is on screen and the tab is visible, and the pixel ratio is capped.
- **Portrait screens** show the network in a band at the top, with the copy below it.
- **Reduced motion, no JavaScript, or a script failure:** the same markup renders as a normal stacked section over the still. Nothing is hidden.
- **No WebGL, Save-Data or 2G connections:** the scene is skipped and the still gets a slow scroll-linked push instead.

## Deploying

The build output in `out/` is plain static files and runs on any static host.

**Vercel:** import the repository. The framework preset is detected; no settings or environment variables are required. Optionally set `NEXT_PUBLIC_SITE_URL` to the final origin (for example `https://example.com`) so social-card image URLs are absolute.

**GitHub Pages (the current host):** `.github/workflows/deploy.yml` builds the site on every push to `main` and publishes `out/`. It sets `NEXT_PUBLIC_BASE_PATH=/my-portfolio` so asset paths resolve under the project sub-path.

The hero stills are committed under `public/hero-network/` and ship with the site. To host them on a CDN instead, upload that folder and change the `asset()` helper in `src/lib/asset.ts`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | only for sub-path hosting | Path prefix, e.g. `/my-portfolio` |
| `NEXT_PUBLIC_SITE_URL` | no | Origin for absolute social-card URLs |

No secrets are used anywhere.

## Real integrations and placeholders

| Item | Status |
| --- | --- |
| "Email me" / "Get in touch" | Real: `mailto:` address from the original site |
| GitHub, LinkedIn, paper and code links | Real: taken from the original site |
| BibTeX copy button | Real: uses the clipboard and reports failure if the browser blocks it |
| Contact form, analytics, newsletter | Not present. None were supplied, so none are faked |
| Social card URL | Relative until `NEXT_PUBLIC_SITE_URL` is set |

## Assumptions

- The uploaded repository and the reference URL are the same site, so its text is reused word for word and only the design is new. One paragraph (the original hero lede) is split across the hero without changing its wording. The short labels "Recent work" and "Open to PhD positions" and the section numbers are the only added copy.
- The brief left the primary button destination blank. It points to the email address already published on the original site.
- "White, transparent" was read as a light-only design. There is no dark theme.
- The audience is researchers and prospective supervisors, and the main action is getting in touch about a PhD position.
- The hero subject is the 3D neural network from the previous version of the site. The earlier glass-brain clip is no longer used. See `ASSETS.md`.

## Project layout

```
src/content/site.ts            all copy and data
src/app/                       layout, page, tokens and styles, fonts
src/components/hero/           HeroSequence, the Three.js network scene, timing config
src/components/sections/       content sections
src/components/                Header (with mobile menu), Motion (reveals, bars, progress)
scripts/                       hero stills, figure builder and the preview server
media-src/                     source figures (not shipped)
public/                        shipped assets, including the hero stills in hero-network/
.github/workflows/deploy.yml    GitHub Pages build and deploy
ASSETS.md                      asset manifest and generation records
```
