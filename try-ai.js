// AQUASCOUT in-browser color-based fire and smoke detector.
// Real, runs entirely on the user's CPU. No upload.

(function () {
  const fileInput = document.getElementById('file-input');
  const dropzone = document.getElementById('dropzone');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const empty = document.getElementById('canvas-empty');
  const result = document.getElementById('result');
  const barFire = document.getElementById('bar-fire');
  const barSmoke = document.getElementById('bar-smoke');
  const pctFire = document.getElementById('pct-fire');
  const pctSmoke = document.getElementById('pct-smoke');
  const verdict = document.getElementById('verdict');
  const resetBtn = document.getElementById('reset-btn');
  const W = 640, H = 480;
  canvas.width = W; canvas.height = H;

  // Procedural sample images so the demo works offline.
  function makeSample(kind) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = kind === 'fire' ? '#1a0e08' : kind === 'smoke' ? '#0a0a0a' : '#cfe1ec';
    g.fillRect(0, 0, W, H);
    if (kind === 'fire') {
      g.fillStyle = '#5a2a0a';
      g.beginPath(); g.ellipse(320, 360, 240, 60, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ff6a1a';
      g.beginPath(); g.ellipse(310, 280, 180, 200, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffba3a';
      g.beginPath(); g.ellipse(300, 240, 110, 150, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff2b0';
      g.beginPath(); g.ellipse(295, 200, 55, 90, 0, 0, Math.PI * 2); g.fill();
    } else if (kind === 'smoke') {
      for (let i = 0; i < 240; i++) {
        const x = 200 + Math.random() * 240;
        const y = 120 + Math.random() * 200;
        const r = 20 + Math.random() * 80;
        const a = 0.08 + Math.random() * 0.18;
        g.fillStyle = `rgba(180,180,185,${a})`;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    } else {
      g.fillStyle = '#9fc1d8';
      g.fillRect(0, 320, W, 160);
      g.fillStyle = '#6f8aa1';
      g.fillRect(0, 300, W, 30);
      g.fillStyle = '#e8e8e8';
      for (let i = 0; i < 5; i++) g.fillRect(60 + i * 110, 200, 60, 100);
      g.fillStyle = '#2a4a66';
      g.fillRect(0, 0, W, 60);
    }
    return c;
  }

  function detect(image) {
    // Draw image to canvas at our standard size
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const ratio = Math.min(W / image.width, H / image.height);
    const dw = image.width * ratio, dh = image.height * ratio;
    const dx = (W - dw) / 2, dy = (H - dh) / 2;
    ctx.drawImage(image, dx, dy, dw, dh);
    const data = ctx.getImageData(0, 0, W, H).data;

    let fireMinX = W, fireMinY = H, fireMaxX = 0, fireMaxY = 0, fireCount = 0;
    let smokeMinX = W, smokeMinY = H, smokeMaxX = 0, smokeMaxY = 0, smokeCount = 0;
    const total = W * H;

    // Pass 1: count + bounding box per class
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // Fire: high R, lower G, much lower B, bright
        if (r > 160 && r > g * 1.25 && r > b * 1.7 && r > 90) {
          fireCount++;
          if (x < fireMinX) fireMinX = x; if (x > fireMaxX) fireMaxX = x;
          if (y < fireMinY) fireMinY = y; if (y > fireMaxY) fireMaxY = y;
        }
        // Smoke: low saturation, mid-bright
        const avg = (r + g + b) / 3;
        const spread = Math.max(r, g, b) - Math.min(r, g, b);
        if (avg > 70 && avg < 230 && spread < 35 && r > g - 15 && r < g + 15 && b > g - 25) {
          smokeCount++;
          if (x < smokeMinX) smokeMinX = x; if (x > smokeMaxX) smokeMaxX = x;
          if (y < smokeMinY) smokeMinY = y; if (y > smokeMaxY) smokeMaxY = y;
        }
      }
    }

    // Pass 2: draw bounding boxes only (no per-pixel overlay, keeps it clean)
    ctx.strokeStyle = 'rgba(0,0,0,0)';
    if (fireCount > 200) {
      const pad = 6;
      ctx.strokeStyle = '#d23f3f';
      ctx.lineWidth = 3;
      ctx.strokeRect(Math.max(0, fireMinX - pad), Math.max(0, fireMinY - pad),
                     (fireMaxX - fireMinX) + pad * 2, (fireMaxY - fireMinY) + pad * 2);
      // Label background
      const label = 'fire';
      ctx.font = '600 14px ui-monospace, "SF Mono", Menlo, monospace';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = '#d23f3f';
      ctx.fillRect(Math.max(0, fireMinX - pad), Math.max(0, fireMinY - pad - 22), tw + 14, 22);
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, Math.max(0, fireMinX - pad) + 7, Math.max(0, fireMinY - pad - 11));
    }
    if (smokeCount > 500) {
      const pad = 6;
      ctx.strokeStyle = '#6b6b6b';
      ctx.lineWidth = 3;
      ctx.strokeRect(Math.max(0, smokeMinX - pad), Math.max(0, smokeMinY - pad),
                     (smokeMaxX - smokeMinX) + pad * 2, (smokeMaxY - smokeMinY) + pad * 2);
      const label = 'smoke';
      ctx.font = '600 14px ui-monospace, "SF Mono", Menlo, monospace';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = '#6b6b6b';
      ctx.fillRect(Math.max(0, smokeMinX - pad), Math.max(0, smokeMinY - pad - 22), tw + 14, 22);
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, Math.max(0, smokeMinX - pad) + 7, Math.max(0, smokeMinY - pad - 11));
    }

    const firePct = (fireCount / total) * 100;
    const smokePct = (smokeCount / total) * 100;

    // Update UI
    barFire.style.width = Math.min(100, firePct * 4).toFixed(1) + '%';
    barSmoke.style.width = Math.min(100, smokePct * 2).toFixed(1) + '%';
    pctFire.textContent = firePct.toFixed(1) + '%';
    pctSmoke.textContent = smokePct.toFixed(1) + '%';
    result.hidden = false;
    resetBtn.hidden = false;

    if (firePct > 1.5) {
      verdict.textContent = 'ALERT: possible fire region';
      verdict.className = 'result-verdict bad';
    } else if (smokePct > 8) {
      verdict.textContent = 'ALERT: possible smoke region';
      verdict.className = 'result-verdict warn';
    } else {
      verdict.textContent = 'No fire or smoke detected';
      verdict.className = 'result-verdict ok';
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    empty.style.display = 'none';
    detect(img);
    URL.revokeObjectURL(url);
  }

  fileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  });

  // Drag and drop
  ;['dragenter', 'dragover'].forEach(ev => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragging');
    });
  });
  ;['dragleave', 'drop'].forEach(ev => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragging');
    });
  });
  dropzone.addEventListener('drop', (e) => {
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFile(f);
  });

  // Sample buttons
  document.getElementById('sample-fire').addEventListener('click', () => {
    empty.style.display = 'none';
    detect(makeSample('fire'));
  });
  document.getElementById('sample-smoke').addEventListener('click', () => {
    empty.style.display = 'none';
    detect(makeSample('smoke'));
  });
  document.getElementById('sample-none').addEventListener('click', () => {
    empty.style.display = 'none';
    detect(makeSample('none'));
  });
  resetBtn.addEventListener('click', () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    empty.style.display = 'flex';
    result.hidden = true;
    resetBtn.hidden = true;
    fileInput.value = '';
  });
})();
