# AQUASCOUT website

Marketing site for the [AQUASCOUT](https://aquascout.vercel.app) Android app. Static HTML, no build step, deployed on Vercel.

The site leads with the detection loop, shows the real app on the phone, and ends on a real signed APK to download. The measured numbers live on the About page rather than in their own homepage section.

## Pages

| Page | What it is |
|---|---|
| `/` | Typographic hero, the live telemetry band, the four jobs as a datasheet, how a frame becomes an alert, two real device screenshots, and the APK download. No prototype band and no results band. |
| `/about.html` | What the project is, why it exists, how it was built, and an explicit list of what it does not do |
| `/privacy.html` | What data is stored, what leaves the device, and why each permission is requested |
| `/diagrams/aquascout-architecture.html` | The device trust boundary diagram |
| `/diagrams/how-it-works.html` | Plain-language walkthrough of the five detection steps |

Every page carries the same header and footer, so you can always get back. The current page is marked with `aria-current="page"`.

## Design: "Field Record"

The site reads as the documented record of a real instrument, a technical datasheet for equipment rather than a moody product page.

- **Ground** `#E8E8E5` cool bone, **ink** `#121214`, recessed panels `#DEDEDA`
- **Signal** `#D8410F` vermilion. It means fire or an alert and nothing else. It is not the brand colour, it does not fill buttons and it never tints a background. Budget about six uses per page.
- **Type**: Bricolage Grotesque for display at 800 with tracking pulled to `-0.04em`, IBM Plex Sans for body, IBM Plex Mono for every label and readout
- **Corner radius is zero.** No rounded cards, no pills, no badges. Structure comes from 1px hairlines and whitespace.
- **One dark element on the page**: the telemetry band under the hero. That is deliberate. Spend the boldness once.

### Why not dark

The previous theme was near-black `#08080A` with a single ember accent. That pairing is the single most recognisable AI-generated-site default, and the site read exactly like one. Flipping the ground to paper is what broke it.

The signature element replaced the old fake WebGL hero canvas with a full-bleed dark band carrying the app's real running state: `LIVE  FIRE 82%  0.748 mAP50  2.0 FPS  2 CLASSES  3.3 MB  OFFLINE`. Every value is true of the shipped build.

### Diagram pages

`diagrams/chrome.css` is separate on purpose. The two diagram pages carry their own `<style>` block and their own `.foot` and `.wrap` rules, so loading `style.css` there would fight over body background, wrapper padding and the footer. The shared header and footer live under `aq-*` class names there instead. A redesign must touch both files or the site visibly splits.

The `.phone` and `.screen` classes in those pages are deliberately left dark. They draw the handset itself, and the app's real UI is dark.

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
| `nav.js` | Mobile menu and scroll reveal |
| `mark-ink.png` | AQUASCOUT compass mark in ink, used on the paper ground |
| `mark-light.png` | The same mark in white, for dark backgrounds |
| `favicon-16/32/48.png` | Transparent ink mark. The default, because the ground is paper |
| `favicon-16/32/48-dark.png` | Transparent white mark, wired to `prefers-color-scheme: dark` and emitted last so it wins where the query is supported |
| `apple-touch-icon.png`, `android-chrome-192/512.png`, `icon-512.png` | Opaque paper tile with the ink mark |
| `og-image.png` | Link preview card, 1200x630 |
| `site.webmanifest` | PWA manifest |
| `AQUASCOUT-1.51.apk` | The installable release build |
| `vercel.json` | Vercel config: clean URLs, security headers, cache policy |

### Asset generation

`mark-ink.png` and the icon set are cut from the 1024px transparent source mark. The source is black, so for a recoloured build the glyph's alpha channel is reused as the paint mask and the original RGB is discarded. To recolour the mark you only change the RGB you merge under that alpha, never the alpha itself.

Four traps in favicon generation, all of which shipped once:

- **Scale the glyph to the TILE, not to the source.** Resizing to a fraction of the source image and pasting into a px-sized canvas put the mark near `-230px` at 16px, so the shipped icons were blank squares that still returned HTTP 200 with a plausible byte size.
- **Do not double-apply alpha.** `img.paste(g, pos, g)` applies the mark's alpha twice; LANCZOS then leaves edges at alpha 193-220 and the browser composites them into a grey smear. That applies to *opaque* icons, which use `alpha_composite` then `putalpha(255)`.
- **Do not dilate at 16px.** The compass ring is one pixel wide there, so any widening, 8-neighbour `MaxFilter(3)` or a 4-neighbour cross, fills the ring interior and the icon becomes a solid blob. Measured ink: plain 7.8-9.0%, cross-dilated 40%. Plain wins.
- **Do not crop the compass out at small sizes.** An earlier set used the compass alone below 32px. That crop is 900x597, so fitting it in a square leaves it small and visibly clipped. The full mark, waves included, is used at every size.

Favicons fill their box completely (fill 1.0). Chrome renders the 32px icon **downscaled to 16px** in the tab, so filling the source box is what makes the glyph read at the size the eye judges. Measured ink at true 16px tab size: fill 0.86 gives 14.8% and reads faint; fill 1.0 gives 20.7% and reads correctly. Do not dilute: one cross-dilation pass reaches 53.9% and fills the compass ring into a solid disc.

Always evaluate a favicon by rendering it at 16x16 and then magnifying, not by looking at the 32px or 512px file. Judging weight from the large file is how a mark ends up looking far too thin in the tab.

The default favicon link is the **ink** mark, because the page ground is paper and light browser chrome is the common case. The white mark is reserved for `prefers-color-scheme: dark` and is emitted last, so browsers that ignore the media query still get the ink one rather than an invisible white glyph on a light tab.

`apple-touch-icon.png` and the Android icons keep an opaque paper tile deliberately: iOS and Android place them over an unpredictable home-screen wallpaper, where a transparent mark can vanish.

`app-dashboard.png` and `app-alerts.png` are real captures from the build, not mock-ups.

## Notes

- The hero carries no canvas and no WebGL. The simulated detection viewfinder and its Three.js dependency were removed in the Field Record redesign, because a decorative fake demo works against a site whose whole claim is that what you see is what the phone is doing. The telemetry band replaces it with real numbers.
- The screenshots render desaturated and come to full colour on hover. They are real captures, so the greyscale is a restraint, not a filter hiding a mock-up.
- `.screens` clips its overflow as a guard, and the step spine is hidden below 1000px where a horizontal rule between stacked steps stops meaning anything.
- The nav collapses to the burger at **900px**, not 720px. Between 720 and 900 the four links plus the CTA do not fit beside the brand and the button hung off the right edge.
- The mobile dropdown background is fully opaque. At a translucent alpha plus a backdrop blur, the headline read through between the links.
- Prefer `padding-block` over the `padding` shorthand on anything that also carries `.wrap`. `.page` sits on the same element as `.wrap`, so the shorthand's left/right `0` silently wipes the mobile gutter and text renders flush to the screen edge.

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