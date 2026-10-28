"use client";

import { motion } from "framer-motion";
import { skillGroups, marqueeTech } from "@/config/portfolio";
import { SectionHeading } from "./about";

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground/90 transition-colors group-hover:text-emerald-200">
          {name}
        </span>
        <span className="font-hud text-[9px] text-muted-foreground">
          {level}%
        </span>
      </div>
      <div className="relative h-[5px] overflow-hidden bg-white/6">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: level / 100 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.1, delay: delay + 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400 shadow-[0_0_12px_rgba(0,255,157,0.5)]"
        />
      </div>
    </motion.div>
  );
}

function MarqueeRow({
  reverse = false,
  outline = false,
}: {
  reverse?: boolean;
  outline?: boolean;
}) {
  const row = [...marqueeTech, ...marqueeTech];
  return (
    <div className="relative overflow-hidden border-y border-white/5 py-5">
      <div
        className={`flex w-max items-center gap-10 whitespace-nowrap ${
          reverse ? "animate-marquee-right" : "animate-marquee-left"
        }`}
      >
        {row.map((t, i) => (
          <span
            key={`${t}-${i}`}
            aria-hidden={i >= marqueeTech.length}
            className={`font-display text-3xl font-bold tracking-wide sm:text-4xl ${
              outline
                ? "text-outline transition-all hover:text-outline-neon"
                : "text-foreground/12"
            }`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="arsenal" className="relative z-10 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="04" title="THE ARSENAL" />
      </div>

      <MarqueeRow />

      <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {skillGroups.map((g, gi) => (
            <motion.div
              key={g.group}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, delay: gi * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="hud-frame border border-white/8 bg-card/60 p-6 backdrop-blur transition-all duration-500 hover:border-emerald-400/40 hover:shadow-[0_0_50px_rgba(0,255,157,0.12)]"
            >
              <div className="mb-7 flex items-center justify-between">
                <h3 className="font-hud text-[11px] text-emerald-300">{g.group}</h3>
                <span className="font-hud text-[9px] text-muted-foreground">
                  MOD-{String(gi + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-col gap-5">
                {g.items.map((s, si) => (
                  <SkillBar key={s.name} name={s.name} level={s.level} delay={si * 0.06} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <MarqueeRow reverse outline />
      </div>
    </section>
  );
}
