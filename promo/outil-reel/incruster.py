#!/usr/bin/env python3
"""Reçoit les captures d'écran à plat (1440x900, JPEG préfixé par sa longueur) sur l'entrée standard,
les place en perspective sur l'écran de la photo (config.json : photo, recadrage, coins_ecran),
ajoute l'accroche et écrit les images 1080x1920 dans ffmpeg (vidéo) ou en JPEG (aperçu)."""
import io, json, math, os, struct, subprocess, sys
import numpy as np
from PIL import Image

DIR = os.path.dirname(os.path.abspath(__file__))
CFG = json.load(open(os.path.join(DIR, 'config.json'), encoding='utf-8'))
MODE, OUT, HOOK = sys.argv[1], sys.argv[2], sys.argv[3]
TIMES = [float(x) for x in sys.argv[4].split(',')] if MODE == 'apercu' else None
FPS, T = float(CFG['fps']), float(CFG['duree'])

W, H = 1080, 1920
photo = Image.open(os.path.join(DIR, CFG['photo'])).convert('RGB')
CX0, CY0 = CFG['recadrage']['x'], CFG['recadrage']['y']
CS = W / CFG['recadrage']['largeur']                       # photo -> frame scale
QUAD = [tuple(p) for p in CFG['coins_ecran']]               # screen corners in the photo: TL, TR, BR, BL
hook = Image.open(HOOK).convert('RGBA')
SW, SH = 880, 550                                           # screen pre-scale, close to its final size
q0 = [((x - CX0) * CS, (y - CY0) * CS) for x, y in QUAD]
CENTER = (sum(p[0] for p in q0) / 4, sum(p[1] for p in q0) / 4)
white = Image.new('L', (SW, SH), 255)


def coeffs(dst, src):
    """PIL PERSPECTIVE coefficients mapping output points dst -> input points src."""
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()


def compose(screen_jpeg, t):
    z = 1.012 - 0.012 * math.cos(2 * math.pi * t / T)       # gentle camera breathing; same at start and end (loop)
    cx, cy = CX0 + CENTER[0] / CS, CY0 + CENTER[1] / CS
    bw, bh = W / CS / z, H / CS / z
    bx, by = cx - CENTER[0] / W * bw, cy - CENTER[1] / H * bh
    frame = photo.resize((W, H), Image.LANCZOS, box=(bx, by, bx + bw, by + bh))
    q = [(CENTER[0] + z * (x - CENTER[0]), CENTER[1] + z * (y - CENTER[1])) for x, y in q0]
    x0, y0 = int(math.floor(min(p[0] for p in q))) - 1, int(math.floor(min(p[1] for p in q))) - 1
    x1, y1 = int(math.ceil(max(p[0] for p in q))) + 1, int(math.ceil(max(p[1] for p in q))) + 1
    c = coeffs([(x - x0, y - y0) for x, y in q], [(0, 0), (SW, 0), (SW, SH), (0, SH)])
    scr = Image.open(io.BytesIO(screen_jpeg)).convert('RGB').resize((SW, SH), Image.LANCZOS)
    size = (x1 - x0, y1 - y0)
    frame.paste(scr.transform(size, Image.PERSPECTIVE, c, Image.BICUBIC), (x0, y0),
                white.transform(size, Image.PERSPECTIVE, c, Image.BILINEAR))
    frame = frame.convert('RGBA'); frame.alpha_composite(hook)
    return frame.convert('RGB')


def frames_in():
    while True:
        hdr = sys.stdin.buffer.read(4)
        if len(hdr) < 4:
            return
        yield sys.stdin.buffer.read(struct.unpack('>I', hdr)[0])


if MODE == 'apercu':
    for buf, t in zip(frames_in(), TIMES):
        compose(buf, t).save(os.path.join(OUT, f'apercu_{t:05.2f}s.jpg'), quality=93)
else:
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
                           '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', OUT],
                          stdin=subprocess.PIPE)
    for k, buf in enumerate(frames_in()):
        ff.stdin.write(compose(buf, k / FPS).tobytes())
    ff.stdin.close(); ff.wait()
