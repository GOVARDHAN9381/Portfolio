/**
 * ─────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT — EDIT THIS FILE TO MAKE IT YOURS
 *  Swap the placeholder name, links, projects & skills here.
 *  Every scene on the site reads from this single source.
 * ─────────────────────────────────────────────────────────────
 */

export const identity = {
  firstName: "AARAV",
  lastName: "MEHTA",
  role: "CREATIVE DEVELOPER",
  tagline:
    "I engineer cinematic web experiences — fusing design, motion and code into products people remember.",
  location: "MUMBAI, IN",
  availability: "AVAILABLE FOR WORK",
  email: "hello@aaravmehta.dev",
};

export const socials = [
  { label: "GITHUB", href: "https://github.com/your-username" },
  { label: "LINKEDIN", href: "https://linkedin.com/in/your-username" },
  { label: "X / TWITTER", href: "https://x.com/your-username" },
  { label: "DRIBBBLE", href: "https://dribbble.com/your-username" },
];

export const about = {
  paragraphs: [
    "I'm a developer who treats the browser like a film set. For the past 5 years I've been obsessed with one question: how do you make software feel alive? The answer, I've learned, lives at the intersection of engineering discipline and cinematic storytelling.",
    "From realtime dashboards processing millions of events to award-winning marketing sites with buttery 60fps motion — I design and build products where every scroll, hover and transition is intentional. Performance is not an afterthought; it's the stage the whole performance stands on.",
  ],
  quote: "Code is the camera. Design is the script. Shipping is the premiere.",
  stats: [
    { value: 5, suffix: "+", label: "YEARS CRAFTING" },
    { value: 42, suffix: "", label: "PROJECTS SHIPPED" },
    { value: 18, suffix: "+", label: "HAPPY CLIENTS" },
    { value: 60, suffix: "FPS", label: "ALWAYS THE TARGET" },
  ],
  portraitEmoji: "🧑‍💻",
};

export type Project = {
  index: string;
  title: string;
  category: string;
  year: string;
  description: string;
  stack: string[];
  accent: "cyan" | "violet" | "pink";
  icon: string;
  liveUrl: string;
  repoUrl: string;
};

export const projects: Project[] = [
  {
    index: "001",
    title: "NEBULA DASH",
    category: "REALTIME ANALYTICS",
    year: "2025",
    description:
      "A realtime analytics cockpit streaming 1M+ events per minute over WebSockets, with GPU-accelerated charts and an alert system that thinks before it pings.",
    stack: ["Next.js", "WebSockets", "ClickHouse", "D3"],
    accent: "cyan",
    icon: "📡",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    index: "002",
    title: "AURORA OS",
    category: "WEB EXPERIENCE",
    year: "2025",
    description:
      "An operating-system-in-the-browser concept — draggable windows, a physics-based dock and a command palette. Featured across dev communities for its motion design.",
    stack: ["React", "Framer Motion", "Zustand"],
    accent: "violet",
    icon: "🪐",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    index: "003",
    title: "PULSE COMMERCE",
    category: "E-COMMERCE PLATFORM",
    year: "2024",
    description:
      "Headless storefront that cut page-load to 0.8s and lifted conversion 34%. Edge-rendered, cart state synced in realtime, checkout smoother than a heist movie.",
    stack: ["Next.js", "Stripe", "Prisma", "Redis"],
    accent: "pink",
    icon: "⚡",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    index: "004",
    title: "ECHO AI",
    category: "AI PRODUCT",
    year: "2024",
    description:
      "Conversational analytics assistant that turns plain-English questions into live SQL, charts and insight cards. Streaming responses, zero loading anxiety.",
    stack: ["TypeScript", "LLM SDK", "PostgreSQL"],
    accent: "cyan",
    icon: "🧠",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    index: "005",
    title: "ORBITAL CMS",
    category: "DEVELOPER TOOLING",
    year: "2023",
    description:
      "A git-backed content engine with live visual editing and instant previews. Open source, 1.2k stars, and the reason three agencies fired their CMS contracts.",
    stack: ["Node.js", "Git API", "Monaco"],
    accent: "violet",
    icon: "🛰️",
    liveUrl: "#",
    repoUrl: "#",
  },
];

export const skillGroups = [
  {
    group: "FRONTEND",
    items: [
      { name: "React / Next.js", level: 95 },
      { name: "TypeScript", level: 92 },
      { name: "Framer Motion", level: 90 },
      { name: "Three.js / WebGL", level: 78 },
      { name: "Tailwind CSS", level: 94 },
    ],
  },
  {
    group: "BACKEND",
    items: [
      { name: "Node.js / Bun", level: 90 },
      { name: "PostgreSQL", level: 84 },
      { name: "Prisma ORM", level: 88 },
      { name: "WebSockets", level: 82 },
      { name: "Redis", level: 76 },
    ],
  },
  {
    group: "CRAFT",
    items: [
      { name: "UI / UX Design", level: 85 },
      { name: "Motion Design", level: 91 },
      { name: "Performance", level: 89 },
      { name: "System Design", level: 80 },
      { name: "Accessibility", level: 83 },
    ],
  },
];

export const marqueeTech = [
  "NEXT.JS", "TYPESCRIPT", "REACT", "NODE.JS", "THREE.JS", "TAILWIND",
  "POSTGRESQL", "FRAMER MOTION", "WEBGL", "PRISMA", "REDIS", "DOCKER",
];
