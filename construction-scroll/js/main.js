/* =========================================================
   CONFIG — the only block you normally need to edit.
   See README.md ("Replace the frames").
   ========================================================= */
const CONFIG = {
  // Total number of images in /frames (frame_001.webp … frame_120.webp)
  frameCount: 225,

  // Landscape frames (desktop, tablets in landscape)
  desktopPath: 'frames/',
  // Portrait frames for phones. Set to null if you only have one set.
  mobilePath: 'frames/mobile/',
  // Screens narrower than this ratio (width / height) use the mobile set
  mobileMaxAspect: 0.9,

  // File name for image number i (1-based)
  fileName: (i) => `frame_${String(i).padStart(3, '0')}.webp`,

  // Change this (2, 3, …) every time you replace the frames after launch,
  // so returning visitors don't see old cached images.
  version: '3',

  // First frame of each of the 7 stages (1-based). Must be increasing.
  // 1 Foundation, 2 Framing, 3 Roof, 4 Exterior, 5 Entrance, 6 Interior, 7 Pool
  stageStartFrames: [1, 21, 49, 73, 105, 160, 187],

  // Smoothing of the scroll in seconds (0 = instant, 1 = very soft).
  // Keep it low so the picture follows the hand: higher values feel like a video catching up.
  scrub: 0.4,
  // Cross-fade between two neighbouring frames. Only turn on if consecutive
  // frames are very similar (e.g. extracted from a slow video at 24+ fps),
  // otherwise you get a "double image" effect during fast camera moves.
  blendFrames: true,

  // Which part of the image stays visible when the screen crops it (0–1)
  focusX: 0.5,
  focusY: 0.5,

  maxDevicePixelRatio: 2,
  // Start the site anyway after this delay, even if some frames are still loading
  loaderTimeoutMs: 20000,
};

/* ========================================================= */

(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const N = CONFIG.frameCount;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const debug = /[?&]debug\b/.test(location.search);

  const canvas = $('#frames');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loader = $('#loader');
  const loaderPct = $('#loaderPct');
  const loaderBar = $('#loaderBar');
  const nav = $('#nav');
  const progressFill = $('#progressFill');
  const progressItems = $$('#progressList li');
  const scrollHint = $('#scrollHint');
  const chapters = $$('.chapter');

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- stage positions (0–1 of the scroll) ---------------- */
  const starts = CONFIG.stageStartFrames.map((f) => (f - 1) / (N - 1));
  const ends = starts.slice(1).concat(1);
  const lastStage = starts.length - 1;

  /* ---------------- frame set ---------------- */
  const isPortrait = window.innerWidth / window.innerHeight < CONFIG.mobileMaxAspect;
  const basePath = isPortrait && CONFIG.mobilePath ? CONFIG.mobilePath : CONFIG.desktopPath;
  const frameUrl = (i) =>
    basePath + CONFIG.fileName(i + 1) + (CONFIG.version ? `?v=${encodeURIComponent(CONFIG.version)}` : '');

  const images = new Array(N);
  const ready = new Uint8Array(N);
  let settled = 0;

  // Load order: first frame, then the first frame of every stage, then the rest
  const order = [];
  const seen = new Set();
  const push = (i) => { if (i >= 0 && i < N && !seen.has(i)) { seen.add(i); order.push(i); } };
  push(0);
  CONFIG.stageStartFrames.forEach((f) => push(f - 1));
  for (let i = 0; i < N; i++) push(i);

  function loadFrame(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        const done = () => { images[i] = img; ready[i] = 1; resolve(); };
        if (img.decode) img.decode().then(done, done); else done();
      };
      img.onerror = () => {
        if (debug) console.warn('[frames] missing:', frameUrl(i));
        resolve();
      };
      img.src = frameUrl(i);
    });
  }

  function preload(onProgress) {
    return new Promise((resolve) => {
      let next = 0;
      const CONCURRENCY = 8;
      const worker = () => {
        if (next >= order.length) return Promise.resolve();
        const i = order[next++];
        return loadFrame(i).then(() => {
          settled++;
          onProgress(settled / N, i);
          return worker();
        });
      };
      Promise.all(Array.from({ length: CONCURRENCY }, worker)).then(resolve);
    });
  }

  /* ---------------- canvas drawing ---------------- */
  const state = { frame: 0 };
  let lastDrawn = -1;
  let rafId = 0;
  let activeStage = 0;

  /* debug overlay: add ?debug to the URL to see the frame number */
  let debugEl = null;
  if (debug) {
    debugEl = document.createElement('div');
    debugEl.className = 'debug';
    document.body.appendChild(debugEl);
  }

  function nearestReady(i) {
    if (ready[i]) return i;
    for (let d = 1; d < N; d++) {
      if (i - d >= 0 && ready[i - d]) return i - d;
      if (i + d < N && ready[i + d]) return i + d;
    }
    return -1;
  }

  function drawCover(img, alpha) {
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = cw / scale, sh = ch / scale;
    const sx = (iw - sw) * CONFIG.focusX;
    const sy = (ih - sh) * CONFIG.focusY;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }

  function draw() {
    rafId = 0;
    if (!canvas.width) return;
    const f = Math.max(0, Math.min(N - 1, state.frame));
    const key = CONFIG.blendFrames ? Math.round(f * 50) / 50 : Math.round(f);
    if (key === lastDrawn) return;

    const a = nearestReady(CONFIG.blendFrames ? Math.floor(f) : Math.round(f));
    if (a < 0) return;
    drawCover(images[a], 1);

    if (CONFIG.blendFrames) {
      const frac = f - Math.floor(f);
      const b = Math.min(N - 1, Math.floor(f) + 1);
      if (frac > 0.02 && ready[b] && b !== a) drawCover(images[b], frac);
      ctx.globalAlpha = 1;
    }
    lastDrawn = key;
    if (debugEl) debugEl.textContent = `frame ${Math.round(f) + 1}/${N} · stage ${activeStage + 1} · ${basePath}`;
  }

  function requestDraw() {
    if (!rafId) rafId = requestAnimationFrame(draw);
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDevicePixelRatio);
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (w && h && (w !== canvas.width || h !== canvas.height)) {
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      lastDrawn = -1;
      draw();
    }
  }

  if ('ResizeObserver' in window) new ResizeObserver(resizeCanvas).observe(canvas);
  else window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  /* ---------------- progress UI ---------------- */
  function updateProgressUI(p) {
    progressFill.style.transform = `scaleY(${p.toFixed(4)})`;
    let s = 0;
    for (let i = 0; i < starts.length; i++) if (p >= starts[i] - 1e-4) s = i;
    if (s !== activeStage || !progressItems[s].classList.contains('is-active')) {
      activeStage = s;
      progressItems.forEach((li, i) => {
        li.classList.toggle('is-active', i === s);
        li.classList.toggle('is-done', i < s);
        const btn = li.querySelector('button');
        if (i === s) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
      });
    }
    if (scrollHint) scrollHint.classList.toggle('is-hidden', p > 0.01);
  }

  /* ---------------- scroll timeline (GSAP) ---------------- */
  let storyTrigger = null;

  function initScroll() {
    if (!window.gsap || !window.ScrollTrigger) {
      // Fallback: GSAP failed to load — show first frame and all text
      chapters.forEach((c) => { c.style.position = 'relative'; c.style.opacity = 1; c.style.visibility = 'visible'; });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.story',
        start: 'top top',
        end: 'bottom bottom',
        scrub: reduceMotion ? true : CONFIG.scrub,
        invalidateOnRefresh: true,
      },
    });
    storyTrigger = tl.scrollTrigger;

    // 1) Frames: linear over the whole story (timeline length = 1)
    tl.to(state, {
      frame: N - 1,
      duration: 1,
      onUpdate() {
        requestDraw();
        updateProgressUI(state.frame / (N - 1));
      },
    }, 0);

    // 2) Text: each chapter fades in at the start of its stage, out at the end
    const lift = reduceMotion ? 0 : 36;
    gsap.set(chapters, { autoAlpha: 1 });
    chapters.forEach((el, i) => {
      const parts = Array.from(el.children);
      const a = starts[i], b = ends[i], L = b - a;
      if (i > 0) {
        tl.fromTo(parts,
          { autoAlpha: 0, y: lift },
          { autoAlpha: 1, y: 0, duration: L * 0.2, stagger: L * 0.035, ease: 'power2.out' },
          a + L * 0.05);
      }
      if (i < lastStage) {
        tl.fromTo(parts,
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: -lift * 0.7, duration: L * 0.15, stagger: L * 0.02, ease: 'power2.in', immediateRender: false },
          b - L * 0.3);
      }
    });

    // Nav gets a background once the story is over
    ScrollTrigger.create({
      trigger: '.story',
      start: 'bottom 80px',
      onEnter: () => nav.classList.add('is-solid'),
      onLeaveBack: () => nav.classList.remove('is-solid'),
    });

    // Side progress: click a stage to jump to it
    progressItems.forEach((li) => {
      const btn = li.querySelector('button');
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.goto);
        const L = ends[i] - starts[i];
        const p = i === 0 ? 0 : Math.min(1, starts[i] + L * 0.42);
        const st = storyTrigger;
        const y = st.start + (st.end - st.start) * p;
        window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    updateProgressUI(0);
  }

  /* ---------------- mobile menu ---------------- */
  const toggle = $('#navToggle');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('#navLinks a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------------- boot ---------------- */
  let started = false;
  function start() {
    if (started) return;
    started = true;
    loader.classList.add('is-done');
    loader.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-loading');
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    requestDraw();
  }

  initScroll();

  const timeout = setTimeout(start, CONFIG.loaderTimeoutMs);
  preload((ratio, i) => {
    const pct = Math.round(ratio * 100);
    loaderPct.textContent = pct;
    loaderBar.style.transform = `scaleX(${ratio})`;
    // draw as soon as the frame currently needed is available
    if (Math.abs(i - state.frame) < 2 || lastDrawn === -1) { lastDrawn = -1; requestDraw(); }
  }).then(() => {
    clearTimeout(timeout);
    if (!ready.some(Boolean)) console.warn('[frames] no frame could be loaded from', basePath);
    setTimeout(start, 250);
  });
})();
