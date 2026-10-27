"use client";

import { useEffect, useRef } from "react";

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number; // 0 = cyan, 1 = violet
};

/**
 * Interactive particle constellation — drifting nodes that link with
 * neon lines and react to the mouse (repel + link to pointer).
 */
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: P[] = [];
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    const COUNT = isMobile ? 42 : 96;
    const LINK_DIST = isMobile ? 110 : 150;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
        hue: Math.random() > 0.6 ? 1 : 0,
      }));
    };

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const m = mouse.current;

      for (const p of particles) {
        // gentle repel from cursor
        const dx = p.x - m.x;
        const dy = p.y - m.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130 && dist > 0.01) {
          const force = ((130 - dist) / 130) * 0.35;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.x += p.vx;
        p.y += p.vy;

        // damp velocity back to cruise speed
        p.vx *= 0.96;
        p.vy *= 0.96;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed < 0.12) {
          p.vx += (Math.random() - 0.5) * 0.06;
          p.vy += (Math.random() - 0.5) * 0.06;
        }

        // wrap edges
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      // links between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.22;
            ctx.strokeStyle =
              a.hue === b.hue
                ? `rgba(0, 255, 157, ${alpha})`
                : `rgba(52, 211, 153, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // links from cursor to nearby particles
      if (m.x > 0) {
        for (const p of particles) {
          const d = Math.hypot(p.x - m.x, p.y - m.y);
          if (d < 180) {
            const alpha = (1 - d / 180) * 0.5;
            ctx.strokeStyle = `rgba(0, 255, 157, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle =
          p.hue === 0 ? "rgba(0, 255, 157, 0.85)" : "rgba(52, 211, 153, 0.85)";
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    seed();
    tick();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
