"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { identity } from "@/config/portfolio";

/**
 * Cinematic boot sequence: counter 0→100 + decode lines,
 * then the screen splits open like elevator doors.
 */
export default function Preloader({ onDone }: { onDone?: () => void }) {
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const DURATION = 1700;
    let raf = 0;

    const step = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      // ease-out for that dramatic slow finish
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          setGone(true);
          onDone?.();
        }, 260);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const bootLine =
    count > 66 ? "RENDERING SCENES" : count > 33 ? "LOADING MEMORY" : "INITIALIZING";

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-[#050508]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          {/* split-open panels */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-[#050508]"
            exit={{ y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-[#050508]"
            exit={{ y: "100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />

          <motion.div
            className="relative z-10 flex flex-col items-center gap-5"
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="font-hud text-[10px] text-emerald-300/70">
              {bootLine} ...
            </div>
            <div className="font-display text-7xl font-bold tabular-nums text-foreground glow-text-cyan">
              {String(count).padStart(3, "0")}
              <span className="text-emerald-400/60 text-4xl">%</span>
            </div>
            <div className="relative h-px w-52 overflow-hidden bg-white/10">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-400 transition-[width] duration-100"
                style={{ width: `${count}%` }}
              />
            </div>
            <div className="font-hud text-[10px] text-muted-foreground">
              PORTFOLIO OF {identity.firstName} {identity.lastName}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
