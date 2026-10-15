# AQUASCOUT — Design System: "Field Record"

Status: the approved direction for the site redesign. Every draft MUST obey this
file. It is a hard constraint, not a suggestion.

## 1. Product context

**AQUASCOUT** is a real Android app, not a concept. A custom YOLOv8n model
detects fire and smoke on the phone camera at ~2.0 FPS and sends an SMS to one
emergency contact with the GPS pin. It is a **BSCS undergraduate thesis** at
Saint Columban College, Pagadian City, Philippines, built by three students
(Tampugao, Peñaranda, Balbarino) in 2026.

**Jobs to be done**
1. A classmate wants to install the APK and test it on their own phone.
2. A thesis panel member wants to judge the engineering honestly.
3. A person wants to know what data leaves their phone before trusting it.

**Voice.** Plain, specific, engineering-literate. Confident about what is built,
candid about what is not. Never promotional. No exclamation marks, no
"revolutionary", no emoji. Numbers are exact: `2.0 FPS`, `3.3 MB`, `0.748`,
`39.3 MB`, `v1.51`, `API 24`.

**Honesty rules (non-negotiable)**
- Stage classification is the thesis contribution but is **NOT built**. Never
  imply it works.
- Thermal sensing is a known limitation; the MLX90640 is the correct future
  sensor. Never claim thermal detection ships.
- Candles, cigarettes and steam are known false positives. State them.
- Auto-911 calling is illegal in several US jurisdictions. Never mention it.

## 2. The problem this redesign solves

The previous site was near-black `#08080A` with a single vermilion accent. That
is a documented AI-generated-site default ("almost-black background plus a
single bright accent"). It also carried a pill-badge eyebrow, four equal
cards, three equal step cards, a decorative WebGL hero canvas, and ordinary
display type with no scale contrast.

## 3. Visual direction — Field Record

The site looks like **the documented record of a real instrument**: a technical
datasheet or equipment plate, printed rather than rendered. Reference DNA is
Swiss high-contrast editorial (off-white ground, near-black ink, heavy geometric
grotesk, tight tracking, hairline rules, asymmetrical grid).

Deliberately NOT adopted from the reference style, because each is an AI-era
default: the 5-layer "echo stack" text effect, a centred 11vw hero, pill-shaped
`border-radius:9999px` showcases, and three-equal-card grids.

## 4. Colour

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#E8E8E5` | the page ground. Cool bone, NOT warm cream |
| `--paper-2` | `#DEDEDA` | recessed panels, table zebra |
| `--paper-3` | `#D2D2CE` | deeper inset |
| `--ink` | `#121214` | primary text, black buttons |
| `--ink-2` | `#4E4E56` | secondary text |
| `--ink-3` | `#86868F` | tertiary text, mono metadata |
| `--void` | `#0B0B0C` | the ONE dark band |
| `--rule` | `rgba(18,18,20,.16)` | hairline rules, borders |
| `--rule-soft` | `rgba(18,18,20,.08)` | faint dividers |
| `--signal` | `#D8410F` | vermilion. **Fire and alert states ONLY** |
| `--signal-soft` | `rgba(216,65,15,.10)` | alert fill |

### Accent discipline — the single most important rule

Vermilion means **fire or an alert**. Nothing else. Budget **at most 6 uses on
the homepage**. It is NOT the brand colour, it does NOT fill buttons, it does
NOT tint section backgrounds, and it does NOT appear in gradients.

- Primary buttons are **near-black ink**, not vermilion.
- Links are ink, underlined or with a bottom rule.
- The only vermilion on the page: the live-detection readout, the `●` live dot,
  fire/smoke class labels, and at most one small emphasis word.

This inversion is the point: the page is cold and neutral, and fire is the only
warm thing in it.

## 5. Typography

Loaded from Google Fonts.

- **Display** — `Bricolage Grotesque`, weight 800. Used ONLY for h1, h2 and the
  big numerals. Tracking `-0.04em`, line-height `0.88`.
- **Body** — `IBM Plex Sans`, 400/500. Line-height `1.6`. Max measure `68ch`.
- **Data / labels** — `IBM Plex Mono`, 400/500. Uppercase, `letter-spacing:.14em`,
  `font-size:12px`, for every kicker, table head, and readout.

Google Fonts URL:
`https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700..800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap`

### Type scale — minimum 10:1 display-to-body contrast

| Role | Size | Weight | Tracking |
| --- | --- | --- | --- |
| Hero h1 | `clamp(44px, 9.5vw, 148px)` | 800 | `-0.045em` |
| Section h2 | `clamp(30px, 4.2vw, 56px)` | 800 | `-0.035em` |
| h3 / step title | `21px` | 700 | `-0.01em` |
| Body | `16.5px` | 400 | `0` |
| Small body | `14.5px` | 400 | `0` |
| Mono label | `12px` | 500 | `.14em` |
| Telemetry readout | `13px` | 500 | `.08em` |

## 6. Layout

- `--gut`: `clamp(20px, 5vw, 64px)`
- `--maxw`: `1240px`
- **Asymmetry is the default.** Nothing on this page is centred except content
  inside the telemetry band. Anchor every section to the left edge.
- **NO rounded corners anywhere.** `--r: 0`. Cards get 1px `--rule` borders.
- **NO shadows, NO glows, NO gradients** except inside the one dark band.
- Section rhythm alternates: full-width band, then asymmetric two-column, so
  the eye moves rather than marching down a centred column.

## 7. Signature element — the telemetry band

The page has exactly ONE dark moment. A full-bleed `--void` band running edge
to edge, carrying a real mono readout of the app's actual running state:

```
● LIVE    FIRE 82%    0.748 mAP50    2.0 FPS    2 CLASSES    3.3 MB    OFFLINE
```

Every value is true of the shipped build. It replaces the old fake WebGL
viewfinder canvas: honest instead of impressive. It sits directly under the
hero and is the loudest element on the page. Everything around it stays quiet.

## 8. Section contracts (homepage)

1. **Hero** — left-anchored oversized h1, no image, no centred text. A narrow
   lede column offset to the right below the headline. Two actions. Then the
   telemetry band, full-bleed.
2. **What it does** — NOT a card grid. A two-column **datasheet definition
   table**: narrow term column, wide description, `1px` hairline between every
   row, generous row height. Four rows.
3. **How it works** — NOT three cards. A horizontal three-stage sequence joined
   by a single hairline spine. Oversized light-weight `01 / 02 / 03` numerals.
   This IS a genuine ordered pipeline, so numbering carries information.
4. **The interface** — asymmetric: the dashboard screenshot large at 7 columns,
   the alerts screenshot at 4 columns and pushed down off the baseline. Hard 1px
   frames, no bezel glow. The false-positive caveat sits directly beneath.
5. **Get the app** — a bordered spec plate: hairline-ruled fact grid, then a
   near-black download button. Not a glowing card.

## 9. Motion

Minimal and purposeful. One orchestrated moment only: the telemetry band
reveals and its readout counts up on load. Everything else is a plain CSS
colour transition on hover. No scroll-parallax, no floating elements, no
infinite loops, no marquee. All motion disabled under
`prefers-reduced-motion: reduce`.

## 10. Components

- **Button** — square, `1px solid var(--ink)`, background `var(--ink)`,
  text `var(--paper)` for primary; transparent with ink border for secondary.
  Hover inverts. No radius, no shadow.
- **Kicker** — mono uppercase `12px` `.14em`, preceded by a `10px` square in
  `--ink`. Never a pill, never a rounded badge.
- **Section head** — kicker, then h2, then optional lede. Left-aligned.
- **Definition row** — term in mono, description in body sans, hairline under.
- **Screenshot frame** — `1px solid var(--rule)`, no radius, no glow.
- **Top bar** — sticky, `--paper` at 92% with backdrop blur, `1px` bottom rule.
- **Footer** — quiet, `1px` top rule, on `--paper`. Not dark. The telemetry
  band stays the only dark element.

## 11. Responsive

- `1240px` — content max
- `1000px` — two-column sections collapse to one
- `900px` — nav collapses to burger, opaque dropdown
- `620px` — datasheet rows stack; telemetry band wraps to two rows
- `320px` — must not overflow. No fixed widths, no horizontal scroll.

## 12. Fidelity constraint

**Use ONLY the fonts, colours, spacing and component styles defined in this
document.** Do not introduce any other font, colour, gradient, radius, shadow,
emoji, stock illustration or icon set. If something is not defined here, leave
it undefined rather than inventing it.