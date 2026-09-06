# AQUASCOUT website

Marketing site for the [AQUASCOUT](https://aquascout.vercel.app) Android app. Static HTML, no build step, deployed on Vercel.

The site presents what the app does (on-device fire and smoke detection), shows the app's interface as phone mockups, and links to the download. The Android app is the product; this site is the front door.

## What's here

- Home page with hero, "screens" gallery of app mockups, features, how-it-works, and download CTA.
- Privacy policy page.
- No build, no framework, no dependencies. Just HTML, CSS, and a tiny JS file for the mobile menu.

## Files

| File | Role |
|---|---|
| `index.html` | Home page |
| `privacy.html` | Privacy policy |
| `style.css` | All styles, mobile-first |
| `nav.js` | Hamburger menu toggle for mobile |
| `logo_light.png` | AQUASCOUT mark, transparent background |
| `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png`, `android-chrome-192.png`, `android-chrome-512.png` | Browser, iOS, Android icons |
| `vercel.json` | Vercel config: clean URLs, security headers, cache policy |

## License

(c) 2026 Saint Columban College. All rights reserved.
