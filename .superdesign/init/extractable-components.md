# Extractable components

Menu of what can be pulled out as reusable Superdesign `DraftComponent`
entities. Because there is no component system, "extraction" means promoting a
repeated markup + CSS pattern into a named component before generating drafts.

## Layout components

### TopBar
- Source: `index.html:31-51`, duplicated in `about.html` and `privacy.html`
- Category: `layout`
- Description: Sticky site header with brand mark, four nav links, primary CTA, burger.
- Extractable props:
  - `activeItem` (string, one of `how` | `screens` | `about` | `privacy`) — drives `aria-current="page"`
  - `ctaHref` (string, default `#get`)
- Hardcoded: `mark-light.png`, the word AQUASCOUT, the four link labels, all CSS.

### DiagramTopBar
- Source: `diagrams/chrome.css` `.aq-topbar` + the markup in both diagram pages
- Category: `layout`
- Description: Header variant for the two SVG diagram pages, which do not load `style.css`.
- Extractable props: `activeItem` (string)
- Hardcoded: all `aq-*` CSS, max-width 1240px, 66px height.

### Footer
- Source: `index.html:279-295`, duplicated in `about.html` and `privacy.html`
- Category: `layout`
- Description: Site footer with brand lockup, one-line description, seven links.
- Extractable props: none. Identical on every page.
- Hardcoded: `foot-sub` copy, the seven link labels including the mailto.

### DiagramFooter
- Source: `diagrams/chrome.css` `.aq-foot`
- Category: `layout`
- Extractable props: none.

### PageShell
- Source: `.page` wrapper on `about.html` and `privacy.html`
- Category: `layout`
- Description: `.wrap.page` content column for interior pages.
- Extractable props: `pageTitle` (string), `kicker` (string)
- Hardcoded: the `.page` / `.wrap` pairing. **`padding-block` only, never the
  `padding` shorthand** — the shorthand's left/right 0 wipes the gutter.

## Basic components

### Button
- Source: `style.css`, used `index.html:45,79,80,254`
- Category: `basic`
- Description: Primary / secondary / large action link.
- Extractable props: `variant` (`ember` | `ghost`), `size` (default | `lg`), `withIcon` (bool)
- Hardcoded: border-radius, ember gradient, the 16x16 arrow and download SVG paths.

### Kicker
- Source: `style.css`, used `index.html:60,116,176,204,247`
- Category: `basic`
- Description: Mono uppercase eyebrow label with a square tick marker.
- Extractable props: `muted` (bool), `text` (string)
- Hardcoded: the `.tick` square, letter-spacing `.18em`, ember colour.

### SectionHead
- Source: `index.html:115-118`, `176-179`, `204-211`
- Category: `basic`
- Description: Kicker + h2 + optional lede, opening a section.
- Extractable props: `kicker` (string), `title` (string), `lede` (string, optional)

### Feature
- Source: `index.html:120-169`
- Category: `basic`
- Description: Icon + term + description, used inside `<dl class="features">`. Four instances.
- Extractable props: `icon` (24x24 SVG path), `term` (string), `body` (string), `link` (optional)

### Step
- Source: `index.html:181-197`
- Category: `basic`
- Description: `STEP NN` + title + body, inside `<ol class="steps">`. Three instances.
- Extractable props: `index` (number), `title` (string), `body` (string)
- Note: the numbering is genuine — this is a real ordered pipeline.

### PhoneShot
- Source: `index.html:214-232`
- Category: `basic`
- Description: Real device screenshot in a dark bezel with ember glow and a caption.
- Extractable props: `src` (string), `alt` (string), `captionTitle` (string), `captionBody` (string)
- Hardcoded: 864x1920 intrinsic size, `.phone-shell` bezel + glow, the ember glow bleed.

### GetCard
- Source: `index.html:246-273`
- Category: `basic`
- Description: Download panel with primary action, four spec facts, and a Play note.
- Extractable props: `href` (string, default `/AQUASCOUT-1.51.apk`), `facts` (list)
- Hardcoded: all four spec facts (39.3 MB, v1.51 (21), Android 8+ API 24, arm64+armv7+x86) and the Play copy.

### TeamMember
- Source: `about.html` `.team-grid` > `.member`
- Category: `basic`
- Description: One thesis team member block.
- Extractable props: `name` (string), `role` (string)

### Reveal
- Source: `nav.js` + `style.css` `.reveal`
- Category: `basic`
- Description: IntersectionObserver scroll reveal, staggered via `--d`.
- Extractable props: `delay` (seconds, inline `style="--d:0.04s"`)
- Note: fully disabled under `prefers-reduced-motion`.