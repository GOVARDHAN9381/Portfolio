import Preloader from "@/components/portfolio/preloader";
import CustomCursor from "@/components/portfolio/custom-cursor";
import Nav from "@/components/portfolio/nav";
import Hero from "@/components/portfolio/hero";
import About from "@/components/portfolio/about";
import Projects from "@/components/portfolio/projects";
import Skills from "@/components/portfolio/skills";
import Contact from "@/components/portfolio/contact";
import { ScrollWorld, ScrollHud } from "@/components/portfolio/three/scroll-world";

export default function Page() {
  return (
    <div className="relative flex min-h-svh flex-col">
      {/* cinematic boot */}
      <Preloader />

      {/* the persistent 3D world — scroll drives the camera descent */}
      <ScrollWorld />

      {/* global effects */}
      <CustomCursor />
      <div className="film-grain" aria-hidden="true" />

      {/* HUD nav + descent indicator */}
      <Nav />
      <ScrollHud />

      {/* scenes */}
      <main className="relative z-10 flex flex-1 flex-col">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </div>
  );
}
