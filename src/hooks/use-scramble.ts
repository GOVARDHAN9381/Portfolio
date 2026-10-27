"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#01";

/**
 * Cinematic text decode/scramble effect.
 * Returns [displayedText, ref] — starts scrambling when the element scrolls into view.
 */
export function useScramble(text: string, speed = 1) {
  const [output, setOutput] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          let frame = 0;
          const totalFrames = Math.ceil(24 / speed);
          const interval = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const settled = Math.floor(progress * text.length);
            const next = text
              .split("")
              .map((ch, i) => {
                if (ch === " ") return " ";
                if (i < settled) return ch;
                return CHARS[Math.floor(Math.random() * CHARS.length)];
              })
              .join("");
            setOutput(next);
            if (frame >= totalFrames) {
              setOutput(text);
              clearInterval(interval);
            }
          }, 34);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [text, speed]);

  return [output, ref] as const;
}
