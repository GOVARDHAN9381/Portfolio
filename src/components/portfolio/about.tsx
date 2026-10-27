"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { about, identity } from "@/config/portfolio";
import { useScramble } from "@/hooks/use-scramble";

/* ---------- animated counter ---------- */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const DURATION = 1400;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      setN(Math.round((1 - Math.pow(1 - t, 3)) * value));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

/* ---------- section heading ---------- */
export function SectionHeading({
  index,
  title,
}: {
  index: string;
  title: string;
}) {
  const [decoded, ref] = useScramble(title, 1.2);
  return (
    <div className="mb-14">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-hud text-[10px] text-cyan-400">{index}</span>
        <span aria-hidden="true" className="h-px w-16 bg-cyan-400/40" />
        <span className="font-hud text-[10px] text-muted-foreground">SECTION</span>
      </div>
      <h2
        ref={ref}
        className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
      >
        {decoded}
      </h2>
    </div>
  );
}

/* ---------- reveal paragraph ---------- */
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // portrait parallax drift
  const yPanel = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rotate = useTransform(scrollYProgress, [0, 1], [1.5, -1.5]);

  return (
    <section ref={ref} id="about" className="relative z-10 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-7xl">
        <SectionHeading index="01" title="THE HUMAN BEHIND THE CODE" />

        <div className="grid gap-14 lg:grid-cols-[5fr_7fr] lg:gap-20">
          {/* ---- sticky portrait panel ---- */}
          <motion.div style={{ y: yPanel }} className="relative">
            <div className="lg:sticky lg:top-32">
              <motion.div
                style={{ rotate }}
                className="glow-box hud-frame relative aspect-[4/5] overflow-hidden bg-card"
              >
                {/* animated gradient border wash */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(0,240,255,0.08),rgba(167,139,250,0.1),rgba(0,240,255,0.08))] animate-spin-slow"
                />
                <div className="tech-grid absolute inset-0" aria-hidden="true" />

                {/* portrait placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-cyan-400/30 bg-[#0a0a12] text-6xl shadow-[0_0_50px_rgba(0,240,255,0.2)]">
                    <span aria-hidden="true">{about.portraitEmoji}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-xl font-bold text-foreground">
                      {identity.firstName} {identity.lastName}
                    </p>
                    <p className="mt-1 font-hud text-[10px] text-cyan-300">
                      {identity.role}
                    </p>
                  </div>
                </div>

                {/* bottom meta strip */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-cyan-400/15 bg-[#050508]/80 px-4 py-3 font-hud text-[9px] text-muted-foreground backdrop-blur">
                  <span>ID · {identity.firstName[0]}{identity.lastName[0]}-2025</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    ONLINE
                  </span>
                </div>
              </motion.div>

              {/* floating chip */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="glow-box-violet absolute -right-3 top-8 border border-violet-400/30 bg-[#0a0a12] px-4 py-2.5 font-hud text-[9px] text-violet-300 sm:-right-8"
              >
                EST. 2020 — STILL DEBUGGING
              </motion.div>
            </div>
          </motion.div>

          {/* ---- story ---- */}
          <div className="flex flex-col justify-center">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <p className="mb-7 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {p}
                </p>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <blockquote className="glow-box my-10 border border-cyan-400/20 bg-cyan-400/5 px-6 py-5">
                <p className="font-display text-lg font-medium italic text-cyan-100 sm:text-xl">
                  “{about.quote}”
                </p>
              </blockquote>
            </Reveal>

            {/* stat grid */}
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/5 bg-white/5 sm:grid-cols-4">
              {about.stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.08, duration: 0.55 }}
                  className="group bg-[#07070c] p-5 transition-colors hover:bg-cyan-400/5"
                >
                  <div className="font-display text-3xl font-bold text-foreground transition-colors group-hover:text-cyan-300 sm:text-4xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 font-hud text-[9px] text-muted-foreground">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
