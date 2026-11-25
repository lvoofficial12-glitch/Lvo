/* Esthétique Auto Gagnon — maquette LVO : animations et interactions */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const root = document.documentElement;
  const page = document.body.dataset.page;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const isMobile = () => matchMedia('(max-width: 760px)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger) && !calm;
  const LVO = window.LVO = { ready: [] };

  /* ---------- titres découpés en mots ---------- */
  const splitNode = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (!w.trim()) { frag.appendChild(document.createTextNode(' ')); return; }
          const o = document.createElement('span'); o.className = 'w';
          const i = document.createElement('span'); i.className = 'wi'; i.textContent = w;
          o.appendChild(i); frag.appendChild(o);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') splitNode(n);
    });
  };
  $$('[data-split]').forEach(el => { el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim()); splitNode(el); $$('.w', el).forEach(w => w.setAttribute('aria-hidden', 'true')); });

  /* ---------- prix ---------- */
  const PRICES = {
    eclat: { berline: 220, vus: 240, pickup: 260, minivan: 280, moto: 99 },
    renaissance: { berline: 399, vus: 419, pickup: 439, minivan: 459, moto: 179 },
    ultime: { berline: 400 }
  };
  const VEH = { berline: 'Berline', vus: 'VUS', pickup: 'Pick-up', minivan: 'Mini-van / VUS 7 places', moto: 'Moto' };
  const PK = { eclat: 'Éclat', renaissance: 'Renaissance', ultime: 'Protection ultime' };
  const pkName = (pk, v) => (v === 'moto' && pk === 'eclat') ? 'Lavage classique' : (v === 'moto' && pk === 'ultime' ? 'Polissage & céramique' : PK[pk]);
  const money = n => n.toLocaleString('fr-CA') + ' $';
  function calc(form) {
    const v = (form.querySelector('[name=veh]:checked') || {}).value || 'berline';
    const pk = (form.querySelector('[name=pk]:checked') || {}).value || 'renaissance';
    const moto = v === 'moto';
    form.querySelectorAll('.car-only').forEach(l => { l.classList.toggle('off', moto); if (moto) l.querySelector('input').checked = false; });
    const base = (PRICES[pk] || {})[v];
    const quote = base == null;
    let from = pk === 'ultime', extras = 0;
    const lines = [[`${pkName(pk, v)} · ${VEH[v]}`, quote ? 'sur devis' : (from ? 'dès ' : '') + money(base)]];
    const ex = [];
    form.querySelectorAll('[name=ex]:checked').forEach(i => {
      const p = +i.dataset.price; extras += p; ex.push(i.value);
      if (i.dataset.from === '1') from = true;
      lines.push([i.closest('label').querySelector('b').textContent, (i.dataset.from === '1' ? 'dès ' : '+') + money(p)]);
    });
    form.querySelectorAll('[data-pk]').forEach(e => {
      const b = (PRICES[e.dataset.pk] || {})[v];
      e.textContent = b == null ? 'sur devis' : (e.dataset.pk === 'ultime' ? 'dès ' : '') + money(b);
    });
    return { v, pk, base, quote, from, extras, total: (base || 0) + extras, lines, ex };
  }
  LVO.calc = calc;

  /* ---------- sécurité : sans GSAP ou mouvement réduit ---------- */
  let lenis = null;
  if (!hasGsap) {
    root.classList.add('no-anim');
    const it = $('#intro'); it && it.remove();
    $$('[data-count]').forEach(e => e.textContent = e.dataset.dec ? (+e.dataset.count).toFixed(1).replace('.', ',') : e.dataset.count);
  } else {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(500, 33);
      LVO.lenis = lenis;
    }
  }
  const scrollToEl = (el, off = -90) => lenis ? lenis.scrollTo(el, { offset: off, duration: 1.2 }) : el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });

  /* ---------- en-tête, menu, progression ---------- */
  const header = $('.site-header');
  let lastY = 0;
  const onScroll = y => {
    header.classList.toggle('solid', y > 40);
    header.classList.toggle('hide', y > lastY && y > 300 && !document.body.classList.contains('nav-open'));
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    const pr = $('.progress'); if (pr) pr.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  if (lenis) lenis.on('scroll', e => onScroll(e.scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  const burger = $('.burger');
  const setNav = open => {
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (lenis) open ? lenis.stop() : lenis.start();
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger && burger.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setNav(false); });
  $$('.mnav a').forEach(a => a.addEventListener('click', () => setNav(false)));
  matchMedia('(min-width: 1061px)').addEventListener('change', e => { if (e.matches) setNav(false); });

  /* ---------- rideau entre les pages ---------- */
  const curtain = $('.curtain');
  const internal = a => a.host === location.host && /\.html$|\/$/.test(a.pathname) && !a.target && !a.hasAttribute('download') && !(a.pathname === location.pathname && a.hash);
  if (hasGsap && curtain) {
    gsap.set(curtain, { y: 0, yPercent: 100 });
    let fromNav = false;
    try { fromNav = sessionStorage.getItem('eag-nav') === '1'; sessionStorage.removeItem('eag-nav'); } catch (e) {}
    if (fromNav) {
      gsap.set(curtain, { yPercent: 0 });
      gsap.to(curtain, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.1, onComplete: () => gsap.set(curtain, { yPercent: 100 }) });
    }
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !internal(a)) return;
      e.preventDefault();
      try { sessionStorage.setItem('eag-nav', '1'); } catch (err) {}
      setTimeout(() => { location.href = a.href; }, 1100);
      gsap.timeline()
        .fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' })
        .to($('span', curtain), { opacity: 1, duration: 0.3 }, '-=.25')
        .add(() => { location.href = a.href; });
    });
    addEventListener('pageshow', e => { if (e.persisted) { gsap.set(curtain, { yPercent: 100 }); gsap.set($('span', curtain), { opacity: 0 }); } });
  }

  /* ---------- curseur et boutons magnétiques ---------- */
  if (fine && hasGsap) {
    document.body.classList.add('has-cur');
    const cur = document.createElement('div'); cur.className = 'cur hidden'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="cur-ring"><em></em></div><div class="cur-dot"></div>';
    document.body.appendChild(cur);
    const ring = $('.cur-ring', cur), dot = $('.cur-dot', cur), em = $('em', cur);
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    addEventListener('pointermove', e => { cur.classList.remove('hidden'); gsap.set(dot, { x: e.clientX, y: e.clientY }); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('pointerleave', () => cur.classList.add('hidden'));
    document.addEventListener('pointerover', e => {
      const l = e.target.closest('[data-cursor]');
      const a = e.target.closest('a,button,label,input[type=range],select');
      cur.classList.toggle('is-label', !!l); em.textContent = l ? l.dataset.cursor : '';
      cur.classList.toggle('is-link', !l && !!a);
    });
    $$('[data-magnetic]').forEach(b => {
      const mx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), my = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.25); my((e.clientY - r.top - r.height / 2) * 0.35); });
      b.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* ---------- son d'ambiance (généré dans le navigateur) ---------- */
  const snd = $('.sound');
  let actx = null, master = null, water = null, engine = null, soundOn = false;
  function buildAudio() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    actx = new AC(); master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 170; lp.Q.value = 3; lp.connect(master);
    engine = actx.createGain(); engine.gain.value = 0.42; engine.connect(lp);
    [[34, .5], [51, .26], [68, .14]].forEach(([f, g]) => { const o = actx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const gg = actx.createGain(); gg.gain.value = g; o.connect(gg).connect(engine); o.start(); });
    const lfo = actx.createOscillator(); lfo.frequency.value = 6.5; const lg = actx.createGain(); lg.gain.value = 0.14; lfo.connect(lg).connect(engine.gain); lfo.start();
    const buf = actx.createBuffer(1, actx.sampleRate * 2, actx.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const n = actx.createBufferSource(); n.buffer = buf; n.loop = true;
    const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.6;
    water = actx.createGain(); water.gain.value = 0.015; n.connect(bp).connect(water).connect(master); n.start();
    return true;
  }
  LVO.setWater = v => { if (water && actx) water.gain.setTargetAtTime(0.015 + v * 0.12, actx.currentTime, 0.2); };
  snd && snd.addEventListener('click', () => {
    if (!actx && !buildAudio()) return;
    soundOn = !soundOn; actx.resume();
    master.gain.setTargetAtTime(soundOn ? 0.2 : 0, actx.currentTime, 0.4);
    snd.setAttribute('aria-pressed', soundOn); snd.setAttribute('aria-label', soundOn ? 'Couper le son d’ambiance' : 'Activer le son d’ambiance');
    $('.lbl', snd).textContent = soundOn ? 'COUPER' : 'SON';
  });
  document.addEventListener('visibilitychange', () => { if (actx && soundOn) document.hidden ? actx.suspend() : actx.resume(); });

  /* ---------- intro : les phares s'allument ---------- */
  function runIntro(done) {
    const el = $('#intro');
    if (!el || !hasGsap) { done(); return; }
    try { sessionStorage.setItem('eag-intro', '1'); } catch (e) {}
    lenis && lenis.stop();
    const tl = gsap.timeline({ onComplete: () => { el.remove(); lenis && lenis.start(); } });
    tl.to('#intro .eye', { opacity: 1, duration: 0.06, repeat: 5, yoyo: true, ease: 'none' }, 0.35)
      .set('#intro .eye', { opacity: 1 })
      .to('#intro .flash', { opacity: 0.7, duration: 0.18, yoyo: true, repeat: 1 })
      .to('#intro .beam', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '<')
      .fromTo('#intro .brand', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '<+.1')
      .add(done, '+=.45')
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.05, ease: 'expo.inOut' }, '<');
    setTimeout(() => { if (document.body.contains(el)) { tl.progress(1); } }, 6000);
  }

  /* ---------- animations communes ---------- */
  function splitAnim(el, delay = 0, now = false) {
    const words = $$('.wi', el);
    const cfg = { yPercent: 115, rotateX: -75, opacity: 0, duration: 1.15, ease: 'expo.out', stagger: 0.06, delay };
    if (now) gsap.from(words, cfg);
    else gsap.from(words, { ...cfg, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  }
  function commonAnims(skipHero) {
    if (!hasGsap) return;
    $$('[data-split]').forEach(el => { if (skipHero && el.classList.contains('hero-title')) return; splitAnim(el, 0, el.closest('.phero') != null); });
    $$('.phero [data-reveal]').forEach((el, i) => gsap.from(el, { y: 30, opacity: 0, duration: 1, delay: 0.35 + i * 0.1, ease: 'power3.out' }));
    ScrollTrigger.batch($$('[data-reveal]').filter(e => !e.closest('.phero')), {
      start: 'top 90%', once: true,
      onEnter: els => gsap.fromTo(els, { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true })
    });
    $$('[data-reveal]').filter(e => !e.closest('.phero')).forEach(e => { if (e.getBoundingClientRect().top > innerHeight * 0.9) gsap.set(e, { opacity: 0 }); });
    $$('[data-count]').forEach(e => {
      const end = +e.dataset.count, dec = e.dataset.dec ? 1 : 0, o = { v: 0 };
      const fmt = v => dec ? v.toFixed(1).replace('.', ',') : Math.round(v).toString();
      e.textContent = fmt(0);
      gsap.to(o, { v: end, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 92%', once: true }, onUpdate: () => e.textContent = fmt(o.v) });
    });
    $$('img[data-parallax]').forEach(img => gsap.fromTo(img, { yPercent: -9 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('.reveal-img').forEach(el => {
      gsap.set(el, { '--x': 0 });
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    $$('.cta-end').forEach(s => gsap.fromTo($$('.ring', s), { scale: 0.4, opacity: 0 }, { scale: (i) => [1, 0.8, 0.6][i], opacity: 1, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: s, start: 'top bottom', end: 'center center', scrub: true } }));
    if (fine) $$('[data-tilt]').forEach(c => {
      const rx = gsap.quickTo(c, 'rotationX', { duration: 0.6, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(c, { transformPerspective: 1100 });
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; ry((x - 0.5) * 9); rx((0.5 - y) * 9); c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%'); });
      c.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ================= ACCUEIL ================= */
  function home() {
    const hero = $('#hero'); if (!hero) return;
    const canvas = $('#car');
    let car = null;
    const fail = () => hero.classList.add('no-gl');
    if (window.GagnonCar) { try { car = window.GagnonCar.init(canvas, { mobile: isMobile(), model: 'car.glb', onError: fail }); } catch (e) { car = null; } }
    if (!car) fail();
    LVO.car = car;
    const steps = $$('.hero-step');
    const heroProgress = p => {
      car && car.setProgress(p);
      steps.forEach((s, k) => { const f = clamp(p * 3 - k); $('.bar i', s).style.transform = `scaleX(${f})`; s.classList.toggle('on', p * 3 >= k - 0.02); });
    };
    if (hasGsap) {
      ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom bottom', onUpdate: s => heroProgress(s.progress) });
      gsap.to('.hero-c', { opacity: 0, y: -70, ease: 'none', scrollTrigger: { trigger: hero, start: () => `top+=${innerHeight * 0.25} top`, end: () => `top+=${innerHeight * 0.85} top`, scrub: true } });
      gsap.to('.scroll-hint', { opacity: 0, scrollTrigger: { trigger: hero, start: 'top top', end: '+=200', scrub: true } });
    } else {
      const upd = () => { const r = hero.getBoundingClientRect(); heroProgress(clamp(-r.top / (r.height - innerHeight))); };
      addEventListener('scroll', upd, { passive: true }); upd();
    }
    if (car && fine) addEventListener('pointermove', e => car.setPointer(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
    heroProgress(0);
    washSection();
    motoFan();
    if (hasGsap) gsap.from('.plan', { y: 90, rotationX: 22, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, transformOrigin: '50% 100%', scrollTrigger: { trigger: '.plans', start: 'top 85%', once: true } });
  }
  function heroIn() {
    if (LVO.car) LVO.car.lightsOn();
    if (!hasGsap) return;
    const t = $('.hero-title'); if (t) splitAnim(t, 0.05, true);
    gsap.from('.hero .hp', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.25 });
    gsap.from('.hero-steps', { y: 20, opacity: 0, duration: 1, delay: 0.7 });
  }

  /* lavage au défilement */
  function washSection() {
    const sec = $('#lavage'); if (!sec) return;
    const stage = $('.wash-stage', sec), dirty = $('.wash-dirty', sec), gc = $('.wash-dirty canvas', sec), fx = $('.wash-fx', sec);
    const steps = $$('.wash-steps li', sec), pct = $('.wash-pct', sec), doneEl = $('.wash-done', sec), shine = $('.wash-shine', sec);
    let W = 0, H = 0, dpr = 1, last = 0, finished = false, bubbles = [], drops = [];
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    function grime() {
      const r = stage.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, 1.5);
      [gc, fx].forEach(c => { c.width = W * dpr; c.height = H * dpr; });
      const g = gc.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      seed = 7;
      g.fillStyle = 'rgba(86,70,48,.28)'; g.fillRect(0, 0, W, H);
      const gr = g.createLinearGradient(0, H * 0.35, 0, H); gr.addColorStop(0, 'rgba(70,54,34,0)'); gr.addColorStop(1, 'rgba(58,43,26,.78)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const n = Math.round(W * H / 260);
      for (let i = 0; i < n; i++) { const x = rnd() * W, y = rnd() * H, s = rnd() * 2.2 + 0.4; g.fillStyle = `rgba(${130 + rnd() * 40 | 0},${108 + rnd() * 30 | 0},${76 + rnd() * 20 | 0},${rnd() * 0.35})`; g.fillRect(x, y, s, s); }
      for (let i = 0; i < 70; i++) { const x = rnd() * W, y = H * 0.45 + rnd() * H * 0.55, r2 = rnd() * 26 + 4; const rg = g.createRadialGradient(x, y, 0, x, y, r2); rg.addColorStop(0, 'rgba(62,46,28,.7)'); rg.addColorStop(1, 'rgba(62,46,28,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, r2, 0, 6.3); g.fill(); }
      g.strokeStyle = 'rgba(150,128,96,.18)'; g.lineCap = 'round';
      for (let i = 0; i < 90; i++) { const x = rnd() * W, y = rnd() * H * 0.7, l = rnd() * 90 + 20; g.lineWidth = rnd() * 3 + 1; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + rnd() * 6 - 3, y + l * 0.3, x + rnd() * 8 - 4, y + l * 0.7, x + rnd() * 4 - 2, y + l); g.stroke(); }
      bubbles = []; for (let i = 0; i < (isMobile() ? 90 : 170); i++) bubbles.push({ y: rnd() * H, r: rnd() * 9 + 2, off: rnd() * 70, a: rnd() * 0.6 + 0.3, w: rnd() * 6.3 });
      drops = []; for (let i = 0; i < 70; i++) drops.push({ y: rnd() * H, d: rnd() * 60 + 10, r: rnd() * 1.8 + 0.6, w: rnd() * 6.3 });
      render(last, true);
    }
    const wave = (y, p) => Math.sin(y * 0.011 + p * 9) * 26 + Math.sin(y * 0.033 + 1.7) * 10;
    function render(p, force) {
      if (!W) return;
      if (!force && Math.abs(p - last) < 0.0005) return;
      last = p;
      const edge = -90 + p * (W + 200);
      const pts = [];
      for (let k = 0; k <= 24; k++) { const y = H * k / 24; pts.push(`${(edge + wave(y, p)).toFixed(1)}px ${y.toFixed(1)}px`); }
      dirty.style.clipPath = `polygon(${pts.join(',')},${W + 2}px ${H + 2}px,${W + 2}px -2px)`;
      dirty.style.visibility = p >= 0.999 ? 'hidden' : 'visible';
      const g = fx.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      if (p > 0.001 && p < 0.999) {
        const t = p * 40;
        for (const b of bubbles) {
          const x = edge + wave(b.y, p) - b.off + Math.sin(t + b.w) * 3;
          const al = b.a * (1 - b.off / 80);
          g.beginPath(); g.arc(x, b.y + Math.cos(t * 0.7 + b.w) * 2, b.r, 0, 6.3);
          g.fillStyle = `rgba(255,255,255,${al * 0.55})`; g.fill();
          g.lineWidth = 1; g.strokeStyle = `rgba(255,255,255,${al})`; g.stroke();
        }
        for (const d of drops) {
          const x = edge + wave(d.y, p) + d.d * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.5 + d.w)));
          g.beginPath(); g.arc(x, d.y, d.r, 0, 6.3); g.fillStyle = 'rgba(220,235,255,.7)'; g.fill();
        }
        const lg = g.createLinearGradient(edge - 40, 0, edge + 40, 0);
        lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,.18)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = lg; g.fillRect(edge - 40, 0, 80, H);
      }
      const idx = Math.min(3, Math.floor(p * 4));
      steps.forEach((s, k) => s.classList.toggle('on', k === idx));
      pct.textContent = Math.round(p * 100);
      LVO.setWater && LVO.setWater(p > 0.01 && p < 0.99 ? 1 : 0);
      if (p >= 0.999 && !finished) {
        finished = true;
        if (hasGsap) { gsap.to(doneEl, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }); gsap.fromTo(shine, { xPercent: -120 }, { xPercent: 120, duration: 1.6, ease: 'power2.inOut' }); }
        else doneEl.style.opacity = 1;
      } else if (p < 0.97 && finished) {
        finished = false; if (hasGsap) gsap.to(doneEl, { opacity: 0, y: 20, duration: 0.4 });
      }
    }
    grime();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(grime, 150); });
    const map = prog => clamp((prog - 0.06) / 0.8);
    if (hasGsap) ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: s => render(map(s.progress)) });
    else if (calm) render(1, true);
    else { const upd = () => { const r = sec.getBoundingClientRect(); render(map(clamp(-r.top / (r.height - innerHeight)))); }; addEventListener('scroll', upd, { passive: true }); upd(); }
  }

  function motoFan() {
    const figs = $$('.moto-fan figure'); if (figs.length < 3) return;
    if (!hasGsap) { const pos = [[-48, -8, 18], [0, 0, 0], [48, 8, -18]]; figs.forEach((f, i) => f.style.transform = `translateX(${pos[i][0]}%) rotate(${pos[i][1]}deg) rotateY(${pos[i][2]}deg)`); return; }
    const mm = gsap.matchMedia();
    mm.add({ big: '(min-width: 901px)', small: '(max-width: 900px)' }, ctx => {
      const s = ctx.conditions.small ? 0.62 : 1;
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.moto-fan', start: 'top 85%', end: 'center 45%', scrub: 1 } });
      tl.fromTo(figs[0], { xPercent: 0, rotation: 0, rotationY: 0, z: -60 }, { xPercent: -62 * s, rotation: -8, rotationY: 22, z: -40, ease: 'none' }, 0)
        .fromTo(figs[1], { z: -30, yPercent: 0 }, { z: 70, yPercent: -4, ease: 'none' }, 0)
        .fromTo(figs[2], { xPercent: 0, rotation: 0, rotationY: 0, z: -60 }, { xPercent: 62 * s, rotation: 8, rotationY: -22, z: -40, ease: 'none' }, 0);
      gsap.set(figs[1], { zIndex: 2 });
    });
  }

  /* ================= FORFAITS ================= */
  function odometer(el, value) {
    const str = String(value);
    if (el.dataset.len !== String(str.length)) {
      el.innerHTML = str.split('').map(() => '<span class="d"><i>' + '0123456789'.split('').map(n => `<span>${n}</span>`).join('') + '</i></span>').join('');
      el.dataset.len = str.length;
      void el.offsetWidth;
    }
    $$('.d i', el).forEach((col, k) => col.style.transform = `translateY(-${+str[k]}em)`);
  }
  function forfaits() {
    const form = $('#cfg'); if (!form) return;
    const sum = $('.summary'), lines = $('.lines', sum), odo = $('.odo', sum), pre = $('.pre', sum), curS = $('.total .cur-s', sum), go = $('#cfg-go'), sr = $('.total-sr', sum);
    const qs = new URLSearchParams(location.search);
    if (qs.get('v')) { const i = form.querySelector(`[name=veh][value="${qs.get('v')}"]`); i && (i.checked = true); }
    if (qs.get('f')) { const i = form.querySelector(`[name=pk][value="${qs.get('f')}"]`); i && (i.checked = true); }
    let devis = null;
    const fab = $('.fab .btn'); let fabTxt = null;
    if (fab) {
      fab.setAttribute('href', '#resume');
      fabTxt = document.createElement('span'); fab.firstChild.replaceWith(fabTxt);
      fab.addEventListener('click', e => { e.preventDefault(); scrollToEl(sum, -90); });
    }
    const upd = (anim = true) => {
      const r = calc(form);
      lines.innerHTML = r.lines.map(([a, b]) => `<li><span>${a}</span><span>${b}</span></li>`).join('');
      if (r.quote) {
        odo.style.display = 'none'; curS.style.display = 'none';
        if (!devis) { devis = document.createElement('span'); devis.className = 'devis'; odo.after(devis); }
        devis.style.display = ''; devis.textContent = 'Sur devis';
        pre.textContent = r.extras ? `+ ${money(r.extras)} d’extras` : '';
        sr.textContent = 'Sur devis';
      } else {
        odo.style.display = ''; curS.style.display = ''; if (devis) devis.style.display = 'none';
        pre.textContent = r.from ? 'dès' : '';
        odometer(odo, r.total);
        sr.textContent = (r.from ? 'À partir de ' : '') + money(r.total);
      }
      if (fab) { fabTxt.textContent = r.quote ? 'Estimation : sur devis' : `Total : ${r.from ? 'dès ' : ''}${money(r.total)}`; }
      const p = new URLSearchParams({ v: r.v, f: r.pk }); if (r.ex.length) p.set('x', r.ex.join(','));
      go.href = 'reserver.html?' + p.toString();
      if (anim && hasGsap) gsap.fromTo($('.shine', sum), { xPercent: -100 }, { xPercent: 100, duration: 1, ease: 'power2.out' });
    };
    form.addEventListener('change', () => upd());
    upd(false);
    if (location.hash === '#config') setTimeout(() => scrollToEl($('#config'), -80), 400);
  }

  /* ================= RÉALISATIONS ================= */
  function realisations() {
    $$('[data-ba]').forEach(b => {
      const inp = $('input', b);
      b.dataset.cursor = 'Glisser';
      const set = v => b.style.setProperty('--p', v + '%');
      inp.addEventListener('input', () => set(inp.value));
      if (hasGsap) {
        const o = { v: 50 };
        gsap.timeline({ scrollTrigger: { trigger: b, start: 'top 75%', once: true } })
          .to(o, { v: 22, duration: 0.9, ease: 'power2.inOut', onUpdate: () => { if (!b.dataset.touched) set(o.v); } })
          .to(o, { v: 76, duration: 1.1, ease: 'power2.inOut', onUpdate: () => { if (!b.dataset.touched) set(o.v); } })
          .to(o, { v: 50, duration: 0.8, ease: 'power2.inOut', onUpdate: () => { if (!b.dataset.touched) { set(o.v); inp.value = Math.round(o.v); } } });
        inp.addEventListener('pointerdown', () => b.dataset.touched = 1);
        inp.addEventListener('keydown', () => b.dataset.touched = 1);
      }
    });
    const btns = $$('.filters button'), figs = $$('.gal figure');
    figs.forEach(f => f.dataset.cursor = 'Voir');
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-pressed', x === b));
      const f = b.dataset.f;
      figs.forEach(g => g.classList.toggle('hide', f !== 'all' && g.dataset.cat !== f));
      if (hasGsap) { gsap.fromTo(figs.filter(g => !g.classList.contains('hide')), { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05 }); ScrollTrigger.refresh(); }
    }));
    if (hasGsap) {
      figs.forEach(f => { if (f.getBoundingClientRect().top > innerHeight * 0.92) gsap.set(f, { opacity: 0 }); });
      ScrollTrigger.batch(figs, { start: 'top 94%', once: true, onEnter: els => gsap.fromTo(els, { opacity: 0, y: 60, rotationX: 14, transformPerspective: 900 }, { opacity: 1, y: 0, rotationX: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, overwrite: true }) });
      const tl = $('.tl-fill'); tl && gsap.to(tl, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 60%', scrub: true } });
    }
  }

  /* ================= ZONE ================= */
  function zone() {
    const map = $('[data-map]');
    if (map && hasGsap) {
      const riv = $$('.river, .river-line', map);
      riv.forEach(p => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
      const tl = gsap.timeline({ scrollTrigger: { trigger: map, start: 'top 75%', once: true } });
      tl.from($$('.bank', map), { opacity: 0, duration: 0.8, stagger: 0.15 })
        .to(riv, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.2)
        .from($('.label', map), { opacity: 0, duration: 0.6 }, '-=.4')
        .from($('.radius', map), { scale: 0, transformOrigin: '50% 50%', opacity: 0, duration: 1.2, ease: 'expo.out' }, '-=.6')
        .from($$('[data-d]', map), { opacity: 0, scale: 0, transformOrigin: '0% 50%', duration: 0.6, ease: 'back.out(2)', stagger: 0.08 }, '-=.9')
        .from($('.pin', map), { y: -60, opacity: 0, duration: 0.8, ease: 'bounce.out' }, '-=.5');
    }
    $$('.qa').forEach(q => {
      const b = $('button', q), a = $('.ans', q);
      b.addEventListener('click', () => {
        const open = !q.classList.contains('open');
        q.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
        if (open) { a.style.height = a.scrollHeight + 'px'; const end = () => { if (q.classList.contains('open')) a.style.height = 'auto'; a.removeEventListener('transitionend', end); }; a.addEventListener('transitionend', end); }
        else { a.style.height = a.scrollHeight + 'px'; requestAnimationFrame(() => requestAnimationFrame(() => { a.style.height = '0px'; })); }
        setTimeout(() => hasGsap && ScrollTrigger.refresh(), 550);
      });
    });
  }

  /* ================= RÉSERVER ================= */
  function reserver() {
    const form = $('#book'); if (!form) return;
    const steps = $$('.fstep', form), prog = $$('.fprog span'), back = $('.back', form), next = $('.next', form), done = $('.done', form), est = $('.est');
    const nextHTML = next.innerHTML;
    let cur = 0;
    const qs = new URLSearchParams(location.search);
    if (qs.get('v')) { const i = form.querySelector(`[name=veh][value="${qs.get('v')}"]`); i && (i.checked = true); }
    if (qs.get('f')) { const i = form.querySelector(`[name=pk][value="${qs.get('f')}"]`); i && (i.checked = true); }
    (qs.get('x') || '').split(',').filter(Boolean).forEach(x => { const i = form.querySelector(`[name=ex][value="${x}"]`); i && (i.checked = true); });
    const date = $('#date');
    const d0 = new Date(); d0.setDate(d0.getDate() + 1);
    const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    date.min = iso(d0);
    const adr = $('.adr', form);
    const updEst = () => {
      const r = calc(form);
      est.textContent = r.quote ? 'sur devis' + (r.extras ? ` + ${money(r.extras)}` : '') : (r.from ? 'dès ' : '') + money(r.total);
      adr.hidden = (form.querySelector('[name=lieu]:checked') || {}).value !== 'domicile';
    };
    form.addEventListener('change', updEst); updEst();
    const field = el => el.closest('.field');
    const err = (el, bad) => { field(el).classList.toggle('err', bad); return bad; };
    function valid(i) {
      let bad = false;
      if (i === 2) {
        const v = date.value; const d = v ? new Date(v + 'T12:00:00') : null;
        bad = err(date, !d || v < date.min || d.getDay() === 0) || bad;
        if (!adr.hidden) bad = err($('#adresse'), $('#adresse').value.trim().length < 5) || bad;
      }
      if (i === 3) {
        bad = err($('#nom'), $('#nom').value.trim().length < 2) || bad;
        bad = err($('#tel'), $('#tel').value.replace(/\D/g, '').length < 10) || bad;
        bad = err($('#courriel'), !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('#courriel').value.trim())) || bad;
      }
      if (bad) { const f = form.querySelector('.field.err input, .field.err select'); f && f.focus(); }
      return !bad;
    }
    form.addEventListener('input', e => { const f = e.target.closest('.field'); f && f.classList.remove('err'); });
    function show(i) {
      cur = i;
      steps.forEach((s, k) => s.classList.toggle('on', k === i));
      prog.forEach((p, k) => p.classList.toggle('on', k <= i));
      back.classList.toggle('show', i > 0);
      next.innerHTML = i === 3 ? 'Envoyer ma demande ' + nextHTML.slice(nextHTML.indexOf('<svg')) : nextHTML;
      const r = form.closest('.form').getBoundingClientRect();
      if (r.top < 60 || r.top > innerHeight * 0.6) scrollToEl(form.closest('.form'), -100);
      const first = steps[i].querySelector('input:not([type=radio]):not([type=checkbox])');
      if (first && fine) setTimeout(() => first.focus({ preventScroll: true }), 350);
    }
    back.addEventListener('click', () => show(Math.max(0, cur - 1)));
    next.addEventListener('click', () => {
      if (!valid(cur)) return;
      if (cur < 3) return show(cur + 1);
      submit();
    });
    form.addEventListener('submit', e => { e.preventDefault(); next.click(); });
    form.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') { e.preventDefault(); next.click(); } });
    function submit() {
      const r = calc(form);
      const lieu = form.querySelector('[name=lieu]:checked').value;
      const body = [
        'Bonjour Jean-Thomas,', '', 'Voici ma demande de prix :', '',
        `Véhicule : ${VEH[r.v]}${$('#modele').value.trim() ? ' (' + $('#modele').value.trim() + ')' : ''}`,
        ...r.lines.map(([a, b]) => `- ${a} : ${b}`),
        `Estimation : ${est.textContent}`, '',
        `Lieu : ${lieu === 'domicile' ? 'chez moi, ' + $('#adresse').value.trim() : 'à l’atelier de Lévis'}`,
        `Date souhaitée : ${date.value} (${$('#moment').value.toLowerCase()})`, '',
        `Nom : ${$('#nom').value.trim()}`, `Téléphone : ${$('#tel').value.trim()}`, `Courriel : ${$('#courriel').value.trim()}`,
        $('#msg').value.trim() ? `\nMessage : ${$('#msg').value.trim()}` : ''
      ].join('\n');
      const href = `mailto:info@esthetiqueautogagnon.com?subject=${encodeURIComponent('Demande de prix, ' + $('#nom').value.trim())}&body=${encodeURIComponent(body)}`;
      steps.forEach(s => s.classList.remove('on'));
      $('.fnav', form).style.display = 'none';
      done.hidden = false; requestAnimationFrame(() => done.classList.add('on'));
      prog.forEach(p => p.classList.add('on'));
      scrollToEl(form.closest('.form'), -100);
      setTimeout(() => { location.href = href; }, 900);
    }
  }

  /* ---------- démarrage ---------- */
  if (page === 'home') home();
  if (page === 'forfaits') forfaits();
  if (page === 'realisations') realisations();
  if (page === 'zone') zone();
  if (page === 'reserver') reserver();

  if (hasGsap) {
    if (page === 'home') {
      commonAnims(true);
      gsap.set('.hero .hp, .hero-title .wi', { opacity: 0 });
      runIntro(() => { gsap.set('.hero .hp, .hero-title .wi', { opacity: 1 }); heroIn(); });
    } else commonAnims(false);
    addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  } else if (page === 'home') heroIn();
})();
