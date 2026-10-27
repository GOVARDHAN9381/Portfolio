"use client";

import { useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

type Props = {
  href: string;
  children: React.ReactNode;
  tone?: "cyan" | "ghost";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Fluid button — a liquid blob fills from the exact pointer entry point
 * (with an organic morphing edge) while the button magnetically drifts
 * toward the cursor.
 */
export default function FluidButton({
  href,
  children,
  tone = "cyan",
  className = "",
  onClick,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [fill, setFill] = useState({ on: false, x: 50, y: 50 });
  const mx = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });
  const my = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });

  const move = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    mx.set(Math.max(-7, Math.min(7, dx * 0.16)));
    my.set(Math.max(-5, Math.min(5, dy * 0.22)));
  };

  const enter = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setFill({
      on: true,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const leave = () => {
    setFill((f) => ({ ...f, on: false }));
    mx.set(0);
    my.set(0);
  };

  const toneClass =
    tone === "cyan"
      ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200 hover:text-[#050508] hover:shadow-[0_0_40px_rgba(0,240,255,0.35)]"
      : "border-white/12 text-muted-foreground hover:text-cyan-200 hover:border-cyan-400/30";

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onPointerMove={move}
      onPointerEnter={enter}
      onPointerLeave={leave}
      style={{ x: mx, y: my }}
      data-cursor="hover"
      className={`relative overflow-hidden border px-8 py-3.5 font-hud text-xs transition-colors duration-300 ${toneClass} ${className}`}
    >
      {/* liquid blob */}
      <span
        aria-hidden="true"
        className="liquid-morph absolute left-0 top-0 z-0 block h-72 w-72 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: `${fill.x}%`,
          top: `${fill.y}%`,
          transform: `translate(-50%, -50%) scale(${fill.on ? 1 : 0})`,
          background:
            tone === "cyan" ? "rgba(0, 240, 255, 0.92)" : "rgba(232, 234, 242, 0.14)",
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.a>
  );
}
