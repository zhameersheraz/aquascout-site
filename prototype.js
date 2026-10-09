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
    batt:    mat(0x232C33,  { rough: 0.7,  metal: 0.15 }),
    wire:    mat(0x39454E,  { rough: 0.55, metal: 0.05 }),
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

  /* ---------- rover ----------
     Matches the LAFVIN 2WD Smart Robot Car V2.0 kit: a two-layer black
     acrylic sandwich on yellow standoffs, two driven wheels at the rear,
     one swivel caster at the front. Built by us on top of that: the mast,
     two ESP32-CAM heads, the water tank, pump and nozzle.                */

  var rover = new THREE.Group();
  scene.add(rover);

  var BASE_Y = 0.46, DECK_Y = 0.70, STANDBY = 0.24;

  // lower acrylic plate
  box(3.05, 0.07, 1.95, M.plate, 0, BASE_Y, 0, rover);
  // upper acrylic plate, slightly inset, held clear on standoffs
  box(2.72, 0.07, 1.70, M.plate, 0, DECK_Y, 0, rover);
  // yellow standoffs between the plates
  (function () {
    var sx = 1.22, sz = 0.74;
    for (var a = -1; a <= 1; a += 2) {
      for (var b = -1; b <= 1; b += 2) {
        cyl(0.045, 0.045, STANDBY, M.hub,
          a * sx, BASE_Y + STANDBY / 2 + 0.035, b * sz, rover, 10);
      }
    }
  })();
  // front and rear bumper rails
  box(3.05, 0.10, 0.10, M.plateLt, 0, BASE_Y + 0.06, 0.99, rover);
  box(3.05, 0.10, 0.10, M.plateLt, 0, BASE_Y + 0.06, -0.99, rover);

  /* Wheels: two driven at the rear, one caster at the front. */
  var wheels = [];
  var WR = 0.40, WZ = 1.00, WX = 1.02;

  function driveWheel(x, z, side) {
    var g = new THREE.Group();
    g.position.set(x, WR, z);

    // tyre
    var tyre = cyl(WR, WR, 0.30, M.rubber, 0, 0, 0, g, 30);
    tyre.rotation.z = Math.PI / 2;
    // dished hub, recessed so the tyre reads as the outer edge
    var hub = cyl(WR * 0.54, WR * 0.54, 0.32, M.hub, 0, 0, 0, g, 20);
    hub.rotation.z = Math.PI / 2;
    // a single spoke, enough to read rotation without becoming a fan of bars
    box(0.33, WR * 1.16, 0.07, M.plateLt, 0, 0, 0, g);
    // gear-motor can + bracket, inboard
    var can = cyl(0.12, 0.12, 0.24, M.hub, -side * 0.22, 0.02, 0, g, 14);
    can.rotation.z = Math.PI / 2;
    box(0.045, 0.30, 0.18, M.plateLt, -side * 0.33, 0, 0, g);   // NEMA bracket

    rover.add(g);
    wheels.push({ g: g, side: side, spin: 0 });
  }
  driveWheel(-WX, WZ, 1);
  driveWheel(-WX, -WZ, -1);

  /* Front swivel caster, exactly like the kit. */
  var caster = new THREE.Group();
  caster.position.set(WX, 0.30, 0);
  box(0.10, 0.26, 0.10, M.plateLt, 0, 0.13, 0, caster);          // strut
  var ball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 14), M.hub);
  ball.position.set(0, -0.04, 0);
  ball.castShadow = true;
  caster.add(ball);
  var ballYoke = new THREE.Group();
  ballYoke.add(caster);
  ballYoke.position.set(WX, 0.30, 0);
  caster.position.set(0, 0, 0);
  rover.add(ballYoke);

  /* ---------- electronics on the upper plate ---------- */

  // 4xAA battery holder across the back
  var batt = box(0.62, 0.26, 0.30, M.batt, 0.72, DECK_Y + 0.18, -0.52, rover);
  for (var c = 0; c < 4; c++) {
    cyl(0.055, 0.055, 0.27, M.plateLt,
      0.50 + c * 0.145, DECK_Y + 0.18, -0.52, rover, 12);
  }

  // motor driver board, the big one with the heatsink
  box(0.70, 0.10, 0.56, M.board, -0.86, DECK_Y + 0.09, 0.18, rover);
  box(0.34, 0.05, 0.20, M.hub, -0.86, DECK_Y + 0.17, 0.18, rover);   // heatsink
  cyl(0.04, 0.04, 0.06, M.sensor, -0.62, DECK_Y + 0.18, 0.18, rover, 10);  // trim pot

  // Arduino UNO
  box(0.68, 0.06, 0.54, M.dark, -0.10, DECK_Y + 0.08, 0.10, rover);
  box(0.50, 0.03, 0.15, M.hub, -0.10, DECK_Y + 0.12, 0.18, rover);   // USB-B

  // JDY-16 BLE module with its antenna whip
  box(0.32, 0.05, 0.26, M.plateLt, -0.10, DECK_Y + 0.13, -0.52, rover);
  cyl(0.022, 0.022, 0.34, M.sensor, 0.02, DECK_Y + 0.28, -0.52, rover, 8);

  // IR receiver for the LAFVIN handset
  box(0.14, 0.05, 0.10, M.dark, 0.36, DECK_Y + 0.08, 0.52, rover);
  for (var ir = 0; ir < 3; ir++) {
    cyl(0.018, 0.018, 0.04, M.sensor,
      0.31 + ir * 0.05, DECK_Y + 0.12, 0.52, rover, 8);
  }

  // HC-SR04 on a front bracket
  var sonic = new THREE.Group();
  sonic.position.set(1.24, DECK_Y + 0.10, 0);
  box(0.07, 0.16, 0.24, M.plateLt, 0, 0.08, 0, sonic);          // bracket
  box(0.14, 0.12, 0.23, M.dark, 0.08, 0.14, 0, sonic);
  cyl(0.055, 0.055, 0.05, M.sensor, 0.08, 0.21, -0.055, sonic, 14);
  cyl(0.055, 0.055, 0.05, M.sensor, 0.08, 0.21, 0.055, sonic, 14);
  rover.add(sonic);

  /* ---------- wiring harness ---------- */
  function wire(pts, r) {
    var curve = new THREE.CatmullRomCurve3(pts.map(function (p) {
      return new THREE.Vector3(p[0], p[1], p[2]);
    }));
    var g = new THREE.TubeGeometry(curve, 24, r || 0.018, 6, false);
    var m = new THREE.Mesh(g, M.wire);
    m.castShadow = true;
    rover.add(m);
    return m;
  }
  wire([[-0.86, DECK_Y + 0.14, 0.18], [-0.55, DECK_Y + 0.20, 0.30],
        [-0.10, DECK_Y + 0.14, 0.16], [0.40, DECK_Y + 0.20, 0.30]]);   // driver to UNO
  wire([[-0.10, DECK_Y + 0.14, -0.52], [0.20, DECK_Y + 0.22, -0.30],
        [0.72, DECK_Y + 0.22, -0.46]], 0.016);                          // UNO to battery
  wire([[1.24, DECK_Y + 0.16, 0], [0.90, DECK_Y + 0.26, 0.24],
        [0.20, DECK_Y + 0.16, 0.10]], 0.015);                            // servo to UNO

  // mast + two ESP32-CAM heads
  var mast = cyl(0.05, 0.05, 1.02, M.plateLt, 0, DECK_Y + 0.51, 0, rover, 12);
  box(0.54, 0.05, 0.05, M.plateLt, 0, 1.70, 0, rover);         // crossbar

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

  // water tank + pump + nozzle, on the upper plate
  var tank = cyl(0.24, 0.24, 0.42, M.tank, 0.90, DECK_Y + 0.24, 0.10, rover, 24);
  cyl(0.09, 0.09, 0.09, M.sensor, 0.90, DECK_Y + 0.49, 0.10, rover, 14);   // cap
  var pump = box(0.28, 0.20, 0.24, M.dark, 0.90, DECK_Y + 0.13, -0.42, rover);
  // hose from the tank down to the pump
  var hose = cyl(0.045, 0.045, 0.34, M.wire, 0.90, DECK_Y + 0.13, -0.18, rover, 10);
  hose.rotation.x = Math.PI / 2;
  // feed line running forward to the nozzle
  cyl(0.035, 0.035, 1.05, M.wire, 1.22, DECK_Y + 0.10, 0, rover, 10).rotation.z = Math.PI / 2;

  var nozzle = new THREE.Group();
  nozzle.position.set(1.40, DECK_Y + 0.06, 0);
  var nz = cyl(0.045, 0.085, 0.24, M.plateLt, 0.10, -0.04, 0, nozzle, 14);
  nz.rotation.z = -Math.PI / 2;
  rover.add(nozzle);

  // water jet
  var jetGeo = new THREE.ConeGeometry(0.15, 1.4, 18, 1, true);
  jetGeo.rotateZ(-Math.PI / 2);
  jetGeo.translate(0.70, -0.04, 0);
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

  // A smouldering plume over the same drum. It is faint by design: the app's
  // honest caveat is that smoke is the easier of the two classes to score, so a
  // scene with only a hard fire would flatter the detector.
  var smoke = new THREE.Mesh(
    new THREE.ConeGeometry(0.26, 1.05, 10, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x6E7C86, transparent: true, opacity: 0.10,
      depthWrite: false, side: THREE.DoubleSide
    })
  );
  smoke.position.set(2.7, 1.28, 0);
  scene.add(smoke);

  /* ---------- hotspots ----------
     Each anchor carries a screen-space offset. Without them the chips stack
     on top of each other, because the parts of a rover are physically close.  */
  // Deck parts sit within a small screen area, so their labels are laid out as
  // two vertical columns well clear of the model, connected by leader lines.
  var HOTSPOTS = [
    { p: new THREE.Vector3(0, 1.70, 0.30),   t: "ESP32-CAM, front", dx: -30,  dy: -52 },
    { p: new THREE.Vector3(0, 1.70, -0.30),  t: "ESP32-CAM, rear",  dx: 30,   dy: -52 },
    { p: new THREE.Vector3(-0.86, DECK_Y + 0.14, 0.18),  t: "Motor driver", dx: -150, dy: -74 },
    { p: new THREE.Vector3(-0.10, DECK_Y + 0.16, -0.52), t: "JDY-16 BLE", dx: -152, dy: -34 },
    { p: new THREE.Vector3(-0.10, DECK_Y + 0.12, 0.10),  t: "Arduino UNO", dx: -150, dy: 6 },
    { p: new THREE.Vector3(-WX, WR, WZ), t: "Drive wheels", dx: -148, dy: 46 },
    { p: new THREE.Vector3(1.24, DECK_Y + 0.24, 0),      t: "HC-SR04",     dx: 152,  dy: -104 },
    { p: new THREE.Vector3(0.90, DECK_Y + 0.40, 0.10),   t: "Water tank",  dx: 154,  dy: -48 },
    { p: new THREE.Vector3(0.72, DECK_Y + 0.30, -0.52),  t: "4xAA holder", dx: 152,  dy: 8 },
    { p: new THREE.Vector3(0.90, DECK_Y + 0.14, -0.42),  t: "Pump",        dx: 150,  dy: 64 },
    { p: new THREE.Vector3(WX, 0.30, 0), t: "Front caster", dx: 60, dy: 88 }
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
    vL: 0, vR: 0,
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

  /* ---------- the alert itself ----------
     Shared by the panel button and the phone's hold button, so both raise the
     same event instead of drifting apart. */
  function raiseAlert() {
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
  }

  btnAlarm.addEventListener("click", raiseAlert);

  btnReset.addEventListener("click", function () {
    keys = {};
    state.x = 0; state.z = 0; state.heading = 0; state.speed = 0; state.dist = 0; state.alarm = false;
    state.vL = 0; state.vR = 0;
    wheels.forEach(function (w) { w.spin = 0; w.g.rotation.x = 0; });
    ballYoke.rotation.y = 0;
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

  // Both the side panel and the phone use the same canonical key codes, so the
  // two control surfaces are literally the same input path.
  var dpBtns = Array.prototype.slice.call(document.querySelectorAll(".dp, .pd"));
  dpBtns.forEach(function (b) {
    // Go through the same MAP the keyboard uses. The buttons carry the
    // readable key letter, but the drive model reads the canonical name,
    // so translating here keeps both input paths identical.
    var code = MAP[b.dataset.key];
    if (!code) return;
    var on = function (e) { e.preventDefault(); keys[code] = true; syncDpad(); };
    var off = function (e) { e.preventDefault(); keys[code] = false; syncDpad(); };
    b.addEventListener("pointerdown", on);
    b.addEventListener("pointerup", off);
    b.addEventListener("pointerleave", off);
    b.addEventListener("pointercancel", off);
  });
  function syncDpad() {
    dpBtns.forEach(function (b) {
      var code = MAP[b.dataset.key];
      b.classList.toggle("on", !!(code && keys[code]));
    });
  }

  /* ---------- the phone ----------
     The screen is a second viewport into the SAME scene, cut out of the main
     canvas with the scissor test. So the feed moves when the rover turns, and
     the detection box is projected from the real plume position rather than
     animated by hand. A recorded video or a CSS mock could not do either. */

  var phone    = document.getElementById("phone");
  var phScreen = document.getElementById("phoneScreen");
  var phDet    = document.getElementById("phDet");
  var phDetBox = null;
  var phTime   = document.getElementById("phTime");
  var phHud    = document.getElementById("phHud");
  var phLiveTxt= document.getElementById("phLiveTxt");
  var phGps    = document.getElementById("phGpsChip");
  var phLinkChip = document.getElementById("phLinkChip");
  var phHold   = document.getElementById("phHold");
  var phHoldFill= document.getElementById("phHoldFill");
  var phPump   = document.getElementById("phPump");
  var phoneOn  = true;

  // The mast camera. Local +X is the nose, so rotating -90 about Y points the
  // camera's -Z down the rover's nose. A small negative X tilt drops it onto
  // the drum sitting 2.7 m ahead.
  var camCam = new THREE.PerspectiveCamera(62, 4 / 3, 0.05, 90);
  camCam.rotation.x = -0.13;
  var camMount = new THREE.Object3D();
  camMount.position.set(0.10, 1.70, 0.30);
  camMount.rotation.y = -Math.PI / 2;
  camMount.add(camCam);
  rover.add(camMount);

  // The mast camera must not see its own chassis. Everything outside the rover
  // gets layer 1; the phone renders only layer 1, the orbit camera only layer 0.
  (function () {
    var insideRover = [];
    rover.traverse(function (o) { insideRover.push(o); });
    scene.traverse(function (o) {
      if (insideRover.indexOf(o) === -1) o.layers.enable(1);
    });
    camCam.layers.set(1);
  })();

  // The plume is a sensor-view element, not scenery. Left in the orbit camera
  // it sat as a grey cone across the product shot, so it gets its own layer:
  // the mast camera sees it, the orbit camera does not. The detection box then
  // still wraps a real, moving 3D target.
  smoke.layers.set(2);
  camCam.layers.enable(2);

  // Hold-to-alert, the same 1500 ms the app uses.
  var HOLD_MS = 1500;
  var holdT0 = 0, holdTimer = null;
  function holdStart(e) {
    if (e) e.preventDefault();
    if (holdTimer) return;
    holdT0 = performance.now();
    phHold.classList.add("pressing");
    holdTimer = setInterval(function () {
      var p = Math.min(1, (performance.now() - holdT0) / HOLD_MS);
      phHoldFill.style.width = (p * 100).toFixed(0) + "%";
      if (p >= 1) {
        holdEnd();
        phHold.classList.add("done");
        setTimeout(function () {
          phHold.classList.remove("done");
          phHoldFill.style.width = "0%";
        }, 900);
        raiseAlert();
      }
    }, 33);
  }
  function holdEnd() {
    if (!holdTimer) return;
    clearInterval(holdTimer);
    holdTimer = null;
    phHold.classList.remove("pressing");
    phHoldFill.style.width = "0%";
  }
  phHold.addEventListener("pointerdown", holdStart);
  phHold.addEventListener("pointerup", holdEnd);
  phHold.addEventListener("pointerleave", holdEnd);
  phHold.addEventListener("pointercancel", holdEnd);

  phPump.addEventListener("click", function () {
    setPump(!state.pump);
    // Set here too, not only in the loop, so the button is correct on the
    // same tick as the tap rather than one frame later.
    phPump.setAttribute("aria-pressed", state.pump ? "true" : "false");
  });

  document.getElementById("phoneToggle").addEventListener("change", function (e) {
    phoneOn = e.target.checked;
    phone.hidden = !phoneOn;
  });

  /* ---------- moving the phone ----------
     The phone sits over the canvas because the viewfinder is a scissored
     region of it, so it cannot live in the sidebar. That made its position
     fixed and wrong for anyone whose screen or taste does not match the
     default corner, so it drags. Position is remembered per browser. */

  var PHONE_POS_KEY = "aquascout.phone.pos";
  var dragging = null;

  function clampToStage(x, y) {
    var pw = phone.offsetWidth, ph = phone.offsetHeight;
    return {
      x: Math.max(6, Math.min(x, stage.clientWidth - pw - 6)),
      y: Math.max(6, Math.min(y, stage.clientHeight - ph - 6))
    };
  }
  function setPhonePos(x, y, save) {
    var p = clampToStage(x, y);
    phone.style.left = p.x + "px";
    phone.style.top = p.y + "px";
    if (save) {
      try { localStorage.setItem(PHONE_POS_KEY, p.x + "," + p.y); } catch (e) {}
    }
    return p;
  }
  function reClampPhone() {
    if (phone.hidden || !phone.style.left) return;
    setPhonePos(parseFloat(phone.style.left), parseFloat(phone.style.top), false);
  }
  function resetPhonePos() {
    try { localStorage.removeItem(PHONE_POS_KEY); } catch (e) {}
    phone.style.left = "";
    phone.style.top = "";
  }

  // Grab anywhere that is not a control, so the hold button and D-pad keep
  // working while the chrome around them moves the phone.
  phone.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button, input, label, a, select")) return;
    var r = phone.getBoundingClientRect();
    var s = stage.getBoundingClientRect();
    dragging = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    try { phone.setPointerCapture(e.pointerId); } catch (err) {}
    phone.classList.add("dragging");
    e.preventDefault();
  });
  phone.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var s = stage.getBoundingClientRect();
    setPhonePos(e.clientX - dragging.dx - s.left, e.clientY - dragging.dy - s.top, false);
    e.preventDefault();
  });
  function endDrag() {
    if (!dragging) return;
    dragging = null;
    phone.classList.remove("dragging");
    try {
      localStorage.setItem(PHONE_POS_KEY,
        phone.style.left.replace("px", "") + "," + phone.style.top.replace("px", ""));
    } catch (e) {}
  }
  phone.addEventListener("pointerup", endDrag);
  phone.addEventListener("pointercancel", endDrag);
  phone.addEventListener("dblclick", resetPhonePos);

  // restore last position
  try {
    var saved = localStorage.getItem(PHONE_POS_KEY);
    if (saved) {
      var a = saved.split(",");
      setPhonePos(parseFloat(a[0]), parseFloat(a[1]), false);
    }
  } catch (e) {}

  var _wp = new THREE.Vector3(), _pp = new THREE.Vector3();
  var _ep = new THREE.Vector3(), _rt = new THREE.Vector3(), _q = new THREE.Quaternion();

  function updatePhoneDet() {
    smoke.getWorldPosition(_wp);
    _pp.copy(_wp).project(camCam);
    var r = phScreen.getBoundingClientRect();

    // Half-size in screen pixels, measured by projecting a point one radius to
    // the camera's right and one to its up. Scale-aware, so the box shrinks as
    // the rover recedes. Measuring only the right vector silently produced a
    // zero-height box, because that vector has no vertical component at all.
    var q = camCam.getWorldQuaternion(_q);
    _ep.copy(_wp).add(_rt.set(1, 0, 0).applyQuaternion(q).multiplyScalar(0.20)).project(camCam);
    var hx = Math.abs(_ep.x - _pp.x) * 0.5 * r.width;
    _ep.copy(_wp).add(_rt.set(0, 1, 0).applyQuaternion(q).multiplyScalar(0.50)).project(camCam);
    var hy = Math.abs(_ep.y - _pp.y) * 0.5 * r.height;

    var cx = (_pp.x * 0.5 + 0.5) * r.width;
    var cy = (-_pp.y * 0.5 + 0.5) * r.height;

    var visible = _pp.z < 1 && cx > -40 && cx < r.width + 40 && cy > -40 && cy < r.height + 40;
    phDet.classList.toggle("on", visible);
    if (!visible) return;

    if (!phDetBox) {
      phDetBox = document.createElement("span");
      phDetBox.className = "ph-det-box";
      phDet.appendChild(phDetBox);
    }
    phDetBox.style.left = (cx - hx) + "px";
    phDetBox.style.top = (cy - hy) + "px";
    phDetBox.style.width = (hx * 2) + "px";
    phDetBox.style.height = (hy * 2) + "px";
    document.getElementById("phDetTag").textContent =
      state.alarm ? "FIRE 0.92" : "SMOKE 0.71";
  }

  function renderPhone() {
    if (!phoneOn || phone.hidden) return;
    var r = phScreen.getBoundingClientRect();
    var c = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;

    camCam.aspect = r.width / r.height;
    camCam.updateProjectionMatrix();

    var x = r.left - c.left;
    var y = c.bottom - r.bottom;      // WebGL origin is bottom-left
    renderer.setViewport(x, y, r.width, r.height);
    renderer.setScissor(x, y, r.width, r.height);
    renderer.setScissorTest(true);
    renderer.render(scene, camCam);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, c.width, c.height);   // restore for the next frame
  }

  /* ---------- resize ---------- */
  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    reClampPhone();   // a saved position can sit outside a shrunken stage
  }
  window.addEventListener("resize", resize);

  /* ---------- loop ---------- */
  var MAX_V   = 1.5;     // m/s at full throttle
  var MAX_W   = 3.0;     // rad/s wheel speed
  var WHEEL_R = WR;      // 0.40
  var TRACK   = WZ * 2;  // 2.0 m between the driven wheels
  var ACCEL   = 2.6;
  var DRAG    = 2.4;

  // Differential drive, same model as a real two-wheel chassis:
  //   v = (vR + vL) / 2      forward speed
  //   w = (vR - vL) / track  turn rate
  // Steering mixes into throttle rather than adding a separate spin, which is
  // what made the old build read like a hovercraft: the body turned but all
  // four wheels kept the same speed.
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

    var throttle = (keys.f ? 1 : 0) - (keys.r ? 1 : 0);
    var steer    = (keys.rr ? 1 : 0) - (keys.l ? 1 : 0);

    if (state.link) {
      // Wanted wheel speeds.
      // steer is +1 for a right turn. A right turn must run the RIGHT (outside)
      // wheel faster, so the outside term is added to vR.
      var wantL = throttle * MAX_W - steer * MAX_W * 0.85;
      var wantR = throttle * MAX_W + steer * MAX_W * 0.85;

      // motor response: spin up, then roll off drag
      state.vL += (wantL - state.vL) * Math.min(1, ACCEL * dt);
      state.vR += (wantR - state.vR) * Math.min(1, ACCEL * dt);
      state.vL -= state.vL * DRAG * dt * 0.35;
      state.vR -= state.vR * DRAG * dt * 0.35;
      if (Math.abs(state.vL) < 0.01) state.vL = 0;
      if (Math.abs(state.vR) < 0.01) state.vR = 0;

      // clamp so a hard turn cannot exceed full throttle
      var cap = MAX_W * 1.35;
      state.vL = Math.max(-cap, Math.min(cap, state.vL));
      state.vR = Math.max(-cap, Math.min(cap, state.vR));
    } else {
      state.vL = 0; state.vR = 0;
    }

    // Body motion derived from the two wheels.
    //
    // Frame note: the chassis is built with its length along local X (nose at
    // +X, right side at +Z). Three.js maps local +X to world (cos h, 0, -sin h),
    // so forward is (cos h, 0, -sin h) and a positive rotation.y swings the nose
    // toward -Z, which is the rover's LEFT. A right turn therefore has to
    // decrease heading, hence the negation on omega.
    var v = (state.vR + state.vL) / 2 / WHEEL_R;         // m/s
    var omega = (state.vR - state.vL) / TRACK;          // rad/s
    v = Math.max(-MAX_V * 0.6, Math.min(MAX_V, v));
    state.speed = v;
    state.heading -= omega * dt;

    state.x += Math.cos(state.heading) * v * dt;
    state.z += -Math.sin(state.heading) * v * dt;

    // keep it on the bench
    var lim = 6.2;
    if (Math.abs(state.x) > lim) { state.x = Math.sign(state.x) * lim; state.vL = state.vR = 0; }
    if (Math.abs(state.z) > lim) { state.z = Math.sign(state.z) * lim; state.vL = state.vR = 0; }

    rover.position.set(state.x, 0, state.z);
    rover.rotation.y = state.heading;

    // each wheel turns at its own rate
    for (var w = 0; w < wheels.length; w++) {
      var wh = wheels[w];
      var rate = wh.side > 0 ? state.vR : state.vL;
      wh.spin -= (rate / WHEEL_R) * dt;
      wh.g.rotation.x = wh.spin;
    }

    // the caster swivels to follow the body, trailing slightly
    ballYoke.rotation.y = omega * 0.12;

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

    // smoke plume over the drum
    var wantSm = state.alarm ? 0.20 : 0.075;
    smoke.material.opacity += (wantSm - smoke.material.opacity) * Math.min(1, dt * 4);
    if (!REDUCED) {
      smoke.scale.set(
        1 + Math.sin(now / 900) * 0.09,
        1 + Math.sin(now / 1300) * 0.14,
        1 + Math.cos(now / 1050) * 0.09
      );
      smoke.rotation.y += dt * 0.12;
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
        var el = hsEls[i];
        el.classList.toggle("show", vis);
        el.style.left = ((v.x * 0.5 + 0.5) * stage.clientWidth) + "px";
        el.style.top = ((-v.y * 0.5 + 0.5) * stage.clientHeight) + "px";

        // Leader runs from the anchor to the chip.
        var h2 = HOTSPOTS[i];
        var len = Math.sqrt(h2.dx * h2.dx + h2.dy * h2.dy);
        var lead = el.querySelector(".hs-lead");
        lead.style.width = len + "px";
        lead.style.transform = "rotate(" + (Math.atan2(h2.dy, h2.dx) * 180 / Math.PI) + "deg";

        // Chip sits at the END of the leader and grows away from the model,
        // so the left column extends left and the right column extends right.
        var chip = el.querySelector(".hs-chip");
        if (h2.dx < 0) {
          chip.style.left = "auto";
          chip.style.right = (-h2.dx) + "px";
        } else {
          chip.style.right = "auto";
          chip.style.left = h2.dx + "px";
        }
        chip.style.top = (h2.dy - 9) + "px";
      }
    } else {
      for (var j = 0; j < hsEls.length; j++) hsEls[j].classList.remove("show");
    }

    controls.update();
    renderer.render(scene, camera);

    // phone overlay: second pass, cut out of the same canvas
    phone.classList.toggle("scanning", !state.alarm);
    phone.classList.toggle("armed", state.link && !state.alarm);
    phone.classList.toggle("alert", state.alarm);
    if (phoneOn && !phone.hidden) {
      phHud.textContent = state.alarm ? "FIRE" : (state.cam ? "SCANNING" : "CAMERA OFF");
      phLiveTxt.textContent = state.alarm ? "ALERT SENT" : (state.link ? "ARMED" : "NO LINK");
      phLinkChip.textContent = state.link ? "BLE LINK" : "BLE LOST";
      phLinkChip.classList.toggle("warn", !state.link);
      phGps.textContent = "GPS 7.31, 123.39";
      phPump.setAttribute("aria-pressed", state.pump ? "true" : "false");
      var t = new Date();
      phTime.textContent = ("0" + t.getHours()).slice(-2) + ":" + ("0" + t.getMinutes()).slice(-2);
      updatePhoneDet();
      renderPhone();
    }
  }

  resize();
  setCam(true); setLink(true);
  log("Prototype loaded, rover at origin");
  log("Drag to orbit, W A S D to drive");
  requestAnimationFrame(tick);
})();
