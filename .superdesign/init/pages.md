# Pages

Static HTML, no bundler, no imports. The dependency tree below is therefore
just "which shared files each page loads".

## / (Home)

Entry: `index.html`

```
- /style.css          (single global stylesheet)
- /nav.js             (burger toggle + IntersectionObserver reveal)
- /viewfinder.js      (Three.js hero canvas, loaded from CDN at runtime)
- assets: mark-light.png, app-dashboard.png, app-alerts.png, AQUASCOUT-1.51.apk
- inline: none
```

Renders: topbar, hero (copy + simulated detection canvas), "What it does"
(four-item definition list), "How it works" (three ordered steps), "The whole
interface" (two real screenshots), download card, footer.

Context files for redesigning this page: `style.css`, `nav.js`.
`viewfinder.js` is only needed if the hero canvas is being kept.

## /about

Entry: `about.html`

```
- /style.css
- /nav.js
- assets: mark-light.png
```

Renders: topbar (with `aria-current="page"` on About), page header,
"Why it exists", "How it was built", "What it does not do", "The rover",
"The team" (`.team-grid` > `.member`), "Read next", footer.

Context files: `style.css`, `nav.js`.

## /privacy

Entry: `privacy.html`

```
- /style.css
- /nav.js
- assets: mark-light.png
```

Renders: topbar (with `aria-current="page"` on Privacy), page header,
"What this app stores" (a `<table>` whose 18 `<td>` carry `data-label`, which
restacks under 620px), "What we do not do", "Why the app asks for permissions",
"Third parties", "SMS alerts", "Deleting your data", "Children", "Changes",
"Contact", footer.

Context files: `style.css`, `nav.js`.

## /diagrams/aquascout-architecture

Entry: `diagrams/aquascout-architecture.html`

```
- /diagrams/chrome.css   (aq-* header and footer)
- inline <style>         (page-specific SVG theming)
- /nav.js
- Google Fonts link
```

Does NOT load `style.css`. Renders an inline SVG trust-boundary diagram.

## /diagrams/how-it-works

Entry: `diagrams/how-it-works.html`

```
- /diagrams/chrome.css
- inline <style>
- /nav.js
- Google Fonts link
```

Does NOT load `style.css`. Renders an inline SVG pipeline diagram.

## Context selection for design calls

- **Homepage redesign**: pass `style.css` (or the relevant token + component
  sections), `nav.js`, and `theme.md`. Do not pass `viewfinder.js` unless the
  hero canvas is in scope.
- **Cross-site change** (palette, type, chrome): `style.css` + `diagrams/chrome.css`.
  The diagram pages will not follow a `style.css`-only change and the site
  will visibly split.
- The 41 MB `AQUASCOUT-1.51.apk` must never be passed as a context file.