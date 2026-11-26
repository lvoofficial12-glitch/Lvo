// Filme le site dans le navigateur (écran à plat 1440x900) et envoie chaque image au script
// incruster.py, qui la place en perspective sur l'écran de la photo et écrit la vidéo.
//
//   node filmer.js video  sortie.mp4
//   node filmer.js apercu dossier-sortie 0.1,4.6,13.9     (quelques images fixes)
//
// Réglages : config.json. Prérequis : Node + Playwright (Chromium), Python 3 + Pillow + numpy, ffmpeg.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const CFG = JSON.parse(fs.readFileSync(path.join(DIR, 'config.json'), 'utf8'));
const MODE = process.argv[2], OUT = path.resolve(process.argv[3] || 'reel.mp4');
const TIMES = MODE === 'apercu' ? process.argv[4].split(',').map(Number) : null;
const SITE = path.resolve(DIR, CFG.site), HD = path.resolve(DIR, CFG.images_hd);
const T = CFG.duree, FPS = CFG.fps;

// ---------- small static server: /ecran.html, /accroche.html, /site/*, /hd/*
const fill = b => b.split('{{URL}}').join(CFG.url_affichee)
  .split('{{LIGNE1}}').join(CFG.accroche.ligne1).split('{{LIGNE2}}').join(CFG.accroche.ligne2)
  .split('{{EMOJIS}}').join(CFG.accroche.emojis);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
function serve(req, res) {
  let u = decodeURIComponent(req.url.split('?')[0]);
  let file;
  if (u.startsWith('/site/')) file = path.join(SITE, u.slice(6));
  else if (u.startsWith('/hd/')) file = path.join(HD, u.slice(4));
  else file = path.join(DIR, u);
  if (u.endsWith('/')) file = path.join(file, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    if (u === '/ecran.html' || u === '/accroche.html') data = fill(data.toString('utf8'));   // texts from config.json
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' }); res.end(data);
  });
}

// ---------- scroll: trackpad "flicks" (fast start, momentum decay), pauses, one small scroll back up
const N = CFG.nb_images, SF = CFG.debut_etapes;
const starts = SF.map(f => (f - 1) / (N - 1)), ends = starts.slice(1).concat(1);
const tgt = i => starts[i] + 0.45 * (ends[i] - starts[i]);           // text of stage i fully visible
const K = 7, F = u => (1 - Math.exp(-K * u) * (1 + K * u)) / (1 - Math.exp(-K) * (1 + K));
let MAXY = 1, END_Y = 1;
function targetY(v) {
  if (v === 'fin') return END_Y;                                    // past the story, into the next section
  if (typeof v === 'string' && v.startsWith('etape:')) {
    const m = v.slice(6).match(/^(\d+)([+-][\d.]+)?$/);
    return (tgt(Number(m[1])) + Number(m[2] || 0)) * MAXY;
  }
  return v * MAXY;
}
function scrollAt(t) {
  let y = 0;
  for (const [t0, d, target] of CFG.gestes) {
    const y1 = targetY(target);
    if (t <= t0) return y;
    if (t >= t0 + d) { y = y1; continue; }
    return y + (y1 - y) * F((t - t0) / d);
  }
  return y;
}

(async () => {
  const server = http.createServer(serve).listen(0);
  const BASE = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();

  // hook text, rendered once on a transparent background
  const hp = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await hp.goto(`${BASE}/accroche.html?style=${CFG.accroche.style}`);
  await hp.evaluate(() => document.fonts.ready); await hp.waitForTimeout(800);
  const HOOK = path.join(DIR, '.accroche.png');
  await hp.screenshot({ path: HOOK, omitBackground: true }); await hp.close();

  // the site, on a flat 1440x900 "screen" (Safari bar, cursor, scroll wheel, macOS scrollbar)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const rewrite = (pattern, fn) => page.route(pattern, async r => { const f = await r.fetch(); r.fulfill({ response: f, body: fn(await f.text()) }); });
  await rewrite('**/site/js/main.js', b => b
    .replace(/frameCount:\s*\d+,/, `frameCount: ${N},`)
    .replace(/desktopPath:\s*'[^']*',/, "desktopPath: '/hd/',")
    .replace(/mobilePath:\s*[^,]+,/, 'mobilePath: null,')
    .replace(/version:\s*'[^']*',/, "version: '',")
    .replace(/stageStartFrames:\s*\[[^\]]*\],/, `stageStartFrames: [${SF.join(', ')}],`)
    .replace(/scrub:\s*[\d.]+,/, 'scrub: true,')
    .replace(/blendFrames:\s*\w+,/, 'blendFrames: true,')
    .replace(/loaderTimeoutMs:\s*\d+,/, 'loaderTimeoutMs: 120000,'));
  await rewrite('**/site/index.html', b => b.split("[NOM DE L'ENTREPRISE]").join(CFG.nom_entreprise));
  await rewrite('**/site/css/style.css', b => b + '\nhtml{scrollbar-width:none;scrollbar-gutter:auto!important;scroll-behavior:auto!important}html::-webkit-scrollbar{display:none}');
  await page.goto(`${BASE}/ecran.html`);
  const frame = page.frames().find(f => f.url().includes('/site/'));
  await frame.waitForSelector('.loader.is-done', { timeout: 180000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  const geo = await frame.evaluate(() => ({ maxY: document.querySelector('.story').offsetHeight - innerHeight,
    vh: innerHeight, docH: document.documentElement.scrollHeight }));
  MAXY = geo.maxY; END_Y = geo.maxY + 0.5 * geo.vh;
  const TRACK = geo.vh - 6, THUMB = Math.max(36, TRACK * geo.vh / geo.docH);
  let lastMove = -10;

  const render = async (t) => {
    const y = scrollAt(t);
    const dt = 1 / 60, v = (scrollAt(t + dt) - scrollAt(Math.max(0, t - dt))) / (2 * dt);   // px per second
    if (Math.abs(v) > 25) lastMove = t;
    const sbA = Math.abs(v) > 25 ? 1 : Math.max(0, 1 - Math.max(0, t - lastMove - 0.45) / 0.35);
    await frame.evaluate(yy => { window.scrollTo(0, yy); window.dispatchEvent(new Event('scroll')); }, Math.round(y));
    await frame.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
    await page.evaluate(o => window.setFrame(o), {
      wheel: Math.min(1, Math.abs(v) / 900), phase: y / 140 * Math.sign(v || 1),
      sbTop: 56 + (TRACK - THUMB) * Math.min(1, y / (geo.docH - geo.vh)), sbH: THUMB, sbA });
    return page.screenshot({ type: 'jpeg', quality: 96 });
  };

  const times = MODE === 'apercu' ? TIMES : Array.from({ length: Math.round(T * FPS) }, (_, k) => k / FPS);
  if (MODE === 'apercu') fs.mkdirSync(OUT, { recursive: true });
  const py = spawn('python3', [path.join(DIR, 'incruster.py'), MODE, OUT, HOOK, MODE === 'apercu' ? TIMES.join(',') : ''],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let k = 0; k < times.length; k++) {
    const buf = await render(times[k]);
    const hdr = Buffer.alloc(4); hdr.writeUInt32BE(buf.length);
    if (!py.stdin.write(Buffer.concat([hdr, buf]))) await new Promise(r => py.stdin.once('drain', r));
    if (k % 60 === 0) process.stdout.write(`\r${k}/${times.length}`);
  }
  py.stdin.end();
  await new Promise(r => py.on('close', r));
  console.log('\nterminé :', OUT);
  await browser.close(); server.close();
})();
