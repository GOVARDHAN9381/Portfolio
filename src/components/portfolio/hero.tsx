"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { identity } from "@/config/portfolio";

const letterContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 2.4 } },
};

const letter = {
  hidden: { y: 90, opacity: 0, filter: "blur(14px)", rotateX: -50 },
  show: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    rotateX: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function Letters({ word, className }: { word: string; className?: string }) {
  return (
    <motion.span
      className={`inline-flex overflow-visible ${className ?? ""}`}
      variants={letterContainer}
      initial="hidden"
      animate="show"
      aria-label={word}
    >
      {word.split("").map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          variants={letter}
          className="inline-block"
          aria-hidden="true"
        >
          {ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // cinematic exit: content drifts up + fades as you scroll away
  const yContent = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden"
    >
      {/* tech grid backdrop */}
      <div className="tech-grid absolute inset-0" aria-hidden="true" />

      {/* aurora blobs */}
      <div
        aria-hidden="true"
        className="animate-drift-a absolute -top-32 left-[8%] h-96 w-96 rounded-full bg-cyan-500/12 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="animate-drift-b absolute bottom-0 right-[4%] h-[28rem] w-[28rem] rounded-full bg-violet-500/14 blur-[150px]"
      />

      {/* HUD corner meta */}
      <div
        aria-hidden="true"
        className="absolute bottom-10 left-6 font-hud text-[9px] text-cyan-300/50 sm:left-10"
      >
        LAT 19.0760° N
        <br />
        LONG 72.8777° E
      </div>
      <div
        aria-hidden="true"
        className="absolute right-6 top-24 text-right font-hud text-[9px] text-cyan-300/50 sm:right-10"
      >
        FILE // PORTFOLIO
        <br />
        STATUS · <span className="text-cyan-300">LIVE</span>
      </div>

      <motion.div
        style={{ y: yContent, opacity, scale }}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8"
      >
        {/* status chip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="mb-7 inline-flex items-center gap-2.5 border border-cyan-400/25 bg-cyan-400/5 px-4 py-1.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="ping-ring absolute inline-flex h-full w-full rounded-full bg-cyan-400" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <span className="font-hud text-[10px] text-cyan-300">
            {identity.availability}
          </span>
          <span className="hidden font-hud text-[10px] text-muted-foreground sm:inline">
            · {identity.location}
          </span>
        </motion.div>

        {/* the name */}
        <h1 className="font-display font-bold leading-[0.92] tracking-tight">
          <span className="sr-only">
            {identity.firstName} {identity.lastName} — {identity.role}
          </span>
          <Letters
            word={identity.firstName}
            className="text-[clamp(3.4rem,12vw,9.5rem)] text-foreground"
          />
          <br />
          <Letters
            word={identity.lastName}
            className="gradient-text glow-text-violet text-[clamp(3.4rem,12vw,9.5rem)]"
          />
        </h1>

        {/* role line */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3.1, duration: 0.7 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <span aria-hidden="true" className="h-px w-14 bg-gradient-to-r from-cyan-400 to-transparent" />
          <h2 className="font-hud text-xs text-cyan-300 sm:text-sm">
            {identity.role}
          </h2>
        </motion.div>

        {/* tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.3, duration: 0.7 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {identity.tagline}
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 0.7 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#works"
            className="sheen group relative border border-cyan-400/50 bg-cyan-400/10 px-8 py-3.5 font-hud text-xs text-cyan-200 transition-all duration-300 hover:bg-cyan-400/20 hover:shadow-[0_0_30px_rgba(0,240,255,0.35)]"
          >
            VIEW MY WORK →
          </a>
          <a
            href="#transmit"
            className="border border-white/10 px-8 py-3.5 font-hud text-xs text-muted-foreground transition-all duration-300 hover:border-violet-400/50 hover:text-violet-300 hover:shadow-[0_0_30px_rgba(167,139,250,0.25)]"
          >
            GET IN TOUCH
          </a>
        </motion.div>
      </motion.div>

      {/* rotating scroll badge */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.9, duration: 0.8 }}
        className="absolute bottom-10 right-8 z-10 hidden h-28 w-28 items-center justify-center sm:flex"
        aria-label="Scroll to about section"
      >
        <svg viewBox="0 0 100 100" className="animate-spin-slow absolute inset-0 h-full w-full">
          <defs>
            <path id="circlePath" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-cyan-300/80 font-hud" fontSize="8.5" letterSpacing="2.5">
            <textPath href="#circlePath">
              SCROLL · EXPLORE · CREATE · REPEAT ·
            </textPath>
          </text>
        </svg>
        <span aria-hidden="true" className="text-cyan-300">↓</span>
      </motion.a>

      {/* scroll drip */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.9 }}
        className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 sm:block"
      >
        <div className="animate-scroll-drip h-16 w-px bg-gradient-to-b from-cyan-400 to-transparent" />
      </motion.div>
    </section>
  );
}
