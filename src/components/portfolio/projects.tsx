"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { projects, socials, type Project } from "@/config/portfolio";
import { SectionHeading } from "./about";
import ProjectModal from "./project-modal";

const ACCENT = {
  cyan: {
    text: "text-cyan-300",
    border: "hover:border-cyan-400/60",
    glow: "hover:shadow-[0_0_60px_rgba(0,240,255,0.18)]",
    bg: "from-cyan-500/25 via-cyan-400/5 to-transparent",
    chip: "border-cyan-400/30 text-cyan-300",
  },
  violet: {
    text: "text-violet-300",
    border: "hover:border-violet-400/60",
    glow: "hover:shadow-[0_0_60px_rgba(167,139,250,0.2)]",
    bg: "from-violet-500/25 via-violet-400/5 to-transparent",
    chip: "border-violet-400/30 text-violet-300",
  },
  pink: {
    text: "text-fuchsia-300",
    border: "hover:border-fuchsia-400/60",
    glow: "hover:shadow-[0_0_60px_rgba(240,171,252,0.18)]",
    bg: "from-fuchsia-500/25 via-fuchsia-400/5 to-transparent",
    chip: "border-fuchsia-400/30 text-fuchsia-300",
  },
} as const;

function ReelCard({
  project,
  i,
  onOpen,
}: {
  project: Project;
  i: number;
  onOpen: (p: Project) => void;
}) {
  const a = ACCENT[project.accent];
  return (
    <motion.article
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
      role="button"
      tabIndex={0}
      aria-label={`Open holographic dossier for ${project.title}`}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(project);
        }
      }}
      data-cursor="hover"
      className={`group relative flex w-[84vw] max-w-[480px] shrink-0 cursor-pointer flex-col overflow-hidden border border-white/8 bg-card transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:w-[480px] ${a.border} ${a.glow}`}
    >
      {/* thumbnail — pure CSS art (height adapts to viewport) */}
      <div className="scanlines sheen relative h-[clamp(150px,26vh,224px)] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${a.bg}`} />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px]"
        />
        <span
          aria-hidden="true"
          className="holo-flicker absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl opacity-0 drop-shadow-[0_0_25px_rgba(0,240,255,0.45)] transition-opacity duration-500 group-hover:opacity-100"
        >
          {project.icon}
        </span>
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-70 transition-all duration-500 group-hover:scale-90 group-hover:opacity-0"
        >
          {project.icon}
        </span>
        <div className="absolute left-4 top-4 font-hud text-[9px] text-muted-foreground">
          {project.category}
        </div>
        <div className="absolute right-4 top-4 font-hud text-[9px] text-muted-foreground">
          {project.year}
        </div>
        <div className="absolute bottom-4 right-4 font-hud text-[9px] text-cyan-300/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          [ 3D HOLOGRAM ]
        </div>
        {/* scanline */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
        />
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-baseline justify-between">
          <span className={`font-display text-5xl font-bold text-outline ${a.text}`}>
            {project.index}
          </span>
          <span className="font-hud text-[9px] text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            OPEN ⟶
          </span>
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-cyan-200">
          {project.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span
              key={s}
              className={`border px-2.5 py-1 font-hud text-[9px] ${a.chip}`}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-5 border-t border-white/5 pt-5">
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              if (project.liveUrl.startsWith("#")) e.preventDefault();
            }}
            className="inline-flex items-center gap-1.5 font-hud text-[10px] text-foreground/80 transition-colors hover:text-cyan-300"
          >
            LIVE <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              if (project.repoUrl.startsWith("#")) e.preventDefault();
            }}
            className="inline-flex items-center gap-1.5 font-hud text-[10px] text-foreground/80 transition-colors hover:text-cyan-300"
          >
            CODE <Github className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState(0);
  const [selected, setSelected] = useState<Project | null>(null);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, -range]);
  const reelWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setRange(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
      }
    };
    measure();
    // re-measure once fonts/layout settle
    const t = setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const navigate = (dir: 1 | -1) => {
    setSelected((cur) => {
      if (!cur) return cur;
      const idx = projects.findIndex((p) => p.index === cur.index);
      const next = (idx + dir + projects.length) % projects.length;
      return projects[next] ?? cur;
    });
  };

  return (
    <section id="works" className="relative z-10">
      {/* heading stays in normal flow */}
      <div className="px-5 pt-28 sm:px-8 sm:pt-36">
        <div className="mx-auto max-w-7xl">
          <SectionHeading index="02" title="SELECTED WORKS" />
          <p className="-mt-8 max-w-md font-hud text-[10px] leading-relaxed text-muted-foreground sm:-mt-10">
            KEEP SCROLLING — THE PAGE TURNS INTO A FILM REEL. PRESS ANY FILE TO
            PROJECT ITS HOLOGRAM.
          </p>
        </div>
      </div>

      {/* ---- desktop: pinned horizontal reel ---- */}
      <div ref={wrapRef} className="relative hidden md:block" style={{ height: "380vh" }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex items-center gap-8 pl-[8vw] will-change-transform"
          >
            {/* intro card */}
            <div className="w-[30vw] shrink-0">
              <p className="font-display text-3xl font-bold leading-snug text-foreground">
                Six missions.
                <br />
                <span className="gradient-text animate-gradient-flow">All deployed.</span>
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                AI mentors, security scanners, vision systems — every build below
                is live in production. Press one to project its hologram.
              </p>
              <div className="mt-8 font-hud text-[10px] text-cyan-300">
                → REEL MOVES WITH YOUR SCROLL · 06 LIVE BUILDS
              </div>
            </div>

            {projects.map((p, i) => (
              <ReelCard key={p.index} project={p} i={i} onOpen={setSelected} />
            ))}

            {/* outro card */}
            <div className="flex w-[26vw] shrink-0 flex-col items-start justify-center gap-4 pr-[10vw]">
              <p className="font-display text-2xl font-bold text-foreground">
                Six missions declassified.
                <br />
                <span className="gradient-text animate-gradient-flow">
                  More in the vault…
                </span>
              </p>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Risk Assessment Tool, MedCare HMS, FraudShield AI, a compiler
                visualizer — plus IoT and encryption research in the lab.
              </p>
              <a
                href={socials.find((s) => s.label === "GITHUB")?.href ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="sheen border border-cyan-400/40 px-6 py-3 font-hud text-[10px] text-cyan-300 transition-all hover:bg-cyan-400/10 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]"
              >
                MORE ON GITHUB ↗
              </a>
            </div>
          </motion.div>

          {/* reel progress — floating HUD chip */}
          <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 border border-cyan-400/20 bg-[#050508]/85 px-5 py-2.5 backdrop-blur-md">
            <div className="mb-2 flex w-56 justify-between font-hud text-[9px] text-muted-foreground">
              <span className="text-cyan-300">REEL</span>
              <span>06 MISSIONS</span>
            </div>
            <div className="h-px w-full bg-white/10">
              <motion.div
                style={{ width: reelWidth }}
                className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 shadow-[0_0_10px_rgba(0,240,255,0.6)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---- mobile: vertical stack ---- */}
      <div className="flex flex-col items-center gap-8 px-5 pb-24 md:hidden">
        {projects.map((p, i) => (
          <ReelCard key={p.index} project={p} i={i} onOpen={setSelected} />
        ))}
      </div>

      {/* holographic dossier modal */}
      <ProjectModal
        project={selected}
        onClose={() => setSelected(null)}
        onNavigate={navigate}
      />
    </section>
  );
}
