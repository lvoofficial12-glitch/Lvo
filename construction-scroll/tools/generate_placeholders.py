#!/usr/bin/env python3
"""
Generates the PLACEHOLDER frame sequence used by the site until the real
renders are added: a stylised house built in 7 stages, with camera moves.

    python3 tools/generate_placeholders.py            # both sets
    python3 tools/generate_placeholders.py --only desktop

Output:
    frames/frame_001.webp ... frame_120.webp          (1600x900, landscape)
    frames/mobile/frame_001.webp ... frame_120.webp   (720x1280, portrait)

Requires Pillow (with WebP) and numpy. Not needed in production.
"""
import argparse
import math
import os

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

N_FRAMES = 120
N_STAGES = 7
SS = 2  # supersampling factor (anti-aliasing)
G = 640  # ground line (world units)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ---------------------------------------------------------------- helpers
def clamp(v, a=0.0, b=1.0):
    return max(a, min(b, v))


def lerp(a, b, t):
    return a + (b - a) * t


def smooth(t):
    t = clamp(t)
    return t * t * (3 - 2 * t)


def ramp(u, a, b):
    """0 before a, 1 after b, smooth in between."""
    if b <= a:
        return 1.0 if u >= b else 0.0
    return smooth((u - a) / (b - a))


def mix(c1, c2, t):
    return tuple(int(round(lerp(x, y, t))) for x, y in zip(c1, c2))


def scale_c(c, f):
    return tuple(int(clamp(x * f, 0, 255)) for x in c)


# ---------------------------------------------------------------- palettes
# (t, sky_top, sky_horizon, far_hills, near_hills, ground, ambient)
PALETTES = [
    (0.00, (34, 42, 56), (112, 122, 132), (66, 74, 86), (44, 52, 54), (54, 50, 44), 0.80),
    (0.30, (40, 54, 76), (150, 150, 150), (78, 84, 96), (50, 60, 56), (62, 58, 48), 0.86),
    (0.48, (48, 64, 94), (212, 176, 136), (96, 92, 102), (58, 68, 56), (72, 64, 50), 0.96),
    (0.74, (30, 34, 60), (196, 132, 100), (72, 62, 78), (40, 44, 42), (50, 44, 38), 0.78),
    (1.00, (26, 26, 52), (242, 138, 78), (90, 62, 78), (40, 36, 42), (44, 36, 32), 0.74),
]


def palette(t):
    for i in range(len(PALETTES) - 1):
        a, b = PALETTES[i], PALETTES[i + 1]
        if a[0] <= t <= b[0]:
            k = smooth((t - a[0]) / (b[0] - a[0]))
            return [mix(a[j], b[j], k) for j in range(1, 6)] + [lerp(a[6], b[6], k)]
    p = PALETTES[-1]
    return list(p[1:6]) + [p[6]]


# ---------------------------------------------------------------- camera
# Camera at the END of each stage: (cx, cy, view height, min view width)
CAM_START = (800, 575, 380, 380)
CAM_KEYS = [
    (800, 570, 440, 500),  # 1 foundation
    (800, 545, 520, 470),  # 2 framing
    (800, 515, 560, 470),  # 3 roof
    (792, 525, 520, 470),  # 4 exterior
    (688, 586, 168, 110),  # 5 entrance (door)
    (860, 565, 116, 92),   # 6 interior (big window)
    (810, 590, 500, 470),  # 7 pool / sunset
]


def camera(t, aspect):
    s = min(int(t * N_STAGES), N_STAGES - 1)
    u = smooth(t * N_STAGES - s)
    a = CAM_START if s == 0 else CAM_KEYS[s - 1]
    b = CAM_KEYS[s]
    cx, cy = lerp(a[0], b[0], u), lerp(a[1], b[1], u)
    vh = math.exp(lerp(math.log(a[2]), math.log(b[2]), u))
    mw = lerp(a[3], b[3], u)
    vh = max(vh, mw / aspect)
    # Leave room for the text: house to the right on landscape screens,
    # house in the upper half on portrait screens.
    if aspect > 1:
        cx -= 0.11 * vh * aspect
    else:
        cy += 0.16 * vh
    return cx, cy, vh


class R:
    """World -> screen renderer."""

    def __init__(self, img, cam, parallax=1.0, base=(800, 560, 900)):
        self.img = img
        self.d = ImageDraw.Draw(img, "RGBA")
        self.W, self.H = img.size
        cx, cy, vh = cam
        if parallax != 1.0:  # background layers move/zoom less
            cx = lerp(base[0], cx, parallax)
            cy = lerp(base[1], cy, parallax)
            vh = math.exp(lerp(math.log(base[2] if vh < base[2] else vh), math.log(vh), parallax))
        self.cx, self.cy, self.k = cx, cy, self.H / vh

    def p(self, x, y):
        return ((x - self.cx) * self.k + self.W / 2, (y - self.cy) * self.k + self.H / 2)

    def poly(self, pts, fill):
        self.d.polygon([self.p(x, y) for x, y in pts], fill=fill)

    def rect(self, x0, y0, x1, y1, fill):
        a, b = self.p(x0, y0), self.p(x1, y1)
        if b[0] - a[0] < 0.5 or b[1] - a[1] < 0.5:
            return
        self.d.rectangle([a, b], fill=fill)

    def ellipse(self, x0, y0, x1, y1, fill):
        a, b = self.p(x0, y0), self.p(x1, y1)
        if b[0] - a[0] < 0.5 or b[1] - a[1] < 0.5:
            return
        self.d.ellipse([a, b], fill=fill)

    def line(self, x0, y0, x1, y1, w, fill):
        self.d.line([self.p(x0, y0), self.p(x1, y1)], fill=fill, width=max(1, int(round(w * self.k))))

    def glow(self, x, y, r, color, intensity):
        if intensity <= 0.01:
            return
        sx, sy = self.p(x, y)
        rr = int(r * self.k)
        if rr < 2 or sx + rr < 0 or sy + rr < 0 or sx - rr > self.W or sy - rr > self.H:
            return
        if rr > 4000:
            return
        m = GLOW.resize((2 * rr, 2 * rr), Image.BILINEAR)
        m = m.point(lambda v: int(v * clamp(intensity)))
        self.img.paste(color, (int(sx - rr), int(sy - rr)), m)


def _glow_mask():
    n = 256
    y, x = np.mgrid[0:n, 0:n]
    r = np.sqrt((x - n / 2 + 0.5) ** 2 + (y - n / 2 + 0.5) ** 2) / (n / 2)
    v = np.clip(1 - r, 0, 1) ** 2.2
    return Image.fromarray((v * 255).astype(np.uint8), "L")


GLOW = _glow_mask()


# ---------------------------------------------------------------- scene parts
def sky(img, pal, cam_r):
    W, H = img.size
    top, hor = np.array(pal[0], float), np.array(pal[1], float)
    _, hy = cam_r.p(0, 600)
    ys = np.arange(H, dtype=float)
    t = np.clip(ys / max(hy, 1), 0, 1) ** 1.6
    col = top[None, :] * (1 - t[:, None]) + hor[None, :] * t[:, None]
    arr = np.repeat(col[:, None, :], W, axis=1).astype(np.uint8)
    img.paste(Image.fromarray(arr, "RGB"))


def hills(r, y0, amp, seed, color):
    pts = [(-3000, 3000)]
    for x in range(-3000, 4601, 40):
        y = y0 - amp * (0.55 * math.sin(x * 0.0021 + seed) + 0.3 * math.sin(x * 0.0057 + seed * 2.1)
                        + 0.15 * math.sin(x * 0.013 + seed * 3.7))
        pts.append((x, y))
    pts.append((4600, 3000))
    r.poly(pts, color)


def cypress(r, x, base, h, color, grow=1.0):
    if grow <= 0.01:
        return
    h *= grow
    w = h * 0.16
    pts = []
    for i in range(0, 21):
        a = i / 20
        yy = base - a * h
        ww = w * math.sin(math.pi * (0.08 + 0.92 * (1 - a) ** 0.9)) * (1 - a * 0.15)
        pts.append((x + ww / 2, yy))
    for i in range(20, -1, -1):
        a = i / 20
        yy = base - a * h
        ww = w * math.sin(math.pi * (0.08 + 0.92 * (1 - a) ** 0.9)) * (1 - a * 0.15)
        pts.append((x - ww / 2, yy))
    r.poly(pts, color)


def bush(r, x, y, s, color, grow=1.0):
    if grow <= 0.01:
        return
    s *= grow
    for dx, dy, k in ((-0.6, 0.1, 0.7), (0.55, 0.15, 0.65), (0, -0.25, 0.85), (-0.2, 0.2, 0.75)):
        rr = s * k
        r.ellipse(x + dx * s - rr, y + dy * s - rr, x + dx * s + rr, y + dy * s + rr, color)


def gable_y(x):
    # top of upper facade (eaves 392 at x=620/1000, apex 302 at x=810)
    if x <= 810:
        return 392 - (x - 620) * (90 / 190)
    return 392 - (1000 - x) * (90 / 190)


UPPER = [(620, 482), (1000, 482), (1000, 392), (810, 302), (620, 392)]
DOOR = (660, 545, 715, 632)
BIG = (760, 510, 960, 620)
UPWIN = [(650, 402, 720, 470), (885, 402, 960, 470)]


def room(r, light):
    """Interior seen through the big window (BIG rect)."""
    x0, y0, x1, y1 = BIG
    wall = scale_c((206, 186, 158), 0.55 + 0.45 * light)
    r.rect(x0, y0, x1, y1, wall)
    # back window with dusk landscape
    r.rect(x0 + 6, y0 + 16, x0 + 34, y0 + 70, scale_c((214, 140, 98), 0.6 + 0.4 * light))
    r.rect(x0 + 6, y0 + 52, x0 + 34, y0 + 70, scale_c((70, 64, 70), 0.6 + 0.4 * light))
    r.rect(x0 + 6, y0 + 16, x0 + 34, y0 + 18, (40, 36, 34))
    r.rect(x0 + 19, y0 + 16, x0 + 21, y0 + 70, (40, 36, 34))
    # ceiling + floor
    r.rect(x0, y0, x1, y0 + 8, scale_c((180, 160, 134), 0.5 + 0.5 * light))
    r.rect(x0, y1 - 24, x1, y1, scale_c((124, 88, 58), 0.5 + 0.5 * light))
    for i in range(8):
        xx = x0 + 10 + i * 26
        r.line(xx, y1 - 24, xx - 14, y1, 0.4, scale_c((100, 70, 46), 0.5 + 0.5 * light))
    # rug
    r.poly([(800, 604), (930, 604), (944, 614), (786, 614)], scale_c((190, 176, 156), 0.5 + 0.5 * light))
    # artwork
    r.rect(833, 533, 887, 561, (38, 34, 30))
    r.rect(836, 536, 884, 558, scale_c((150, 112, 82), 0.55 + 0.45 * light))
    r.ellipse(846, 540, 866, 556, scale_c((214, 160, 104), 0.55 + 0.45 * light))
    r.rect(866, 536, 884, 558, scale_c((84, 96, 104), 0.55 + 0.45 * light))
    # sofa
    sofa = scale_c((224, 214, 198), 0.5 + 0.5 * light)
    r.rect(800, 568, 920, 584, scale_c((206, 196, 180), 0.5 + 0.5 * light))
    r.rect(796, 580, 924, 598, sofa)
    r.rect(792, 574, 804, 598, sofa)
    r.rect(916, 574, 928, 598, sofa)
    for cx in (830, 860, 890):
        r.rect(cx - 13, 571, cx + 13, 583, scale_c((232, 224, 210), 0.5 + 0.5 * light))
    r.rect(800, 598, 803, 602, (40, 34, 30))
    r.rect(917, 598, 920, 602, (40, 34, 30))
    # coffee table
    r.rect(832, 600, 888, 604, (66, 48, 34))
    r.rect(836, 604, 839, 610, (50, 36, 26))
    r.rect(881, 604, 884, 610, (50, 36, 26))
    # plant
    r.rect(936, 588, 950, 601, (60, 54, 50))
    for dx, dy in ((-6, -8), (4, -12), (0, -18), (8, -6), (-3, -24)):
        r.ellipse(943 + dx - 5, 588 + dy - 4, 943 + dx + 5, 588 + dy + 4, scale_c((74, 100, 62), 0.5 + 0.5 * light))
    # pendant lamp
    r.line(780, y0, 780, 553, 0.5, (30, 30, 30))
    r.poly([(773, 562), (787, 562), (783, 553), (777, 553)], (34, 32, 30))
    r.glow(780, 566, 60, (255, 196, 128), 0.75 * light)
    r.glow(780, 563, 10, (255, 236, 200), 0.95 * light)
    # recessed spots
    for sx in (830, 880, 930):
        r.glow(sx, y0 + 9, 26, (255, 214, 160), 0.55 * light)
    # sun beam
    r.poly([(x0 + 34, y0 + 18), (x0 + 34, y0 + 70), (x0 + 150, y1), (x0 + 90, y1)], (255, 190, 120, int(26 * light)))


def house(r, t, pal):
    s = min(int(t * N_STAGES), N_STAGES - 1)
    u = t * N_STAGES - s
    amb = pal[5]
    hor = pal[1]

    def tone(c):
        return scale_c(mix(c, hor, 0.12), amb)

    st = [1.0 if i < s else (u if i == s else 0.0) for i in range(N_STAGES)]
    p0, p1, p2, p3, p4, p5, p6 = st
    lights = clamp(ramp(p3, 0.75, 1.0) * 0.35 + ramp(p4, 0.0, 0.6) * 0.65)
    door_open = ramp(p4, 0.35, 0.95)

    # --- dirt mounds (cleared during exterior stage)
    dirt = ramp(p0, 0.0, 0.3) * (1 - ramp(p3, 0.4, 0.9))
    if dirt > 0:
        a = int(255 * dirt)
        r.poly([(400, G + 2), (450, G - 26), (500, G - 18), (540, G + 2)], tone((96, 76, 58)) + (a,))
        r.poly([(1070, G + 2), (1110, G - 20), (1170, G - 30), (1210, G + 2)], tone((90, 72, 54)) + (a,))

    # --- excavation & foundation
    pit = ramp(p0, -0.5, 0.35)
    if pit > 0 and p1 < 0.3:
        r.poly([(540, G), (1060, G), (1045, G + 26), (555, G + 26)], tone((44, 36, 30)) + (int(255 * pit),))
    found = ramp(p0, 0.2, 0.75)
    if found > 0:
        top = lerp(G + 26, 630, found)
        r.rect(560, top, 1040, G + 6, tone((150, 148, 142)))
        r.rect(560, top, 1040, top + 3, tone((178, 176, 170)))
    rebar = ramp(p0, 0.55, 0.85) * (1 - ramp(p1, 0.0, 0.15))
    if rebar > 0:
        for x in range(570, 1040, 16):
            r.line(x, 630, x, 622, 1.2, (150, 92, 56, int(255 * rebar)))
        r.line(565, 624, 1035, 624, 1.2, (150, 92, 56, int(255 * rebar)))
    # stakes & string lines
    stake = ramp(p0, -0.5, 0.3) * (1 - ramp(p1, 0.2, 0.5))
    if stake > 0:
        for x in (548, 1052):
            r.line(x, G + 4, x, G - 20, 2, (196, 170, 120, int(255 * stake)))
        r.line(548, G - 16, 1052, G - 16, 0.6, (236, 96, 64, int(255 * stake)))

    # --- ground floor block walls
    gf_h = ramp(p1, 0.0, 0.55)
    if gf_h > 0:
        top_y = 630 - 140 * gf_h
        row_h = 10
        y = 630
        i = 0
        while y > top_y + 0.01:
            y_top = max(y - row_h, top_y)
            r.rect(580, y_top, 1020, y, tone((168, 160, 150) if i % 2 == 0 else (160, 152, 142)))
            off = 0 if i % 2 == 0 else 14
            for x in range(580 + off, 1020, 28):
                r.line(x, y_top, x, y, 0.5, tone((120, 114, 106)))
            r.line(580, y_top, 1020, y_top, 0.5, tone((120, 114, 106)))
            y -= row_h
            i += 1
        for (x0, y0, x1, y1) in (DOOR, BIG):
            if y1 > top_y:
                r.rect(x0, max(y0, top_y), x1, y1, (26, 24, 24))
    # floor slab between levels
    slab = ramp(p1, 0.52, 0.62)
    if slab > 0:
        r.rect(lerp(800, 572, slab), 482, lerp(800, 1028, slab), 492, tone((150, 148, 142)))

    # --- scaffolding
    scaf = ramp(p1, 0.55, 0.75) * (1 - ramp(p3, 0.05, 0.35))
    if scaf > 0:
        c = (176, 176, 170, int(200 * scaf))
        for x in (596, 700, 810, 920, 1024):
            r.line(x, G, x, 372, 1.6, c)
        for y in (560, 482, 420):
            r.line(596, y, 1024, y, 1.4, c)

    # --- upper floor timber framing
    fr = ramp(p1, 0.6, 1.0)
    if fr > 0:
        xr = lerp(620, 1000, fr)
        wood = tone((196, 160, 112))
        r.line(620, 480, xr, 480, 3, wood)
        x = 620
        while x <= xr:
            r.line(x, 480, x, 392, 2.2, wood)
            x += 20
        if fr >= 0.999:
            r.line(620, 393, 1000, 393, 3, wood)

    # --- roof structure
    raf = ramp(p2, 0.0, 0.4)
    if raf > 0:
        wood = tone((190, 152, 104))
        n = int(raf * 12)
        for i in range(n + 1):
            k = i / 12
            x = lerp(620, 1000, k)
            r.line(x, 393, x, gable_y(x), 1.8, wood)
        r.line(600, 400, lerp(600, 810, raf), lerp(400, 296, raf), 3, wood)
        r.line(1020, 400, lerp(1020, 810, raf), lerp(400, 296, raf), 3, wood)
    sheath = ramp(p2, 0.55, 1.0) * (1 - ramp(p3, 0.0, 0.55))
    if sheath > 0 or p3 >= 1:
        pass
    if p2 > 0.55:
        osb = tone((176, 146, 100))
        k = ramp(p2, 0.55, 1.0)
        xr = lerp(620, 1000, k)
        pts = [(620, 482), (xr, 482)]
        if xr > 810:
            pts += [(xr, gable_y(xr)), (810, 302), (620, 392)]
        else:
            pts += [(xr, gable_y(xr)), (620, 392)]
        r.poly(pts, osb)

    # --- exterior finish: render + wood cladding
    ren = ramp(p3, 0.0, 0.45)
    if ren > 0:
        ytop = lerp(630, 490, ren)
        r.rect(580, ytop, 1020, 632, tone((226, 222, 214)))
        for (x0, y0, x1, y1) in (DOOR, BIG):
            if y1 > ytop:
                r.rect(x0, max(y0, ytop), x1, y1, (26, 24, 24))
        r.rect(572, 482, 1028, 494, tone((214, 210, 202)) if ren > 0.99 else tone((150, 148, 142)))
    clad = ramp(p3, 0.1, 0.6)
    if clad > 0:
        xr = lerp(620, 1000, clad)
        x = 620
        i = 0
        while x < xr - 0.01:
            x1 = min(x + 9, xr)
            base = (170, 106, 64) if i % 3 == 0 else ((160, 98, 58) if i % 3 == 1 else (178, 114, 70))
            r.poly([(x, 482), (x1, 482), (x1, gable_y(x1)), (x, gable_y(x))], tone(base))
            r.line(x, 482, x, gable_y(x), 0.4, tone((120, 72, 42)))
            x += 9
            i += 1

    # --- roof covering
    rc = ramp(p2, 0.3, 0.85)
    if rc > 0:
        dark = tone((44, 46, 52))
        kL = rc
        # left slope
        lx = lerp(598, 810, kL)
        ly = lerp(399, 288, kL)
        r.poly([(598, 399), (lx, ly), (lx, ly + 13), (598, 412)], dark)
        rx = lerp(1022, 810, kL)
        ry = lerp(399, 288, kL)
        r.poly([(1022, 399), (rx, ry), (rx, ry + 13), (1022, 412)], dark)
        if kL > 0.98:
            r.line(598, 399, 810, 288, 1.2, tone((90, 92, 98)))
            r.line(810, 288, 1022, 399, 1.2, tone((90, 92, 98)))
    chim = ramp(p2, 0.7, 1.0)
    if chim > 0:
        r.rect(900, lerp(340, 300, chim), 920, 345, tone((60, 60, 64)))
        r.rect(897, lerp(340, 296, chim), 923, lerp(343, 300, chim), tone((36, 36, 40)))

    # --- openings: windows & door
    win = ramp(p3, 0.4, 0.75)
    if win > 0:
        a = int(255 * win)
        warm = (255, 200, 138)
        for (x0, y0, x1, y1) in UPWIN:
            glass = mix((30, 36, 46), warm, 0.85 * lights)
            r.rect(x0, y0, x1, y1, (24, 24, 26, a))
            r.rect(x0 + 2, y0 + 2, x1 - 2, y1 - 2, glass + (a,))
            r.line((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, 1.2, (24, 24, 26, a))
            r.glow((x0 + x1) / 2, (y0 + y1) / 2, 60, (255, 180, 110), 0.35 * lights * win)
        # big window with room inside
        x0, y0, x1, y1 = BIG
        if win > 0.99:
            room(r, lights)
            dark = int(235 * (1 - lights))
            r.rect(x0, y0, x1, y1, (24, 30, 38, dark))
            r.poly([(x0 + 40, y0), (x0 + 70, y0), (x0 + 10, y1), (x0 - 20 + 20, y1)], (255, 255, 255, 12))
        else:
            r.rect(x0, y0, x1, y1, (26, 30, 36, a))
        r.line(x0, y0, x1, y0, 2.4, (22, 22, 24, a))
        r.line(x0, y1, x1, y1, 2.4, (22, 22, 24, a))
        r.line(x0, y0, x0, y1, 2.4, (22, 22, 24, a))
        r.line(x1, y0, x1, y1, 2.4, (22, 22, 24, a))
        # door
        dx0, dy0, dx1, dy1 = DOOR
        r.rect(dx0, dy0, dx1, dy1, (22, 20, 20, a))
        r.rect(dx0 + 2, dy0 + 2, dx1 - 2, dy1, mix((36, 30, 26), (255, 206, 150), lights) + (a,))
        if lights > 0 and win > 0.99:
            # hallway hint
            r.rect(dx0 + 12, dy0 + 20, dx1 - 12, dy1, scale_c((232, 186, 132), 0.4 + 0.6 * lights) + (int(200 * door_open),))
            r.rect(dx0 + 2, dy1 - 6, dx1 - 2, dy1, (150, 108, 74, int(255 * door_open)))
        pw = (dx1 - dx0 - 4) * (1 - 0.72 * door_open)
        r.rect(dx0 + 2, dy0 + 2, dx0 + 2 + pw, dy1, tone((92, 62, 40)) + (a,))
        r.rect(dx0 + 2 + pw - 5, 585, dx0 + 2 + pw - 3, 600, (200, 180, 140, a))
        # canopy
        r.rect(645, 536, 735, 542, (26, 26, 28, a))
        r.glow(dx0 + 27, dy0 + 40, 70, (255, 190, 120), 0.45 * door_open * lights)
        # sconces
        for sx in (650, 725):
            r.rect(sx - 2, 560, sx + 2, 568, (30, 30, 30, a))
            r.glow(sx, 566, 22, (255, 200, 140), 0.8 * lights)

    # eave light strip
    r.glow(810, 488, 260, (255, 180, 110), 0.12 * lights)


def landscape_fg(r, t, pal):
    s = min(int(t * N_STAGES), N_STAGES - 1)
    u = t * N_STAGES - s
    p3 = 1.0 if s > 3 else (u if s == 3 else 0.0)
    p4 = 1.0 if s > 4 else (u if s == 4 else 0.0)
    p6 = u if s == 6 else 0.0
    amb = pal[5]
    green = scale_c(mix((40, 56, 42), pal[1], 0.1), amb)
    g = ramp(p3, 0.5, 1.0)
    # cypresses beside the house
    for x, h, d in ((520, 200, 0.0), (548, 160, 0.1), (1072, 180, 0.05), (1102, 220, 0.12), (470, 140, 0.2)):
        cypress(r, x, G + 2, h, green, ramp(g, d, d + 0.7))
    # shrubs at the base
    for x, sz in ((600, 12), (740, 10), (980, 13), (1010, 9)):
        bush(r, x, G - 4, sz, scale_c((70, 86, 58), amb), g)
    # path to door
    path = ramp(p4, 0.0, 0.5)
    if path > 0:
        for i in range(4):
            y = G + 8 + i * 14
            w = 26 + i * 6
            r.rect(687 - w / 2, y, 687 + w / 2, y + 6, scale_c((190, 180, 164), amb) + (int(255 * path),))

    # --- pool & deck (last stage)
    pool = ramp(p6, 0.0, 0.45)
    if pool > 0:
        a = int(255 * pool)
        r.poly([(480, 656), (1140, 656), (1220, 760), (400, 760)], scale_c((196, 184, 166), amb) + (a,))
        water = ramp(p6, 0.25, 0.8)
        r.poly([(540, 668), (1080, 668), (1140, 740), (480, 740)], (34, 52, 60, a))
        if water > 0:
            wa = int(255 * water)
            for i in range(14):
                y0 = 668 + i * 5.2
                y1 = y0 + 5.4
                c = mix((70, 168, 180), (22, 82, 110), i / 13)
                c = mix(c, (240, 150, 90), 0.18)
                xl0, xr0 = lerp(540, 480, (y0 - 668) / 72), lerp(1080, 1140, (y0 - 668) / 72)
                xl1, xr1 = lerp(540, 480, (y1 - 668) / 72), lerp(1080, 1140, (y1 - 668) / 72)
                r.poly([(xl0, y0), (xr0, y0), (xr1, y1), (xl1, y1)], c + (wa,))
            # sunset streaks + window reflections
            for i in range(9):
                y = 674 + i * 7
                w = 40 + i * 9
                r.line(1000 - w / 2, y, 1000 + w / 2, y, 1.0, (255, 196, 140, int(110 * water)))
            for x in (685, 860):
                r.rect(x - 22, 680, x + 22, 700, (255, 200, 140, int(40 * water)))
            r.glow(810, 700, 220, (120, 220, 230), 0.18 * water)


def render(t, size):
    W, H = size[0] * SS, size[1] * SS
    img = Image.new("RGB", (W, H))
    pal = palette(t)
    cam = camera(t, W / H)
    r_sky = R(img, cam, parallax=0.15)
    sky(img, pal, r_sky)

    # sun (appears once the overcast clears)
    s = min(int(t * N_STAGES), N_STAGES - 1)
    sun_a = clamp((t - 0.3) / 0.15)
    if sun_a > 0:
        k = smooth(clamp((t - 0.42) / 0.58))
        sx, sy = lerp(1320, 1250, k), lerp(380, 600, k)
        rs = R(img, cam, parallax=0.2)
        col = mix((255, 236, 200), (255, 150, 80), k)
        rs.glow(sx, sy, 520, col, 0.45 * sun_a)
        rs.glow(sx, sy, 90, col, 0.8 * sun_a)
        rr = 18 + 6 * k
        rs.ellipse(sx - rr, sy - rr, sx + rr, sy + rr, col + (int(230 * sun_a),))

    hills(R(img, cam, parallax=0.3), 590, 46, 1.3, pal[2])
    rn = R(img, cam, parallax=0.6)
    hills(rn, 622, 26, 4.2, pal[3])
    tree_c = scale_c(pal[3], 0.8)
    for x, h in ((-260, 120), (-180, 150), (200, 130), (260, 110), (330, 150), (1380, 140), (1440, 120), (1520, 160),
                 (1880, 130), (1960, 150)):
        cypress(rn, x, 632, h, tree_c)
    for x in (60, 380, 1280, 1700):
        bush(rn, x, 624, 18, scale_c(pal[3], 1.1))

    r = R(img, cam)
    s_, u_ = min(int(t * N_STAGES), N_STAGES - 1), t * N_STAGES - min(int(t * N_STAGES), N_STAGES - 1)
    lawn = 1.0 if s_ > 3 else (ramp(u_, 0.4, 1.0) if s_ == 3 else 0.0)
    gc = mix(pal[4], scale_c((54, 66, 46), pal[5]), 0.55 * lawn)
    r.rect(-4000, G, 6000, 6000, scale_c(gc, 0.5))
    for i in range(30):
        y0 = G + i * 12
        r.rect(-4000, y0, 6000, y0 + 12.5, mix(mix(gc, pal[1], 0.18), scale_c(gc, 0.5), (i / 29) ** 0.8))
    for i in range(70):  # grass / soil texture strokes
        x = -600 + (i * 137) % 2800
        y = G + 6 + (i * 53) % 300
        r.line(x, y, x + 10 + (i % 5) * 4, y, 0.7, scale_c(gc, 1.25) + (90,))
    r.rect(-4000, G, 6000, G + 2, scale_c(mix(gc, pal[1], 0.3), 1.1))
    house(r, t, pal)
    landscape_fg(r, t, pal)

    out = img.resize(size, Image.LANCZOS)
    return out


def vignette(size):
    W, H = size
    y, x = np.mgrid[0:H, 0:W]
    nx, ny = (x - W / 2) / (W / 2), (y - H / 2) / (H / 2)
    d = np.sqrt(nx ** 2 * 0.8 + ny ** 2 * 0.9)
    v = 1 - 0.42 * np.clip(d - 0.35, 0, 1) ** 1.5
    v = (np.clip(v, 0, 1) * 255).astype(np.uint8)
    m = Image.fromarray(v, "L")
    return Image.merge("RGB", (m, m, m))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", choices=["desktop", "mobile"])
    ap.add_argument("--frames", type=int, default=N_FRAMES)
    ap.add_argument("--quality", type=int, default=72)
    args = ap.parse_args()

    sets = [("desktop", (1600, 900), os.path.join(ROOT, "frames")),
            ("mobile", (720, 1280), os.path.join(ROOT, "frames", "mobile"))]
    for name, size, out in sets:
        if args.only and args.only != name:
            continue
        os.makedirs(out, exist_ok=True)
        vig = vignette(size)
        for i in range(args.frames):
            t = i / (args.frames - 1)
            im = ImageChops.multiply(render(t, size), vig)
            im.save(os.path.join(out, f"frame_{i + 1:03d}.webp"), "WEBP", quality=args.quality, method=6)
            print(f"\r{name}: {i + 1}/{args.frames}", end="", flush=True)
        print()


if __name__ == "__main__":
    main()
