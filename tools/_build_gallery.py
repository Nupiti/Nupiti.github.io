#!/usr/bin/env python3
"""One-off: build images/web from the master manifest and write data/photos.json.
Deterministic names (saved in images/web/_names.json). Resumable: run until it
says DONE. Parks any web file not in the manifest in images/web/_old/."""
import json, os, sys, shutil, time
from PIL import Image, ImageOps
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _gallery_manifest import M, SESSIONS, ALIASES, PREFIX

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(SITE, "images"); DST = os.path.join(SRC, "web")
NAMES = os.path.join(DST, "_names.json")
BUDGET = 150  # seconds per run
os.makedirs(DST, exist_ok=True)

# ---- deterministic names ------------------------------------------------
if os.path.exists(NAMES):
    names = json.load(open(NAMES))
else:
    old = {}
    om = os.path.expanduser("~/manifest.json")
    if os.path.exists(om):
        for src, out, _ in json.load(open(om)):
            old[os.path.basename(src)] = out[:-4]
    used = set(ALIASES.values()); names = {}; counters = {}
    for src, sess, cap, pick in M:
        b = os.path.basename(src)
        if src in ALIASES: nm = ALIASES[src]
        elif b in old and old[b] not in used: nm = old[b]
        else:
            p = PREFIX[sess]; counters.setdefault(p, 0)
            while True:
                counters[p] += 1; nm = f"{p}-{counters[p]:02d}"
                if nm not in used: break
        used.add(nm); names[src] = nm
    json.dump(names, open(NAMES, "w"), indent=0)

def save(im, path, maxpx, q):
    im = im.copy()
    if max(im.size) > maxpx: im.thumbnail((maxpx, maxpx), Image.LANCZOS)
    im.save(path, "JPEG", quality=q, optimize=True, progressive=True)

t0 = time.time(); made = skipped = failed = 0; stopped = False
for src, nm in names.items():
    big = os.path.join(DST, nm + ".jpg"); small = os.path.join(DST, nm + "-s.jpg")
    if os.path.exists(big) and os.path.exists(small): skipped += 1; continue
    if time.time() - t0 > BUDGET: stopped = True; break
    try:
        im = Image.open(os.path.join(SRC, src))
        try: im.draft("RGB", (2400, 2400))   # fast JPEG decode at reduced size
        except Exception: pass
        im = ImageOps.exif_transpose(im).convert("RGB")
        if not os.path.exists(big): save(im, big, 2000, 82)
        if not os.path.exists(small): save(im, small, 900, 80)
        made += 1
    except Exception as e:
        print("FAILED", src, e); failed += 1

print(f"made {made}, already {skipped}, failed {failed}, remaining {len(names)-made-skipped-failed}")
if stopped:
    print("TIME BUDGET REACHED — run again to continue."); sys.exit(0)

# ---- finish: park orphans, dims, photos.json -----------------------------
keep = {nm + ".jpg" for nm in names.values()} | {nm + "-s.jpg" for nm in names.values()}
oldd = os.path.join(DST, "_old"); moved = 0
for f in os.listdir(DST):
    if f.lower().endswith(".jpg") and f not in keep:
        os.makedirs(oldd, exist_ok=True); shutil.move(os.path.join(DST, f), os.path.join(oldd, f)); moved += 1

dims = {}
for nm in names.values():
    with Image.open(os.path.join(DST, nm + ".jpg")) as im: dims[nm + ".jpg"] = list(im.size)
json.dump(dims, open(os.path.join(DST, "_dims.json"), "w"), indent=0)

readme = [
 "This is the only file you edit to change the gallery.",
 "Web-ready images live in images/web/ (made by tools/add-photos.py from your originals).",
 "A session is a story, not a place. \"pick\": true makes a photo the large one at the top.",
 "Caption convention: a short descriptive phrase, no final full stop, place last after a comma.",
]
sessions = []
for key, title, place, note in SESSIONS:
    photos = [{"file": names[s] + ".jpg", "caption": c, **({"pick": True} if p else {})}
              for s, ss, c, p in M if ss == key]
    sessions.append({"title": title, "place": place, "note": note, "photos": photos})
json.dump({"_README": readme, "sessions": sessions},
          open(os.path.join(SITE, "data", "photos.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"DONE. {len(names)} photos, orphans parked: {moved}, dims: {len(dims)}")
print({s['title']: len(s['photos']) for s in sessions})
