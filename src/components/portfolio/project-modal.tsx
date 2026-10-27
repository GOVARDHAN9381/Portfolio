"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Github, X } from "lucide-react";
import type { Project } from "@/config/portfolio";
import { useTypewriter } from "@/hooks/use-typewriter";
import FluidButton from "./fluid-button";

const HoloCanvas = dynamic(
  () => import("./three/holograms").then((m) => m.HoloCanvas),
  { ssr: false }
);

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProjectModal({
  project,
  onClose,
  onNavigate,
}: {
  project: Project | null;
  onClose: () => void;
  onNavigate: (dir: 1 | -1) => void;
}) {
  const { typed, done } = useTypewriter(
    project?.description ?? "",
    !!project,
    13,
    700
  );

  // esc / arrows + scroll lock
  useEffect(() => {
    if (!project) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [project, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="holo-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Project dossier: ${project.title}`}
          className="fixed inset-0 z-[85] flex items-center justify-center p-4 sm:p-8"
        >
          {/* backdrop — pitch black void */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            className="scanlines absolute inset-0 bg-[#020204]/92 backdrop-blur-md"
          />

          {/* panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="border-beam relative z-10 max-h-[92vh] w-full max-w-6xl overflow-y-auto border border-cyan-400/20 bg-[#07070d] shadow-[0_0_80px_rgba(0,240,255,0.14)]"
          >
            {/* header strip */}
            <div className="flex items-center justify-between border-b border-cyan-400/15 px-5 py-3 sm:px-7">
              <div className="font-hud text-[9px] text-cyan-300/80">
                PROJECT FILE // {project.index}
                <span className="holo-flicker ml-3 text-muted-foreground">
                  HOLO-PROJECTION · RENDERING
                </span>
              </div>
              <button
                autoFocus
                onClick={onClose}
                aria-label="Close project dossier"
                className="flex h-9 w-9 items-center justify-center border border-white/10 text-muted-foreground transition-all hover:border-cyan-400/50 hover:text-cyan-300 hover:shadow-[0_0_18px_rgba(0,240,255,0.3)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid lg:grid-cols-[46fr_54fr]">
              {/* ── left: the 3D hologram ── */}
              <div className="relative min-h-[320px] border-b border-cyan-400/10 lg:min-h-[540px] lg:border-b-0 lg:border-r">
                <div key={project.index} className="glitch-in absolute inset-0">
                  <HoloCanvas variant={project.index as never} />
                </div>

                {/* scan sweep */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 z-[7] h-24 overflow-hidden"
                >
                  <div className="scan-sweep h-16 w-full bg-gradient-to-b from-transparent via-cyan-400/12 to-transparent" />
                </div>

                {/* corner meta over hologram */}
                <div className="pointer-events-none absolute left-4 top-4 z-10 font-hud text-[9px] text-cyan-300/60">
                  MODEL · {project.index}
                  <br />
                  ROTATION · AUTO
                </div>
                <div className="pointer-events-none absolute bottom-4 right-4 z-10 hidden font-hud text-[9px] text-cyan-300/60 sm:block">
                  DRAG CURSOR TO TILT
                </div>
                {/* pedestal glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-6 left-1/2 z-[6] h-10 w-56 -translate-x-1/2 rounded-full bg-cyan-400/14 blur-2xl"
                />
              </div>

              {/* ── right: typed dossier ── */}
              <div className="flex flex-col justify-center p-6 sm:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
                  className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-hud text-[9px] text-muted-foreground"
                >
                  <span className="text-cyan-300">{project.category}</span>
                  <span>YEAR · {project.year}</span>
                  <span className="holo-flicker text-cyan-300/70">
                    STATUS · DECLASSIFIED
                  </span>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.6, ease: EASE }}
                  className="gradient-text animate-gradient-flow font-display text-4xl font-bold tracking-tight sm:text-5xl"
                >
                  {project.title}
                </motion.h3>

                {/* typewritten brief */}
                <p className="mt-6 min-h-[7.5rem] text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <span className="mr-1 font-hud text-[10px] text-cyan-400">
                    &gt;
                  </span>
                  {typed}
                  <span
                    aria-hidden="true"
                    className={`caret-blink ml-0.5 inline-block h-4 w-[7px] translate-y-[3px] bg-cyan-300 ${
                      done ? "opacity-60" : ""
                    }`}
                  />
                </p>

                {/* assets fade in once the brief finishes typing */}
                <motion.div
                  initial="hidden"
                  animate={done ? "show" : "hidden"}
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.07 } },
                  }}
                  className="mt-7 flex flex-wrap gap-2"
                  aria-label="Tech stack"
                >
                  {project.stack.map((s) => (
                    <motion.span
                      key={s}
                      variants={{
                        hidden: { opacity: 0, y: 14, scale: 0.94 },
                        show: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: { duration: 0.4, ease: EASE },
                        },
                      }}
                      className="border border-cyan-400/25 bg-cyan-400/5 px-3 py-1.5 font-hud text-[9px] text-cyan-300"
                    >
                      {s}
                    </motion.span>
                  ))}
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate={done ? "show" : "hidden"}
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
                  }}
                  className="mt-9 flex flex-wrap gap-4"
                >
                  {[
                    { href: project.liveUrl, label: "VISIT LIVE ↗", tone: "cyan" as const, icon: <ExternalLink className="h-3.5 w-3.5" /> },
                    { href: project.repoUrl, label: "SOURCE CODE", tone: "ghost" as const, icon: <Github className="h-4 w-4" /> },
                  ].map((b) => (
                    <motion.span
                      key={b.label}
                      variants={{
                        hidden: { opacity: 0, y: 18 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
                      }}
                    >
                      <FluidButton
                        href={b.href}
                        tone={b.tone}
                        className="!px-6 !py-3 text-[10px]"
                        onClick={(e) => {
                          if (b.href.startsWith("#")) e.preventDefault();
                        }}
                      >
                        {b.icon}
                        {b.label}
                      </FluidButton>
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* footer: mission navigation */}
            <div className="flex items-center justify-between border-t border-cyan-400/15 px-5 py-3 sm:px-7">
              <button
                onClick={() => onNavigate(-1)}
                className="group inline-flex items-center gap-2 font-hud text-[10px] text-muted-foreground transition-colors hover:text-cyan-300"
              >
                <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                PREV FILE
              </button>

              <div className="flex items-center gap-2" aria-hidden="true">
                {["001", "002", "003", "004", "005"].map((idx) => (
                  <span
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-400 ${
                      idx === project.index
                        ? "w-7 bg-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                        : "w-3 bg-white/15"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => onNavigate(1)}
                className="group inline-flex items-center gap-2 font-hud text-[10px] text-muted-foreground transition-colors hover:text-cyan-300"
              >
                NEXT FILE
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
