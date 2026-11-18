/* boot.js — the loading plate.
   The site opens the way the detector opens: brackets come in, a target is
   locked, then it hands over to the page. It never blocks the visitor:
   if the load is slow the plate gives up on its own and the page shows. */

(function () {
  "use strict";

  var boot = document.getElementById("boot");
  if (!boot) return;

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (REDUCED) { boot.remove(); return; }

  var bar = document.getElementById("bootBar");
  var status = document.getElementById("bootStatus");
  var root = document.documentElement;

  root.classList.add("booting");

  var pct = 0;
  var finished = false;
  var started = Date.now();
  var MIN_MS = 1100;   /* the plate is worth showing, so it stays up at least this long */

  function hide() {
    if (finished) return;
    finished = true;
    boot.classList.add("done");
    root.classList.remove("booting");
    window.setTimeout(function () {
      if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
    }, 800);
  }

  function frame() {
    if (finished) return;

    // Creep toward the target. It never jumps, and it never stalls on 100
    // until the browser says the page is actually ready.
    var target = document.readyState === "complete" ? 100 : 86;
    pct += Math.max(0.5, (target - pct) * 0.09);
    if (pct > target) pct = target;

    if (bar) bar.style.width = pct.toFixed(1) + "%";
    if (status) status.textContent = pct > 64 ? "LOCKED" : "SCANNING";

    if (pct >= 100) {
      if (status) status.textContent = "READY";
      var wait = Math.max(0, MIN_MS - (Date.now() - started));
      window.setTimeout(hide, wait + 260);
      return;
    }
    window.requestAnimationFrame(frame);
  }

  window.requestAnimationFrame(frame);

  // Failsafe. Four seconds and the plate steps aside no matter what.
  window.setTimeout(function () {
    if (bar) bar.style.width = "100%";
    hide();
  }, 4000);
})();
