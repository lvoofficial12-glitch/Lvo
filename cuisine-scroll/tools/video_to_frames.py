#!/usr/bin/env python3
"""
Turns one or more videos (played one after the other) into the scroll frame
sequence used by the site: a landscape set for desktop and a portrait set for
phones (the whole kitchen kept sharp at the top, a cream fade behind the text).

    python3 tools/video_to_frames.py tools/video/01-construction.mp4 tools/video/02-interieur.mp4 --fps 8

Requires ffmpeg and Pillow. Prints the frame count to put in js/main.js (CONFIG.frameCount).
"""
import argparse
import glob
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG = (244, 239, 230)  # site background (--bg in css/style.css): the mobile frames fade into it


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def mobile(frame, cx, size=(720, 1280), top=96, crop=0.56, bg_color=BG):
    """Portrait frame: `crop` of the width around `cx`, sharp at the top,
    a blurred extension of the same picture around it, fading to dark at the bottom."""
    mw, mh = size
    W, H = frame.size
    scale = mh / H
    bg = frame.resize((int(W * scale), mh), Image.BILINEAR)
    left = int(max(0, min(bg.width - mw, cx * bg.width - mw / 2)))
    bg = bg.crop((left, 0, left + mw, mh)).filter(ImageFilter.GaussianBlur(28))
    bg = Image.blend(Image.new("RGB", size, bg_color), bg, 0.42)
    cw = W * crop
    x0 = max(0, min(W - cw, cx * W - cw / 2))
    fh = int(mw * H / cw)
    fg = frame.resize((mw, fh), Image.LANCZOS, box=(x0, 0, x0 + cw, H))
    mask = Image.new("L", (mw, fh), 255)
    d = ImageDraw.Draw(mask)
    for y in range(70):
        d.line([(0, y), (mw, y)], fill=int(255 * (y / 70) ** 1.5))
    for y in range(150):
        d.line([(0, fh - 1 - y), (mw, fh - 1 - y)], fill=int(255 * (y / 150) ** 1.5))
    bg.paste(fg, (0, top), mask)
    shade = Image.new("L", size, 0)
    d = ImageDraw.Draw(shade)
    g0, g1 = top + fh - 170, top + fh + 60
    for y in range(g0, mh):
        d.line([(0, y), (mw, y)], fill=int(235 * smooth((y - g0) / (g1 - g0))))
    bg.paste(bg_color, (0, 0), shade)
    return bg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("videos", nargs="+")
    ap.add_argument("--fps", type=float, default=8, help="frames kept per second of video")
    ap.add_argument("--width", type=int, default=1280, help="desktop frame width")
    ap.add_argument("--quality", type=int, default=60)
    ap.add_argument("--mobile-cx", type=float, default=0.56,
                    help="horizontal centre (0-1) kept on phones")
    ap.add_argument("--mobile-crop", type=float, default=0.56,
                    help="share of the video width kept sharp on phones")
    args = ap.parse_args()

    out_d = os.path.join(ROOT, "frames")
    out_m = os.path.join(out_d, "mobile")
    os.makedirs(out_m, exist_ok=True)
    for f in glob.glob(os.path.join(out_d, "*.webp")) + glob.glob(os.path.join(out_m, "*.webp")):
        os.remove(f)

    tmp = tempfile.mkdtemp()
    try:
        n = 0
        for v in args.videos:
            pattern = os.path.join(tmp, f"{os.path.basename(v)}_%05d.png")
            subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vf", f"fps={args.fps}", pattern], check=True)
            for src in sorted(glob.glob(os.path.join(tmp, f"{os.path.basename(v)}_*.png"))):
                n += 1
                img = Image.open(src).convert("RGB")
                h = round(args.width * img.height / img.width / 2) * 2
                name = f"frame_{n:03d}.webp"
                img.resize((args.width, h), Image.LANCZOS).save(
                    os.path.join(out_d, name), "WEBP", quality=args.quality, method=6)
                mobile(img, args.mobile_cx, crop=args.mobile_crop).resize((540, 960), Image.LANCZOS).save(
                    os.path.join(out_m, name), "WEBP", quality=args.quality + 2, method=6)
                print(f"\r{n} frames", end="", flush=True)
        print(f"\nDone: {n} frames. Set CONFIG.frameCount = {n} in js/main.js.")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
