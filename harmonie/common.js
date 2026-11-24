/* LVO — moteur d'animation commun (préchargeur, défilement fluide, curseur, révélations) */
(function () {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduce = new URLSearchParams(location.search).has('calme');
  const fine = matchMedia('(pointer: fine)').matches;
  const root = document.documentElement;
  window.LVO = { reduce, calm, fine, onReady: [] };

  /* ---------- texte découpé en mots ---------- */
  const splitNode = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
          const o = document.createElement('span'); o.className = 'w';
          const i = document.createElement('span'); i.className = 'wi'; i.textContent = w;
          o.appendChild(i); frag.appendChild(o);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') splitNode(n);
    });
  };
  document.querySelectorAll('[data-split]').forEach(splitNode);

  /* ---------- sécurité : sans GSAP, tout est visible ---------- */
  if (!window.gsap || reduce) {
    root.classList.add('no-anim');
    const pl = document.getElementById('preloader');
    if (pl) pl.remove();
    document.querySelectorAll('[data-count]').forEach(e => e.textContent = e.dataset.count);
    addEventListener('load', () => (window.LVO.onReady || []).forEach(f => f()));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- défilement fluide ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.LVO.lenis = lenis;
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -20, duration: 1.4 }); }
    }));
  }

  /* ---------- préchargeur ---------- */
  const pl = document.getElementById('preloader');
  const num = pl && pl.querySelector('.pl-num');
  const imgs = [...document.images].filter(i => i.getBoundingClientRect().top < innerHeight * 1.2);
  document.querySelectorAll('img').forEach(i => { if (!imgs.includes(i)) i.loading = 'lazy'; });
  let done = 0, shown = 0;
  const total = Math.max(1, imgs.length);
  const bump = () => { done++; };
  imgs.forEach(i => i.complete ? bump() : (i.addEventListener('load', bump), i.addEventListener('error', bump)));
  const start = performance.now();
  function tick() {
    const target = Math.min(100, (done / total) * 100);
    shown += (target - shown) * 0.12 + 0.4;
    if (num) num.textContent = Math.min(100, Math.floor(shown));
    if (shown >= 99.5 || performance.now() - start > 3500) return finish();
    requestAnimationFrame(tick);
  }
  function finish() {
    if (num) num.textContent = 100;
    const tl = gsap.timeline({ onComplete: () => { pl && pl.remove(); } });
    if (pl) tl.to(pl.querySelector('.pl-inner'), { y: -40, opacity: 0, duration: .5, ease: 'power2.in' })
              .to(pl, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=.1');
    tl.add(() => window.LVO.onReady.forEach(f => f()), pl ? '-=.55' : 0);
  }
  if (pl) requestAnimationFrame(tick); else addEventListener('load', finish);

  /* ---------- curseur ---------- */
  if (fine) {
    document.body.classList.add('has-cur');
    const c = document.createElement('div'); c.className = 'cur';
    c.innerHTML = '<span class="cur-dot"></span><span class="cur-ring"><em></em></span>';
    document.body.appendChild(c);
    const dot = c.querySelector('.cur-dot'), ring = c.querySelector('.cur-ring'), lab = ring.querySelector('em');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
    gsap.ticker.add(() => { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('a,button,[data-cursor],input,select,textarea,label');
      c.classList.toggle('is-link', !!t);
      const l = t && t.dataset && t.dataset.cursor;
      c.classList.toggle('is-label', !!l); lab.textContent = l || '';
    });
    document.addEventListener('pointerleave', () => c.style.opacity = 0);
    document.addEventListener('pointerenter', () => c.style.opacity = 1);
  }

  /* ---------- boutons magnétiques ---------- */
  if (fine) document.querySelectorAll('[data-magnetic]').forEach(b => {
    const s = 0.35;
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * s, y: (e.clientY - r.top - r.height / 2) * s, duration: .4, ease: 'power3.out' });
    });
    b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }));
  });

  /* ---------- en-tête + barre de progression ---------- */
  const hdr = document.querySelector('.site-header');
  const bar = document.querySelector('.progress');
  let last = 0;
  ScrollTrigger.create({
    start: 0, end: 'max', onUpdate: self => {
      const y = self.scroll();
      if (bar) bar.style.transform = `scaleX(${self.progress})`;
      if (hdr) {
        hdr.classList.toggle('scrolled', y > 40);
        hdr.classList.toggle('hide', y > last && y > 300);
        last = y;
      }
    }
  });

  /* ---------- révélations au défilement (après le préchargeur) ---------- */
  window.LVO.onReady.push(() => {
    document.querySelectorAll('[data-split]:not([data-split-manual])').forEach(el => {
      gsap.from(el.querySelectorAll('.wi'), {
        yPercent: 115, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: .045,
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
    gsap.utils.toArray('[data-reveal]').forEach(el => gsap.from(el, {
      y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', delay: +(el.dataset.delay || 0),
      scrollTrigger: { trigger: el, start: 'top 90%' }
    }));
    gsap.utils.toArray('[data-stagger]').forEach(el => gsap.from(el.children, {
      y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1,
      scrollTrigger: { trigger: el, start: 'top 85%' }
    }));
    gsap.utils.toArray('[data-img-reveal]').forEach(el => {
      const img = el.querySelector('img');
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } });
      tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' });
      if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
    });
    gsap.utils.toArray('[data-speed]').forEach(el => gsap.fromTo(el, { yPercent: -(+el.dataset.speed) * 50 }, {
      yPercent: (+el.dataset.speed) * 50, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    }));
    gsap.utils.toArray('[data-count]').forEach(el => {
      const o = { v: 0 }, end = +el.dataset.count;
      gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' },
        onUpdate: () => el.textContent = Math.round(o.v) });
    });
    gsap.utils.toArray('[data-tilt]').forEach(el => {
      if (!fine) return;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        gsap.to(el, { rotateY: px * 12, rotateX: -py * 12, transformPerspective: 900, duration: .6, ease: 'power3.out' });
        el.style.setProperty('--gx', (px + .5) * 100 + '%'); el.style.setProperty('--gy', (py + .5) * 100 + '%');
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1,.5)' }));
    });
    ScrollTrigger.refresh();
  });
})();
