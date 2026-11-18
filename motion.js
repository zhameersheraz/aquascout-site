/* motion.js — pointer tilt on the hero device.
   The device leans with the pointer, the way a physical object on a table
   would catch the light. Desktop only, and off entirely when the reader
   asked for reduced motion. */

(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var device = document.getElementById("device");
  var stage = document.querySelector(".hero-stage");

  if (!device || !stage || REDUCED) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var raf = null;
  var tx = 0, ty = 0;

  function apply() {
    raf = null;
    device.classList.add("live");
    device.style.transform =
      "rotateY(" + (ty - 15).toFixed(2) + "deg) rotateX(" + (tx + 3).toFixed(2) + "deg)";
  }

  function onMove(e) {
    var r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var px = (e.clientX - r.left) / r.width - 0.5;
    var py = (e.clientY - r.top) / r.height - 0.5;
    tx = -py * 9;
    ty = px * 16;
    if (!raf) raf = requestAnimationFrame(apply);
  }

  function onLeave() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    device.style.transform = "";
    device.classList.remove("live");
  }

  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);
})();
