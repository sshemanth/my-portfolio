# Sri Sai Hemanth Bollepalli · Portfolio

Personal research portfolio of Sri Sai Hemanth Bollepalli, medical AI researcher working on deep learning for medical image analysis and clinical signal processing.

The site covers:

- **Research interests** in medical image segmentation, reliability and uncertainty, explainable AI and learning from clinical data
- **Publications and projects**, including the accepted MICCAI 2026 BraTS-METS challenge paper, *Region-Aware Residual Encoder nnU-Net for Multi-Region Brain Metastasis Segmentation*
- **Technology stack** used across these projects
- **Education** and contact details

## Structure

```
index.html         Single-page site (HTML and CSS, no build step)
js/scene.js        Full-page 3D neural network background (Three.js)
js/animations.js   Page animations: entrance, scroll reveals, card tilt (Motion)
network-bg.jpg     Fallback background for browsers without WebGL
```

A deep neural network of translucent glass nodes sits behind the whole page in WebGL. Signals flow from layer to layer, and scrolling moves the camera forward through the network. It follows the pointer and pauses when the tab is hidden. Visitors who turn on reduced motion get a still frame and no animations.

[Three.js](https://threejs.org) and [Motion](https://motion.dev) load from the jsDelivr CDN through an import map, so there is still no build step. Fonts load from Google Fonts (Inter, with Georgia for headings). Technology logos are inline SVGs from [Simple Icons](https://simpleicons.org).

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Deploy

The site is static, so it can be served as is with GitHub Pages: go to **Settings → Pages**, choose **Deploy from a branch**, and select `main` with the root folder.

## Contact

- Email: sshemanthofficial@gmail.com
- LinkedIn: [linkedin.com/in/sshemanth](https://linkedin.com/in/sshemanth)
- GitHub: [github.com/sshemanth](https://github.com/sshemanth)
