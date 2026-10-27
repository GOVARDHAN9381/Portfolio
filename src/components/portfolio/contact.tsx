"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { identity, socials } from "@/config/portfolio";
import FluidButton from "./fluid-button";
import { SectionHeading } from "./about";

export default function Contact() {
  return (
    <section id="transmit" className="relative z-10 flex flex-col px-5 pb-10 pt-28 sm:px-8 sm:pt-36">
      {/* aurora backdrop */}
      <div
        aria-hidden="true"
        className="animate-drift-a pointer-events-none absolute left-1/2 top-1/3 h-[26rem] w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[150px]"
      />

      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading index="04" title="OPEN TRANSMISSION" />

        <div className="relative">
          {/* giant CTA text */}
          <motion.h3
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.4rem,8vw,7rem)] font-bold leading-[1.02] tracking-tight"
          >
            <span className="text-foreground">LET&apos;S BUILD</span>
            <br />
            <span className="gradient-text glow-text-cyan">SOMETHING</span>
            <br />
            <span className="text-outline-neon">LEGENDARY</span>
          </motion.h3>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-12 flex flex-wrap items-center gap-5"
          >
            <FluidButton href={`mailto:${identity.email}`} tone="cyan" className="!bg-emerald-400/10">
              <Mail className="h-4 w-4" />
              INITIATE CONTACT
            </FluidButton>
            <span className="font-hud text-[10px] text-muted-foreground">
              RESPONSE TIME · <span className="text-emerald-300">&lt; 24 HRS</span>
            </span>
          </motion.div>

          {/* socials */}
          <motion.ul
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-14 flex flex-wrap gap-x-10 gap-y-4"
            aria-label="Social links"
          >
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 font-hud text-[11px] text-muted-foreground transition-colors hover:text-emerald-300"
                >
                  <span className="h-1 w-1 rounded-full bg-emerald-400/60 transition-all group-hover:w-4 group-hover:shadow-[0_0_8px_rgba(0,255,157,0.8)]" />
                  {s.label} ↗
                </a>
              </li>
            ))}
          </motion.ul>

          {/* direct channels */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-10 grid gap-px overflow-hidden border border-white/5 bg-white/5 sm:grid-cols-3"
          >
            {[
              {
                k: "EMAIL",
                v: identity.email,
                href: `mailto:${identity.email}`,
              },
              {
                k: "PHONE",
                v: identity.phone,
                href: identity.phoneHref,
              },
              {
                k: "BASE",
                v: identity.location,
                href: undefined,
              },
            ].map((row) => (
              <div key={row.k} className="group bg-[#07070c] p-5 transition-colors hover:bg-emerald-400/5">
                <div className="font-hud text-[9px] text-muted-foreground">{row.k}</div>
                {row.href ? (
                  <a
                    href={row.href}
                    className="mt-2 inline-block break-all text-sm text-foreground/90 transition-colors hover:text-emerald-300"
                  >
                    {row.v}
                  </a>
                ) : (
                  <div className="mt-2 text-sm text-foreground/90">{row.v}</div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* footer — mt-auto keeps it pinned when page is short */}
      <footer className="mt-auto pt-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 py-7 font-hud text-[9px] text-muted-foreground sm:flex-row">
          <span>
            © 2025 {identity.firstName} {identity.lastName} — ALL SIGNALS RESERVED
          </span>
          <span className="flex items-center gap-2">
            DESIGNED & BUILT WITH
            <span className="text-emerald-300">TOO MUCH COFFEE</span>
          </span>
          <a href="#top" className="transition-colors hover:text-emerald-300">
            BACK TO TOP ↑
          </a>
        </div>
      </footer>
    </section>
  );
}
