# Routes

Static HTML. No router, no build step. Deployed to Vercel via git push to
`origin/main`; Vercel's Git integration auto-deploys.

`vercel.json` sets `"cleanUrls": true`, so `/about` serves `about.html` and
`/privacy` serves `privacy.html`. **Local checks must request the real
`.html` filenames** — `python -m http.server` does no clean-URL rewriting.

| URL path | File | Stylesheet | Purpose |
| --- | --- | --- | --- |
| `/` | `index.html` | `/style.css` | Homepage: hero, what it does, how it works, real screenshots, APK download |
| `/about` | `about.html` | `/style.css` | BSCS thesis, why it exists, how it was built, what it does NOT do, the rover, team, read-next |
| `/privacy` | `privacy.html` | `/style.css` | Privacy policy + a data-flow table with `data-label` attributes |
| `/diagrams/aquascout-architecture` | `diagrams/aquascout-architecture.html` | `/diagrams/chrome.css` + inline `<style>` | Inline SVG trust-boundary diagram |
| `/diagrams/how-it-works` | `diagrams/how-it-works.html` | `/diagrams/chrome.css` + inline `<style>` | Inline SVG pipeline diagram |

Asset routes (static files):

| Path | Notes |
| --- | --- |
| `/AQUASCOUT-1.51.apk` | 39.3 MB signed universal APK, `download` attribute |
| `/style.css` | global stylesheet, 3 main pages |
| `/nav.js` | burger toggle + scroll reveal |
| `/viewfinder.js` | hero canvas only (Three.js from CDN) |
| `/mark-light.png` | white compass mark, 30px in nav |
| `/mark-ember.png` | ember compass mark |
| `/app-dashboard.png` | real device capture, 864x1920 |
| `/app-alerts.png` | real device capture, 864x1920 |
| `/og-image.png` | 1200x630 social card |
| `/favicon-{16,32,48}{,-light}.png` | transparent pair via `prefers-color-scheme` |
| `/apple-touch-icon.png` | deliberately opaque dark tile |
| `/site.webmanifest` | PWA manifest |

## Page detail

### `/` (Home)
`index.html`. Sections: `.hero` (copy + `#viewfinder` canvas), `.does`
(four-item `<dl class="features">`), `.how` (three-step `<ol class="steps">`),
`.screens` (two real screenshots in `.screen-grid`), `.get` (download card).
Anchors: `#how`, `#screens`, `#get`, `#does`.

### `/about`
`about.html`. Sections: page header, "Why it exists", "How it was built",
"What it does not do", "The rover", "The team" (`.team-grid` / `.member`),
"Read next". BSCS thesis framing, Saint Columban College, Pagadian City, 2026.

### `/privacy`
`privacy.html`. Sections: "What this app stores" (a `<table>` with
`data-label` on all 18 `<td>`, restacking under 620px), "What we do not do",
"Why the app asks for permissions", "Third parties", "SMS alerts",
"Deleting your data", "Children", "Changes", "Contact".

### Diagram pages
Both are single inline-SVG explainers with `aq-*` chrome. They do NOT load
`style.css`. Any redesign must restyle `diagrams/chrome.css` in parallel or
the two halves of the site will diverge.