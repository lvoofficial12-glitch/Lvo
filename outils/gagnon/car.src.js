/* LVO — voiture 3D procédurale (aucun modèle externe, aucune marque) */
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, BufferGeometry, Float32BufferAttribute,
  MeshPhysicalMaterial, MeshStandardMaterial, MeshBasicMaterial, CylinderGeometry, TorusGeometry,
  BoxGeometry, PlaneGeometry, CircleGeometry,  Color,
  PMREMGenerator, RectAreaLight, SpotLight, AmbientLight, CanvasTexture, SRGBColorSpace,
  ACESFilmicToneMapping, AdditiveBlending, MathUtils, DoubleSide, PointLight
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

function radialTex(stops, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'); const gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, s]) => gr.addColorStop(o, s));
  x.fillStyle = gr; x.fillRect(0, 0, size, size);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}

export function init(canvas, opts = {}) {
  const mobile = opts.mobile ?? matchMedia('(max-width: 760px)').matches;
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pm = new PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(30, 1, 0.1, 60);
  const car = new Group(); scene.add(car);

  const holder = new Group(); car.add(holder);
  const lightMats = [], tailMats = [];
  let loaded = false;
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const paint = new MeshPhysicalMaterial({ color: 0x0b0b0d, metalness: 0.55, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04 });
  const paint2 = new MeshPhysicalMaterial({ color: 0x17181c, metalness: 0.8, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 });
  const glass = new MeshPhysicalMaterial({ color: 0x030405, metalness: 0, roughness: 0.03, clearcoat: 1, transparent: true, opacity: 0.86 });
  const goldM = new MeshPhysicalMaterial({ color: 0xc9a45c, metalness: 1, roughness: 0.28 });
  loader.load(opts.model || 'car.glb', g => {
    const m = g.scene;
    m.traverse(o => {
      if (!o.isMesh) return;
      const n = (o.material && o.material.name) || '';
      if (/License/.test(o.name) || /License/.test(n)) { o.visible = false; return; }
      if (/^Paint 1/.test(n)) o.material = paint;
      else if (/^Paint 2/.test(n)) o.material = paint2;
      else if (/^Glass/.test(n)) o.material = glass;
      else if (/^Brake$/.test(n)) o.material = goldM;
      else if (/^Tireside/.test(n)) { o.material = o.material.clone(); o.material.map = null; o.material.color = new Color(0x161616); }
      else if (/^Interior 3/.test(n)) { o.material = o.material.clone(); o.material.color = new Color(0x6b4a26); }
      else if (/^Headlight/.test(n)) { o.material = new MeshBasicMaterial({ color: 0xfff1d6, transparent: true, opacity: 0.15 }); lightMats.push(o.material); }
      else if (/^Brakelight|^Signallight/.test(n)) { o.material = new MeshBasicMaterial({ color: 0xff2414, transparent: true, opacity: 0.2 }); tailMats.push(o.material); }
      else if (o.material && o.material.transmission) { o.material = o.material.clone(); o.material.transmission = 0; }
    });
    m.rotation.y = Math.PI / 2;
    m.position.x = -0.24;
    holder.add(m);
    loaded = true;
    canvas.classList.add('is-loaded');
    opts.onLoad && opts.onLoad();
  }, undefined, () => { opts.onError && opts.onError(); });

  const lightMat = { set opacity(v) { lightMats.forEach(x => x.opacity = 0.15 + v * 0.85); } };
  const tailMat = { set opacity(v) { tailMats.forEach(x => x.opacity = 0.2 + v * 0.8); } };

  const glows = [];
  const headLight = new PointLight(0xffe7c2, 0, 4, 2); headLight.position.set(2.6, 0.6, 0); car.add(headLight);

  // sol
  const floor = new Mesh(new CircleGeometry(9, 64), new MeshBasicMaterial({ map: radialTex([[0, 'rgba(201,164,92,.22)'], [0.35, 'rgba(201,164,92,.06)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.001; scene.add(floor);
  const shadow = new Mesh(new PlaneGeometry(5.4, 2.9), new MeshBasicMaterial({ map: radialTex([[0, 'rgba(0,0,0,.95)'], [0.55, 'rgba(0,0,0,.6)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.004; car.add(shadow);

  // éclairage
  RectAreaLightUniformsLib.init();
  const sweep = new RectAreaLight(0xffd9a0, 0, 0.5, 9);
  sweep.position.set(0, 3.1, 0); sweep.lookAt(0, 0, 0); scene.add(sweep);
  const sweepSide = new RectAreaLight(0xffe3b0, 0, 0.35, 3);
  sweepSide.position.set(0, 1, 3.4); sweepSide.lookAt(0, 0.8, 0); scene.add(sweepSide);
  const key = new SpotLight(0xffffff, 40, 20, 0.6, 0.8, 1.6); key.position.set(3, 6, 4); scene.add(key);
  const rim = new SpotLight(0xc9a45c, 30, 20, 0.7, 0.9, 1.6); rim.position.set(-5, 3, -4); scene.add(rim);
  scene.add(new AmbientLight(0xffffff, 0.15));

  // état
  let progress = 0, px = 0, py = 0, sx = 0, sy = 0, lights = 0, lightsTarget = 0, running = true, visible = true;
  let w = 0, h = 0, t0 = performance.now(), raf = 0, sweepIntensity = 0;
  let lastShift = -1;
  const isNarrow = () => w < 900 || w / h < 1.05;
  function applyOffset() {
    const k = !isNarrow() ? (opts.shift ?? 0.16) * MathUtils.clamp(2.3 - (w / h) * 0.7, 1, 1.5) * (1 - MathUtils.smoothstep(progress, 0.15, 0.55)) : 0;
    if (Math.abs(k - lastShift) < 0.0005) return;
    lastShift = k;
    if (k > 0) camera.setViewOffset(w, h, -w * k, 0, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  function resize() {
    lastShift = -1;
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    applyOffset();
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const io = new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible && running && !raf) loop(); }, { rootMargin: '100px' });
  io.observe(canvas);

  function frame(now) {
    const t = (now - t0) / 1000;
    sx += (px - sx) * 0.06; sy += (py - sy) * 0.06;
    lights += (lightsTarget - lights) * 0.08;
    sweepIntensity += (1 - sweepIntensity) * 0.02;
    // rotation selon défilement : 3/4 avant -> profil -> 3/4 arrière
    applyOffset();
    const yaw = MathUtils.lerp(-0.62, 2.35, progress) + sx * 0.25 + Math.sin(t * 0.35) * 0.04;
    car.rotation.y = yaw;
    const narrow = isNarrow();
    const dist = (narrow ? MathUtils.clamp(8.2 / camera.aspect, 11, 19) : 9.6 * Math.max(1, 1.75 / camera.aspect)) - progress * 1.1;
    const elev = 2.3 + sy * 0.6 - progress * 0.6;
    camera.position.set(0, elev, dist);
    camera.lookAt(0, narrow ? 2.3 - progress * 1.3 : 0.55, 0);
    // le trait de lumière balaie la carrosserie
    const s = ((t * 0.16) % 1.4) - 0.2;
    sweep.position.x = MathUtils.lerp(-4.5, 4.5, s); sweep.lookAt(sweep.position.x, 0, 0);
    sweep.intensity = 26 * sweepIntensity;
    sweepSide.position.x = MathUtils.lerp(4, -4, ((t * 0.11 + 0.5) % 1.3) - 0.15);
    sweepSide.intensity = 14 * sweepIntensity;
    lightMat.opacity = lights; tailMat.opacity = lights * 0.9;
    glows.forEach(g => g.material.opacity = lights * 0.75);
    headLight.intensity = lights * 6;
        renderer.render(scene, camera);
  }
  // qualité adaptative : si l'appareil peine, on baisse la résolution
  let pr = renderer.getPixelRatio(), lastT = 0, slow = 0, samples = 0;
  function adapt(now) {
    if (lastT && !document.hidden) {
      const dt = now - lastT;
      if (dt < 250) { samples++; if (dt > 34) slow++; }
      if (samples >= 45) {
        if (slow / samples > 0.6 && pr > 1) { pr = Math.max(1, pr * 0.75); renderer.setPixelRatio(pr); lastShift = -1; resize(); }
        samples = 0; slow = 0;
      }
    }
    lastT = now;
  }
  function loop() {
    raf = 0;
    if (!running || !visible) { lastT = 0; return; }
    const now = performance.now();
    adapt(now);
    frame(now);
    raf = requestAnimationFrame(loop);
  }
  loop();

  return {
    setProgress(p) { progress = MathUtils.clamp(p, 0, 1); },
    setPointer(x, y) { px = x; py = y; },
    lightsOn() { lightsTarget = 1; },
    renderOnce() { frame(performance.now()); },
    destroy() { running = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); }
  };
}
window.GagnonCar = { init };
