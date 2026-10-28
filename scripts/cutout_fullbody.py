#!/usr/bin/env python3
"""Chroma-key the full-body render -> RGBA cutout + silhouette edge JSON.
Screen = green-dominant pixels; despill + feather; crop to bbox; export
edge points (normalized) for the three.js particle system."""
from PIL import Image, ImageFilter
import json, os

SRC = "/home/z/my-project/scripts/assets/fullbody_suit.png"
OUT_IMG = "/home/z/my-project/public/holo/fullbody.png"
OUT_EDGE = "/home/z/my-project/public/holo/fullbody_edges.json"
os.makedirs(os.path.dirname(OUT_IMG), exist_ok=True)

im = Image.open(SRC).convert("RGB")
W, H = im.size
px = im.load()

# ── build screen mask: green channel dominant over red AND blue ──
mask = [[False] * W for _ in range(H)]
for y in range(H):
    for x in range(W):
        r, g, b = px[x, y]
        if g > r * 1.12 and g > b * 1.12 and g > 42:
            mask[y][x] = True

# ── clean mask: erode 1px then feather ──
m2 = [[False] * W for _ in range(H)]
for y in range(H):
    for x in range(W):
        if not mask[y][x]:
            m2[y][x] = False
            continue
        n = 0
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                yy, xx = y + dy, x + dx
                if 0 <= yy < H and 0 <= xx < W and mask[yy][xx]:
                    n += 1
        m2[y][x] = n >= 6  # drop isolated/noisy screen pixels

alpha = Image.new("L", (W, H), 0)
ap = alpha.load()
for y in range(H):
    for x in range(W):
        ap[x, y] = 0 if m2[y][x] else 255

# ── keep only the largest connected alpha component (kills shadow blobs) ──
seen = [[False] * W for _ in range(H)]
best = []
from collections import deque
for y0 in range(H):
    for x0 in range(W):
        if ap[x0, y0] > 90 and not seen[y0][x0]:
            comp = []
            q = deque([(x0, y0)])
            seen[y0][x0] = True
            while q:
                x, y = q.popleft()
                comp.append((x, y))
                for xx, yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
                    if 0 <= xx < W and 0 <= yy < H and not seen[yy][xx] and ap[xx, yy] > 90:
                        seen[yy][xx] = True
                        q.append((xx, yy))
            if len(comp) > len(best):
                best = comp
keep = set(best)
for y in range(H):
    for x in range(W):
        if (x, y) not in keep:
            ap[x, y] = 0

# feather
alpha = alpha.filter(ImageFilter.GaussianBlur(1.1))
alpha = alpha.filter(ImageFilter.MinFilter(3))  # erode to kill green fringe
alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))

# ── despill: clamp green where it dominates (halo suppression) ──
out = Image.new("RGBA", (W, H))
op = out.load()
al = alpha.load()
for y in range(H):
    for x in range(W):
        r, g, b = px[x, y]
        a = al[x, y]
        if a > 0 and g > (r + b) * 0.62:
            g = int((r + b) * 0.62)
        op[x, y] = (r, g, b, a)

# ── crop to bbox with margin ──
bbox = alpha.getbbox()
if bbox:
    mx = 14
    l, t, r_, b_ = bbox
    l, t = max(0, l - mx), max(0, t - mx)
    r_, b_ = min(W, r_ + mx), min(H, b_ + mx)
    out = out.crop((l, t, r_, b_))
    alpha_c = alpha.crop((l, t, r_, b_))
else:
    alpha_c = alpha

cw, ch = out.size
# cap texture height for GPU friendliness
MAXH = 1100
if ch > MAXH:
    nw = round(cw * MAXH / ch)
    out = out.resize((nw, MAXH), Image.LANCZOS)
    alpha_c = alpha_c.resize((nw, MAXH), Image.LANCZOS)
    cw, ch = out.size

out.save(OUT_IMG, optimize=True)
print(f"cutout: {cw}x{ch} -> {OUT_IMG} ({os.path.getsize(OUT_IMG)//1024} KB)")

# ── silhouette edge points (normalized 0..1, y down) ──
ac = alpha_c.load()
edges = []
for y in range(1, ch - 1):
    for x in range(1, cw - 1):
        if ac[x, y] > 140:
            if ac[x - 1, y] <= 90 or ac[x + 1, y] <= 90 or ac[x, y - 1] <= 90 or ac[x, y + 1] <= 90:
                edges.append([x / cw, y / ch])
# thin out to ~1800 points
step = max(1, len(edges) // 1800)
edges = edges[::step]
with open(OUT_EDGE, "w") as f:
    json.dump({"w": cw, "h": ch, "points": edges}, f)
print(f"edge points: {len(edges)} -> {OUT_EDGE}")
