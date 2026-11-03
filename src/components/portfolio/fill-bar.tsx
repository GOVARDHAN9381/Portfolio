"use client";

import { motion } from "framer-motion";
import { useEnteredView } from "@/hooks/use-entered-view";

/* ════════════════════════════════════════════════════════════════════
   DETERMINISTIC FILL BAR — the animated percentage bar used by the
   ARSENAL skill modules and the JOURNEY depth levels.

   Unlike the previous per-element whileInView (which silently missed
   thin 5px bars during fast scrolling and left them stuck empty),
   this fills to `pct` the moment the bar enters the viewport — proven
   by a scroll-driven rect check that cannot be skipped. `once`
   semantics: stays filled after the first reveal.
   ════════════════════════════════════════════════════════════════════ */

export function FillBar({
  pct,
  delay = 0.15,
  duration = 1.1,
  trackClass,
  fillClass,
}: {
  pct: number; // 0..100
  delay?: number;
  duration?: number;
  trackClass?: string;
  fillClass?: string;
}) {
  const { ref, entered } = useEnteredView<HTMLDivElement>(60);

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${trackClass ?? "h-[5px] w-full bg-white/6"}`}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={entered ? { scaleX: pct / 100 } : { scaleX: 0 }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
        className={`h-full w-full origin-left ${
          fillClass ??
          "bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400 shadow-[0_0_12px_rgba(0,255,157,0.5)]"
        }`}
      />
    </div>
  );
}
