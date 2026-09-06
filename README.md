# AQUASCOUT website

Static landing site for the AQUASCOUT Android app. Three pages: home, privacy policy, and a download link.

## Files

- `index.html` — home page. Has 6 feature cards, a "how it works" section, a CTA, and links to `/privacy.html` and the download.
- `privacy.html` — privacy policy. Plain English, follows the data the app actually touches (camera frames stay on device, alert log goes to Firebase if signed in, SMS goes to Semaphore if turned on).
- `style.css` — shared styles. Monochrome, system fonts, no external dependencies.
- `favicon.svg` — small AQUASCOUT mark.
- `vercel.json` — Vercel config: clean URLs, no trailing slash, security headers, cache policy for the privacy page.

## Deploy to Vercel

The site is plain static files, so it deploys in one step.

### Option A: Vercel CLI (fastest)

1. Install the CLI if you do not have it: `npm i -g vercel`
2. From this folder, run: `vercel`
3. Follow the prompts. The first deploy gives you a `*.vercel.app` URL. Subsequent deploys use `vercel --prod`.
4. To attach a custom domain, run `vercel domains add yourdomain.com` and follow the DNS instructions Vercel prints.

### Option B: Vercel dashboard (no CLI)

1. Push this folder to a GitHub repo.
2. In Vercel, click `Add New -> Project` and import the repo.
3. Leave all build settings blank. Vercel auto-detects static sites.
4. Click `Deploy`. Done in about 30 seconds.

## Before you ship

- Replace the `https://example.com/aquascout-download` URL in `index.html` with the real Play Store URL (or your APK direct download link).
- Replace `contact@example.com` in both `index.html` and `privacy.html` with a real email you check.
- If you want a custom domain, register it (Namecheap, Cloudflare Registrar, etc.) and point it at Vercel.
- Optional: add `sitemap.xml` and `robots.txt` if you want search engines to index the privacy page.

## Local preview

Any static file server works. Quickest:

```
npx serve .
```

or

```
python -m http.server 8000
```

then open `http://localhost:8000`.
