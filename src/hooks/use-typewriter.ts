"use client";

import { useEffect, useState } from "react";

/**
 * Terminal-grade typewriter — timeline-driven (rAF + elapsed time),
 * so it never drifts when the main thread stalls on WebGL work.
 */
export function useTypewriter(
  text: string,
  active: boolean,
  speed = 13,
  startDelay = 600
) {
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!active || !text) {
      // defer reset to avoid sync setState in effect
      const raf = requestAnimationFrame(() => setOutput(""));
      return () => cancelAnimationFrame(raf);
    }
    let raf = 0;
    const start = performance.now();
    const total = startDelay + text.length * speed;

    const step = (now: number) => {
      const elapsed = now - start - startDelay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(step);
        return;
      }
      const n = Math.min(Math.floor(elapsed / speed), text.length);
      setOutput(text.slice(0, n));
      if (n < text.length) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [text, active, speed, startDelay]);

  return { typed: output, done: output.length >= text.length && text.length > 0 };
}
