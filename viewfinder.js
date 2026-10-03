/* ============================================================
   viewfinder.js
   A simulated camera feed with a working detection loop.

   The point is not decoration. It behaves the way the app does:
     - a plume drifts through frame
     - the detector acquires over ~0.5s (brackets converge)
     - it tracks, with confidence jittering like a real score
     - it drops, and re-acquires elsewhere
   Everything is drawn, nothing is faked from a static image.
   ============================================================ */

(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- small helpers ---------- */

  function rand(a, b) { return a + Math.random() * (b - a); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // ease that settles hard, so acquisition feels mechanical not floaty
  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }

  /* ---------- the detector ---------- */

  function Viewfinder(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.t = 0;
    this.blobs = [];
    this.target = null;
    this.phase = "track";      // start locked, see "idle" below
    this.phaseT = 0;
    this.conf = 0.9;
    this.fps = 2.8;
    this.fpsAcc = 0;
    this.fpsFrames = 0;
    this.frames = 0;
    this.label = "smoke";

    this.resize();
    this.seedBlobs();
    // Open already locked, so the first painted frame shows the product.
    // It drops shortly after, which is when the acquire cycle becomes visible.
    this.placeTarget();
    this.phaseT = 0.9;

    var self = this;
    this.onResize = function () { self.resize(); };
    window.addEventListener("resize", this.onResize);

    if (REDUCED) {
      // Reduced motion still gets the drawing, just no loop. It is deferred to
      // the next frame: painting synchronously here happens before the canvas
      // has a real box, which produced a blank black rectangle.
      this.seedBlobs();
      this.phase = "track";
      this.phaseT = 2;
      this.conf = 0.91;
      this.placeTarget();
      requestAnimationFrame(function () { self.draw(); });
      window.addEventListener("resize", function () { self.draw(); });
    } else {
      this.last = performance.now();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }
  }

  Viewfinder.prototype.resize = function () {
    var r = this.cv.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width || this.cv.width));
    var h = Math.max(1, Math.round((w * 660) / 560));   // keep 560:660 ratio
    this.cv.width = w * this.dpr;
    this.cv.height = h * this.dpr;
    this.w = w;
    this.h = h;
  };

  // Three soft plumes. Layered radial gradients with 'lighter' read as smoke
  // without needing per-pixel noise, which would cost too much on a phone.
  Viewfinder.prototype.seedBlobs = function () {
    this.blobs = [
      { bx: 0.32, by: 0.60, r: 0.44, drift: 0.030, sway: 0.055, phase: 0.0, a: 0.44 },
      { bx: 0.64, by: 0.46, r: 0.34, drift: -0.021, sway: 0.042, phase: 2.1, a: 0.34 },
      { bx: 0.50, by: 0.80, r: 0.28, drift: 0.016, sway: 0.030, phase: 4.0, a: 0.26 }
    ];
  };

  Viewfinder.prototype.placeTarget = function () {
    // Box sits over a blob, in a plausible part of frame.
    var i = Math.floor(Math.random() * this.blobs.length);
    var b = this.blobs[i];
    this.target = {
      b: i,
      bx: b.bx + rand(-0.06, 0.06),
      by: b.by + rand(-0.10, -0.04),
      bw: rand(0.26, 0.36),
      bh: rand(0.30, 0.40)
    };
    this.label = Math.random() < 0.68 ? "smoke" : "fire";
  };

  Viewfinder.prototype.step = function (dt) {
    this.t += dt;
    this.frames++;

    // plume motion
    for (var i = 0; i < this.blobs.length; i++) {
      var b = this.blobs[i];
      b.by -= b.drift * dt;
      b.bx += Math.sin(this.t * 0.55 + b.phase) * b.sway * dt;
      if (b.by < -0.1) { b.by = 1.1; b.bx = rand(0.2, 0.8); }
      b.bx = clamp(b.bx, 0.1, 0.9);
    }

    this.phaseT += dt;

    if (this.phase === "idle") {
      if (this.phaseT > rand(0.25, 0.55)) { this.phase = "acquire"; this.phaseT = 0; this.placeTarget(); }
    } else if (this.phase === "acquire") {
      this.conf = lerp(0.18, 0.92, easeOutQuint(clamp(this.phaseT / 0.55, 0, 1)));
      if (this.phaseT > 0.55) { this.phase = "track"; this.phaseT = 0; this.conf = 0.92; }
    } else if (this.phase === "track") {
      // hold high but never perfectly still
      var noise = Math.sin(this.t * 3.1) * 0.012 + Math.sin(this.t * 7.7) * 0.006;
      this.conf = clamp(0.92 + noise, 0.80, 0.985);
      if (this.phaseT > rand(3.2, 5.0)) { this.phase = "drop"; this.phaseT = 0; }
    } else if (this.phase === "drop") {
      this.conf = lerp(this.conf, 0.10, clamp(this.phaseT / 0.35, 0, 1));
      if (this.phaseT > 0.35) { this.phase = "idle"; this.phaseT = 0; this.conf = 0; }
    }

    // fps readout
    this.fpsAcc += dt;
    this.fpsFrames++;
    if (this.fpsAcc >= 0.5) {
      this.fps = this.fpsFrames / this.fpsAcc;
      this.fpsAcc = 0;
      this.fpsFrames = 0;
    }
  };

  /* ---------- drawing ---------- */

  Viewfinder.prototype.draw = function () {
    var c = this.ctx, w = this.w, h = this.h;
    c.save();
    c.scale(this.dpr, this.dpr);
    c.clearRect(0, 0, w, h);

    // feed base
    c.fillStyle = "#0B0F12";
    c.fillRect(0, 0, w, h);

    // a faint vertical falloff so it reads like a lens, not a flat panel
    var vg = c.createLinearGradient(0, 0, 0, h);
    vg.addColorStop(0, "rgba(30,42,50,.55)");
    vg.addColorStop(0.55, "rgba(11,15,18,0)");
    vg.addColorStop(1, "rgba(4,6,8,.6)");
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);

    // plumes
    c.globalCompositeOperation = "lighter";
    for (var i = 0; i < this.blobs.length; i++) {
      var b = this.blobs[i];
      var cx = b.bx * w, cy = b.by * h, r = b.r * w;
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(150,166,176," + b.a + ")");
      g.addColorStop(0.45, "rgba(96,110,120," + (b.a * 0.4) + ")");
      g.addColorStop(1, "rgba(40,50,58,0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fill();
    }
    c.globalCompositeOperation = "source-over";

    // scan lines
    c.fillStyle = "rgba(255,255,255,.016)";
    for (var y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);

    // frame furniture
    this.drawFurniture(c, w, h);
    this.drawBox(c, w, h);

    c.restore();
  };

  Viewfinder.prototype.drawFurniture = function (c, w, h) {
    // corner marks
    c.strokeStyle = "rgba(147,161,171,.34)";
    c.lineWidth = 1;
    var m = 16, L = 13;
    var corners = [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]];
    for (var i = 0; i < 4; i++) {
      var p = corners[i];
      c.beginPath();
      c.moveTo(p[0] + p[2] * L, p[1]);
      c.lineTo(p[0], p[1]);
      c.lineTo(p[0], p[1] + p[3] * L);
      c.stroke();
    }

    c.font = "500 10px 'IBM Plex Mono', monospace";
    c.textBaseline = "alphabetic";

    // top-left state
    c.fillStyle = "#93A1AB";
    c.fillText("LIVE  ·  CAM 1", 18, 32);

    // top-right mode
    c.fillStyle = "rgba(147,161,171,.6)";
    c.fillText("2-CLASS", w - 18 - c.measureText("2-CLASS").width, 32);

    // bottom bar
    var by = h - 18;
    c.fillStyle = "#93A1AB";
    c.fillText("2.8 FPS", 18, by);

    if (this.phase === "track" || this.phase === "acquire") {
      var txt = this.label.toUpperCase() + "  " + this.conf.toFixed(2);
      c.fillStyle = "#F0A97E";
      c.fillText(txt, w - 18 - c.measureText(txt).width, by);
    } else {
      c.fillStyle = "rgba(147,161,171,.4)";
      c.fillText("SCANNING", w - 18 - c.measureText("SCANNING").width, by);
    }
  };

  // Corner brackets that converge during acquire, then track the plume.
  Viewfinder.prototype.drawBox = function (c, w, h) {
    if (!this.target || this.phase === "idle" || this.phase === "drop") return;

    var t = this.target;
    var b = this.blobs[t.b];

    // follow the drifting plume, plus a little lag so it feels estimated
    var cx = (t.bx + (b.bx - t.bx) * 0.55) * w;
    var cy = (t.by + (b.by - t.by) * 0.55) * h;
    var bw = t.bw * w;
    var bh = t.bh * h;

    var x = cx - bw / 2, y = cy - bh / 2;

    // acquire: brackets start wide and pull in
    var spread = this.phase === "acquire"
      ? (1 - easeOutQuint(clamp(this.phaseT / 0.55, 0, 1))) * 26 + 3
      : 3;

    var armX = Math.min(bw * 0.3, 22);
    var armY = Math.min(bh * 0.3, 22);
    var strong = this.phase === "track";

    c.lineWidth = strong ? 1.6 : 1.2;
    c.strokeStyle = strong ? "#F0A97E" : "rgba(240,169,126,.55)";

    // TL
    c.beginPath();
    c.moveTo(x - spread, y + armY); c.lineTo(x - spread, y - spread); c.lineTo(x + armX, y - spread);
    c.stroke();
    // TR
    c.beginPath();
    c.moveTo(x + bw - armX, y - spread); c.lineTo(x + bw + spread, y - spread); c.lineTo(x + bw + spread, y + armY);
    c.stroke();
    // BL
    c.beginPath();
    c.moveTo(x - spread, y + bh - armY); c.lineTo(x - spread, y + bh + spread); c.lineTo(x + armX, y + bh + spread);
    c.stroke();
    // BR
    c.beginPath();
    c.moveTo(x + bw - armX, y + bh + spread); c.lineTo(x + bw + spread, y + bh + spread); c.lineTo(x + bw + spread, y + bh - armY);
    c.stroke();

    // label chip, only once locked
    if (strong) {
      var lbl = this.label;
      c.font = "500 10px 'IBM Plex Mono', monospace";
      var tw = c.measureText(lbl).width;
      c.fillStyle = "#F0A97E";
      c.fillRect(x, y - 20, tw + 14, 17);
      c.fillStyle = "#0B0F12";
      c.fillText(lbl, x + 7, y - 8);
    }
  };

  Viewfinder.prototype.loop = function (now) {
    var dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    // Re-measure if the first pass caught a zero-width layout.
    if (this.w < 10) this.resize();
    this.step(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  };

  /* ---------- boot ---------- */

  function boot() {
    var cv = document.getElementById("viewfinder");
    if (!cv) return;
    // wait for fonts so the mono label metrics are right
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { window.__vf = new Viewfinder(cv); });
    } else {
      window.__vf = new Viewfinder(cv);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
