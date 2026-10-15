# AQUASCOUT website

Marketing site for the [AQUASCOUT](https://aquascout.vercel.app) Android app. Static HTML, no build step, deployed on Vercel.

The site leads with the detection loop, shows the real app on the phone, and ends on a real signed APK to download. The measured numbers live on the About page rather than in their own homepage section.

## Pages

| Page | What it is |
|---|---|
| `/` | Hero with a live simulated detection viewfinder, what the app does, how a frame becomes an alert, two real device screenshots, and the APK download. No prototype band and no results band. |
| `/about.html` | What the project is, why it exists, how it was built, and an explicit list of what it does not do |
| `/privacy.html` | What data is stored, what leaves the device, and why each permission is requested |
| `/diagrams/aquascout-architecture.html` | The device trust boundary diagram |
| `/diagrams/how-it-works.html` | Plain-language walkthrough of the five detection steps |

Every page carries the same header and footer, so you can always get back. The current page is marked with `aria-current="page"`.

## Design

Near-black with an ember accent.

- **Ground** `#08080A`, **card** `#131319`, **ink** `#F4F4F7`
- **Ember** `#FF7A1A`, gold `#FFB347`. Ember means one thing: fire, or an alert raised because of fire. It is never decoration.
- **Type**: Bricolage Grotesque for display, IBM Plex Sans for body, IBM Plex Mono for every number and label
- The flowing wave lines and the flame are lifted from the app's own wordmark art

### Token compatibility note

Note the naming: `--ink` is the dark surface and `--ground` is the light one, so text is coloured with `--ground`. The names read backwards. Do not "fix" them.

`diagrams/chrome.css` is separate on purpose. The two diagram pages carry their own `<style>` block and their own `.foot` and `.wrap` rules, so loading `style.css` there would fight over body background, wrapper padding and the footer. The shared header and footer live under `aq-*` class names there instead.

## The APK

`AQUASCOUT-1.51.apk` is the signed release build, copied straight from `app/build/outputs/apk/release/app-release.apk`.

- Signed with `CN=AQUASCOUT, OU=Saint Columban College`, APK Signature Scheme v2
- Same keystore as the Google Play internal testing upload
- 39.3 MB, universal: arm64-v8a, armeabi-v7a, x86, x86_64
- SHA-256 `8271022E41A29AD7409163F12503EBAC3B79F1A73D0B132B4A1D859A82E12823`

It is a universal APK rather than per-ABI splits so that no classmate has to pick the right file. About 17 MB of the total is x86 and x86_64 native libraries, which no physical phone needs.

## Files

| File | Role |
|---|---|
| `index.html` | Home page |
| `about.html` | About the project |
| `privacy.html` | Privacy policy |
| `diagrams/*.html` | Standalone figures, each with its own inline stylesheet |
| `style.css` | Shared tokens, layout, components |
| `diagrams/chrome.css` | Header and footer for the diagram pages only |
| `viewfinder.js` | The hero detection loop. Drifts a plume, acquires with converging corner brackets, tracks with a jittering confidence, then drops and re-acquires |
| `nav.js` | Mobile menu and scroll reveal |
| `mark-light.png`, `mark-ember.png` | AQUASCOUT compass mark, white and ember, cropped to its bounding box |
| `favicon-16/32/48.png`, `apple-touch-icon.png`, `android-chrome-192/512.png`, `icon-512.png` | Browser, iOS and Android icons |
| `og-image.png` | Link preview card, 1200x630 |
| `site.webmanifest` | PWA manifest |
| `AQUASCOUT-1.51.apk` | The installable release build |
| `vercel.json` | Vercel config: clean URLs, security headers, cache policy |

### Asset generation

`mark-light.png` and the icon set are cut from the 1024px transparent source mark. The source is black, which is invisible on this ground, so the glyph's alpha channel is reused as the paint mask and the original RGB is discarded.

The tab icons are **transparent with an ember mark**. An earlier set was a near-black tile with a white mark, which on a light browser tab reads as a black rectangle rather than a logo. Ember was chosen over white because a white mark needs an opaque dark tile to survive, which is exactly what the transparent version removes; ember holds up against both light and dark tab chrome.

Four traps in favicon generation, all of which shipped once:

- **Scale the glyph to the TILE, not to the source.** Resizing to a fraction of the source image and pasting into a px-sized canvas put the mark near `-230px` at 16px, so the shipped icons were blank squares that still returned HTTP 200 with a plausible byte size.
- **Do not double-apply alpha.** `img.paste(g, pos, g)` applies the mark's alpha twice; LANCZOS then leaves edges at alpha 193-220 and the browser composites them into a grey smear. That applies to *opaque* icons, which use `alpha_composite` then `putalpha(255)`.
- **Do not dilate at 16px.** The compass ring is one pixel wide there, so any widening, 8-neighbour `MaxFilter(3)` or a 4-neighbour cross, fills the ring interior and the icon becomes a solid blob. Measured ink: plain 7.8-9.0%, cross-dilated 40%. Plain wins.
- **Small sizes use the compass alone**, cropped at row 600, which is where the bottom arc closes without dragging wave fragments in. Compass plus three wave lines cannot resolve at 16px.

Favicons fill their box completely (fill 1.0). Chrome renders the 32px icon **downscaled to 16px** in the tab, so filling the source box is what makes the glyph read at the size the eye judges. Measured ink at true 16px tab size: fill 0.86 gives 14.8% and reads faint; fill 1.0 gives 20.7% and reads correctly. Do not dilute: one cross-dilation pass reaches 53.9% and fills the compass ring into a solid disc.

Always evaluate a favicon by rendering it at 16x16 and then magnifying, not by looking at the 32px or 512px file. Judging weight from the large file is how a mark ends up looking far too thin in the tab.

`apple-touch-icon.png` keeps its dark tile deliberately: iOS places it on the home screen over an unpredictable wallpaper, where a transparent mark can vanish.

`app-dashboard.png` and `app-alerts.png` are real captures from the build, not mock-ups.

## Notes

- Three.js is loaded from a CDN. If it fails to load, the hero viewfinder canvas shows a plain message rather than a blank box.
- `viewfinder.js` and the 3D loop both respect `prefers-reduced-motion`.
- `.hotspots` clips its overflow. Without it, the absolutely positioned hotspot labels push the document wider than the viewport and the page scrolls sideways on a phone.
- `.screens` clips its overflow too. The ember glow behind the handsets extends 28% past each side by design, and at narrow widths that was pushing the document wide.
- The nav collapses to the burger at **900px**, not 720px. Between 720 and 900 the five links plus the CTA do not fit beside the brand and the button hung off the right edge.
- The mobile dropdown background is fully opaque. At `.97` plus a backdrop blur, the hero headline still read through between the links.

### Checking responsiveness

`aqshots/sweep.js` walks every page across 15 widths from 320 to 1440 and reports any page whose document is wider than its viewport, naming the offending element. Three spot widths are not enough - a layout can be clean at 390 and 1440 and still blow out at 320 or 768. Both overflow bugs above were invisible at the original three widths.

## Verifying a change

```bash
py -3 -m http.server 8899 --bind 127.0.0.1     # from this folder
```

Chrome's old headless mode ignores `--window-size` for the layout viewport, so a narrow `--screenshot` silently crops a desktop render and looks like an overflow bug. Use `aqshots/shoot.js`, which drives CDP `Emulation.setDeviceMetricsOverride` and reports `scrollWidth` against `clientWidth`.

Vercel rewrites `/about` to `about.html` via `cleanUrls`. Python's server does not, so local checks have to ask for the real filename.

## License

(c) 2026 Saint Columban College. All rights reserved.