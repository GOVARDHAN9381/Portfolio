"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor: glowing dot + lagging spring ring.
 * Ring expands over interactive elements (a, button, [data-cursor]).
 * Desktop (fine pointer) only.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 24, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 24, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    // defer enablement to avoid sync setState in effect
    const raf = requestAnimationFrame(() => {
      setEnabled(true);
      document.documentElement.classList.add("cursor-native-off");
    });

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement | null;
      setHovering(
        !!target?.closest("a, button, [role='button'], [data-cursor='hover']")
      );
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("cursor-native-off");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* trailing ring */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-cyan-300/60"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 52 : 34,
          height: hovering ? 52 : 34,
          opacity: hovering ? 1 : 0.6,
          scale: pressed ? 0.8 : 1,
          boxShadow: hovering
            ? "0 0 18px rgba(0,240,255,0.45), inset 0 0 12px rgba(0,240,255,0.15)"
            : "0 0 10px rgba(0,240,255,0.2)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
      {/* core dot */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-cyan-300"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          boxShadow: "0 0 12px rgba(0,240,255,0.9), 0 0 30px rgba(0,240,255,0.4)",
        }}
        animate={{ scale: pressed ? 2 : 1 }}
      />
    </>
  );
}
