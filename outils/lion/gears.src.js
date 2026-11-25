/* LVO — Mécanique Mobile Lion : engrenages 3D procéduraux (aucun modèle externe) */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Shape, Path, ExtrudeGeometry,
  MeshPhysicalMaterial, MeshBasicMaterial, PMREMGenerator, PointLight, AmbientLight, DirectionalLight,
  ACESFilmicToneMapping, BufferGeometry, Float32BufferAttribute, Points, PointsMaterial,
  AdditiveBlending, CanvasTexture, SRGBColorSpace, CylinderGeometry, TorusGeometry, MathUtils, Vector3, InstancedMesh, BoxGeometry, Object3D, ConeGeometry
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

function gearShape(teeth, rOuter, rInner, rHole, spokes) {
  const s = new Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts = [
      [rInner, a],
      [rInner, a + step * 0.18],
      [rOuter, a + step * 0.30],
      [rOuter, a + step * 0.62],
      [rInner, a + step * 0.74],
    ];
    pts.forEach(([r, t], j) => {
      const x = Math.cos(t) * r, y = Math.sin(t) * r;
      if (i === 0 && j === 0) s.moveTo(x, y); else s.lineTo(x, y);
    });
  }
  s.closePath();
  const hole = new Path(); hole.absarc(0, 0, rHole, 0, Math.PI * 2, true); s.holes.push(hole);
  if (spokes) {
    const r1 = rHole + (rInner - rHole) * 0.22, r2 = rInner * 0.78;
    for (let k = 0; k < spokes; k++) {
      const a0 = (k / spokes) * Math.PI * 2 + 0.22, a1 = ((k + 1) / spokes) * Math.PI * 2 - 0.22;
      const w = new Path();
      w.absarc(0, 0, r2, a0, a1, false);
      w.absarc(0, 0, r1, a1, a0, true);
      w.closePath();
      s.holes.push(w);
    }
  }
  return s;
}

function sparkTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,240,210,1)'); g.addColorStop(0.25, 'rgba(255,170,60,.9)'); g.addColorStop(1, 'rgba(255,120,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}

export function init(canvas, opts = {}) {
  const mobile = matchMedia('(max-width: 760px)').matches;
  let renderer;
  try { renderer = new WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pm = new PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const steel = new MeshPhysicalMaterial({ color: 0x2b2d33, metalness: 1, roughness: 0.32, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  const dark = new MeshPhysicalMaterial({ color: 0x15161a, metalness: 0.9, roughness: 0.45 });
  const amber = new MeshPhysicalMaterial({ color: 0xff8a1f, metalness: 0.85, roughness: 0.28, emissive: 0x4a1d00, emissiveIntensity: 0.6 });
  const glow = new MeshBasicMaterial({ color: 0xffa64d, transparent: true, opacity: 0.9 });

  const ext = { depth: 0.55, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: mobile ? 2 : 4, curveSegments: mobile ? 16 : 28 };
  const rig = new Group(); scene.add(rig);

  function makeGear(teeth, rO, rI, rH, spokes, mat, depthMul = 1) {
    const g = new Group();
    const geo = new ExtrudeGeometry(gearShape(teeth, rO, rI, rH, spokes), { ...ext, depth: ext.depth * depthMul });
    geo.center();
    g.add(new Mesh(geo, mat));
    const hub = new Mesh(new CylinderGeometry(rH * 1.35, rH * 1.35, ext.depth * depthMul + 0.35, mobile ? 24 : 40), dark);
    hub.rotation.x = Math.PI / 2; g.add(hub);
    const ring = new Mesh(new TorusGeometry(rH * 1.05, 0.05, 8, 48), glow);
    ring.position.z = (ext.depth * depthMul + 0.35) / 2 + 0.01; g.add(ring);
    for (let b = 0; b < 6; b++) {
      const bolt = new Mesh(new CylinderGeometry(0.09, 0.09, 0.12, 6), amber);
      const a = (b / 6) * Math.PI * 2;
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(Math.cos(a) * rH * 1.35 * 0.7, Math.sin(a) * rH * 1.35 * 0.7, (ext.depth * depthMul + 0.35) / 2 + 0.04);
      g.add(bolt);
    }
    g.userData.teeth = teeth;
    return g;
  }

  // Module identique (pas = 2πr/teeth constant) pour que les dents s'emboîtent
  const M = 0.22;
  const tA = 24, tB = 14, tC = 18;
  const rA = (tA * M) / (Math.PI / 2) * 0.5 + 0, rB = (tB * M) / (Math.PI / 2) * 0.5, rC = (tC * M) / (Math.PI / 2) * 0.5;
  const big = makeGear(tA, rA + 0.22, rA - 0.2, 0.55, 5, steel, 1.1);
  const small = makeGear(tB, rB + 0.22, rB - 0.2, 0.35, 0, amber, 0.9);
  const mid = makeGear(tC, rC + 0.22, rC - 0.2, 0.42, 4, steel, 1);
  rig.add(big, small, mid);
  const dAB = rA + rB, dAC = rA + rC;
  const angAB = -0.35, angAC = 2.35;
  small.position.set(Math.cos(angAB) * dAB, Math.sin(angAB) * dAB, 0.05);
  mid.position.set(Math.cos(angAC) * dAC, Math.sin(angAC) * dAC, -0.05);
  rig.position.set(-0.3, 0.2, 0);

  // Étincelles
  const N = mobile ? 90 : 220;
  const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), life = new Float32Array(N);
  const sGeo = new BufferGeometry(); sGeo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  const sparks = new Points(sGeo, new PointsMaterial({ size: mobile ? 0.16 : 0.12, map: sparkTex(), transparent: true, depthWrite: false, blending: AdditiveBlending }));
  scene.add(sparks);
  const tmp = new Vector3();
  const emit = () => { tmp.copy(small.position).multiplyScalar(rA / (rA + rB)); tmp.z = 0.5; rig.localToWorld(tmp); return tmp; };
  function reset(i) {
    const c = emit();
    pos[i * 3] = c.x + (Math.random() - 0.5) * 0.2; pos[i * 3 + 1] = c.y + (Math.random() - 0.5) * 0.2; pos[i * 3 + 2] = c.z;
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 5;
    vel[i * 3] = Math.cos(a) * sp; vel[i * 3 + 1] = Math.abs(Math.sin(a)) * sp * 0.8 + 1; vel[i * 3 + 2] = (Math.random() - 0.2) * 3;
    life[i] = Math.random() * 1.2;
  }
  for (let i = 0; i < N; i++) { reset(i); life[i] = Math.random() * 1.2; }

  scene.add(new AmbientLight(0xffffff, 0.15));
  const key = new DirectionalLight(0xdfe7ff, 1.6); key.position.set(-5, 6, 8); scene.add(key);
  const warm = new PointLight(0xff8a1f, 60, 30, 1.6); warm.position.set(4, -2, 5); scene.add(warm);
  const back = new PointLight(0xff6a00, 40, 30, 1.6); back.position.set(-4, 3, -4); scene.add(back);

  let w = 0, h = 0;
  function resize() {
    const r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w / h < 0.9 ? 19 : 14;
    camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);

  const state = { progress: 0, mx: 0, my: 0, spin: 0, sparkOn: 1 };
  addEventListener('pointermove', e => { state.mx = e.clientX / innerWidth - 0.5; state.my = e.clientY / innerHeight - 0.5; }, { passive: true });

  let visible = true, last = performance.now(), slow = 0, raf;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) { last = performance.now(); loop(); } }, { rootMargin: '100px' }).observe(canvas);

  function loop() {
    cancelAnimationFrame(raf);
    if (!visible) return;
    raf = requestAnimationFrame(loop);
    const now = performance.now(); let dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (dt > 0.034) { slow++; if (slow > 60 && renderer.getPixelRatio() > 1) { renderer.setPixelRatio(1); resize(); slow = 0; } }
    state.spin += dt * (0.35 + state.progress * 1.6);
    const a = state.spin + state.progress * Math.PI * 2;
    big.rotation.z = a;
    small.rotation.z = -a * (tA / tB) + Math.PI / tB;
    mid.rotation.z = -a * (tA / tC) + Math.PI / tC * 0.5;
    rig.rotation.y = MathUtils.lerp(rig.rotation.y, -0.55 + state.progress * 1.1 + state.mx * 0.5, 0.06);
    rig.rotation.x = MathUtils.lerp(rig.rotation.x, 0.25 - state.my * 0.4, 0.06);
    const sc = 0.92 + state.progress * 0.16; rig.scale.setScalar(sc);
    warm.intensity = 50 + Math.sin(now * 0.012) * 10 + Math.random() * 8;
    for (let i = 0; i < N; i++) {
      life[i] -= dt;
      if (life[i] <= 0) reset(i);
      vel[i * 3 + 1] -= 9 * dt;
      pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
    }
    sGeo.attributes.position.needsUpdate = true;
    sparks.material.opacity = state.sparkOn;
    renderer.render(scene, camera);
  }
  loop();
  return { setProgress(p) { state.progress = p; }, resize };
}


/* ---------- Roue de camion lourd 3D ---------- */
export function initWheel(canvas, labels = []) {
  const mobile = matchMedia('(max-width: 760px)').matches;
  let renderer;
  try { renderer = new WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const pm = new PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  const camera = new PerspectiveCamera(30, 1, 0.1, 100); camera.position.set(0, 0, 15);

  const rubber = new MeshPhysicalMaterial({ color: 0x121315, roughness: 0.82, metalness: 0, sheen: 0.3 });
  const alu = new MeshPhysicalMaterial({ color: 0xd9dadf, metalness: 1, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05 });
  const dark = new MeshPhysicalMaterial({ color: 0x1a1b1f, metalness: 0.9, roughness: 0.5 });
  const amber = new MeshPhysicalMaterial({ color: 0xff8a1f, metalness: 0.3, roughness: 0.35, emissive: 0x5a2400, emissiveIntensity: 0.7 });
  const hot = new MeshBasicMaterial({ color: 0xff6a00, transparent: true, opacity: 0.85 });

  const rig = new Group(); scene.add(rig);
  const spin = new Group(); rig.add(spin);
  const seg = mobile ? 48 : 96;
  // Pneu
  const tire = new Mesh(new TorusGeometry(2.25, 0.78, mobile ? 20 : 32, seg), rubber);
  tire.scale.set(1, 1, 1.35); spin.add(tire);
  // Bande de roulement
  const N = 44, blk = new InstancedMesh(new BoxGeometry(0.3, 0.16, 0.62), rubber, N * 2), o = new Object3D();
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    for (let k = 0; k < 2; k++) {
      o.position.set(Math.cos(a) * 3.04, Math.sin(a) * 3.04, k ? 0.4 : -0.4);
      o.rotation.set(0, 0, a + (k ? 0.25 : -0.25));
      o.updateMatrix(); blk.setMatrixAt(i * 2 + k, o.matrix);
    }
  }
  spin.add(blk);
  // Jante : disque percé
  const face = new Shape(); face.absarc(0, 0, 1.62, 0, Math.PI * 2, false);
  const ch = new Path(); ch.absarc(0, 0, 0.46, 0, Math.PI * 2, true); face.holes.push(ch);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 10, h = new Path();
    h.absellipse(Math.cos(a) * 1.18, Math.sin(a) * 1.18, 0.2, 0.13, 0, Math.PI * 2, true, a);
    face.holes.push(h);
  }
  const faceGeo = new ExtrudeGeometry(face, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: mobile ? 24 : 48 });
  const faceM = new Mesh(faceGeo, alu); faceM.position.z = 0.55; spin.add(faceM);
  const barrel = new Mesh(new CylinderGeometry(1.66, 1.66, 1.5, seg, 1, true), alu);
  barrel.rotation.x = Math.PI / 2; spin.add(barrel);
  const lip = new Mesh(new TorusGeometry(1.66, 0.07, 12, seg), alu); lip.position.z = 0.75; spin.add(lip);
  // Moyeu
  const hub = new Mesh(new CylinderGeometry(0.44, 0.5, 0.7, 40), dark); hub.rotation.x = Math.PI / 2; hub.position.z = 0.75; spin.add(hub);
  const cap = new Mesh(new TorusGeometry(0.36, 0.05, 10, 40), amber); cap.position.z = 1.1; spin.add(cap);
  // Écrous + indicateurs orange
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const nut = new Mesh(new CylinderGeometry(0.1, 0.1, 0.22, 6), alu);
    nut.rotation.x = Math.PI / 2; nut.position.set(Math.cos(a) * 0.74, Math.sin(a) * 0.74, 0.78); spin.add(nut);
    const ind = new Mesh(new ConeGeometry(0.11, 0.3, 3), amber);
    ind.position.set(Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0.84); ind.rotation.z = a - Math.PI / 2; spin.add(ind);
  }
  // Tambour de frein (fixe)
  const drum = new Mesh(new CylinderGeometry(1.42, 1.42, 1.1, 48), dark); drum.rotation.x = Math.PI / 2; drum.position.z = -0.75; rig.add(drum);
  const glowRing = new Mesh(new TorusGeometry(1.43, 0.03, 8, 64), hot); glowRing.position.z = -0.25; rig.add(glowRing);

  scene.add(new AmbientLight(0xffffff, 0.12));
  const key = new DirectionalLight(0xe8eeff, 2.2); key.position.set(-6, 5, 8); scene.add(key);
  const warm = new PointLight(0xff8a1f, 90, 30, 1.6); warm.position.set(5, -3, 4); scene.add(warm);
  const rim = new PointLight(0xff6a00, 70, 30, 1.6); rim.position.set(-3, 4, -5); scene.add(rim);

  const anchors = [new Vector3(0, 3.1, 0.2), new Vector3(0, 0, 1.15), new Vector3(-1.1, -1.0, -1.25)];
  const tmp = new Vector3();
  let w = 0, h = 0;
  function resize() {
    const r = canvas.getBoundingClientRect(); w = r.width; h = r.height; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.position.z = w / h < 0.9 ? 21 : 15; camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);
  const st = { p: 0, mx: 0, my: 0, a: 0, lastP: 0, vel: 0 };
  addEventListener('pointermove', e => { st.mx = e.clientX / innerWidth - 0.5; st.my = e.clientY / innerHeight - 0.5; }, { passive: true });
  let visible = true, last = performance.now(), raf;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) { last = performance.now(); loop(); } }, { rootMargin: '100px' }).observe(canvas);
  function loop() {
    cancelAnimationFrame(raf); if (!visible) return; raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05); last = now;
    st.vel = MathUtils.lerp(st.vel, (st.p - st.lastP) * 60, 0.1); st.lastP = st.p;
    st.a += dt * 0.25 + st.vel * 0.5;
    spin.rotation.z = -st.a;
    rig.rotation.y = MathUtils.lerp(rig.rotation.y, -0.95 + st.p * 1.5 + st.mx * 0.4, 0.07);
    rig.rotation.x = MathUtils.lerp(rig.rotation.x, 0.12 - st.my * 0.3, 0.07);
    rig.position.x = mobile ? 0 : MathUtils.lerp(rig.position.x, (w / h > 1.5 ? 2.6 : 2.0) - st.p * 0.5, 0.07);
    hot.opacity = 0.55 + Math.sin(now * 0.004) * 0.25;
    renderer.render(scene, camera);
    anchors.forEach((a, i) => {
      const el = labels[i]; if (!el) return;
      tmp.copy(a); rig.localToWorld(tmp); tmp.project(camera);
      el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px,${(-tmp.y * 0.5 + 0.5) * h}px)`;
    });
  }
  loop();
  return { setProgress(p) { st.p = p; } };
}
window.LionGears = { init, initWheel };
