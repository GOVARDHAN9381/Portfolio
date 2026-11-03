"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { journey, about } from "@/config/portfolio";
import { SectionHeading } from "./about";
import { FillBar } from "./fill-bar";

/* cumulative depth percentage per level — 6 levels → 17..100% */
const LEVEL_PCTS = journey.map((_, i) =>
  Math.round(((i + 1) / journey.length) * 100)
);

export default function Journey() {
  const [active, setActive] = useState(0);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);

  /* the card nearest the viewport centre becomes the active level */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) setActive(idx);
          }
        }
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    cardRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const jumpTo = (i: number) =>
    cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  const completion = LEVEL_PCTS[active];

  return (
    <section id="journey" className="relative z-10 px-5 py-28 sm:px-8 sm:py-36">
      {/* giant watermark — clipped by its own overlay so lg:sticky keeps working */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-8 top-16 select-none font-display text-[22vw] font-bold leading-none text-outline opacity-[0.16]">
          ROUTE
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        <SectionHeading index="02" title="THE JOURNEY" />

        <div className="mb-12 flex flex-wrap items-center gap-3">
          <span className="font-hud text-[10px] text-emerald-300">
            SIX-LEVEL DESCENT — EVERY PHASE IS A DEPTH LEVEL
          </span>
          <span aria-hidden="true" className="h-px w-16 bg-emerald-400/40" />
          <span className="font-hud text-[9px] text-muted-foreground">
            {about.internship}
          </span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[4fr_8fr] lg:gap-16">
          {/* ─────────── sticky route map ─────────── */}
          <div>
            <div className="lg:sticky lg:top-32">
              <div className="hud-frame relative border border-emerald-400/20 bg-[#07070c]/80 p-6 backdrop-blur">
                <div className="mb-5 flex items-center justify-between font-hud text-[9px] text-muted-foreground">
                  <span>ROUTE MAP // DEPTH LEVELS</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    LIVE
                  </span>
                </div>

                {/* current level readout */}
                <div className="flex items-end gap-4">
                  <motion.span
                    key={active}
                    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.45 }}
                    className="font-display text-6xl font-bold leading-none text-foreground [text-shadow:0_0_30px_rgba(0,255,157,0.25)]"
                  >
                    {String(active + 1).padStart(2, "0")}
                  </motion.span>
                  <div className="pb-1">
                    <div className="font-hud text-[9px] text-emerald-300/70">
                      LVL {String(active + 1).padStart(2, "0")} / 06
                    </div>
                    <div className="mt-1 font-display text-sm font-bold text-foreground">
                      {journey[active].title}
                    </div>
                  </div>
                </div>

                {/* completion meter */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between font-hud text-[9px]">
                    <span className="text-muted-foreground">JOURNEY COMPLETION</span>
                    <span className="text-emerald-300">{completion}%</span>
                  </div>
                  <div className="h-[3px] overflow-hidden bg-white/8">
                    <motion.div
                      animate={{ width: `${completion}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-200 shadow-[0_0_10px_rgba(0,255,157,0.6)]"
                    />
                  </div>
                </div>

                {/* level index — clickable */}
                <ol className="mt-6 space-y-1.5 border-t border-white/8 pt-5">
                  {journey.map((j, i) => {
                    const done = i < active;
                    const now = i === active;
                    return (
                      <li key={j.phase}>
                        <button
                          type="button"
                          onClick={() => jumpTo(i)}
                          className={`group flex w-full items-center gap-3 py-1 text-left font-hud text-[9px] transition-colors ${
                            now
                              ? "text-emerald-300"
                              : done
                                ? "text-foreground/60"
                                : "text-muted-foreground/60 hover:text-foreground/90"
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[7px] ${
                              now
                                ? "border-emerald-400 bg-emerald-400/20 shadow-[0_0_10px_rgba(0,255,157,0.6)]"
                                : done
                                  ? "border-emerald-400/50 bg-emerald-400/10"
                                  : "border-white/20"
                            }`}
                          >
                            {done ? "✓" : now ? "●" : ""}
                          </span>
                          <span className="w-5 shrink-0 opacity-70">{j.phase}</span>
                          <span className="flex-1 truncate tracking-wide">{j.title}</span>
                          <span className={now ? "text-emerald-300" : "opacity-60"}>
                            {LEVEL_PCTS[i]}%
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>

          {/* ─────────── level cards ─────────── */}
          <ol className="relative space-y-6">
            {/* rail */}
            <span
              aria-hidden="true"
              className="absolute bottom-6 left-[13px] top-6 w-px bg-gradient-to-b from-emerald-400/50 via-emerald-400/15 to-transparent sm:left-[15px]"
            />

            {journey.map((j, i) => {
              const now = i === active;
              return (
                <motion.li
                  key={j.phase}
                  data-idx={i}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  initial={{ opacity: 0, y: 44 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.65, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ rotateX: 2.5, rotateY: -2.5, scale: 1.008 }}
                  style={{ transformPerspective: 900 }}
                  className={`relative ml-8 cursor-default border bg-[#07070c]/85 p-6 backdrop-blur transition-[border-color,box-shadow] duration-500 sm:ml-10 ${
                    now
                      ? "border-emerald-400/45 shadow-[0_0_44px_rgba(0,255,157,0.14)]"
                      : "border-white/8 hover:border-emerald-400/25"
                  }`}
                >
                  {/* node on the rail */}
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[21px] top-7 flex h-2.5 w-2.5 items-center justify-center rounded-full border transition-all duration-500 sm:-left-[25px] ${
                      now
                        ? "border-emerald-300 bg-emerald-400 shadow-[0_0_16px_rgba(0,255,157,0.9)]"
                        : "border-emerald-400/40 bg-[#050508]"
                    }`}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-hud text-[10px] text-emerald-400">
                        LVL {j.phase}
                      </span>
                      <span className="font-hud text-[9px] text-muted-foreground">
                        {j.year}
                      </span>
                    </div>
                    <span
                      className={`border px-2 py-0.5 font-hud text-[8px] tracking-widest transition-colors duration-500 ${
                        now
                          ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                          : "border-white/10 text-muted-foreground"
                      }`}
                    >
                      DEPTH {LEVEL_PCTS[i]}%
                    </span>
                  </div>

                  <h4
                    className={`mt-3 font-display text-xl font-bold tracking-tight transition-colors duration-500 sm:text-2xl ${
                      now ? "text-foreground [text-shadow:0_0_24px_rgba(0,255,157,0.3)]" : "text-foreground/85"
                    }`}
                  >
                    {j.title}
                  </h4>
                  <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {j.desc}
                  </p>

                  {/* per-card level fill — deterministic, fast-scroll proof */}
                  <FillBar
                    pct={LEVEL_PCTS[i]}
                    delay={0.2}
                    duration={1}
                    trackClass="mt-5 h-px w-full bg-white/8"
                    fillClass={
                      now
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(0,255,157,0.7)]"
                        : "bg-emerald-400/40"
                    }
                  />
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
