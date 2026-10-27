"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { about, journey, identity } from "@/config/portfolio";
import { useScramble } from "@/hooks/use-scramble";

const HoloBodyCanvas = dynamic(
  () => import("./three/holo-body").then((m) => m.HoloBodyCanvas),
  { ssr: false }
);

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
        <span className="font-hud text-[10px] text-emerald-400">{index}</span>
        <span aria-hidden="true" className="h-px w-16 bg-emerald-400/40" />
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
  const yPanel = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rotate = useTransform(scrollYProgress, [0, 1], [1.5, -1.5]);

  return (
    <section ref={ref} id="about" className="relative z-10 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-7xl">
        <SectionHeading index="01" title="THE HUMAN BEHIND THE CODE" />

        <div className="grid gap-14 lg:grid-cols-[5fr_7fr] lg:gap-20">
          {/* ---- sticky holo-me panel ---- */}
          <motion.div style={{ y: yPanel }} className="relative">
            <div className="lg:sticky lg:top-32">
              <motion.div
                style={{ rotate }}
                className="glow-box hud-frame relative aspect-[4/5] overflow-hidden bg-card"
              >
                {/* professional full-body hologram — built from real photos */}
                <div className="absolute inset-0">
                  <HoloBodyCanvas />
                </div>

                {/* scan sweep */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 z-[7] h-24 overflow-hidden"
                >
                  <div className="scan-sweep h-16 w-full bg-gradient-to-b from-transparent via-emerald-400/12 to-transparent" />
                </div>

                {/* top meta */}
                <div className="pointer-events-none absolute left-4 top-4 z-10 font-hud text-[9px] leading-relaxed text-emerald-300/70">
                  HOLO-ME · UNIT GR-2028
                  <br />
                  RENDER · REALTIME
                </div>

                {/* bottom meta strip */}
                <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-emerald-400/15 bg-[#050508]/80 px-4 py-3 font-hud text-[9px] text-muted-foreground backdrop-blur">
                  <span>{about.education}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    ONLINE
                  </span>
                </div>
              </motion.div>

              {/* floating verified ID photo — the real me */}
              <motion.div
                initial={{ opacity: 0, x: 30, rotate: 6 }}
                whileInView={{ opacity: 1, x: 0, rotate: 3 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -right-3 top-8 sm:-right-8"
              >
                <div className="hud-frame w-24 border border-emerald-400/40 bg-[#0a0a12] p-1 shadow-[0_0_30px_rgba(0,255,157,0.25)] sm:w-28">
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={about.photos.main}
                      alt={`Portrait of ${identity.fullName}`}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div className="py-1.5 text-center font-hud text-[7px] tracking-[0.18em] text-emerald-300">
                    ✓ VERIFIED · {about.batch}
                  </div>
                </div>
              </motion.div>

              {/* off-duty filmstrip */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-6"
              >
                <div className="mb-2 flex items-center justify-between font-hud text-[9px] text-muted-foreground">
                  <span>OFF DUTY //</span>
                  <span className="text-emerald-300/70">RIDES · SUMMITS · CAMPUS</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {about.photos.strip.map((src, i) => (
                    <div
                      key={src}
                      className="hud-frame group relative h-20 overflow-hidden border border-white/8 sm:h-24"
                    >
                      <Image
                        src={src}
                        alt={
                          ["Royal Enfield ride", "Summit arms wide", "Campus day"][
                            i
                          ] ?? "Personal photo"
                        }
                        fill
                        sizes="160px"
                        className="object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ---- story ---- */}
          <div className="flex flex-col justify-center">
            {/* role priority chips — full stack last by design */}
            <Reveal>
              <div className="mb-8 flex flex-wrap gap-2">
                {about.roles.map((r, i) => (
                  <span
                    key={r}
                    className={`border px-3 py-1.5 font-hud text-[9px] ${
                      i === 0
                        ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                        : i === about.roles.length - 1
                          ? "border-white/10 text-muted-foreground/70"
                          : "border-emerald-400/30 text-emerald-300"
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </Reveal>

            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <p className="mb-7 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {p}
                </p>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <blockquote className="glow-box my-10 border border-emerald-400/20 bg-emerald-400/5 px-6 py-5">
                <p className="font-display text-lg font-medium italic text-emerald-100 sm:text-xl">
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
                  className="group bg-[#07070c] p-5 transition-colors hover:bg-emerald-400/5"
                >
                  <div className="font-display text-3xl font-bold text-foreground transition-colors group-hover:text-emerald-300 sm:text-4xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 font-hud text-[9px] text-muted-foreground">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* journey timeline */}
            <div className="mt-16">
              <div className="mb-8 flex items-center gap-3">
                <span className="font-hud text-[10px] text-emerald-300">
                  THE JOURNEY
                </span>
                <span aria-hidden="true" className="h-px w-16 bg-emerald-400/40" />
                <span className="font-hud text-[9px] text-muted-foreground">
                  {about.internship}
                </span>
              </div>

              <ol className="relative space-y-8 border-l border-white/10 pl-8">
                {journey.map((j, i) => (
                  <motion.li
                    key={j.phase}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative"
                  >
                    {/* node */}
                    <span
                      aria-hidden="true"
                      className="absolute -left-[38px] top-1 flex h-3 w-3 items-center justify-center rounded-full border border-emerald-400/60 bg-[#050508] transition-all group-hover:shadow-[0_0_14px_rgba(0,255,157,0.7)]"
                    >
                      <span className="h-1 w-1 rounded-full bg-emerald-300" />
                    </span>
                    <div className="flex flex-wrap items-baseline gap-x-4">
                      <span className="font-hud text-[9px] text-emerald-400/80">
                        {j.phase}
                      </span>
                      <span className="font-hud text-[9px] text-muted-foreground">
                        {j.year}
                      </span>
                      <h4 className="font-display text-base font-bold text-foreground transition-colors group-hover:text-emerald-200 sm:text-lg">
                        {j.title}
                      </h4>
                    </div>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {j.desc}
                    </p>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
