# AQUASCOUT website

Static marketing site for the AQUASCOUT Android app. Three sections on the home page (hero, screens, features), a privacy policy, and a download link. Deploys to Vercel in one click.

## Files

- `index.html` — home page. Hero with one full phone mockup of the live detection screen, a "Screens" gallery with three more phone mockups (alerts, stats, settings), six feature cards, a four-step "How it works", and a download CTA.
- `nav.js` — hamburger menu toggle for mobile.
- `style.css` — monochrome styles, responsive.
- `privacy.html` — privacy policy. Plain English, follows the data the app actually touches.
- `logo_light.png` — full AQUASCOUT chrome logo (transparent background, used in the page header).
- `mark.png` — simplified chrome triangle mark (transparent background, used inside the app bar of each phone mockup).
- `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `android-chrome-192.png`, `android-chrome-512.png` — icon files for browser tabs, iOS home screen, Android home screen. All are a cropped view of the chrome triangle on a black background so they stay readable at 16x16.
- `vercel.json` — Vercel config: clean URLs, no trailing slash, security headers, cache policy for the privacy page.

## What's NOT here

- No live AI demo. The home page shows the app's interface as phone mockups instead. The real YOLOv8n model lives in the Android APK and is not embedded on the website.

## Deploy

The site is plain static files. Vercel auto-detects it on import.

### Vercel dashboard

1. Push this repo to GitHub (already done).
2. In Vercel, click `Add New` then `Project`.
3. Select `zhameersheraz/aquascout-site`. Click `Import`.
4. Framework preset: `Other`. Root directory: `./`. Leave build and output empty.
5. Click `Deploy`. The site is live at `<project-name>.vercel.app` in about 30 seconds.

### Local preview

Any static file server works:

```
npx serve .
```

or

```
python -m http.server 8000
```

then open `http://localhost:8000`.

## Before you ship

- Replace the `https://example.com/aquascout-download` URL in `index.html` (hero CTA, final CTA, and the nav `Download` button) with the real Play Store URL or your APK direct link.
- Replace `contact@example.com` in `index.html` and `privacy.html` with a real email.
- If you want a custom domain, register it (Namecheap, Cloudflare Registrar, Porkbun) and add it under Vercel `Project Settings -> Domains`.

## License

(c) 2026 Saint Columban College. All rights reserved.
