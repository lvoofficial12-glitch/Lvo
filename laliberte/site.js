/* Laliberté — animations du site */
(function () {
  const L = window.LVO, page = document.body.dataset.page, html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const anim = !!window.gsap && !L.reduce;
  const setBars = () => html.style.setProperty('--bars', (($('.demo-bar')||{}).offsetHeight||0) + (($('.urgbar')||{}).offsetHeight||0) + 'px');
  setBars(); addEventListener('resize', setBars);

  /* vidéos : fichier hébergé, sinon source Pexels directe */
  $$('video[data-fallback]').forEach(v => {
    const s = v.querySelector('source');
    const fb = () => { if (v.dataset.fb) return; v.dataset.fb = 1; v.src = v.dataset.fallback; v.load(); v.play().catch(() => {}); };
    if (s) s.addEventListener('error', fb);
    v.addEventListener('error', fb);
    v.play && v.play().catch(() => {});
  });

  /* menu mobile */
  const burger = $('.burger');
  if (burger) burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    if (L.lenis) open ? L.lenis.stop() : L.lenis.start();
  });

  /* rideau entre les pages */
  const curtain = $('.curtain');
  function leave(href) {
    if (!anim || !curtain) { location.href = href; return; }
    try { sessionStorage.setItem('lal-seen', '1'); } catch (e) {}
    curtain.style.display = 'grid';
    gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: .75, ease: 'expo.inOut', onComplete: () => location.href = href });
  }
  $$('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (!h || h.startsWith('#') || h.startsWith('tel:') || h.startsWith('mailto:') || h.startsWith('http') || a.target) return;
    a.addEventListener('click', e => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); leave(h); });
  });
  addEventListener('pageshow', e => { if (e.persisted && curtain) { curtain.style.display = 'none'; } });
  try { sessionStorage.setItem('lal-seen', '1'); } catch (e) {}

  L.onReady.unshift(() => {
    if (curtain && html.classList.contains('from-curtain') && anim) {
      gsap.to(curtain, { yPercent: -100, duration: .9, ease: 'expo.inOut', delay: .05, onComplete: () => curtain.style.display = 'none' });
    } else if (curtain) curtain.style.display = 'none';
  });

  /* ---------- filtres et visionneuse (sans dépendance à GSAP) ---------- */
  if (page === 'realisations') {
    const figs = $$('.masonry figure');
    $$('.filters button').forEach(b => b.addEventListener('click', () => {
      $$('.filters button').forEach(x => x.classList.toggle('on', x === b));
      const f = b.dataset.f;
      figs.forEach(g => g.classList.toggle('out', f !== 'all' && g.dataset.cat !== f));
      if (anim) { gsap.fromTo(figs.filter(g => !g.classList.contains('out')), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'expo.out', stagger: .04 }); ScrollTrigger.refresh(); }
    }));
    const lb = $('.lb'), lbi = $('.lb img');
    figs.forEach(g => g.addEventListener('click', () => { lbi.src = g.querySelector('img').src; lbi.alt = g.querySelector('img').alt; lb.classList.add('on'); L.lenis && L.lenis.stop(); }));
    const close = () => { lb.classList.remove('on'); L.lenis && L.lenis.start(); };
    lb.addEventListener('click', e => { if (e.target !== lbi) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  if (page === 'soumission') {
    const steps = $$('.qstep'), bars = $$('.qbar i'); let i = 0;
    const show = n => {
      i = n; steps.forEach((s, k) => s.classList.toggle('on', k === n)); bars.forEach((b, k) => b.classList.toggle('on', k <= n));
      $('.qback').style.visibility = n > 0 && n < steps.length - 1 ? 'visible' : 'hidden';
      $('.qnav').style.display = n === steps.length - 1 ? 'none' : 'flex';
      $('.qnext').textContent = n === steps.length - 2 ? $('.qnext').dataset.send : $('.qnext').dataset.next;
      const top = $('.qform').getBoundingClientRect().top + scrollY - 120;
      if (scrollY > top) (L.lenis ? L.lenis.scrollTo(top) : scrollTo(0, top));
    };
    $('.qnext').addEventListener('click', () => {
      const cur = steps[i]; const req = $$('[required]', cur);
      for (const f of req) { if (!f.checkValidity()) { f.reportValidity(); return; } }
      if (i < steps.length - 1) show(i + 1);
    });
    $('.qback').addEventListener('click', () => i > 0 && show(i - 1));
    const drop = $('.drop'), file = $('#photos'), th = $('.thumbs');
    const add = fs => [...fs].slice(0, 6).forEach(f => { if (!f.type.startsWith('image/')) return; const im = new Image(); im.src = URL.createObjectURL(f); im.alt = ''; th.appendChild(im); });
    file.addEventListener('change', () => add(file.files));
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => add(e.dataTransfer.files));
    const pre = new URLSearchParams(location.search).get('service');
    if (pre) { const r = $(`input[name=service][value="${pre}"]`); if (r) r.checked = true; }
    show(0);
  }

  if (page === 'services') {
    const imgs = $$('.stick img'), lab = $('.stick .lab');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const k = +e.target.dataset.i;
      imgs.forEach((im, j) => im.classList.toggle('on', j === k)); if (lab) lab.textContent = e.target.dataset.lab;
    }), { rootMargin: '-45% 0px -45% 0px' });
    $$('.sblock').forEach(b => io.observe(b));
    if (imgs[0]) imgs[0].classList.add('on');
  }

  if (!anim) return;

  L.onReady.push(() => {
    const mm = gsap.matchMedia();

    /* ===== ACCUEIL ===== */
    if (page === 'home') {
      const hm = $('.hero-media');
      gsap.timeline()
        .fromTo(hm, { clipPath: 'inset(22% 26% 22% 26% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.8, ease: 'expo.inOut' })
        .fromTo('.hero-media video, .hero-media img', { scale: 1.35 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0)
        .from('.hero h1 .wi', { yPercent: 120, rotate: 6, duration: 1.4, ease: 'expo.out', stagger: .07 }, .9)
        .from('.hero .hp', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1 }, 1.3)
        .from('.site-header .nav', { y: -30, opacity: 0, duration: 1, ease: 'expo.out' }, 1.1);
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
        .to(hm, { clipPath: 'inset(6% 3% 6% 3% round 28px)', ease: 'none' }, 0)
        .to('.hero-media video, .hero-media img', { scale: 1.15, ease: 'none' }, 0)
        .to('.hero-c', { yPercent: -18, opacity: 0, ease: 'none' }, 0);

      gsap.fromTo('.statement .wi', { color: '#cdd8c6' }, { color: '#1d3a28', ease: 'none', stagger: .1,
        scrollTrigger: { trigger: '.statement p', start: 'top 78%', end: 'bottom 40%', scrub: true } });

      mm.add('(min-width: 701px)', () => {
        const track = $('.hsvc-track'), cards = $$('.scard');
        const dist = () => track.scrollWidth - innerWidth;
        gsap.to(track, { x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: '.hsvc', start: 'top top', end: () => '+=' + dist(), pin: '.hsvc-pin', scrub: 1, invalidateOnRefresh: true,
            onUpdate: () => cards.forEach(c => {
              const r = c.getBoundingClientRect(), d = ((r.left + r.width / 2) - innerWidth / 2) / innerWidth;
              gsap.set(c, { rotateY: gsap.utils.clamp(-28, 28, -d * 34), z: -Math.abs(d) * 160 });
              const im = c.querySelector('img'); if (im) gsap.set(im, { xPercent: d * 10 });
            }) } });
      });
      mm.add('(max-width: 700px)', () => { $('.hsvc-track').style.cssText = 'width:auto;flex-direction:column;'; $$('.scard').forEach(c => c.style.width = '100%'); $('.hsvc-pin').style.height = 'auto'; $('.hsvc-pin').style.padding = '90px 0'; });

      const zw = $('.zoom-word span');
      gsap.timeline({ scrollTrigger: { trigger: '.zoom', start: 'top top', end: '+=240%', pin: true, scrub: 1 } })
        .fromTo(zw, { scale: .7 }, { scale: 1, duration: .25, ease: 'power2.out' })
        .to(zw, { scale: 46, duration: 1, ease: 'power2.in' })
        .to('.zoom-full', { opacity: 1, duration: .35 }, '-=.75')
        .fromTo('.zoom-full img', { scale: 1.25 }, { scale: 1, duration: .6, ease: 'none' }, '<')
        .to('.zoom-copy', { opacity: 1, duration: .2 }, '-=.35')
        .from('.zoom-copy > *', { y: 40, duration: .3, stagger: .05 }, '<');

      gsap.fromTo('.big247 .fill', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none',
        scrollTrigger: { trigger: '.urgband', start: 'top 70%', end: 'center center', scrub: true } });

      $$('.rrow').forEach((r, k) => gsap.fromTo(r, { x: k % 2 ? -innerWidth * .35 : 0 }, { x: k % 2 ? 0 : -innerWidth * .35, ease: 'none',
        scrollTrigger: { trigger: '.reel', start: 'top bottom', end: 'bottom top', scrub: true } }));

      gsap.fromTo('.final', { clipPath: 'inset(8% 10% 8% 10% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 32px)', ease: 'none',
        scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'top 20%', scrub: true } });
    }

    if (page === 'realisations') ScrollTrigger.batch('.masonry figure', { start: 'top 92%', once: true,
      onEnter: b => gsap.from(b, { y: 70, opacity: 0, scale: .96, duration: 1.1, ease: 'expo.out', stagger: .08 }) });

    /* ===== PAGES INTÉRIEURES ===== */
    if ($('.phero h1')) gsap.from('.phero h1 .wi', { yPercent: 120, rotate: 5, duration: 1.3, ease: 'expo.out', stagger: .06, delay: .15 });
    if ($('.phero .row')) gsap.from('.phero .crumb, .phero .row > *', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, delay: .5 });
    if ($('.pimg')) {
      gsap.fromTo('.pimg', { clipPath: 'inset(0 20% 0 20% round 40px)' }, { clipPath: 'inset(0 0% 0 0% round 28px)', ease: 'none',
        scrollTrigger: { trigger: '.pimg', start: 'top bottom', end: 'top 15%', scrub: true } });
      gsap.fromTo('.pimg img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.pimg', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
    if ($('.sgrid .rail i')) gsap.to('.sgrid .rail i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.sgrid', start: 'top 80%', end: 'bottom 55%', scrub: true } });

    if (page === 'urgence') {
      gsap.timeline()
        .fromTo('.uhero .media', { clipPath: 'inset(30% 0 30% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 1.6, ease: 'expo.inOut' })
        .fromTo('.uhero video, .uhero .media img', { scale: 1.3 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0)
        .from('.uhero h1 .wi', { yPercent: 120, duration: 1.3, ease: 'expo.out', stagger: .06 }, .7)
        .from('.uhero .hp', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1 }, 1.1);
    }

    if (page === 'conseils') {
      const names = $$('.slist b'), tips = $$('.stip'), bgs = $$('.seasons .sbg img');
      let cur = -1;
      const set = k => {
        if (k === cur) return; cur = k;
        names.forEach((n, j) => n.classList.toggle('on', j === k)); tips.forEach((t, j) => t.classList.toggle('on', j === k));
        bgs.forEach((b, j) => gsap.to(b, { opacity: j === k ? 1 : 0, scale: j === k ? 1 : 1.1, duration: 1.2, ease: 'power3.out' }));
      };
      set(0);
      ScrollTrigger.create({ trigger: '.seasons', start: 'top top', end: '+=300%', pin: true, scrub: true,
        onUpdate: s => set(Math.min(3, Math.floor(s.progress * 4))) });
    }
    ScrollTrigger.refresh();
  });
})();
