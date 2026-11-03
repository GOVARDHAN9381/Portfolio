"use client";

import { useEffect, useRef } from "react";

/* ════════════════════════════════════════════════════════════════════
   CURSOR STAR SWARM — a 3D cloud of stars that swirls around the
   cursor. Every star rides its own tilted orbital ring around the
   pointer anchor (true 3D: perspective projection, depth-based size
   + alpha), the whole cloud follows the cursor with spring lag and
   trails behind fast moves like it's dragging through space.
   Rendered on a single lightweight 2D canvas — no extra WebGL ctx.
   ════════════════════════════════════════════════════════════════════ */

type Star = {
  r: number; // orbit radius (px)
  ecc: number; // ellipse squash 0.55..1
  tilt: number; // orbital plane tilt around X
  yaw: number; // orbital plane rotation around Y
  z0: number; // depth offset from anchor
  speed: number; // angular speed rad/s (some retrograde)
  phase: number; // start angle
  size: number; // core radius px
  tw: number; // twinkle speed
  mint: boolean;
};

const TAU = Math.PI * 2;
const F = 320; // focal length for perspective projection
const Z_NEAR = 150; // depth band center

export default function CursorStars() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      canvas.style.display = "none";
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const COUNT = fine ? 150 : 64;

    /* deterministic-ish seedable rng */
    let seed = 20260214;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const stars: Star[] = Array.from({ length: COUNT }, () => ({
      r: 10 + Math.pow(rnd(), 2.1) * 150,
      ecc: 0.55 + rnd() * 0.45,
      tilt: rnd() * Math.PI,
      yaw: rnd() * Math.PI,
      z0: (rnd() - 0.5) * 210,
      speed: (0.35 + rnd() * 1.15) * (rnd() < 0.28 ? -1 : 1),
      phase: rnd() * TAU,
      size: 0.9 + Math.pow(rnd(), 2.0) * 2.4,
      tw: 0.9 + rnd() * 2.2,
      mint: rnd() < 0.34,
    }));

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = !document.hidden;
    let fade = 0; // 0→1 ramp, starts on the first pointer move
    let started = false;

    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /* cloud anchor springs toward the pointer */
    const target = { x: w / 2, y: h * 0.6 };
    const anchor = { x: target.x, y: target.y };
    const vel = { x: 0, y: 0 }; // smoothed anchor velocity (px/s)

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!started) {
        started = true;
        canvas.style.opacity = "1";
      }
    };
    const onVis = () => {
      visible = !document.hidden;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (started && fade < 1) fade = Math.min(1, fade + dt / 0.9);
      if (fade === 0) {
        /* still waiting for the first move — keep the sky clean */
        ctx.clearRect(0, 0, w, h);
        return;
      }

      /* spring-follow the cursor + smooth velocity */
      const k = 1 - Math.exp(-5.2 * dt);
      const px = anchor.x;
      const py = anchor.y;
      anchor.x += (target.x - anchor.x) * k;
      anchor.y += (target.y - anchor.y) * k;
      const instX = (anchor.x - px) / Math.max(dt, 1e-3);
      const instY = (anchor.y - py) / Math.max(dt, 1e-3);
      vel.x += (instX - vel.x) * Math.min(1, dt * 6);
      vel.y += (instY - vel.y) * Math.min(1, dt * 6);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      /* faint nebula halo that binds the swarm into one cloud */
      const halo = ctx.createRadialGradient(
        anchor.x,
        anchor.y,
        0,
        anchor.x,
        anchor.y,
        120
      );
      halo.addColorStop(0, `rgba(125,255,200,${(0.085 * fade).toFixed(3)})`);
      halo.addColorStop(0.55, `rgba(125,255,200,${(0.03 * fade).toFixed(3)})`);
      halo.addColorStop(1, "rgba(125,255,200,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 120, 0, TAU);
      ctx.fill();

      const t = now / 1000;

      for (const s of stars) {
        /* position on the tilted orbital ring (anchor-local 3D) */
        const a = s.phase + t * s.speed;
        const breathe = 1 + 0.08 * Math.sin(t * 0.7 + s.phase * 3.1);
        let x = Math.cos(a) * s.r * breathe;
        let y = Math.sin(a) * s.r * s.ecc * breathe;
        let z = s.z0;
        /* tilt around X */
        const ct = Math.cos(s.tilt);
        const st = Math.sin(s.tilt);
        const y1 = y * ct - z * st;
        const z1 = y * st + z * ct;
        /* yaw around Y */
        const cy = Math.cos(s.yaw + t * 0.05);
        const sy = Math.sin(s.yaw + t * 0.05);
        const x2 = x * cy + z1 * sy;
        const z2 = -x * sy + z1 * cy;

        /* perspective projection — depth drives size + alpha */
        const persp = F / (F + z2 + Z_NEAR);
        /* velocity trail — nearer stars lag more (parallax drag) */
        const depthLag = 0.028 + (persp - 0.6) * 0.16;
        const sx = anchor.x + x2 * persp - vel.x * depthLag;
        const sy2 = anchor.y + y1 * persp - vel.y * depthLag;

        if (sx < -30 || sx > w + 30 || sy2 < -30 || sy2 > h + 30) continue;

        const twinkle = 0.62 + 0.38 * Math.sin(t * s.tw + s.phase * 9.3);
        const alpha =
          fade * twinkle * Math.min(1.45, Math.max(0.35, persp)) * 1.0;
        const size = Math.max(0.5, s.size * persp);

        /* soft glow halo */
        ctx.fillStyle = s.mint
          ? `rgba(125,255,200,${(alpha * 0.22).toFixed(3)})`
          : `rgba(234,255,244,${(alpha * 0.16).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, sy2, size * 3.6, 0, TAU);
        ctx.fill();
        /* bright core */
        ctx.fillStyle = s.mint
          ? `rgba(190,255,228,${alpha.toFixed(3)})`
          : `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, sy2, size, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 opacity-0 transition-opacity duration-700"
    />
  );
}
