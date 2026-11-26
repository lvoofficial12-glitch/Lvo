#!/usr/bin/env python3
"""
Builds the scroll frame sequence from 7 still keyframes (one per stage):
slow camera push, cross-fades between the construction stages (same camera),
and "walk-in" zooms for exterior -> entrance -> interior.

    python3 tools/build_frames.py

Input : tools/keyframes/stage1.jpg ... stage7.jpg  (16:9, same camera for 1-4 and 7)
Output: frames/frame_001.webp ... frame_120.webp           (desktop, 1280x720)
        frames/mobile/frame_001.webp ... frame_120.webp    (mobile, 540x960)

When you have a real video of the build, you don't need this script:
extract the frames with ffmpeg instead (see README).
Requires Pillow (with WebP).
"""
import argparse
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYS = os.path.join(ROOT, "tools", "keyframes")

N_FRAMES = 120
N_STAGES = 7
FADE_START = 0.72  # part of each stage after which the cross-fade to the next one begins

# Point each camera zooms toward (x, y as 0-1 of the image)
HOUSE = (0.62, 0.45)       # house centre on the exterior views (stages 1-4, 7)
DOOR_ON_EXTERIOR = (0.607, 0.60)
OPEN_DOOR = (0.44, 0.55)   # stage 5 (entrance)
INTERIOR = (0.50, 0.45)    # stage 6 (living room)

# Horizontal centre kept on phones, per stage
MOBILE_CX = [0.60, 0.62, 0.62, 0.62, 0.45, 0.50, 0.62]


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def view(img, zoom, focus, size):
    """Crop `img` zoomed `zoom`x so that `focus` stays fixed, resized to `size`."""
    W, H = img.size
    tw, th = size
    # crop to the output aspect first
    aspect = tw / th
    if W / H > aspect:
        bw, bh = H * aspect, H
    else:
        bw, bh = W, W / aspect
    w, h = bw / zoom, bh / zoom
    fx, fy = focus
    left = (W - w) * fx
    top = (H - h) * fy
    return img.resize(size, Image.LANCZOS, box=(left, top, left + w, top + h))


def frame_at(keys, t, size):
    """Returns (image, mobile_centre_x) for global progress t in [0, 1]."""
    s = min(int(t * N_STAGES), N_STAGES - 1)
    u = t * N_STAGES - s
    w = smooth((u - FADE_START) / (1 - FADE_START)) if s < N_STAGES - 1 else 0.0
    ext = 1.0 + 0.10 * min(1.0, t / (4 / N_STAGES))  # slow push over the build stages

    if s <= 2:  # foundation -> framing -> roof -> exterior: same camera, cross-fade
        a = view(keys[s], ext, HOUSE, size)
        b = view(keys[s + 1], ext, HOUSE, size) if w > 0 else None
    elif s == 3:  # exterior -> push toward the door -> entrance
        fx = HOUSE[0] + (DOOR_ON_EXTERIOR[0] - HOUSE[0]) * w
        fy = HOUSE[1] + (DOOR_ON_EXTERIOR[1] - HOUSE[1]) * w
        a = view(keys[3], ext * (1 + 0.9 * w * w), (fx, fy), size)
        b = view(keys[4], 1 + 0.25 * (1 - w), OPEN_DOOR, size) if w > 0 else None
    elif s == 4:  # entrance -> through the door -> interior
        a = view(keys[4], (1 + 0.06 * u) * (1 + 0.9 * w * w), OPEN_DOOR, size)
        b = view(keys[5], 1 + 0.25 * (1 - w), INTERIOR, size) if w > 0 else None
    elif s == 5:  # interior -> back outside at sunset
        a = view(keys[5], (1 + 0.06 * u) * (1 + 0.15 * w), INTERIOR, size)
        b = view(keys[6], 1.30 - 0.22 * w, HOUSE, size) if w > 0 else None
    else:  # pool at sunset: slow pull back to the full view
        a = view(keys[6], 1.08 - 0.08 * smooth(u), HOUSE, size)
        b = None

    img = Image.blend(a, b, w) if b is not None else a
    cx = MOBILE_CX[s] if s == N_STAGES - 1 else MOBILE_CX[s] + (MOBILE_CX[s + 1] - MOBILE_CX[s]) * w
    return img, cx


def mobile(frame, cx, size=(720, 1280), top=110):
    """Portrait frame: the whole house kept sharp in the upper part,
    a blurred, darkened extension of the same picture around it."""
    mw, mh = size
    W, H = frame.size
    # background: cover crop, blurred and darkened
    scale = mh / H
    bg = frame.resize((int(W * scale), mh), Image.BILINEAR)
    left = int(max(0, min(bg.width - mw, cx * bg.width - mw / 2)))
    bg = bg.crop((left, 0, left + mw, mh)).filter(ImageFilter.GaussianBlur(28))
    bg = Image.blend(Image.new("RGB", size, (12, 11, 10)), bg, 0.42)
    # foreground: 56% of the width around the house, full height
    cw = W * 0.56
    x0 = max(0, min(W - cw, cx * W - cw / 2))
    fh = int(mw * H / cw)
    fg = frame.resize((mw, fh), Image.LANCZOS, box=(x0, 0, x0 + cw, H))
    # feathered top / bottom edges
    mask = Image.new("L", (mw, fh), 255)
    d = ImageDraw.Draw(mask)
    fade_t, fade_b = 70, 150
    for y in range(fade_t):
        d.line([(0, y), (mw, y)], fill=int(255 * (y / fade_t) ** 1.5))
    for y in range(fade_b):
        d.line([(0, fh - 1 - y), (mw, fh - 1 - y)], fill=int(255 * (y / fade_b) ** 1.5))
    bg.paste(fg, (0, top), mask)
    # smooth fade to the page colour behind the text (bottom of the screen)
    shade = Image.new("L", size, 0)
    d = ImageDraw.Draw(shade)
    g0, g1 = top + fh - 170, top + fh + 60
    for y in range(g0, mh):
        d.line([(0, y), (mw, y)], fill=int(235 * smooth((y - g0) / (g1 - g0))))
    bg.paste((12, 11, 10), (0, 0), shade)
    return bg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--frames", type=int, default=N_FRAMES)
    ap.add_argument("--quality", type=int, default=62)
    args = ap.parse_args()

    keys = [Image.open(os.path.join(KEYS, f"stage{i}.jpg")).convert("RGB") for i in range(1, N_STAGES + 1)]
    out_d = os.path.join(ROOT, "frames")
    out_m = os.path.join(out_d, "mobile")
    os.makedirs(out_m, exist_ok=True)
    for f in os.listdir(out_d):
        if f.endswith(".webp"):
            os.remove(os.path.join(out_d, f))
    for f in os.listdir(out_m):
        if f.endswith(".webp"):
            os.remove(os.path.join(out_m, f))

    for i in range(args.frames):
        t = i / (args.frames - 1)
        img, cx = frame_at(keys, t, (1600, 900))
        desk = img.resize((1280, 720), Image.LANCZOS)
        name = f"frame_{i + 1:03d}.webp"
        desk.save(os.path.join(out_d, name), "WEBP", quality=args.quality - 8, method=6)
        mobile(img, cx).resize((540, 960), Image.LANCZOS).save(os.path.join(out_m, name), "WEBP", quality=args.quality, method=6)
        print(f"\r{i + 1}/{args.frames}", end="", flush=True)
    print()


if __name__ == "__main__":
    main()
