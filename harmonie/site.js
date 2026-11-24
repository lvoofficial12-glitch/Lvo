/* Harmonie Sensoriel — animations */
(function () {
  const L = window.LVO, page = document.body.dataset.page, html = document.documentElement;
  const EN = html.lang.startsWith('en');
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const anim = !!window.gsap && !L.reduce;
  const setBars = () => html.style.setProperty('--bars', (($('.demo-bar') || {}).offsetHeight || 0) + (($('.openbar') || {}).offsetHeight || 0) + 'px');
  setBars(); addEventListener('resize', setBars);

  /* vidéos */
  $$('video[data-fallback]').forEach(v => {
    const s = v.querySelector('source');
    const fb = () => { if (v.dataset.fb) return; v.dataset.fb = 1; v.src = v.dataset.fallback; v.load(); v.play().catch(() => {}); };
    if (s) s.addEventListener('error', fb); v.addEventListener('error', fb);
    v.play && v.play().catch(() => {});
    setTimeout(() => { if (v.readyState === 0 || v.networkState === 3) fb(); }, 2500);
  });

  /* compte à rebours jusqu'à l'ouverture */
  const OPEN = new Date('2026-11-28T00:00:00-05:00').getTime();
  const cds = $$('[data-cd]');
  const tick = () => {
    const d = OPEN - Date.now();
    cds.forEach(c => {
      if (d <= 0) { if (!c.classList.contains('open')) { c.classList.add('open'); c.innerHTML = `<div><b>${EN ? 'Now open' : 'Maintenant ouvert'}</b></div>`; } return; }
      const v = { d: Math.floor(d / 864e5), h: Math.floor(d / 36e5) % 24, m: Math.floor(d / 6e4) % 60, s: Math.floor(d / 1e3) % 60 };
      $$('b[data-u]', c).forEach(b => { const t = String(v[b.dataset.u]).padStart(2, '0'); if (b.textContent !== t) { b.textContent = t; b.classList.remove('flip'); void b.offsetWidth; b.classList.add('flip'); } });
    });
    const ob = $('.openbar [data-ob]');
    if (ob && d <= 0) ob.textContent = EN ? 'Now open at 68 rue Saint-Lambert, Sherbrooke.' : 'Maintenant ouvert au 68, rue Saint-Lambert, Sherbrooke.';
  };
  if (cds.length || $('[data-ob]')) { tick(); setInterval(tick, 1000); }

  /* ambiance sonore générée (aucun fichier), désactivée par défaut */
  const sb = $('.sound'); let actx = null, master = null;
  function startSound() {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
    const verb = actx.createConvolver(); const len = actx.sampleRate * 3.5, ir = actx.createBuffer(2, len, actx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb.buffer = ir; const wet = actx.createGain(); wet.gain.value = .55; verb.connect(wet); wet.connect(master);
    [[174.61, 0], [220, .4], [261.63, .9], [329.63, 1.6]].forEach(([f, ph], k) => {
      const o = actx.createOscillator(), g = actx.createGain(), lfo = actx.createOscillator(), lg = actx.createGain();
      o.type = 'sine'; o.frequency.value = f; o.detune.value = (k - 1.5) * 4; g.gain.value = .035;
      lfo.frequency.value = .05 + k * .023; lg.gain.value = .03; lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(verb); g.connect(master); o.start(); lfo.start(actx.currentTime + ph);
    });
    const nb = actx.createBuffer(1, actx.sampleRate * 4, actx.sampleRate), nd = nb.getChannelData(0);
    let last = 0; for (let i = 0; i < nd.length; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; nd[i] = last * 3.5; }
    const ns = actx.createBufferSource(); ns.buffer = nb; ns.loop = true;
    const bp = actx.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 900;
    const ng = actx.createGain(); ng.gain.value = .18; const nl = actx.createOscillator(), nlg = actx.createGain();
    nl.frequency.value = .08; nlg.gain.value = .08; nl.connect(nlg); nlg.connect(ng.gain);
    ns.connect(bp); bp.connect(ng); ng.connect(master); ns.start(); nl.start();
  }
  if (sb) sb.addEventListener('click', () => {
    const on = !sb.classList.contains('on');
    if (on && !actx) startSound();
    if (actx) { actx.resume(); master.gain.cancelScheduledValues(actx.currentTime); master.gain.setTargetAtTime(on ? .9 : 0, actx.currentTime, .8); }
    sb.classList.toggle('on', on); sb.setAttribute('aria-pressed', on);
    $('span', sb).textContent = on ? sb.dataset.off : sb.dataset.on;
    try { sessionStorage.setItem('hs-sound', on ? '1' : '0'); } catch (e) {}
  });

  /* menu */
  const burger = $('.burger');
  if (burger) burger.addEventListener('click', () => { const o = document.body.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', o); if (L.lenis) o ? L.lenis.stop() : L.lenis.start(); });

  /* rideau */
  const curtain = $('.curtain');
  function leave(href) {
    if (!anim || !curtain) { location.href = href; return; }
    try { sessionStorage.setItem('hs-seen', '1'); } catch (e) {}
    curtain.style.display = 'grid';
    gsap.fromTo(curtain, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: .8, ease: 'expo.inOut', onComplete: () => location.href = href });
  }
  $$('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (!h || h.startsWith('#') || h.startsWith('tel:') || h.startsWith('mailto:') || h.startsWith('http') || a.target) return;
    a.addEventListener('click', e => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); leave(h); });
  });
  addEventListener('pageshow', e => { if (e.persisted && curtain) curtain.style.display = 'none'; });
  try { sessionStorage.setItem('hs-seen', '1'); } catch (e) {}
  L.onReady.unshift(() => {
    if (curtain && html.classList.contains('from-curtain') && anim)
      gsap.fromTo(curtain, { clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut', delay: .05, onComplete: () => curtain.style.display = 'none' });
    else if (curtain) curtain.style.display = 'none';
  });

  /* carte-cadeau qui suit la souris */
  const gs = $('.gstage'), gc = $('.gcard');
  if (gs && gc && L.fine && anim) {
    const rx = gsap.quickTo(gc, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(gc, 'rotationY', { duration: .6, ease: 'power3' });
    gs.addEventListener('pointermove', e => { const r = gs.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      ry(x * 28); rx(-y * 22); gc.style.setProperty('--sh', (x * 160) + '%'); });
    gs.addEventListener('pointerleave', () => { ry(0); rx(0); gc.style.setProperty('--sh', '-60%'); });
  }

  /* salon : visionneuse */
  if (page === 'salon') {
    const lb = $('.lb'), lbi = $('.lb img');
    $$('.masonry figure').forEach(g => g.addEventListener('click', () => { lbi.src = g.querySelector('img').src; lbi.alt = g.querySelector('img').alt; lb.classList.add('on'); L.lenis && L.lenis.stop(); }));
    const close = () => { lb.classList.remove('on'); L.lenis && L.lenis.start(); };
    lb.addEventListener('click', e => { if (e.target !== lbi) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* réserver : calendrier de démonstration */
  if (page === 'reserver') {
    const months = [[2026, 10], [2026, 11], [2027, 0]]; let mi = 0, sel = null, slot = null;
    const loc = EN ? 'en-CA' : 'fr-CA';
    const days = EN ? ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] : ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];
    const first = new Date(2026, 10, 28);
    const SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];
    const cal = $('.cal'), title = $('.cal-h b'), prev = $('.cal-prev'), next = $('.cal-next'), slots = $('.slots');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    function draw() {
      const [y, m] = months[mi]; title.textContent = new Date(y, m, 1).toLocaleDateString(loc, { month: 'long', year: 'numeric' });
      prev.disabled = mi === 0; next.disabled = mi === months.length - 1;
      cal.innerHTML = days.map(d => `<span class="dn">${d}</span>`).join('');
      const off = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
      for (let i = 0; i < off; i++) cal.insertAdjacentHTML('beforeend', '<span></span>');
      for (let d = 1; d <= n; d++) {
        const dt = new Date(y, m, d), b = document.createElement('button'); b.type = 'button'; b.textContent = d;
        const ok = dt >= first && dt >= today;
        b.disabled = !ok; b.style.animationDelay = (d * .012) + 's'; if (+dt === +first) b.classList.add('first'); if (sel && +dt === +sel) b.classList.add('sel');
        b.setAttribute('aria-label', dt.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' }));
        b.addEventListener('click', () => { sel = dt; slot = null; draw(); drawSlots(); });
        cal.appendChild(b);
      }
    }
    function drawSlots() {
      if (!sel) { slots.innerHTML = `<span class="hint">${EN ? 'Choose a date to see availability.' : 'Choisissez une date pour voir les disponibilités.'}</span>`; return; }
      slots.innerHTML = ''; SLOTS.forEach((s, k) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = s; b.style.animationDelay = k * .05 + 's';
        if (s === slot) b.classList.add('sel');
        b.addEventListener('click', () => { slot = s; $$('button', slots).forEach(x => x.classList.toggle('sel', x === b)); recap(); });
        slots.appendChild(b);
      });
      recap();
    }
    function recap() {
      const sv = $('input[name=soin]:checked'); const r = $('.recap');
      r.textContent = (sv ? sv.dataset.label : (EN ? 'No treatment chosen' : 'Aucun soin choisi')) + ' · ' + (sel ? sel.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' }) : '—') + (slot ? ' · ' + slot : '');
    }
    prev.addEventListener('click', () => { mi--; draw(); }); next.addEventListener('click', () => { mi++; draw(); });
    $$('input[name=soin]').forEach(i => i.addEventListener('change', recap));
    const pre = new URLSearchParams(location.search).get('soin'); if (pre) { const r = $(`input[name=soin][value="${pre}"]`); if (r) r.checked = true; }
    $('.bform').addEventListener('submit', e => {
      e.preventDefault();
      if (!$('input[name=soin]:checked')) { $('input[name=soin]').focus(); alertMsg(EN ? 'Please choose a treatment.' : 'Choisissez un soin.'); return; }
      if (!sel || !slot) { alertMsg(EN ? 'Please choose a date and time.' : 'Choisissez une date et une heure.'); return; }
      for (const f of $$('[required]', e.target)) if (!f.checkValidity()) { f.reportValidity(); return; }
      $$('.bsec, .bform > .btn, .recap, .err').forEach(x => x.style.display = 'none'); $('.done').classList.add('on');
    });
    function alertMsg(t) { let el = $('.err'); if (!el) { el = document.createElement('p'); el.className = 'err'; el.style.cssText = 'color:#9a4a3a;font-weight:600;margin-bottom:14px'; el.setAttribute('role', 'alert'); $('.recap').after(el); } el.textContent = t; }
    draw(); drawSlots(); recap();
  }

  if (!anim) return;

  L.onReady.push(() => {
    const mm = gsap.matchMedia();

    if (page === 'home') {
      gsap.timeline()
        .fromTo('.hero-media', { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.inOut' })
        .fromTo('.hero-media video, .hero-media img', { scale: 1.4 }, { scale: 1, duration: 2.6, ease: 'expo.out' }, 0)
        .from('.hero h1 .wi', { yPercent: 115, duration: 1.5, ease: 'expo.out', stagger: .06 }, 1)
        .from('.hero .hp', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .12 }, 1.3)
        .from('.site-header .nav', { y: -30, opacity: 0, duration: 1, ease: 'expo.out' }, 1.2);
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
        .to('.hero-media', { clipPath: 'inset(5% 4% 5% 4% round 6px)', ease: 'none' }, 0)
        .to('.hero-media video, .hero-media img', { scale: 1.18, ease: 'none' }, 0)
        .to('.hero-c', { yPercent: -16, opacity: 0, ease: 'none' }, 0);

      gsap.fromTo('.statement .wi', { color: '#d8cfc3' }, { color: '#2a221c', ease: 'none', stagger: .1,
        scrollTrigger: { trigger: '.statement p', start: 'top 78%', end: 'bottom 42%', scrub: true } });

      const cards = $$('.sc');
      cards.forEach((c, k) => { if (k === cards.length - 1) return;
        gsap.fromTo(c, { scale: 1, filter: 'brightness(1)' }, { scale: .92, filter: 'brightness(.94)', ease: 'none', scrollTrigger: { trigger: cards[k + 1], start: 'top bottom', end: 'top 15%', scrub: true } });
        const im = c.querySelector('img'); gsap.to(im, { yPercent: 8, scale: 1.1, ease: 'none', scrollTrigger: { trigger: cards[k + 1], start: 'top bottom', end: 'top 15%', scrub: true } });
      });

      gsap.timeline({ scrollTrigger: { trigger: '.iris', start: 'top top', end: '+=180%', pin: true, scrub: 1 } })
        .to('.iris .lbl', { opacity: 0, y: 20, duration: .15 })
        .to('.iris .ring', { scale: 6, opacity: 0, duration: .8, ease: 'power2.in' }, 0)
        .to('.iris .img', { clipPath: 'circle(80% at 50% 50%)', duration: 1, ease: 'power2.inOut' }, 0)
        .fromTo('.iris .img img', { scale: 1.3 }, { scale: 1, duration: 1, ease: 'power2.out' }, 0)
        .to('.iris .txt', { opacity: 1, duration: .25 }, .75)
        .from('.iris .txt > div > *', { y: 40, stagger: .05, duration: .3 }, .75);

      gsap.fromTo('.bigdate .fill', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'none',
        scrollTrigger: { trigger: '.opening', start: 'top 70%', end: 'center center', scrub: true } });

      mm.add('(min-width: 701px)', () => {
        $$('.ccol').forEach((c, k) => gsap.fromTo(c, { yPercent: k === 1 ? -22 : 0 }, { yPercent: k === 1 ? 0 : -22, ease: 'none',
          scrollTrigger: { trigger: '.cols', start: 'top bottom', end: 'bottom top', scrub: true } }));
      });
    }

    if ($('.phero h1')) {
      gsap.from('.phero h1 .wi', { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: .06, delay: .15 });
      gsap.from('.phero .over, .phero .lede', { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1, delay: .5 });
    }
    if ($('.pimg')) {
      gsap.fromTo('.pimg', { clipPath: 'inset(0 22% 0 22%)' }, { clipPath: 'inset(0 0% 0 0%)', ease: 'none', scrollTrigger: { trigger: '.pimg', start: 'top bottom', end: 'top 15%', scrub: true } });
      gsap.fromTo('.pimg img, .pimg video', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.pimg', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
    $$('.soin-img > img').forEach(im => gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('.soin-img .float').forEach(f => gsap.fromTo(f, { y: 120 }, { y: -40, ease: 'none', scrollTrigger: { trigger: f.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }));

    if (page === 'experience') {
      const imgs = $$('.rimgs img'), steps = $$('.rstep'), bars = $$('.rbar i b'), num = $('.rnum span'); let cur = -1;
      const set = k => { if (k === cur) return; cur = k;
        steps.forEach((s, j) => s.classList.toggle('on', j === k)); num.textContent = '0' + (k + 1);
        const im = imgs[k]; im.style.zIndex = ++zi; gsap.fromTo(im, { clipPath: 'inset(100% 0 0 0)', scale: 1.25 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.1, ease: 'expo.inOut' });
        gsap.fromTo('.rnum span', { yPercent: 60, opacity: 0, rotationX: -80 }, { yPercent: 0, opacity: 1, rotationX: 0, duration: .8, ease: 'expo.out' }); };
      let zi = 1; imgs.forEach(im => gsap.set(im, { clipPath: 'inset(100% 0 0 0)' }));
      set(0);
      ScrollTrigger.create({ trigger: '.ritual', start: 'top top', end: '+=' + (steps.length * 90) + '%', pin: true, scrub: true,
        onUpdate: s => { const p = s.progress * steps.length, k = Math.min(steps.length - 1, Math.floor(p)); set(k);
          bars.forEach((b, j) => gsap.set(b, { scaleX: gsap.utils.clamp(0, 1, p - j) })); } });
    }
    fx(mm);
    ScrollTrigger.refresh();
  });

  /* ===================== FX v2 ===================== */
  function fx(mm) {
    /* titres en 3D, mot par mot */
    $$('.h3d').forEach(h => gsap.from($$('.wi', h), { rotationX: -95, yPercent: 50, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .055,
      scrollTrigger: { trigger: h, start: 'top 86%' } }));

    /* révélation des images avec un volet doré */
    $$('.soin-img, .bimg, .gstage figure, .pimg, .map, .rimgs, .visit .map').forEach(el => {
      if (el.querySelector(':scope > .rvc')) return;
      const c = document.createElement('i'); c.className = 'rvc'; el.style.position = el.style.position || 'relative'; el.appendChild(c);
      const im = el.querySelector(':scope > img, :scope > video, :scope > iframe');
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 82%' } });
      tl.fromTo(c, { scaleY: 0, transformOrigin: 'bottom' }, { scaleY: 1, duration: .55, ease: 'expo.in' })
        .set(c, { transformOrigin: 'top' })
        .to(c, { scaleY: 0, duration: .9, ease: 'expo.out' });
      if (im) tl.from(im, { scale: 1.35, duration: 1.6, ease: 'expo.out' }, .55);
    });

    /* poussière dorée qui flotte (réagit à la souris) */
    $$('[data-dust]').forEach(sec => {
      const cv = document.createElement('canvas'); cv.className = 'dust'; sec.prepend(cv);
      const x = cv.getContext('2d'); let W, H, dpr = Math.min(devicePixelRatio, 2), P = [], mx = -999, my = -999, vis = false;
      const rs = () => { W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
      rs(); addEventListener('resize', rs);
      const n = sec.classList.contains('hero') ? 90 : 60;
      for (let i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: .6 + Math.random() * 2.4, vy: .15 + Math.random() * .45, ph: Math.random() * 6, a: .25 + Math.random() * .6 });
      sec.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      sec.addEventListener('pointerleave', () => { mx = my = -999; });
      new IntersectionObserver(e => vis = e[0].isIntersecting).observe(sec);
      const light = sec.classList.contains('hero') || sec.classList.contains('final');
      (function f() { requestAnimationFrame(f); if (!vis) return; x.clearRect(0, 0, W, H);
        for (const p of P) { p.y -= p.vy; p.ph += .02; p.x += Math.sin(p.ph) * .35;
          const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy); if (d < 120) { p.x += dx / d * 2.2; p.y += dy / d * 2.2; }
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
          const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          const col = light ? '255,236,200' : '176,141,87';
          g.addColorStop(0, `rgba(${col},${p.a * (.7 + .3 * Math.sin(p.ph * 2))})`); g.addColorStop(1, `rgba(${col},0)`);
          x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, p.r * 4, 0, 7); x.fill(); } })();
    });

    /* bandeau de mots : défile tout seul, accélère et penche avec le défilement */
    $$('.mq .track').forEach(tr => {
      let xp = 0, v = 0; const skew = gsap.quickTo(tr, 'skewX', { duration: .4 });
      ScrollTrigger.create({ trigger: tr, start: 'top bottom', end: 'bottom top', onUpdate: s => { v = s.getVelocity() / 300; skew(gsap.utils.clamp(-12, 12, -v * 2)); } });
      gsap.ticker.add(() => { xp -= .04 + Math.abs(v) * .05; v *= .92; if (xp < -50) xp += 50; gsap.set(tr, { xPercent: xp }); });
    });

    /* images qui penchent selon la vitesse de défilement */
    const sk = $$('.ccol figure, .masonry figure');
    if (sk.length) { const q = sk.map(el => gsap.quickTo(el, 'skewY', { duration: .5, ease: 'power3' }));
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { const k = gsap.utils.clamp(-3, 3, s.getVelocity() / -900); q.forEach(f => f(k)); } }); }

    if (page === 'home') {
      /* volets du héros + vidéo qui suit la souris */
      gsap.fromTo('.shutter i', { scaleY: 1 }, { scaleY: 0, duration: 1.4, ease: 'expo.inOut', stagger: { each: .09, from: 'center' }, delay: .1 });
      gsap.set('.hero-media video, .hero-media img', { scale: 1.08 });
      if (L.fine) { const hx = gsap.quickTo('.hero-media video, .hero-media img', 'x', { duration: 1.2, ease: 'power3' }), hy = gsap.quickTo('.hero-media video, .hero-media img', 'y', { duration: 1.2, ease: 'power3' });
        $('.hero').addEventListener('pointermove', e => { hx((e.clientX / innerWidth - .5) * -40); hy((e.clientY / innerHeight - .5) * -30); }); }
      gsap.from('.cd div', { rotationX: -90, opacity: 0, y: 30, duration: 1.2, ease: 'expo.out', stagger: .1, delay: 1.6 });

      /* cartes empilées : basculent en 3D en reculant, le texte arrive en cascade */
      const cards = $$('.sc');
      cards.forEach((c, k) => {
        gsap.from($$('.in > *', c), { x: 80, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: c, start: 'top 70%' } });
        gsap.from(c.querySelector('figure'), { clipPath: 'inset(0 100% 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: c, start: 'top 75%' } });
      });

      /* orbite de photos autour du cercle */
      const figs = $$('.orbit figure'), R = Math.min(innerWidth, 1400) * .3;
      figs.forEach((f, i) => { f.style.transform = `rotateY(${i * 360 / figs.length}deg) translateZ(${R}px)`; });
      const spin = gsap.to('.orbit', { rotationY: 360, duration: 40, ease: 'none', repeat: -1 });
      gsap.set('.orbit', { rotationX: -8 });
      gsap.timeline({ scrollTrigger: { trigger: '.iris', start: 'top top', end: '+=180%', scrub: 1 } })
        .to('.orbit', { scale: 2.6, opacity: 0, duration: .7, ease: 'power2.in' }, 0)
        .to(spin, { timeScale: 12, duration: .5 }, 0);
      gsap.from('.orbit', { opacity: 0, scale: .3, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.iris', start: 'top 70%' } });

      /* grand 28 qui pivote */
      gsap.from('.bigdate', { rotationY: -70, rotationX: 20, opacity: 0, transformPerspective: 900, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.opening', start: 'top 70%' } });

      /* carte-cadeau : arrive en tournoyant puis flotte */
      gsap.from('.gcard', { y: 220, rotationY: -80, rotationX: 30, opacity: 0, transformPerspective: 1200, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.gift', start: 'top 65%' } });
      gsap.to('.gcard', { y: -14, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 });

      /* colonnes : arrivée en 3D */
      gsap.from('.ccol figure', { rotationX: -50, y: 120, opacity: 0, transformPerspective: 1200, transformOrigin: '50% 0', duration: 1.3, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: '.cgrid', start: 'top 80%' } });

      /* fond doré qui suit la souris dans la section ouverture */
      const op = $('.opening'); const gl = document.createElement('i'); gl.className = 'glow'; op.prepend(gl);
      if (L.fine) op.addEventListener('pointermove', e => { const r = op.getBoundingClientRect(); gsap.to(gl, { left: e.clientX - r.left, top: e.clientY - r.top, duration: 1.2, ease: 'power3' }); });
    }

    /* pages intérieures */
    $$('.soin-img .float').forEach(f => gsap.fromTo(f, { rotationY: 35, rotationX: 10, transformPerspective: 1000 }, { rotationY: -12, rotationX: -4, ease: 'none', scrollTrigger: { trigger: f.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('.soin ul li').forEach(li => gsap.from(li, { x: 60, opacity: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 92%' } }));
    if (page === 'salon') {
      $$('.masonry figure').forEach((f, i) => gsap.from(f, { rotationX: -70, y: 90, opacity: 0, transformOrigin: '50% 0', duration: 1.3, ease: 'expo.out', delay: (i % 3) * .1, scrollTrigger: { trigger: f, start: 'top 95%' } }));
      $$('.faq details').forEach(d => d.addEventListener('toggle', () => { if (d.open) gsap.from(d.querySelector('p'), { height: 0, opacity: 0, duration: .6, ease: 'expo.out' }); }));
      gsap.from('.faq details', { x: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.faq', start: 'top 75%' } });
    }
    if (page === 'experience') {
      $$('.bgrid svg').forEach(sv => $$('path,circle', sv).forEach(p => { try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1); } catch (e) {} }));
      ScrollTrigger.batch('.bgrid > div', { start: 'top 85%', once: true, onEnter: b => b.forEach((d, i) => setTimeout(() => d.classList.add('drawn'), i * 180)) });
    }
    if (page === 'reserver') {
      gsap.from('.bsec', { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .12, delay: .4 });
      gsap.from('.svc', { x: 50, opacity: 0, duration: .9, ease: 'expo.out', stagger: .08, delay: .6 });
    }
    if ($('.phero h1')) gsap.from('.phero h1', { rotationX: 40, transformPerspective: 1000, transformOrigin: '50% 100%', duration: 1.6, ease: 'expo.out', delay: .1 });
  }
})();
