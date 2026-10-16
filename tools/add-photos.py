#!/usr/bin/env python3
"""
Make web-ready copies of your photographs.

Usage:  python tools/add-photos.py

Looks through the images/ folder (and everything inside it) and, for any picture
that does not yet have web copies, writes into images/web/:
  - NAME.jpg     longest edge 2000 px  (used in the lightbox and on large screens)
  - NAME-s.jpg   longest edge 900 px   (used for thumbnails and on phones)
Both are rotated the right way up, stripped of camera data (including GPS
location), and saved at a quality that looks identical but loads quickly.

It also refreshes images/web/_dims.json, which tells the gallery each photo's
shape so portrait and landscape pictures are laid out correctly.

Your originals are never touched. Safe to run as often as you like.

Then add the new filenames to data/photos.json to put them on the site.
Needs Pillow:  pip install Pillow
"""
import json
import os
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip install Pillow")

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "images")
DST = os.path.join(SRC, "web")
BIG, SMALL = 2000, 900
EXT = (".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff")

os.makedirs(DST, exist_ok=True)


def save(im, path, maxpx, quality):
    im = im.copy()
    if max(im.size) > maxpx:
        im.thumbnail((maxpx, maxpx), Image.LANCZOS)
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)


made = skipped = failed = 0
for root, dirs, files in os.walk(SRC):
    if os.path.abspath(root).startswith(os.path.abspath(DST)):
        continue
    for fn in sorted(files):
        if not fn.lower().endswith(EXT):
            continue
        stem = os.path.splitext(fn)[0]
        big = os.path.join(DST, stem + ".jpg")
        small = os.path.join(DST, stem + "-s.jpg")
        if os.path.exists(big) and os.path.exists(small):
            skipped += 1
            continue
        try:
            im = ImageOps.exif_transpose(Image.open(os.path.join(root, fn))).convert("RGB")
            if not os.path.exists(big):
                save(im, big, BIG, 82)
            if not os.path.exists(small):
                save(im, small, SMALL, 80)
            print("  made  images/web/" + stem + ".jpg  (+ -s)")
            made += 1
        except Exception as e:
            print("  FAILED", fn, "-", e)
            failed += 1

# Refresh the dimensions file the gallery uses
dims = {}
for fn in sorted(os.listdir(DST)):
    if fn.lower().endswith(".jpg") and not fn.endswith("-s.jpg"):
        try:
            with Image.open(os.path.join(DST, fn)) as im:
                dims[fn] = list(im.size)
        except Exception:
            pass
with open(os.path.join(DST, "_dims.json"), "w") as f:
    json.dump(dims, f, indent=0)

print(f"\n{made} new, {skipped} already done, {failed} failed. {len(dims)} photos measured.")
if made:
    print("Now add the new filenames to data/photos.json.")
