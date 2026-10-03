# AQUASCOUT website

Marketing site for the [AQUASCOUT](https://aquascout.vercel.app) Android app. Static HTML, no build step, deployed on Vercel.

The site leads with the thing that matters for this project: the detection model and its measured numbers. It then shows what the app does, and links to an interactive 3D model of the rover.

## Pages

| Page | What it is |
|---|---|
| `/` | Hero with a live simulated detection viewfinder, the three measured results, a four-row description of the app, and the download CTA |
| `/prototype.html` | Interactive 3D rover. Orbit it, drive it with WASD, toggle the pump and cameras, and simulate an alert. |
| `/privacy.html` | What data is stored, what leaves the device, and the two known weaknesses in this build |

## Design

Monochrome with a single signal colour.

- **Ground** `#E8ECEF` cold grey, **ink** `#101519` near-black with a blue cast
- **Signal** `#D94F04` burnt orange. It appears only where something is detected or alerting. Never as decoration.
- **Type**: Archivo for display, IBM Plex Sans for body, IBM Plex Mono for every number and label

## Files

| File | Role |
|---|---|
| `index.html` | Home page |
| `prototype.html` | 3D rover page |
| `privacy.html` | Privacy policy |
| `style.css` | Shared tokens, layout, components |
| `prototype.css` | 3D page: stage, control panel, hotspots |
| `viewfinder.js` | The hero detection loop. Drifts a plume, acquires with converging corner brackets, tracks with a jittering confidence, then drops and re-acquires |
| `nav.js` | Mobile menu and scroll reveal |
| `prototype.js` | Three.js scene, rover assembly, drive physics, hotspots, event log |
| `mark.png` | AQUASCOUT mark, transparent background |
| `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png`, `android-chrome-192.png`, `android-chrome-512.png` | Browser, iOS, Android icons |
| `vercel.json` | Vercel config: clean URLs, security headers, cache policy |

## Notes

- Three.js is loaded from a CDN. If it fails to load, the prototype stage shows a plain message rather than a blank canvas.
- `viewfinder.js` and the 3D loop both respect `prefers-reduced-motion`. The viewfinder renders one static locked frame; the 3D scene stops animating but stays fully interactive.

## Assets

The whole site ships about 257 KB. Decorative background art and the old light and dark wordmark variants were removed in the redesign because nothing referenced them. Total payload is `mark.png` plus the five favicon sizes.

## License

(c) 2026 Saint Columban College. All rights reserved.
