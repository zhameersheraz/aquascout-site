/* ============================================================
   prototype.js
   Interactive 3D model of the AQUASCOUT rover.

   The model is built from primitives rather than a downloaded GLB,
   which keeps the page small and lets every part be labelled and
   individually controlled. Controls are real: the wheels turn, the
   rover translates, the pump emits water, the alert fires.
   ============================================================ */

(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var stage = document.getElementById("stage");
  var canvas = document.getElementById("gl");
  if (!stage || !canvas) return;

  if (typeof THREE === "undefined" || typeof THREE.OrbitControls === "undefined") {
    stage.innerHTML =
      '<div style="display:grid;place-content:center;height:100%;padding:40px;' +
      'font-family:var(--mono);font-size:12px;letter-spacing:.1em;color:#5F6C75;text-align:center;line-height:2">' +
      "3D ENGINE COULD NOT LOAD<br>" +
      '<span style="color:#3A464F">check the network, then reload</span></div>';
    return;
  }

  /* ---------- palette (matches the site) ---------- */
  var INK      = 0x101519;
  var PLATE    = 0x1B2228;   // chassis, kept dark so the signal colour stays loudest
  var PLATE_LT = 0x2B353D;
  var RUBBER   = 0x0C1013;
  var HUB      = 0x5A666E;
  var BOARD    = 0x162026;
  var LENS     = 0x05080A;
  var SENSOR   = 0x7E8A93;
  var SIGNAL   = 0xD94F04;
  var SIGNAL_L = 0xF0A97E;
  var WATER    = 0x6FA8C4;

  /* ---------- renderer ---------- */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0A0E11, 12, 34);

  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(4.3, 2.9, 5.0);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 3.6;
  controls.maxDistance = 16;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(0, 0.85, 0);

  /* ---------- lights ---------- */
  // Kept low on purpose: this is a dim bench, not a showroom. A bright key
  // washed the graphite chassis out to mid grey.
  scene.add(new THREE.HemisphereLight(0x8FA6B4, 0x06090B, 0.30));

  var key = new THREE.DirectionalLight(0xFFFFFF, 0.62);
  key.position.set(6, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -8; key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;   key.shadow.camera.bottom = -8;
  scene.add(key);

  var rim = new THREE.DirectionalLight(0x7E96A6, 0.34);
  rim.position.set(-6, 4, -6);
  scene.add(rim);

  /* ---------- helpers ---------- */
  function mat(color, opts) {
    opts = opts || {};
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: opts.rough !== undefined ? opts.rough : 0.72,
      metalness: opts.metal !== undefined ? opts.metal : 0.08,
      transparent: !!opts.opacity,
      opacity: opts.opacity !== undefined ? opts.opacity : 1
    });
  }

  var M = {
    plate:   mat(PLATE,    { rough: 0.62, metal: 0.22 }),
    plateLt: mat(PLATE_LT, { rough: 0.58, metal: 0.26 }),
    rubber:  mat(RUBBER,   { rough: 0.95, metal: 0.02 }),
    hub:     mat(HUB,      { rough: 0.4,  metal: 0.55 }),
    board:   mat(BOARD,    { rough: 0.8,  metal: 0.1 }),
    lens:    mat(LENS,     { rough: 0.16, metal: 0.4 }),
    sensor:  mat(SENSOR,   { rough: 0.5,  metal: 0.2 }),
    tank:    mat(0x9AA6AE,  { rough: 0.35, metal: 0.1, opacity: 0.34 }),
    dark:    mat(0x1A2228,  { rough: 0.85 }),
    ground:  mat(0x0E1316,  { rough: 1, metal: 0 })
  };

  function box(w, h, d, m, x, y, z, parent) {
    var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x || 0, y || 0, z || 0);
    o.castShadow = true; o.receiveShadow = true;
    (parent || scene).add(o);
    return o;
  }
  function cyl(rt, rb, h, m, x, y, z, parent, seg) {
    var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), m);
    o.position.set(x || 0, y || 0, z || 0);
    o.castShadow = true; o.receiveShadow = true;
    (parent || scene).add(o);
    return o;
  }

  /* ---------- ground ---------- */
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // measurement grid, drawn as lines so it stays crisp
  var grid = new THREE.GridHelper(40, 40, 0x253038, 0x182026);
  grid.material.opacity = 0.5;
  grid.material.transparent = true;
  grid.position.y = 0.002;
  scene.add(grid);

  /* ---------- rover ---------- */
  var rover = new THREE.Group();
  scene.add(rover);

  // chassis: lower plate + upper deck
  var base = box(3.0, 0.20, 1.9, M.plate, 0, 0.52, 0, rover);
  var deck = box(2.5, 0.10, 1.5, M.plateLt, 0, 0.66, 0, rover);
  box(2.72, 0.06, 0.12, M.dark, 0, 0.60, 0.78, rover);   // front rail
  box(2.72, 0.06, 0.12, M.dark, 0, 0.60, -0.78, rover);  // rear rail

  // wheels
  var wheels = [];
  (function () {
    var wx = 1.02, wz = 0.98, wr = 0.40;
    var spots = [[wx, wz], [wx, -wz], [-wx, wz], [-wx, -wz]];
    for (var i = 0; i < 4; i++) {
      var g = new THREE.Group();
      g.position.set(spots[i][0], wr, spots[i][1]);
      var t = cyl(wr, wr, 0.30, M.rubber, 0, 0, 0, g, 24);
      t.rotation.z = Math.PI / 2;
      var hub = cyl(wr * 0.42, wr * 0.42, 0.32, M.hub, 0, 0, 0, g, 18);
      hub.rotation.z = Math.PI / 2;
      // tread notches, so rotation is visible
      for (var k = 0; k < 10; k++) {
        var a = (k / 10) * Math.PI * 2;
        var n = box(0.06, 0.05, 0.26, M.dark,
          0, Math.cos(a) * wr * 0.99, Math.sin(a) * wr * 0.99, g);
        n.rotation.x = -a;
      }
      rover.add(g);
      wheels.push({ g: g, side: spots[i][1] > 0 ? 1 : -1, front: spots[i][0] > 0 });
    }
  })();

  // suspension arms
  (function () {
    var wx = 1.02, wz = 0.98;
    for (var s = -1; s <= 1; s += 2) {
      for (var f = -1; f <= 1; f += 2) {
        var arm = box(0.55, 0.07, 0.07, M.dark, f * 0.72, 0.52, s * wz, rover);
        arm.rotation.z = f * 0.16;
      }
    }
  })();

  // electronics bay
  box(1.05, 0.07, 0.86, M.board, -0.45, 0.75, 0, rover);      // protoboard
  var uno = box(0.66, 0.06, 0.52, M.dark, 0.42, 0.75, 0.28, rover);
  box(0.5, 0.02, 0.14, M.hub, 0.42, 0.79, 0.34, rover);      // USB port
  var jdy = box(0.30, 0.05, 0.24, M.plateLt, -0.30, 0.80, -0.44, rover);
  cyl(0.03, 0.03, 0.30, M.sensor, -0.30, 0.95, -0.44, rover, 10);   // BLE antenna

  // HC-SR04 ultrasonic on the front rail
  var sonic = new THREE.Group();
  sonic.position.set(0.86, 0.72, 0);
  box(0.16, 0.10, 0.22, M.dark, 0, 0, 0, sonic);
  var t1 = cyl(0.055, 0.055, 0.06, M.sensor, -0.05, 0.07, 0, sonic, 14);
  var t2 = cyl(0.055, 0.055, 0.06, M.sensor, 0.05, 0.07, 0, sonic, 14);
  rover.add(sonic);

  // mast + two ESP32-CAM heads
  var mast = cyl(0.05, 0.05, 1.05, M.plateLt, 0, 1.24, 0, rover, 12);
  box(0.5, 0.05, 0.05, M.plateLt, 0, 1.72, 0, rover);        // crossbar

  var camLeds = [];
  function camHead(x, z) {
    var g = new THREE.Group();
    g.position.set(x, 1.72, z);
    box(0.30, 0.20, 0.10, M.board, 0, 0, 0, g);
    var lens = cyl(0.055, 0.062, 0.05, M.lens, 0, 0, z > 0 ? 0.07 : -0.07, g, 16);
    lens.rotation.x = Math.PI / 2;
    var led = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 10, 8),
      new THREE.MeshBasicMaterial({ color: SIGNAL_L })
    );
    led.position.set(0.09, 0.06, z > 0 ? 0.055 : -0.055);
    g.add(led);
    camLeds.push(led);
    rover.add(g);
    return g;
  }
  camHead(0, 0.30);   // front
  camHead(0, -0.30);  // rear

  // water tank + pump + nozzle
  var tank = cyl(0.26, 0.26, 0.44, M.tank, -0.86, 0.92, -0.32, rover, 24);
  cyl(0.10, 0.10, 0.10, M.sensor, -0.86, 1.18, -0.32, rover, 14);  // cap
  var pump = box(0.30, 0.22, 0.26, M.dark, -0.86, 0.80, 0.28, rover);
  cyl(0.06, 0.06, 0.5, M.plateLt, -0.5, 0.90, 0.28, rover, 12).rotation.z = Math.PI / 2; // hose

  var nozzle = new THREE.Group();
  nozzle.position.set(1.28, 0.78, 0);
  var nz = cyl(0.05, 0.09, 0.26, M.plateLt, 0, 0, 0, nozzle, 14);
  nz.rotation.z = -Math.PI / 2;
  rover.add(nozzle);

  // water jet
  var jetGeo = new THREE.ConeGeometry(0.16, 1.5, 18, 1, true);
  jetGeo.rotateZ(-Math.PI / 2);
  jetGeo.translate(0.75, 0, 0);
  var jet = new THREE.Mesh(jetGeo, new THREE.MeshBasicMaterial({
    color: WATER, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false
  }));
  jet.position.copy(nozzle.position);
  jet.visible = false;
  scene.add(jet);

  // target the jet at a drum a little ahead of the rover
  var burn = new THREE.Group();
  burn.position.set(2.7, 0, 0);
  cyl(0.30, 0.30, 0.72, M.dark, 0, 0.36, 0, burn, 20);
  cyl(0.32, 0.32, 0.05, M.plateLt, 0, 0.72, 0, burn, 20);
  scene.add(burn);

  // a small flame on the barrel, only while the alert is live
  var flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.8, 14),
    new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0 })
  );
  flame.position.set(2.7, 1.10, 0);
  scene.add(flame);

  /* ---------- hotspots ----------
     Each anchor carries a screen-space offset. Without them the chips stack
     on top of each other, because the parts of a rover are physically close.  */
  var HOTSPOTS = [
    { p: new THREE.Vector3(0, 1.80, 0.30),  t: "ESP32-CAM, front", dx: -14, dy: -30 },
    { p: new THREE.Vector3(0, 1.80, -0.30), t: "ESP32-CAM, rear",  dx: 14,  dy: 24 },
    { p: new THREE.Vector3(0.42, 0.82, 0.28), t: "Arduino UNO",    dx: -6,  dy: 34 },
    { p: new THREE.Vector3(-0.30, 0.86, -0.44), t: "JDY-16 BLE",  dx: 68,  dy: 2 },
    { p: new THREE.Vector3(0.86, 0.82, 0), t: "HC-SR04",          dx: 74,  dy: -16 },
    { p: new THREE.Vector3(-0.86, 0.96, -0.32), t: "Water tank",  dx: -80, dy: -2 },
    { p: new THREE.Vector3(-0.86, 0.84, 0.28),  t: "Pump",        dx: -74, dy: 26 },
    { p: new THREE.Vector3(1.02, 0.42, 0.98),  t: "Drive wheels",    dx: 0,   dy: 34 }
  ];
  var hsLayer = document.getElementById("hotspots");
  var hsEls = HOTSPOTS.map(function (h) {
    var el = document.createElement("div");
    el.className = "hs";
    el.innerHTML = '<span class="hs-dot"></span><span class="hs-lead"></span><span class="hs-chip"></span>';
    el.querySelector(".hs-chip").textContent = h.t;
    if (h.dx < 0) el.setAttribute("data-side", "left");
    hsLayer.appendChild(el);
    return el;
  });
  var labelsOn = true;

  /* ---------- state ---------- */
  var keys = {};
  var state = {
    pump: false, cam: true, link: true, alarm: false,
    speed: 0, heading: 0, x: 0, z: 0, dist: 0, log: []
  };

  var elSpeed = document.getElementById("speed");
  var elSpeedBar = document.getElementById("speedBar");
  var elHud = document.getElementById("hudState");
  var elPumpState = document.getElementById("pumpState");
  var elCamState = document.getElementById("camState");
  var elScanState = document.getElementById("scanState");
  var swPump = document.getElementById("swPump");
  var swCam = document.getElementById("swCam");
  var swScan = document.getElementById("swScan");
  var btnAlarm = document.getElementById("btnAlarm");
  var btnReset = document.getElementById("btnReset");
  var elLog = document.getElementById("log");
  var pumpLed = swPump.querySelector(".sw-led");
  var camLed = swCam.querySelector(".sw-led");
  var scanLed = swScan.querySelector(".sw-led");

  function log(msg, hot) {
    var li = document.createElement("li");
    if (hot) li.className = "hot";
    var t = new Date();
    var stamp = ("0" + t.getHours()).slice(-2) + ":" + ("0" + t.getMinutes()).slice(-2) + ":" + ("0" + t.getSeconds()).slice(-2);
    li.innerHTML = "<b>" + stamp + "</b><span></span>";
    li.querySelector("span").textContent = msg;
    elLog.insertBefore(li, elLog.firstChild);
    while (elLog.children.length > 24) elLog.removeChild(elLog.lastChild);
  }

  /* ---------- view presets ---------- */
  var VIEWS = {
    orbit: { pos: [4.3, 2.9, 5.0], tgt: [0, 0.85, 0] },
    front: { pos: [0.2, 1.6, 6.2], tgt: [0, 0.9, 0] },
    top:   { pos: [0.1, 7.2, 0.8], tgt: [0, 0.5, 0] },
    drive: { pos: [0.4, 2.2, -3.2], tgt: [0, 0.9, 0] }
  };
  var tween = null;
  function goView(name) {
    var v = VIEWS[name];
    if (!v) return;
    tween = {
      t: 0, dur: REDUCED ? 0.001 : 0.9,
      p0: camera.position.clone(), p1: new THREE.Vector3(v.pos[0], v.pos[1], v.pos[2]),
      t0: controls.target.clone(), t1: new THREE.Vector3(v.tgt[0], v.tgt[1], v.tgt[2])
    };
  }
  Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), function (b) {
    b.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), function (x) { x.classList.remove("is-on"); });
      b.classList.add("is-on");
      goView(b.dataset.view);
    });
  });

  document.getElementById("labelsToggle").addEventListener("change", function (e) {
    labelsOn = e.target.checked;
  });

  /* ---------- toggles ---------- */
  function setPump(on, quiet) {
    state.pump = on;
    swPump.setAttribute("aria-pressed", on ? "true" : "false");
    pumpLed.className = "sw-led" + (on ? " is-warn" : "");
    elPumpState.textContent = on ? "Running" : "Off";
    btnAlarm.classList.toggle("pumping", on);
    if (!quiet) log(on ? "Pump armed, 12 V feed confirmed" : "Pump stopped");
  }
  function setCam(on) {
    state.cam = on;
    swCam.setAttribute("aria-pressed", on ? "true" : "false");
    camLed.className = "sw-led" + (on ? " is-on" : "");
    elCamState.textContent = on ? "Streaming" : "Stopped";
    camLeds.forEach(function (l) { l.visible = on; });
    log(on ? "Both ESP32-CAM heads streaming MJPEG" : "Camera streams stopped");
  }
  function setLink(on) {
    state.link = on;
    swScan.setAttribute("aria-pressed", on ? "true" : "false");
    scanLed.className = "sw-led" + (on ? " is-on" : "");
    elScanState.textContent = on ? "Connected" : "Lost";
    log(on ? "Detection link up, phone is the inference host" : "Detection link dropped");
  }

  swPump.addEventListener("click", function () { setPump(!state.pump); });
  swCam.addEventListener("click", function () { setCam(!state.cam); });
  swScan.addEventListener("click", function () { setLink(!state.link); });

  btnAlarm.addEventListener("click", function () {
    if (state.alarm) return;
    state.alarm = true;
    elHud.textContent = "FIRE DETECTED";
    elHud.classList.add("alert");
    setPump(true, true);
    log("smoke 0.91, GPS pin attached", true);
    log("SMS sent to emergency contact", true);
    log("Alert raised, 30 s debounce armed", true);
    if (!REDUCED) {
      setTimeout(function () {
        state.alarm = false;
        elHud.textContent = "IDLE";
        elHud.classList.remove("alert");
        setPump(false, true);
        flame.material.opacity = 0;
      }, 6500);
    }
  });

  btnReset.addEventListener("click", function () {
    keys = {};
    state.x = 0; state.z = 0; state.heading = 0; state.speed = 0; state.dist = 0; state.alarm = false;
    rover.position.set(0, 0, 0);
    rover.rotation.y = 0;
    setPump(false, true);
    elHud.textContent = "IDLE";
    elHud.classList.remove("alert");
    elLog.innerHTML = "";
    log("Rover reset to origin");
  });

  /* ---------- keyboard ---------- */
  var MAP = { w: "f", a: "l", s: "r", d: "rr", arrowup: "f", arrowleft: "l", arrowdown: "r", arrowright: "rr" };
  document.addEventListener("keydown", function (e) {
    var k = e.key.toLowerCase();
    if (MAP[k]) { keys[MAP[k]] = true; syncDpad(); e.preventDefault(); }
    if (k === "p") setPump(!state.pump);
  });
  document.addEventListener("keyup", function (e) {
    var k = e.key.toLowerCase();
    if (MAP[k]) { keys[MAP[k]] = false; syncDpad(); }
  });
  window.addEventListener("blur", function () { keys = {}; syncDpad(); });

  var dpBtns = Array.prototype.slice.call(document.querySelectorAll(".dp"));
  dpBtns.forEach(function (b) {
    var on = function (e) { e.preventDefault(); keys[b.dataset.key] = true; syncDpad(); };
    var off = function (e) { e.preventDefault(); keys[b.dataset.key] = false; syncDpad(); };
    b.addEventListener("pointerdown", on);
    b.addEventListener("pointerup", off);
    b.addEventListener("pointerleave", off);
    b.addEventListener("pointercancel", off);
  });
  function syncDpad() {
    dpBtns.forEach(function (b) { b.classList.toggle("on", !!keys[b.dataset.key]); });
  }

  /* ---------- resize ---------- */
  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  /* ---------- loop ---------- */
  var MAX_V = 1.6;          // m/s at full throttle
  var TURN = 1.9;           // rad/s
  var wheelSpin = 0;

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function tick(now) {
    requestAnimationFrame(tick);
    var dt = Math.min((now - (tick.last || now)) / 1000, 0.05);
    tick.last = now;

    // camera tween
    if (tween) {
      tween.t += dt / tween.dur;
      var k = ease(Math.min(tween.t, 1));
      camera.position.lerpVectors(tween.p0, tween.p1, k);
      controls.target.lerpVectors(tween.t0, tween.t1, k);
      if (tween.t >= 1) tween = null;
    }

    // drive
    var throttle = (keys.f ? 1 : 0) - (keys.r ? 1 : 0);
    var steer = (keys.rr ? 1 : 0) - (keys.l ? 1 : 0);

    if (state.link) {
      state.speed += throttle * 2.4 * dt;
      state.speed -= state.speed * 2.1 * dt;         // drag
      if (Math.abs(state.speed) < 0.002) state.speed = 0;
    } else {
      state.speed = 0;
    }
    state.speed = Math.max(-MAX_V * 0.6, Math.min(MAX_V, state.speed));

    if (steer) state.heading += steer * TURN * dt * (state.speed === 0 ? 1 : 0.6);

    state.x += Math.sin(state.heading) * state.speed * dt;
    state.z += Math.cos(state.heading) * state.speed * dt;

    // keep it on the bench
    var lim = 6.2;
    if (Math.abs(state.x) > lim) { state.x = Math.sign(state.x) * lim; state.speed = 0; }
    if (Math.abs(state.z) > lim) { state.z = Math.sign(state.z) * lim; state.speed = 0; }

    rover.position.set(state.x, 0, state.z);
    rover.rotation.y = state.heading;

    // wheels
    var d = state.speed * dt / 0.40;
    wheelSpin -= d;
    wheels.forEach(function (w) {
      w.g.rotation.x = wheelSpin;
    });

    // water jet
    var wantJet = state.pump ? 0.42 : 0;
    jet.material.opacity += (wantJet - jet.material.opacity) * Math.min(1, dt * 8);
    jet.visible = jet.material.opacity > 0.01;
    if (state.pump && !REDUCED) {
      jet.scale.x = 1 + Math.sin(now / 90) * 0.08;
      jet.scale.y = 1 + Math.cos(now / 110) * 0.14;
    }

    // flame
    var wantF = state.alarm ? 0.85 : 0;
    flame.material.opacity += (wantF - flame.material.opacity) * Math.min(1, dt * 5);
    if (flame.material.opacity > 0.01 && !REDUCED) {
      var s = 0.85 + Math.sin(now / 130) * 0.15;
      flame.scale.set(s, 1 + Math.sin(now / 95) * 0.2, s);
    }

    // readouts
    elSpeed.textContent = state.speed.toFixed(2);
    elSpeedBar.style.width = (Math.abs(state.speed) / MAX_V * 100).toFixed(1) + "%";

    // hotspots
    if (labelsOn) {
      for (var i = 0; i < HOTSPOTS.length; i++) {
        var h = HOTSPOTS[i];
        var v = h.p.clone();
        v.applyMatrix4(rover.matrixWorld);
        v.project(camera);
        var vis = v.z < 1;
        hsEls[i].classList.toggle("show", vis);
        hsEls[i].style.left = ((v.x * 0.5 + 0.5) * stage.clientWidth) + "px";
        hsEls[i].style.top = ((-v.y * 0.5 + 0.5) * stage.clientHeight) + "px";
        var lead = hsEls[i].querySelector(".hs-lead");
        var len = Math.sqrt(h.dx * h.dx + h.dy * h.dy);
        lead.style.width = len + "px";
        lead.style.transform = "rotate(" + (Math.atan2(h.dy, h.dx) * 180 / Math.PI) + "deg)";
      }
    } else {
      for (var j = 0; j < hsEls.length; j++) hsEls[j].classList.remove("show");
    }

    controls.update();
    renderer.render(scene, camera);
  }

  resize();
  setCam(true); setLink(true);
  log("Prototype loaded, rover at origin");
  log("Drag to orbit, W A S D to drive");
  requestAnimationFrame(tick);
})();
