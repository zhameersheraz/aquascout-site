# Theme — AQUASCOUT

Vanilla CSS custom properties. No Tailwind, no framework, no CSS-in-JS.
Single global stylesheet `style.css` for the three main pages; a separate
`diagrams/chrome.css` re-declares the shared header/footer under `aq-*`
names so the diagram pages (which ship their own inline `<style>`) do not
fight over `body` background, `.wrap` padding and `.foot`.

## Part 1 — Compact token summary

### Colour

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#08080A` | page ground (near-black) |
| `--bg-raise` | `#0E0E13` | raised band |
| `--bg-card` | `#131319` | card surface |
| `--bg-card-2` | `#17171E` | nested card surface |
| `--line` | `rgba(255,255,255,.085)` | hairline rule |
| `--line-strong` | `rgba(255,255,255,.16)` | emphasised rule |
| `--text` | `#F4F4F7` | primary text (near-white) |
| `--text-2` | `#A6A6B2` | secondary text |
| `--text-3` | `#74747F` | tertiary text |
| `--ember` | `#FF7A1A` | the single accent |
| `--ember-lo` | `#E2570A` | accent, gradient end |
| `--ember-hi` | `#FFB347` | accent, light |
| `--ember-soft` | `rgba(255,122,26,.13)` | accent fill |
| `--ember-line` | `rgba(255,122,26,.34)` | accent hairline |
| `--green` | `#34D399` | status / go |

Legacy tokens retained (`--ground`, `--ink`, `--surface`, `--rule`, `--signal`, `--feed`)
are still used by the diagram pages' inline styles. **`--ink` is the DARK surface and
`--ground` is the LIGHT one**, so text is coloured with `--ground`. The names read
backwards; the inversion is load-bearing. Do not "fix" it.

### Type

- `--disp`: `"Archivo", var(--sans)` — variable, axes `wdth 75..110` / `wght 500..800`
- `--sans`: `"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif`
- `--mono`: `"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace`
- Loaded from Google Fonts with `display=swap`:
  `https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..110,500..800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap`

### Layout

- `--gut`: `clamp(20px, 5vw, 56px)` — page gutter
- `--maxw`: `1200px` — content column

### Shape

- `--r`: `10px`, `--r-sm`: `6px`

### Breakpoints

- `900px` — nav collapses to burger (`style.css` and `diagrams/chrome.css`)
- `1000px` — hero grid collapses to one column
- `620px` — privacy table restacks as labelled cards

### Motion

- `prefers-reduced-motion` honoured globally in `nav.js` and `html`
- Scroll reveal via `.reveal` → `.in`, staggered with `--d` custom property

## Part 2 — Raw source

### `style.css` — token block

```css
:root{
  --bg:        #08080A;
  --bg-raise:  #0E0E13;
  --bg-card:   #131319;
  --bg-card-2: #17171E;
  --line:        rgba(255,255,255,.085);
  --line-strong: rgba(255,255,255,.16);
  --text:   #F4F4F7;
  --text-2: #A6A6B2;
  --text-3: #74747F;

  --ember:      #FF7A1A;
  --ember-lo:   #E2570A;
  --ember-hi:   #FFB347;
  --ember-soft: rgba(255,122,26,.13);
  --ember-line: rgba(255,122,26,.34);

  --green: #34D399;

  --ground:     #F4F4F7;   /* light surface  -> used as TEXT on dark */
  --surface:    #0E0E13;
  --surface-2:  #131319;
  --ink:        #08080A;   /* dark surface   -> used as BACKGROUND */
  --ink-soft:   #A6A6B2;
  --ink-faint:  #74747F;
  --rule:       rgba(255,255,255,.14);
  --rule-soft:  rgba(255,255,255,.07);

  --signal:      #FF7A1A;
  --signal-dim:  #FFB347;

  --feed:        #08080A;
  --feed-line:   rgba(255,255,255,.09);
  --feed-text:   #A6A6B2;

  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --sans: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --disp: "Archivo", var(--sans);

  --gut: clamp(20px, 5vw, 56px);
  --maxw: 1200px;
  --r: 10px;
  --r-sm: 6px;
}
```

### `diagrams/chrome.css` — token block

```css
:root{
  --aq-bg:      #08080A;
  --aq-text:    #F4F4F7;
  --aq-text-2:  #A6A6B2;
  --aq-line:    rgba(255,255,255,.085);
  --aq-line-2:  rgba(255,255,255,.16);
  --aq-ember:   #FF7A1A;
  --aq-ember-lo:#E2570A;
  --aq-mono:    "IBM Plex Mono", ui-monospace, monospace;
  --aq-sans:    "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --aq-disp:    "Archivo", var(--aq-sans);
  --aq-maxw:    1240px;
}
```

### Known load-bearing rules

```css
/* .page must use padding-block, never the padding shorthand: .page sits on the
   same element as .wrap, and the shorthand's left/right 0 wipes the gutter. */
.page{ padding-block: clamp(...) ...; }

/* Both clip their overflow: absolutely positioned glows extend past the box and
   at narrow widths push the document wider than the viewport. */
.hotspots{ overflow:hidden; }
.screens{ overflow:hidden; }
```