"use client";

import { useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════════════════════════════
   DETERMINISTIC IN-VIEW DETECTOR — cannot be skipped by fast scrolls.

   Why this exists: framer-motion's whileInView (IntersectionObserver)
   can MISS thin elements on heavy scroll-driven pages. When the user
   flings past a section, the observer callback may be delivered AFTER
   the element already left the margin-shrunk viewport, reporting
   isIntersecting:false — so the reveal (e.g. skill-bar fill) never
   fires and stays stuck at scaleX(0).

   This hook re-checks the element rect on every scroll/resize event
   (rAF-throttled, capture-phase so any scrolling ancestor counts),
   plus post-mount re-checks and an IntersectionObserver backup.
   "Was in the viewport at any moment" is therefore always caught.
   Once true, it stays true (once semantics).
   ════════════════════════════════════════════════════════════════════ */

export function useEnteredView<T extends HTMLElement>(marginPx = 80) {
  const ref = useRef<T | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let done = false;
    let raf = 0;
    let io: IntersectionObserver | null = null;

    const finish = () => {
      if (done) return;
      done = true;
      setEntered(true);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      io?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };

    const check = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh =
        window.innerHeight || document.documentElement.clientHeight || 1;
      if (r.top < vh + marginPx && r.bottom > -marginPx) finish();
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };

    // IO backup — catches appearances without a scroll event (fonts
    // settling, anchor jumps handled by scroll events anyway)
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) finish();
        },
        { rootMargin: `${marginPx}px 0px ${marginPx}px 0px` }
      );
      io.observe(el);
    }

    check(); // already in view at mount?
    // belt & braces: re-check after layout/fonts settle, and once later
    const t1 = window.setTimeout(check, 300);
    const t2 = window.setTimeout(check, 1200);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      io?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [marginPx]);

  return { ref, entered };
}
