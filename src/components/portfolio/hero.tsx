"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { identity, about } from "@/config/portfolio";
import FluidButton from "./fluid-button";

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

const [sansWord, serifWord] = identity.lastName.split(" ");

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // cinematic exit: content sinks as the camera dives under
  const yContent = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const ySpace = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden"
    >
      {/* tint layers above the 3D world */}
      <div className="tech-grid pointer-events-none absolute inset-0 z-[1] opacity-70" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="animate-drift-a pointer-events-none absolute -top-32 left-[8%] z-[1] h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="animate-drift-b pointer-events-none absolute bottom-0 right-[4%] z-[1] h-[26rem] w-[26rem] rounded-full bg-white/[0.05] blur-[150px]"
      />

      {/* readability scrim on narrow screens */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_120%_72%_at_30%_62%,rgba(2,2,3,0.78),rgba(2,2,3,0.34)_54%,transparent_76%)] lg:hidden"
      />

      {/* HUD corner meta */}
      <div
        aria-hidden="true"
        className="absolute bottom-10 left-6 z-10 font-hud text-[9px] text-emerald-300/50 sm:left-10"
      >
        LAT {identity.coords.lat}
        <br />
        LONG {identity.coords.long}
      </div>
      <div
        aria-hidden="true"
        className="absolute right-6 top-24 z-10 text-right font-hud text-[9px] text-emerald-300/50 sm:right-10"
      >
        FILE // PORTFOLIO
        <br />
        STATUS · <span className="text-emerald-300">LIVE</span>
      </div>

      <motion.div
        style={{ y: yContent, opacity, scale }}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8 sm:pb-28"
      >
        {/* status chip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="mb-7 inline-flex items-center gap-2.5 border border-emerald-400/25 bg-[#020203]/60 px-4 py-1.5 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="ping-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-hud text-[10px] text-emerald-300">
            {identity.availability}
          </span>
          <span className="hidden font-hud text-[10px] text-muted-foreground sm:inline">
            · {identity.location}
          </span>
        </motion.div>

        {/* the name — "NARAPAREDDY / GOVARDHAN REDDY" full-name lockup */}
        <div className="relative">
          <h1 className="font-display font-bold leading-[0.92] tracking-tight">
            <span className="sr-only">
              {identity.firstName} {identity.lastName} — {identity.role}
            </span>
            <Letters
              word={identity.firstName}
              className="text-[clamp(2.5rem,8.6vw,7.4rem)] text-foreground"
            />
            <br />
            <Letters
              word={sansWord}
              className="text-[clamp(2.5rem,8.6vw,7.4rem)] text-foreground"
            />
            <span
              aria-hidden="true"
              className="ml-3 align-baseline font-serif-accent text-[clamp(1.6rem,5.2vw,4.4rem)] font-normal italic text-emerald-300 [text-shadow:0_0_24px_rgba(0,255,157,0.4)]"
            >
              {serifWord}
            </span>
          </h1>

          {/* mirror — softened so it breathes behind the role block */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.8, duration: 1.2 }}
            className="mirror-text mirror-soft absolute inset-x-0 top-full hidden font-display font-bold leading-[0.92] tracking-tight lg:block"
          >
            <div className="text-[clamp(2.5rem,8.6vw,7.4rem)] text-foreground">
              {identity.firstName}
            </div>
            <div className="flex items-baseline text-[clamp(2.5rem,8.6vw,7.4rem)] text-foreground">
              {sansWord}
              <span className="ml-3 font-serif-accent text-[clamp(1.6rem,5.2vw,4.4rem)] font-normal italic text-emerald-300">
                {serifWord}
              </span>
            </div>
          </motion.div>
        </div>

        {/* role + serif quote line */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3.1, duration: 0.7 }}
          className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          <span aria-hidden="true" className="h-px w-14 bg-gradient-to-r from-emerald-400 to-transparent" />
          <h2 className="font-hud text-xs text-emerald-300 sm:text-sm">
            {identity.role}
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.45, duration: 0.8 }}
          className="mt-4 font-serif-accent text-xl italic text-foreground/75 sm:text-2xl"
        >
          &ldquo;{about.quote}&rdquo;
        </motion.p>

        {/* tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.7 }}
          className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          {identity.tagline}
        </motion.p>

        {/* CTA row — fluid buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.8, duration: 0.7 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <FluidButton href="#works" tone="cyan" className="!bg-[#020203]/60 backdrop-blur">
            VIEW MY WORK →
          </FluidButton>
          <FluidButton href="#transmit" tone="ghost" className="!bg-[#020203]/40 backdrop-blur">
            GET IN TOUCH
          </FluidButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
