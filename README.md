# Sri Sai Hemanth Bollepalli · Portfolio

A single-page research portfolio with a light 3D neural network of glass nodes behind the whole page. The camera travels through the network as you scroll. Static export: no server, no runtime AI calls, no credentials.

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
| The network: layers, colours, camera path, number of signals | `src/components/hero/networkScene.ts` |
| How strong the network is behind the content | `--net-strength` in `src/components/NetworkBackground.tsx` |
| Fallback still and social card | `npm run build && npm run hero:posters`, then build again |
| Paper figures | add to `media-src/figures/`, then `npm run figures:build` |
| Fonts | `src/app/layout.tsx` and `src/app/fonts/` |

## How the background works

`src/components/NetworkBackground.tsx` fixes one canvas behind the page and `src/components/hero/networkScene.ts` draws the network in it with Three.js: fourteen layers of translucent glass nodes, seeded so the layout is identical on every visit. Signals travel from layer to layer and nodes pulse when one arrives.

- **Scroll.** The page scroll position moves the camera from the first layer to the last. The network is at full strength behind the hero and softer behind the content.
- **Normal scrolling.** Nothing is pinned, so the introduction and results follow the name straight away.
- **Light on devices.** Three.js loads after the page, the scene renders only while the tab is visible, and the pixel ratio is capped.
- **Reduced motion:** the network is drawn once for each scroll position, with no animation.
- **No WebGL, Save-Data or 2G connections:** a still of the network is shown instead.

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
- The background is the 3D neural network from the previous version of the site. The earlier glass-brain clip and the pinned scroll hero are no longer used. See `ASSETS.md`.

## Project layout

```
src/content/site.ts            all copy and data
src/app/                       layout, page, tokens and styles, fonts
src/components/hero/           Hero section and the Three.js network scene
src/components/NetworkBackground.tsx   fixed background that hosts the network
src/components/sections/       content sections
src/components/                Header (with mobile menu), Motion (reveals, bars, progress)
scripts/                       hero stills, figure builder and the preview server
media-src/                     source figures (not shipped)
public/                        shipped assets, including the fallback still in hero-network/
.github/workflows/deploy.yml    GitHub Pages build and deploy
ASSETS.md                      asset manifest and generation records
```
