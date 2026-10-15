# Layouts

No framework and no component system. Every page repeats the same
`<header class="topbar">` and `<footer class="foot">` markup verbatim; the
diagram pages repeat an equivalent under `aq-*` class names. There is no
build step, so the markup is duplicated by hand and must be edited in each
file.

## Top bar — `index.html`, `about.html`, `privacy.html`

Source: `index.html:31-51` (identical in `about.html` and `privacy.html` except
the `aria-current="page"` attribute on the active link).

```html
<header class="topbar">
  <div class="wrap topbar-inner">
    <a class="brand" href="/" aria-label="AQUASCOUT home">
      <img class="brand-mark" src="/mark-light.png" alt="" width="30" height="30" />
      <span class="brand-word">AQUASCOUT</span>
    </a>

    <nav class="topnav" id="topnav">
      <a href="#how">How it works</a>
      <a href="#screens">The app</a>
      <a href="/about">About</a>
      <a href="/privacy">Privacy</a>
    </nav>

    <a class="btn btn-ember" href="#get">Get the APK</a>

    <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="topnav">
      <span></span><span></span>
    </button>
  </div>
</header>
```

## Footer — `index.html`, `about.html`, `privacy.html`

Source: `index.html:279-295`.

```html
<footer class="foot">
  <div class="wrap foot-inner">
    <div class="foot-l">
      <span class="foot-brand"><img src="/mark-light.png" alt="" width="22" height="22" /> AQUASCOUT</span>
      <span class="foot-sub">On-device fire and smoke detection for Android. Built at Saint Columban College, Pagadian City.</span>
    </div>
    <nav class="foot-nav">
      <a href="#how">How it works</a>
      <a href="#screens">The app</a>
      <a href="/about">About</a>
      <a href="/privacy">Privacy</a>
      <a href="/diagrams/aquascout-architecture">Architecture</a>
      <a href="#get">Download</a>
      <a href="mailto:zhameersheraztampugao@gmail.com">Contact</a>
    </nav>
  </div>
</footer>
```

## Page shell — `index.html:29-53`

```html
<body>
<header class="topbar"> ... </header>
<main>
  <section class="hero"> ... </section>
  <section id="does" class="does"> ... </section>
  <section id="how" class="how"> ... </section>
  <section id="screens" class="screens"> ... </section>
  <section id="get" class="get"> ... </section>
</main>
<footer class="foot"> ... </footer>
<script src="/nav.js"></script>
<script src="/viewfinder.js"></script>
</body>
```

`about.html` and `privacy.html` use `<main>` wrapped in `.page`:

```html
<div class="wrap page"> ... </div>
```

**`.page` and `.wrap` are on the same element.** `.page` must therefore use
`padding-block`, never the `padding` shorthand, or the horizontal gutter is
wiped to 0 and text renders flush to the screen edge on mobile.

## Diagram chrome — `diagrams/chrome.css`

Loaded only by the two diagram pages, which do NOT load `style.css`. Same
visual result, zero cascade risk. Full source:

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

.aq-topbar{
  position:sticky; top:0; z-index:60;
  background:rgba(8,8,10,.72);
  backdrop-filter:blur(16px) saturate(1.5);
  -webkit-backdrop-filter:blur(16px) saturate(1.5);
  border-bottom:1px solid var(--aq-line);
}
.aq-topbar-inner{
  max-width:var(--aq-maxw); margin:0 auto;
  padding:0 24px;
  display:flex; align-items:center; gap:20px;
  height:66px;
}
.aq-brand{
  display:flex; align-items:center; gap:10px;
  text-decoration:none; margin-right:auto;
}
.aq-brand img{ width:30px; height:30px; }
.aq-brand span{
  font-family:var(--aq-disp); font-weight:800;
  font-size:15.5px; letter-spacing:.09em; color:var(--aq-text);
}
.aq-nav{ display:flex; gap:28px; }
.aq-nav a{
  text-decoration:none; font-size:14.5px; font-weight:500;
  color:var(--aq-text-2);
  padding:7px 0; border-bottom:1px solid transparent;
  transition:color .18s, border-color .18s;
}
.aq-nav a:hover{ color:var(--aq-text); border-bottom-color:var(--aq-line-2); }
.aq-nav a[aria-current="page"]{ color:var(--aq-text); border-bottom-color:var(--aq-ember); }

.aq-cta{
  display:inline-flex; align-items:center; justify-content:center;
  text-decoration:none; font-family:var(--aq-sans);
  font-size:14px; font-weight:600; white-space:nowrap;
  padding:11px 20px; border-radius:6px;
  background:linear-gradient(135deg,var(--aq-ember) 0%,var(--aq-ember-lo) 100%);
  color:#1A0A02;
  box-shadow:0 8px 24px -10px rgba(255,122,26,.75);
  transition:transform .16s, background .16s;
}
.aq-cta:hover{ transform:translateY(-2px); background:linear-gradient(135deg,#FF8A34 0%,var(--aq-ember) 100%); }

.aq-burger{
  display:none;
  width:40px; height:40px; position:relative;
  background:none; border:1px solid var(--aq-line-2);
  border-radius:6px; cursor:pointer; padding:0;
}
.aq-burger span{
  position:absolute; left:11px; right:11px; height:1.5px;
  background:var(--aq-text); transition:transform .22s, opacity .22s;
}
.aq-burger span:nth-child(1){ top:17px; }
.aq-burger span:nth-child(2){ bottom:17px; }
.aq-burger[aria-expanded="true"] span:nth-child(1){ transform:translateY(3px) rotate(45deg); }
.aq-burger[aria-expanded="true"] span:nth-child(2){ transform:translateY(-3px) rotate(-45deg); }

.aq-foot{
  margin-top:48px;
  border-top:1px solid var(--aq-line);
  background:linear-gradient(180deg,#08080A,#0B0B10);
  padding:36px 0 44px;
}
.aq-foot-inner{
  max-width:var(--aq-maxw); margin:0 auto; padding:0 24px;
  display:flex; flex-wrap:wrap; gap:24px;
  align-items:flex-start; justify-content:space-between;
}
.aq-foot-l{ max-width:40ch; }
.aq-foot-brand{
  display:flex; align-items:center; gap:9px;
  font-family:var(--aq-disp); font-weight:800;
  font-size:15px; letter-spacing:.09em; color:var(--aq-text);
}
.aq-foot-brand img{ width:22px; height:22px; }
.aq-foot-sub{
  display:block; margin-top:9px;
  font-size:13.5px; line-height:1.55; color:var(--aq-text-2);
}
.aq-foot-nav{ display:flex; flex-wrap:wrap; gap:10px 26px; }
.aq-foot-nav a{
  font-size:14px; color:var(--aq-text-2); text-decoration:none;
  border-bottom:1px solid transparent;
  transition:color .18s, border-color .18s;
}
.aq-foot-nav a:hover{ color:var(--aq-text); border-bottom-color:var(--aq-ember); }

/* 900, not 820: below this the four links plus the CTA stop fitting beside the
   brand, matching the breakpoint style.css uses for the main pages. */
@media (max-width:900px){
  .aq-nav{
    position:absolute; top:66px; left:0; right:0;
    flex-direction:column; gap:0;
    background:#0A0A0D;
    border-bottom:1px solid var(--aq-line);
    box-shadow:0 24px 40px -20px rgba(0,0,0,.9);
    padding:8px 24px 16px;
    display:none;
  }
  .aq-nav.open{ display:flex; }
  .aq-nav a{ padding:14px 0; border-bottom:1px solid var(--aq-line); }
  .aq-cta{ display:none; }
  .aq-burger{ display:block; }
  .aq-foot-inner{ flex-direction:column; }
}
```