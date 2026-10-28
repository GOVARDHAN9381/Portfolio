"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { identity } from "@/config/portfolio";

const LINKS = [
  { n: "01", label: "ABOUT", href: "#about" },
  { n: "02", label: "JOURNEY", href: "#journey" },
  { n: "03", label: "WORKS", href: "#works" },
  { n: "04", label: "ARSENAL", href: "#arsenal" },
  { n: "05", label: "TRANSMIT", href: "#transmit" },
];

/**
 * Fixed HUD nav: brand, numbered links, mobile overlay menu,
 * and a neon scroll-progress beam.
 */
export default function Nav() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* progress beam */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[80] h-[2px] origin-left bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400"
        style={{ scaleX: progress, boxShadow: "0 0 12px rgba(0,255,157,0.7)" }}
      />

      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: visible ? 0 : -70, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-[70] border-b border-emerald-400/10 bg-[#050508]/70 backdrop-blur-xl"
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8"
        >
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-foreground transition-colors hover:text-emerald-300"
            onClick={() => setOpen(false)}
          >
            {identity.firstName[0]}
            {identity.lastName[0]}
            <span className="text-emerald-400">.</span>
          </a>

          <ul className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <li key={l.n}>
                <a
                  href={l.href}
                  className="group font-hud text-[10px] text-muted-foreground transition-colors hover:text-emerald-300"
                >
                  <span className="mr-1 text-emerald-400/70">{l.n}/</span>
                  {l.label}
                  <span className="block h-px max-w-0 bg-emerald-400 transition-all duration-300 group-hover:max-w-full" />
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#transmit"
            className="sheen hud-frame hidden border border-emerald-400/40 px-4 py-2 font-hud text-[10px] text-emerald-300 transition-all hover:bg-emerald-400/10 sm:block"
          >
            HIRE ME
          </a>

          {/* mobile trigger */}
          <button
            type="button"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="font-hud text-[10px] text-emerald-300 md:hidden"
          >
            {open ? "CLOSE ✕" : "MENU ↓"}
          </button>
        </nav>
      </motion.header>

      {/* mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[65] flex flex-col items-center justify-center gap-8 bg-[#050508]/95 backdrop-blur-2xl"
          >
            {LINKS.map((l, i) => (
              <motion.a
                key={l.n}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.4 }}
                className="font-display text-4xl font-bold text-foreground transition-colors hover:text-emerald-300"
              >
                <span className="mr-3 font-hud text-xs text-emerald-400/70">
                  {l.n}/
                </span>
                {l.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
