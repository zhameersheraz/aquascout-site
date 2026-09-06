# AQUASCOUT website

Static marketing site for the AQUASCOUT Android app. Three pages: home, privacy policy, and an in-browser AI demo. Deploys to Vercel in one click.

## Files

- `index.html` — home page. Hero, "Try the AI" section, six feature cards, four-step "How it works", download CTA.
- `try-ai.js` — client-side color-based fire and smoke detector. Runs entirely in the browser, no upload, no API.
- `nav.js` — hamburger menu toggle for mobile.
- `style.css` — monochrome styles, responsive.
- `privacy.html` — privacy policy. Plain English, follows the data the app actually touches.
- `logo_light.png`, `logo_dark.png`, `logo_light_wb.png` — AQUASCOUT logo in three variants (transparent, black-bg, white-bg).
- `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `android-chrome-192.png`, `android-chrome-512.png` — icon files for browser tabs, iOS home screen, Android home screen.
- `vercel.json` — Vercel config: clean URLs, no trailing slash, security headers, cache policy for the privacy page.

## The Try the AI demo

The home page has a working demo at the `#try` section. Drop a photo, get a fire/smoke verdict with bounding boxes drawn on the image. It runs entirely in your browser using pixel color analysis. No upload, no API, no signup.

Three sample buttons are included so the demo works without uploading anything:
- **Use fire sample** — synthetic fire scene
- **Use smoke sample** — synthetic smoke scene
- **Use clear sample** — synthetic clear scene

The demo is honest: it is a quick color-based preview, not the real AI. The real YOLOv8n INT8 model lives in the Android app and is trained on the D-Fire dataset for far higher accuracy.

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
