/* Mécanique Mobile Lion — interactions (maquette LVO) */
(function () {
  const d = document, html = d.documentElement, body = d.body;
  const calm = /[?&]calme/.test(location.search);
  if (calm) html.classList.add('calm');
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const mobile = matchMedia('(max-width: 860px)').matches;
  const hasG = window.gsap && window.ScrollTrigger;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];

  /* ---------- Rideau entre les pages ---------- */
  const curtain = $('.curtain');
  let first = true; try { first = !sessionStorage.getItem('lion-intro'); sessionStorage.setItem('lion-intro', '1'); } catch (e) {}
  if (!first && curtain) { const cb = curtain.querySelector('.cbar'), cw = curtain.querySelector('.cw'); cb && cb.remove(); cw && cw.remove(); }
  requestAnimationFrame(() => setTimeout(() => curtain && curtain.classList.add('up'), calm ? 0 : first ? 1400 : 250));
  $$('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (!h || h.startsWith('#') || h.startsWith('tel:') || h.startsWith('sms:') || h.startsWith('mailto:') || a.target === '_blank') return;
    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      curtain.classList.remove('up'); curtain.classList.add('down');
      void curtain.offsetWidth;
      curtain.classList.remove('down'); curtain.classList.add('in');
      setTimeout(() => { location.href = a.href; }, 560);
    });
  });
  addEventListener('pageshow', e => { if (e.persisted && curtain) { curtain.className = 'curtain up'; } });

  /* ---------- Défilement doux ---------- */
  let lenis = null;
  if (window.Lenis && !calm && !mobile) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const r = t => { lenis.raf(t); requestAnimationFrame(r); }; requestAnimationFrame(r); }
  }

  /* ---------- Entête ---------- */
  const header = $('.site-header'), prog = $('.progress'), fab = $('.fab');
  let lastY = 0;
  function onScroll() {
    const y = scrollY;
    header.classList.toggle('solid', y > 40);
    const db = $('.demo-badge'); if (db && mobile) db.style.opacity = y > 40 ? '0' : '1';
    lastY = y;
    if (fab) fab.classList.toggle('on', y > innerHeight * 0.8);
    const max = d.documentElement.scrollHeight - innerHeight;
    if (prog) prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('.burger');
  burger && burger.addEventListener('click', () => {
    const o = body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', o);
    if (lenis) o ? lenis.stop() : lenis.start();
  });

  /* ---------- Curseur ---------- */
  if (fine && !calm) {
    const c = d.createElement('div'); c.className = 'cur'; body.appendChild(c);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    (function loop() { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    $$('a,button,label,.div-card').forEach(el => {
      el.addEventListener('pointerenter', () => c.classList.add('big'));
      el.addEventListener('pointerleave', () => c.classList.remove('big'));
    });
  }

  /* ---------- Boutons magnétiques ---------- */
  if (fine && !calm) $$('[data-magnetic]').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  /* ---------- Vidéos : lecture seulement à l'écran ---------- */
  $$('.div-card .bgv video').forEach(v => { v.removeAttribute('data-lazy'); const c = v.closest('.div-card'); c.addEventListener('pointerenter', () => { if (!v.src) v.src = v.dataset.src; const p = v.play(); p && p.catch(() => {}); }); c.addEventListener('pointerleave', () => v.pause()); });
  $$('video[data-lazy]').forEach(v => {
    new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) {
        if (!v.src && v.dataset.src) { v.src = v.dataset.src; }
        const p = v.play(); p && p.catch(() => {});
      } else v.pause();
    }), { rootMargin: '200px' }).observe(v);
  });
  $$('.hero video').forEach(v => { const p = v.play(); p && p.catch(() => {}); });

  /* ---------- Cartes 3D inclinables ---------- */
  if (fine && !calm) $$('.div-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(px - 0.5) * 14}deg) rotateX(${(0.5 - py) * 12}deg) translateZ(10px)`;
      card.style.setProperty('--gx', px * 100 + '%'); card.style.setProperty('--gy', py * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ---------- Accordéons ---------- */
  $$('.acc-i').forEach(i => {
    const q = $('.acc-q', i), a = $('.acc-a', i);
    q.addEventListener('click', () => {
      const open = i.classList.toggle('open');
      q.setAttribute('aria-expanded', open);
      a.style.height = open ? a.scrollHeight + 'px' : '0px';
      setTimeout(() => ScrollTrigger && ScrollTrigger.refresh && ScrollTrigger.refresh(), 600);
    });
  });

  /* ---------- Bandes défilantes ---------- */
  $$('.mq-track').forEach(t => {
    t.innerHTML += t.innerHTML;
    let x = 0, dir = +t.dataset.dir || -1, boost = 0;
    const sp = +t.dataset.speed || 0.6;
    addEventListener('wheel', e => { boost = Math.min(Math.abs(e.deltaY) * 0.04, 8); }, { passive: true });
    (function loop() {
      if (!calm) {
        x += dir * (sp + boost); boost *= 0.92;
        const w = t.scrollWidth / 2;
        if (x <= -w) x += w; if (x > 0) x -= w;
        t.style.transform = `translate3d(${x}px,0,0)`;
      }
      requestAnimationFrame(loop);
    })();
  });

  /* ---------- Lumière qui suit la souris ---------- */
  if (fine && !calm) addEventListener('pointermove', e => { html.style.setProperty('--sx', e.clientX + 'px'); html.style.setProperty('--sy', e.clientY + 'px'); }, { passive: true });

  /* ---------- Vidéo prête : on cache la scène de nuit ---------- */
  $$('.hero, .phero').forEach(sec => {
    $$('video', sec).forEach(v => {
      const ok = () => { if (getComputedStyle(v).display !== 'none') sec.classList.add('has-video'); };
      v.addEventListener('playing', ok); if (v.readyState > 2 && !v.paused) ok();
    });
  });

  /* ---------- Scène de nuit : pluie + gyrophare ---------- */
  $$('canvas.night').forEach(cv => {
    const sec = cv.parentElement, x = cv.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 1.5), drops = [], t0 = performance.now(), vis = true;
    const conic = !!x.createConicGradient;
    function size() {
      const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(380, W * H / 3200));
      drops = Array.from({ length: n }, () => ({ x: Math.random() * W * 1.2, y: Math.random() * H, l: 10 + Math.random() * 26, v: 500 + Math.random() * 600, z: Math.random() }));
    }
    size(); addEventListener('resize', size);
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(cv);
    const truck = (bx, by, s) => { // silhouette camion de service
      x.beginPath(); x.moveTo(bx, by); x.lineTo(bx, by - 62 * s); x.lineTo(bx + 120 * s, by - 62 * s); x.lineTo(bx + 120 * s, by - 46 * s);
      x.lineTo(bx + 150 * s, by - 46 * s); x.lineTo(bx + 172 * s, by - 26 * s); x.lineTo(bx + 176 * s, by); x.closePath(); x.fill();
      x.fillRect(bx + 18 * s, by - 74 * s, 70 * s, 12 * s); // grue repliée
    };
    const semi = (bx, by, s) => {
      x.fillRect(bx, by - 78 * s, 300 * s, 70 * s); x.fillRect(bx + 300 * s, by - 64 * s, 60 * s, 56 * s);
      x.beginPath(); x.moveTo(bx + 360 * s, by - 64 * s); x.lineTo(bx + 380 * s, by - 40 * s); x.lineTo(bx + 384 * s, by - 8 * s); x.lineTo(bx + 360 * s, by - 8 * s); x.fill();
      x.fillRect(bx - 4 * s, by - 10 * s, 392 * s, 10 * s);
    };
    function frame(now) {
      requestAnimationFrame(frame);
      if (!vis || sec.classList.contains('has-video')) return;
      const t = (now - t0) / 1000, dt = 1 / 60;
      const hz = H * 0.62, bx = W * (mobile ? 0.62 : 0.7), by = hz - 64 * (mobile ? 0.6 : 1) - 8;
      const ang = t * 3.6;
      // ciel + sol
      let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#04060a'); g.addColorStop(0.55, '#0c121b'); g.addColorStop(0.62, '#101822'); g.addColorStop(0.63, '#07090c'); g.addColorStop(1, '#030304');
      x.globalCompositeOperation = 'source-over'; x.fillStyle = g; x.fillRect(0, 0, W, H);
      // brume
      for (let i = 0; i < 3; i++) {
        const fx = ((t * (8 + i * 5) + i * 400) % (W + 800)) - 400, fy = hz - 40 + i * 30;
        g = x.createRadialGradient(fx, fy, 0, fx, fy, 420); g.addColorStop(0, 'rgba(70,90,120,.10)'); g.addColorStop(1, 'rgba(70,90,120,0)');
        x.fillStyle = g; x.fillRect(fx - 420, fy - 420, 840, 840);
      }
      // lampadaires lointains
      for (let i = 0; i < 7; i++) { const lx = W * 0.05 + i * W * 0.07, ly = hz - 6 - i * 0.5; g = x.createRadialGradient(lx, ly, 0, lx, ly, 14); g.addColorStop(0, 'rgba(255,214,160,.55)'); g.addColorStop(1, 'rgba(255,214,160,0)'); x.fillStyle = g; x.fillRect(lx - 14, ly - 14, 28, 28); }
      // silhouettes
      const s = mobile ? 0.6 : 1;
      x.fillStyle = '#050608'; semi(W * (mobile ? -0.25 : 0.2), hz, s); truck(bx - 60 * s, hz, s);
      // feux de détresse du semi
      const blink = Math.sin(t * 6) > 0 ? 1 : 0.15, hx = W * (mobile ? -0.25 : 0.2) - 2;
      [[hx, hz - 22 * s], [hx, hz - 70 * s]].forEach(([px, py]) => { g = x.createRadialGradient(px, py, 0, px, py, 40); g.addColorStop(0, `rgba(255,150,40,${0.9 * blink})`); g.addColorStop(1, 'rgba(255,120,0,0)'); x.fillStyle = g; x.fillRect(px - 40, py - 40, 80, 80); });
      // faisceaux du gyrophare
      x.globalCompositeOperation = 'lighter';
      if (conic) {
        g = x.createConicGradient(ang, bx, by);
        g.addColorStop(0, 'rgba(255,138,31,0)'); g.addColorStop(0.06, 'rgba(255,138,31,.22)'); g.addColorStop(0.1, 'rgba(255,138,31,0)');
        g.addColorStop(0.5, 'rgba(255,138,31,0)'); g.addColorStop(0.56, 'rgba(255,138,31,.22)'); g.addColorStop(0.6, 'rgba(255,138,31,0)'); g.addColorStop(1, 'rgba(255,138,31,0)');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
      }
      const face = Math.max(0, Math.cos(ang + 0.25 * Math.PI * 2 - Math.PI / 2)) ** 3 + Math.max(0, Math.cos(ang + 0.75 * Math.PI * 2 - Math.PI / 2)) ** 3;
      g = x.createRadialGradient(bx, by, 0, bx, by, 90 + face * 160); g.addColorStop(0, `rgba(255,190,110,${0.7 + face * 0.3})`); g.addColorStop(0.2, `rgba(255,120,20,${0.25 + face * 0.3})`); g.addColorStop(1, 'rgba(255,100,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      // reflet sur l'asphalte mouillé
      x.save(); x.translate(bx, hz + 6); x.scale(1, 5);
      g = x.createRadialGradient(0, 0, 0, 0, 0, 60); g.addColorStop(0, `rgba(255,130,30,${0.18 + face * 0.25})`); g.addColorStop(1, 'rgba(255,130,30,0)'); x.fillStyle = g; x.fillRect(-60, 0, 120, 60); x.restore();
      // pluie
      x.lineWidth = 1;
      for (const d of drops) {
        d.y += d.v * dt * (0.6 + d.z); d.x -= d.v * dt * 0.18;
        if (d.y > H) { d.y = -d.l; d.x = Math.random() * W * 1.2; }
        const a = Math.atan2(d.y - by, d.x - bx), dd = Math.hypot(d.x - bx, d.y - by);
        let lit = 0; for (const off of [0.06, 0.56]) { let df = Math.abs(((a - ang - off * Math.PI * 2) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI); if (df < 0.25) lit = Math.max(lit, 1 - df / 0.25); }
        lit *= Math.max(0, 1 - dd / (W * 0.8));
        x.strokeStyle = lit > 0.05 ? `rgba(255,${150 + 60 * lit | 0},70,${0.25 + lit * 0.6})` : `rgba(180,200,230,${0.08 + d.z * 0.1})`;
        x.beginPath(); x.moveTo(d.x, d.y); x.lineTo(d.x - d.l * 0.18, d.y + d.l); x.stroke();
      }
      x.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(frame);
  });

  /* ---------- Petits titres brouillés ---------- */
  if (!calm) {
    const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/';
    $$('.kick').forEach(k => {
      const txt = k.textContent; let done = false;
      new IntersectionObserver((es, o) => es.forEach(en => {
        if (!en.isIntersecting || done) return; done = true; o.disconnect();
        let f = 0; const tot = 22;
        const it = setInterval(() => {
          f++; k.textContent = txt.split('').map((c, i) => c === ' ' || i < (f / tot) * txt.length ? c : CH[Math.random() * CH.length | 0]).join('');
          if (f >= tot) { clearInterval(it); k.textContent = txt; }
        }, 35);
      }), { threshold: 0.6 }).observe(k);
    });
  }

  /* ---------- Icônes qui se dessinent ---------- */
  $$('.div-card').forEach(c => new IntersectionObserver((es, o) => es.forEach(en => { if (en.isIntersecting) { c.classList.add('drawn'); o.disconnect(); } }), { threshold: 0.3 }).observe(c));

  if (!hasG) { $$('[data-rev]').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (calm) { gsap.set('[data-rev]', { opacity: 1, y: 0 }); }

  /* ---------- Héro ---------- */
  const heroLines = $$('.hero h1 .line>span, .phero h1 .line>span');
  if (heroLines.length && !calm) {
    gsap.from(heroLines, { yPercent: 115, rotate: 3, duration: 1.3, ease: 'expo.out', stagger: 0.12, delay: 0.55 });
    gsap.from('.phero .kick, .phero p, .phero .hero-cta', { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 1 });
  }
  const hv = $$('.hero-media video');
  if (hv.length && !calm) {
    gsap.to(hv, { scale: 1, duration: 3, ease: 'power2.out' });
    gsap.to('.hero-media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-in', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });
  }
  const pm = $('.phero .pmedia');
  if (pm && !calm) gsap.to(pm, { yPercent: 20, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- Révélations ---------- */
  if (!calm) ScrollTrigger.batch('[data-rev]', {
    start: 'top 88%',
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
    onLeaveBack: b => gsap.to(b, { opacity: 0, y: 40, duration: 0.5, overwrite: true })
  });

  /* ---------- Titres en lettres ---------- */
  $$('[data-split]').forEach(el => {
    if (calm) return;
    const wrapText = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(d.createTextNode(' ')); return; }
            const o = d.createElement('span'); o.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-top:.12em;margin-top:-.12em';
            const i = d.createElement('span'); i.className = 'sw'; i.style.display = 'inline-block'; i.textContent = w;
            o.appendChild(i); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') wrapText(n);
      });
    };
    wrapText(el);
    gsap.from($$('.sw', el), { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' } });
  });

  /* ---------- Manifeste : mots qui se remplissent ---------- */
  $$('.manifest p').forEach(p => {
    const html0 = p.innerHTML;
    const parts = html0.split(/(\s+)/);
    p.innerHTML = parts.map(t => {
      if (/^\s+$/.test(t)) return t;
      const hl = /^\*.*\*[.,!]?$/.test(t);
      return `<span class="w${hl ? ' hlw' : ''}">${t.replace(/\*/g, '')}</span>`;
    }).join('');
    const ws = $$('.w', p);
    if (calm) { ws.forEach(w => { w.style.color = w.classList.contains('hlw') ? 'var(--amb)' : 'var(--ink)'; }); return; }
    ScrollTrigger.create({
      trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: s => {
        const n = Math.floor(s.progress * (ws.length + 1));
        ws.forEach((w, i) => { w.style.color = i < n ? (w.classList.contains('hlw') ? 'var(--amb)' : 'var(--ink)') : ''; });
      }
    });
  });

  /* ---------- Compteur de barre de progression des cartes ---------- */
  $$('.div-card').forEach((c, i) => {
    if (calm) return;
    gsap.from(c, { y: 120, rotateX: -18, opacity: 0, duration: 1.3, ease: 'expo.out', delay: i * 0.1, scrollTrigger: { trigger: '.divs', start: 'top 80%', toggleActions: 'play none none reverse' } });
  });

  /* ---------- Engrenages 3D + étapes ---------- */
  const gc = $('#gears');
  if (gc && window.LionGears) {
    const g = window.LionGears.init(gc);
    const steps = $$('.step'), bars = $$('.step-bar i b');
    if (!mobile && !calm) {
      gsap.set(steps[0], { opacity: 1, y: 0 });
      ScrollTrigger.create({
        trigger: '.gears', start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: s => {
          g && g.setProgress(s.progress);
          const k = Math.min(steps.length - 1, Math.floor(s.progress * steps.length));
          steps.forEach((st, i) => {
            const on = i === k;
            if (on !== st._on) { st._on = on; gsap.to(st, { opacity: on ? 1 : 0, y: on ? 0 : (i < k ? -60 : 60), duration: 0.6, ease: 'power3.out', overwrite: true }); }
          });
          bars.forEach((b, i) => { const p = Math.max(0, Math.min(1, s.progress * steps.length - i)); b.style.transform = `scaleX(${p})`; });
        }
      });
    } else if (g) {
      ScrollTrigger.create({ trigger: '.gears', start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: s => g.setProgress(s.progress) });
    }
    gsap.to('.gears-big', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: '.gears', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- Parallaxe des photos ---------- */
  if (!calm) $$('.split-img img').forEach(im => gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  if (!calm) $$('.split-mini img').forEach((im, i) => gsap.from(im, { y: 60 + i * 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: im, start: 'top 92%' } }));

  /* ---------- Roue 3D ---------- */
  const wc = $('#wheel');
  if (wc && window.LionGears && window.LionGears.initWheel) {
    const lbl = $$('.wlabel');
    const wh = window.LionGears.initWheel(wc, lbl);
    ScrollTrigger.create({ trigger: '.wheel', start: mobile ? 'top bottom' : 'top top', end: mobile ? 'bottom top' : 'bottom bottom', scrub: true,
      onUpdate: s => { wh && wh.setProgress(s.progress); lbl.forEach((l, i) => l.classList.toggle('on', mobile ? s.progress > 0.25 : s.progress > 0.15 + i * 0.18)); } });
    if (!mobile && !calm) gsap.from('.wheel-txt > *', { y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.wheel', start: 'top 40%', toggleActions: 'play none none reverse' } });
  }

  /* ---------- Grand mot du pied de page ---------- */
  if ($('.foot-word') && !calm) gsap.from('.foot-word span', { yPercent: 100, stagger: 0.12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.foot-word', start: 'top 95%', toggleActions: 'play none none reverse' } });
  if ($('.hero-word') && !calm) gsap.to('.hero-word', { xPercent: -25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- Bande vidéo ---------- */
  if ($('.reel') && !calm) {
    gsap.fromTo('.reel', { clipPath: 'inset(12% 8% 12% 8% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.reel', start: 'top bottom', end: 'top top', scrub: true } });
    gsap.to('.reel-media', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.reel', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.reel-txt h2', { scale: 1.5, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.reel', start: 'top 70%', end: 'center center', scrub: true } });
  }

  /* ---------- Atouts : gros mots ---------- */
  $$('.perk .big').forEach(b => { if (!calm) gsap.from(b, { yPercent: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 90%', toggleActions: 'play none none reverse' } }); });

  /* ---------- Radar ---------- */
  const radar = $('.radar');
  if (radar) {
    const towns = $$('.town', radar);
    if (!calm) {
      gsap.from($$('.ring', radar), { scale: 0, transformOrigin: '300px 300px', duration: 1.4, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: radar, start: 'top 80%' } });
      gsap.from(towns, { opacity: 0, scale: 0, transformOrigin: 'center', duration: 0.7, ease: 'back.out(2)', stagger: 0.08, delay: 0.5, scrollTrigger: { trigger: radar, start: 'top 80%' } });
    }
    let ti = 0;
    setInterval(() => { towns.forEach(t => t.classList.remove('on')); if (towns.length) towns[ti++ % towns.length].classList.add('on'); }, 900);
  }

  /* ---------- Appel final ---------- */
  if ($('.final h2') && !calm) gsap.from('.final h2', { letterSpacing: '0.2em', opacity: 0, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top 85%', end: 'center 60%', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();

/* ---------- Formulaire de demande (texto prérempli) ---------- */
(function () {
  const f = document.querySelector('#req'); if (!f) return;
  const L = JSON.parse(f.dataset.l);
  const panes = [...f.querySelectorAll('.f-pane')], bars = [...f.querySelectorAll('.f-steps i')];
  const err = f.querySelector('.f-err');
  let k = 0;
  function show(i) {
    k = i; panes.forEach((p, j) => p.classList.toggle('on', j === i)); bars.forEach((b, j) => b.classList.toggle('on', j <= i));
    f.querySelector('[data-prev]').style.visibility = i ? 'visible' : 'hidden';
    f.querySelector('[data-next]').style.display = i === panes.length - 1 ? 'none' : '';
    err.textContent = '';
    if (i === panes.length - 1) recap();
  }
  const val = n => { const e = f.elements[n]; if (!e) return ''; if (e instanceof RadioNodeList) return e.value; return (e.value || '').trim(); };
  function check(i) {
    if (i === 0 && !val('veh')) return L.e0;
    if (i === 1 && !val('prob')) return L.e1;
    if (i === 2) { if (!val('name')) return L.e2a; if (!/\d{3}.*\d{3}.*\d{4}/.test(val('phone'))) return L.e2b; if (!val('where')) return L.e2c; }
    return '';
  }
  function label(n) { const c = f.querySelector(`input[name="${n}"]:checked`); return c ? c.dataset.t : ''; }
  function recap() {
    const r = f.querySelector('.recap');
    const rows = [[L.r0, label('veh')], [L.r1, val('prob')], [L.r2, label('urg')], [L.r3, val('where')], [L.r4, val('name') + ' · ' + val('phone')]];
    r.innerHTML = rows.map(([a, b]) => `<div><span>${a}</span><b>${(b || '—').replace(/</g, '&lt;')}</b></div>`).join('');
    const msg = `${L.m}\n${L.r0}: ${label('veh')}\n${L.r1}: ${val('prob')}\n${L.r2}: ${label('urg')}\n${L.r3}: ${val('where')}\n${L.r4}: ${val('name')} (${val('phone')})`;
    f.querySelector('[data-sms]').href = 'sms:+15793684357?&body=' + encodeURIComponent(msg);
  }
  f.querySelector('[data-next]').addEventListener('click', () => { const e = check(k); if (e) { err.textContent = e; return; } show(k + 1); });
  f.querySelector('[data-prev]').addEventListener('click', () => show(Math.max(0, k - 1)));
  f.addEventListener('submit', e => e.preventDefault());
  show(0);
})();
