// Clifford strange attractor:
//   x' = sin(a*y) + c*cos(a*x)
//   y' = sin(b*x) + d*cos(b*y)
// Small changes to a/b/c/d produce wildly different shapes — that's the point.
// cfg.drift optionally walks a param over time via sin(t * rate) * depth so the
// shape keeps morphing instead of settling into one static figure.

function attractor(id, cfg) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  const PXW = cfg.pxW ?? cfg.px ?? 200;
  const PXH = cfg.pxH ?? cfg.px ?? 200;
  const buf = Object.assign(document.createElement("canvas"), { width: PXW, height: PXH });
  const bx = buf.getContext("2d");
  const ctx = canvas.getContext("2d");
  const INTERVAL = 1000 / (cfg.fps ?? 30);

  const video = cfg.video;
  let grainData = null, grainCtx = null;
  if (cfg.grain) {
    const grainCanvas = Object.assign(document.createElement("canvas"), { width: PXW, height: PXH });
    grainCtx = grainCanvas.getContext("2d");
    grainData = grainCtx.createImageData(PXW, PXH);
  }

  let x = 0.1, y = 0.1, t = 0, visible = true, last = 0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (canvas.width === Math.floor(r.width) && canvas.height === Math.floor(r.height)) return;
    canvas.width = Math.floor(r.width);
    canvas.height = Math.floor(r.height);
    ctx.imageSmoothingEnabled = false;
  }

  function drawScanlines() {
    const rowH = Math.max(1, Math.floor(canvas.height / PXH));
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#000";
    for (let row = 0; row < canvas.height; row += rowH * 2) ctx.fillRect(0, row + rowH, canvas.width, rowH);
    ctx.restore();
  }

  function withDrift(base, key) {
    const d = cfg.drift?.[key];
    return d ? base + Math.sin(t * d.rate) * d.depth : base;
  }

  function paintGrain() {
    const amt = cfg.grain.amount ?? 40;
    const d = grainData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 2 * amt;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    grainCtx.putImageData(grainData, 0, 0);
    bx.save();
    bx.globalAlpha = cfg.grain.alpha ?? 0.18;
    bx.globalCompositeOperation = "overlay";
    bx.drawImage(grainCtx.canvas, 0, 0);
    bx.restore();
  }

  function draw(ts) {
    requestAnimationFrame(draw);
    if (!visible || document.hidden || ts - last < INTERVAL) return;
    last = ts;
    resize();
    if (!canvas.width || !canvas.height) return;

    if (video && video.readyState >= 2) {
      bx.drawImage(video, 0, 0, PXW, PXH);
    } else {
      bx.fillStyle = `rgba(0,0,0,${cfg.fade ?? 1})`;
      bx.fillRect(0, 0, PXW, PXH);
    }

    if (cfg.iterations) {
      const a = withDrift(cfg.a, "a");
      const b = withDrift(cfg.b, "b");
      const c = withDrift(cfg.c, "c");
      const d = withDrift(cfg.d, "d");
      const scale = cfg.scale ?? Math.min(PXW, PXH) / 5;
      const cx = PXW / 2, cy = PXH / 2;
      const sparkleEvery = cfg.sparkleEvery ?? 37;

      for (let i = 0; i < cfg.iterations; i++) {
        const nx = Math.sin(a * y) + c * Math.cos(a * x);
        const ny = Math.sin(b * x) + d * Math.cos(b * y);
        x = nx;
        y = ny;
        const px = Math.round(cx + x * scale);
        const py = Math.round(cy + y * scale);
        if (px < 0 || px >= PXW || py < 0 || py >= PXH) continue;
        bx.fillStyle = i % sparkleEvery === 0 ? cfg.colors[1] : cfg.colors[0];
        bx.fillRect(px, py, 1, 1);
      }
    }

    if (cfg.grain) paintGrain();

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, PXW, PXH, 0, 0, canvas.width, canvas.height);
    drawScanlines();
    t += cfg.speed ?? 0.01;
  }

  new IntersectionObserver((e) => {
    visible = e[0].isIntersecting;
    if (video) (visible ? video.play() : video.pause());
  }, { threshold: 0.1 }).observe(canvas);
  window.addEventListener("resize", resize, { passive: true });
  bx.fillStyle = "#000";
  bx.fillRect(0, 0, PXW, PXH);
  requestAnimationFrame(draw);
}

attractor("hero-attractor", {
  pxW: 320, pxH: 240,
  video: document.getElementById("hero-video"),
  grain: { amount: 28, alpha: 0.16 },
  a: -1.4, b: 0.9, c: 3.0, d: 0.7,
  iterations: 200,
  scale: 40,
  colors: ["#646262", "#fdfcfc"],
  sparkleEvery: 41,
  speed: 8.004,
  drift: {
    c: { rate: 1.06, depth: 9.35 },
    d: { rate: 0.045, depth: 7.3 },
  },
});
