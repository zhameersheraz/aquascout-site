# Components

There is no component system. These are the recurring HTML patterns plus the
CSS that implements them, all defined in `style.css`. Treat them as the
component library.

## Button — `.btn`

File: `style.css` + `index.html:45,79,80,254`

Variants: `.btn-ember` (primary), `.btn-ghost` (secondary), `.btn-lg` (large).

```html
<a class="btn btn-ember btn-lg" href="#get">Get the APK</a>

<a class="btn btn-ghost btn-lg" href="/diagrams/aquascout-architecture">
  See what leaves the phone
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
</a>
```

The trailing arrow/download chevron is an inline 16x16 SVG, `stroke-width:1.8`,
`fill:none`, `stroke:currentColor`. This is the only iconography in the site.

## Eyebrow label — `.kicker` + `.tick`

File: `index.html:60,116,176,204,247`

```html
<p class="kicker"><span class="tick" aria-hidden="true"></span> Android 8+ &middot; two classes only</p>
<p class="kicker kicker-mute"><span class="tick" aria-hidden="true"></span> What it does</p>
```

Mono, uppercase, letter-spaced, with a small square `.tick` marker.
`.kicker-mute` is the lower-emphasis variant used on every section header.

## Section header — `.sec-head`

File: `index.html:115-118`, `176-179`, `204-211`

```html
<header class="sec-head reveal">
  <p class="kicker kicker-mute"><span class="tick" aria-hidden="true"></span> On the phone</p>
  <h2>The whole interface.</h2>
  <p>Two screens, taken from the build on this page. ...</p>
</header>
```

## Feature item — `.feature` (inside `dl.features`)

File: `index.html:120-169`. Four instances.

```html
<dl class="features">
  <div class="feature reveal" style="--d:0.04s">
    <div class="feat-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="8"/>
        <path d="M12 1.5v2.6M12 19.9v2.6M1.5 12h2.6M19.9 12h2.6"/>
      </svg>
    </div>
    <dt>Detects</dt>
    <dd>Two classes only, fire and smoke. A focused model does one job better than a general one.</dd>
  </div>
  ...
</dl>
```

Icons are 24x24 inline SVG, `stroke-width:1.7`, `stroke:currentColor`, decorative.

## Step item — `.step` (inside `ol.steps`)

File: `index.html:181-197`. Three instances. This IS a real ordered sequence,
so the `STEP 01` numbering carries information.

```html
<ol class="steps">
  <li class="step reveal" style="--d:0.04s">
    <span class="step-n">STEP 01</span>
    <h3>The phone looks</h3>
    <p>The camera feed goes straight into the TFLite interpreter. No upload, no round trip, no waiting on a signal.</p>
  </li>
  ...
</ol>
```

CSS: `.step-n{ font-family:var(--mono); font-size:12px; letter-spacing:.18em; color:var(--ember); }`

## Screenshot figure — `.phone-shot`

File: `index.html:214-232`. Two instances, real captures.

```html
<figure class="phone-shot reveal" style="--d:0.04s">
  <div class="phone-shell">
    <img src="/app-dashboard.png" alt="AQUASCOUT dashboard showing model accuracy, frame rate, camera status and the live detect button" width="864" height="1920" loading="lazy" />
  </div>
  <figcaption class="shot-cap">
    <b>Dashboard</b>
    Model accuracy and speed, camera status, and the two actions that matter
  </figcaption>
</figure>
```

`.phone-shell` draws a dark bezel plus an ember glow. **`.screens` sets
`overflow:hidden`** because that glow extends 28% past each side and pushed the
document wider than the viewport at narrow widths.

## Download card — `.get-card`

File: `index.html:246-273`

```html
<div class="get-card reveal">
  <p class="kicker"><span class="tick" aria-hidden="true"></span> Get the app</p>
  <h2>Point it at a room. See what it does.</h2>
  <p class="get-lede">One signed APK. Android 8 and up. ...</p>
  <a class="btn btn-ember btn-lg" href="/AQUASCOUT-1.51.apk" download>Download the APK ...</a>
  <ul class="get-facts">
    <li><b>39.3 MB</b> download</li>
    <li><b>v1.51</b> (21)</li>
    <li><b>Android 8+</b> (API 24)</li>
    <li><b>arm64 + armv7 + x86</b></li>
  </ul>
  <p class="play-note">This is the same signed build that is in Google Play internal testing ...</p>
</div>
```

## Hero chips — `.hero-chips`

File: `index.html:86-90`. Three pill items.

```html
<ul class="hero-chips reveal" style="--d:0.5s">
  <li>Nothing uploaded</li>
  <li>Works offline</li>
  <li>Signed release build</li>
</ul>
```

## Hero rig — `.hero-rig` / `.rig` / `#viewfinder`

File: `index.html:94-107`. Homepage hero only. Three.js canvas driven by
`viewfinder.js`, loaded from a CDN.

```html
<figure class="hero-rig reveal" style="--d:0.18s">
  <div class="rig">
    <canvas id="viewfinder" width="560" height="660" aria-label="Simulated live detection viewfinder"></canvas>
    <div class="rig-caption">
      <span>Simulated feed</span>
      <span class="rig-dot" aria-hidden="true"></span>
      <span>YOLOv8n dynamic INT8</span>
    </div>
  </div>
  <figcaption>The box and the number are the product. Everything else is the phone you already have.</figcaption>
</figure>
```

## Scroll reveal — `.reveal`

Every animated block carries `class="reveal"` and an optional
`style="--d:0.04s"` stagger delay. `nav.js` observes them with
IntersectionObserver and adds `.in`. Under `prefers-reduced-motion` all
elements get `.in` immediately.

## Privacy table

`privacy.html`. 18 `<td>` elements each carry a `data-label`; under 620px a
media query restacks the rows as labelled cards using those attributes.