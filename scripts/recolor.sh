#!/bin/bash
# v3 recolor: cyan/violet/pink neon -> acid mint green family on pitch black
set -e
cd /home/z/my-project/src

# tailwind palette classes -> emerald family
grep -rl "cyan-" . | xargs -r sed -i 's/cyan-300/emerald-300/g; s/cyan-400/emerald-400/g; s/cyan-200/emerald-200/g; s/cyan-500/emerald-500/g; s/cyan-600/emerald-600/g'
grep -rl "violet-" . | xargs -r sed -i 's/violet-300/emerald-300/g; s/violet-400/emerald-400/g; s/violet-500/emerald-500/g'
grep -rl "fuchsia-" . | xargs -r sed -i 's/fuchsia-300/emerald-300/g; s/fuchsia-200/emerald-200/g'

# raw hexes (holograms, css vars, glows)
grep -rl "#00f0ff" . | xargs -r sed -i 's/#00f0ff/#00ff9d/g'
grep -rl "#a78bfa" . | xargs -r sed -i 's/#a78bfa/#34d399/g'
grep -rl "#f0abfc" . | xargs -r sed -i 's/#f0abfc/#7dffc0/g'
grep -rl "#4df0ff" . | xargs -r sed -i 's/#4df0ff/#5cffb8/g'
grep -rl "#8ef5ff" . | xargs -r sed -i 's/#8ef5ff/#b0ffd9/g'

# rgba variants (spaced + compact)
grep -rl "rgba(0, 240, 255" . | xargs -r sed -i 's/rgba(0, 240, 255/rgba(0, 255, 157/g'
grep -rl "rgba(0,240,255" . | xargs -r sed -i 's/rgba(0,240,255/rgba(0,255,157/g'
grep -rl "rgba(167, 139, 250" . | xargs -r sed -i 's/rgba(167, 139, 250/rgba(52, 211, 153/g'
grep -rl "rgba(167,139,250" . | xargs -r sed -i 's/rgba(167,139,250/rgba(52,211,153/g'
grep -rl "rgba(240, 171, 252" . | xargs -r sed -i 's/rgba(240, 171, 252/rgba(125, 255, 192/g'
grep -rl "rgba(240,171,252" . | xargs -r sed -i 's/rgba(240,171,252/rgba(125,255,192/g'

echo "== leftover neon refs (should be empty) =="
grep -rn "cyan-\|violet-\|fuchsia-\|#00f0ff\|#a78bfa\|#f0abfc" . || echo "CLEAN"
