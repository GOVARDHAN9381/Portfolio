/**
 * ─────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT — NARAPAREDDY GOVARDHAN REDDY
 *  Single source of truth. Edit here to update the whole site.
 * ─────────────────────────────────────────────────────────────
 */

export const identity = {
  firstName: "GOVARDHAN",
  lastName: "REDDY",
  fullName: "Narapareddy Govardhan Reddy",
  role: "ASPIRING SOFTWARE DEVELOPER",
  tagline:
    "Computer Science Engineering student passionate about software development, artificial intelligence and cloud automation — I build practical, high-impact applications that solve real-world problems, from AI-guided mentoring platforms to security-tested systems.",
  location: "CHENNAI, TN, IN",
  availability: "OPEN TO INTERNSHIPS",
  email: "ngovardhanreddy9381@gmail.com",
  phone: "+91 93817 26915",
  phoneHref: "tel:+919381726915",
  whatsapp:
    "https://wa.me/919381726915?text=" +
    encodeURIComponent(
      "Hi Govardhan! I just went through your portfolio and I'd like to connect."
    ),
  coords: { lat: "13.0827° N", long: "80.2707° E" },
};

export const socials = [
  {
    label: "WHATSAPP",
    href: "https://wa.me/919381726915",
  },
  { label: "GITHUB", href: "https://github.com/GOVARDHAN9381" },
  {
    label: "LINKEDIN",
    href: "https://www.linkedin.com/in/narapareddy-govardhan-reddy-a18423346/",
  },
  { label: "LEETCODE", href: "https://leetcode.com/u/750RdF0JQo/" },
];

export const about = {
  paragraphs: [
    "I'm Narapareddy Govardhan Reddy — a B.E. Computer Science Engineering student at Saveetha School of Engineering, SIMATS (Class of 2028). My technical journey spans end-to-end web applications, multi-agent AI systems, API security testing, and cloud deployment workflows.",
    "I've shipped deployed solutions including ProjectGuide-AI (an academic project mentor), CollabIQ (a student teaming platform), and APIAST (an automated API vulnerability tester). Right now I'm sharpening my problem-solving with Java & DSA on LeetCode and gaining hands-on industry exposure through the Infosys Springboard Virtual Internship 7.0.",
  ],
  quote: "Learn. Build. Deploy. Repeat.",
  stats: [
    { value: 14, suffix: "+", label: "PROJECTS BUILT" },
    { value: 11, suffix: "", label: "LIVE DEPLOYMENTS" },
    { value: 8, suffix: "", label: "TECH DOMAINS" },
    { value: 6, suffix: "", label: "JOURNEY PHASES" },
  ],
  education: "B.E. CSE · SAVEETHA SCHOOL OF ENGINEERING",
  batch: "CLASS OF 2028",
  // Role priorities — Full Stack intentionally last
  roles: [
    "AI APPLICATION DEVELOPER",
    "PROBLEM SOLVER · JAVA & DSA",
    "DEVOPS & CLOUD ENTHUSIAST",
    "FULL STACK · EXPANDING",
  ],
  internship: "INFOSYS SPRINGBOARD VIRTUAL INTERNSHIP 7.0",
  photos: {
    main: "/photos/portrait.jpg",
    strip: ["/photos/bike.jpg", "/photos/nature.jpg", "/photos/campus.jpg"],
  },
};

export const journey = [
  {
    phase: "01",
    year: "2024 →",
    title: "ACADEMIC FOUNDATION",
    desc: "B.E. Computer Science Engineering at Saveetha — strong grounding in C, C++, Java, Python and core computing concepts.",
  },
  {
    phase: "02",
    year: "PHASE II",
    title: "MODERN WEB ENGINEERING",
    desc: "Responsive frontends with React + Vite, backed by REST APIs, MySQL/PostgreSQL and cloud deploys on Vercel & Railway.",
  },
  {
    phase: "03",
    year: "PHASE III",
    title: "AI & APPLIED ML",
    desc: "Multi-agent architectures with CrewAI/LangChain, computer vision with OpenCV, and BERT-driven NLP matching.",
  },
  {
    phase: "04",
    year: "PHASE IV",
    title: "CAPSTONES & CYBERSECURITY",
    desc: "Engineered ProjectGuide-AI, CollabIQ and APIAST — vulnerability assessment in authorized environments.",
  },
  {
    phase: "05",
    year: "INDUSTRY",
    title: "INFOSYS SPRINGBOARD 7.0",
    desc: "Virtual internship — team-based software engineering simulations and structured industry learning pathways.",
  },
  {
    phase: "06",
    year: "NOW",
    title: "DSA & PLACEMENT PREP",
    desc: "Solving DSA in Java on LeetCode, mastering Docker & CI/CD pipelines, and hunting software engineering internships.",
  },
];

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
    title: "PROJECTGUIDE-AI",
    category: "AI · MULTI-AGENT SYSTEM",
    year: "2025",
    description:
      "A multi-agent AI platform that evaluates project feasibility, scopes requirements, recommends tech stacks, generates milestone roadmaps, and gives faculty governance tools. Built with CrewAI + LangChain over FastAPI.",
    stack: ["React 19", "FastAPI", "CrewAI", "LangChain", "MongoDB", "JWT"],
    accent: "cyan",
    icon: "🧭",
    liveUrl: "https://project-guide-ai.vercel.app/",
    repoUrl: "https://github.com/GOVARDHAN9381",
  },
  {
    index: "002",
    title: "COLLABIQ",
    category: "TEAM INTELLIGENCE PLATFORM",
    year: "2025",
    description:
      "Student collaboration intelligence that matches complementary peer skills via weighted scoring algorithms — complete with interactive team workspaces and faculty analytics dashboards.",
    stack: ["PHP 8+", "MySQL", "PostgreSQL", "Supabase", "Chart.js"],
    accent: "violet",
    icon: "🧩",
    liveUrl: "https://ip-capstone-production.up.railway.app/",
    repoUrl: "https://github.com/GOVARDHAN9381",
  },
  {
    index: "003",
    title: "APIAST",
    category: "CYBERSECURITY · API TESTING",
    year: "2025",
    description:
      "Automated API security platform providing endpoint discovery, authentication weakness validation, AI risk analysis and real-time vulnerability tracking — tested in authorized environments.",
    stack: ["Python", "Nmap", "Nikto", "Metasploit", "Kali Linux"],
    accent: "pink",
    icon: "🛡️",
    liveUrl: "https://api-testing-phi-three.vercel.app/",
    repoUrl: "https://github.com/GOVARDHAN9381",
  },
  {
    index: "004",
    title: "RESUMEAI",
    category: "AI · NLP SCREENING",
    year: "2025",
    description:
      "BERT-powered resume parsing and candidate ranking tool featuring ATS scoring, job-description matching, and automated interview question generation for recruiters.",
    stack: ["BERT NLP", "Scikit-learn", "FastAPI", "Streamlit", "Supabase"],
    accent: "cyan",
    icon: "🧠",
    liveUrl: "https://ai-resume-analysis-wzya.onrender.com/",
    repoUrl: "https://github.com/GOVARDHAN9381",
  },
  {
    index: "005",
    title: "SPECTAI",
    category: "COMPUTER VISION",
    year: "2024",
    description:
      "Real-time spectacle frame recommender — detects facial landmarks with MediaPipe, measures facial geometry via OpenCV, and recommends compatible eyeglass frames live from your webcam.",
    stack: ["Python", "OpenCV", "MediaPipe", "JavaScript"],
    accent: "violet",
    icon: "👓",
    liveUrl: "https://shimmering-cocada-3bc352.netlify.app/",
    repoUrl: "https://github.com/GOVARDHAN9381",
  },
  {
    index: "006",
    title: "AGRIVISION",
    category: "AGRITECH · EDGE AI",
    year: "2024",
    description:
      "Smart farming advisory platform — plant disease scanning through the camera, crop suitability suggestions, and live market price feeds, running edge AI on-device.",
    stack: ["Python", "Edge AI", "OpenCV", "Weather APIs"],
    accent: "pink",
    icon: "🌾",
    liveUrl: "https://agrisight-1.onrender.com/",
    repoUrl: "https://github.com/GOVARDHAN9381",
  },
];

export const skillGroups = [
  {
    group: "LANGUAGES & CORE",
    items: [
      { name: "Java", level: 88 },
      { name: "Python", level: 90 },
      { name: "JavaScript (ES6+)", level: 82 },
      { name: "C / C++", level: 80 },
      { name: "SQL", level: 78 },
      { name: "PHP", level: 72 },
    ],
  },
  {
    group: "AI & INTELLIGENCE",
    items: [
      { name: "CrewAI / LangChain", level: 85 },
      { name: "BERT NLP", level: 80 },
      { name: "OpenCV / MediaPipe", level: 82 },
      { name: "Scikit-learn / Pandas", level: 84 },
      { name: "TensorFlow / Keras", level: 75 },
      { name: "Computer Vision", level: 82 },
    ],
  },
  {
    group: "WEB · CLOUD · SECURITY",
    items: [
      { name: "React 19 / Vite", level: 88 },
      { name: "FastAPI / Node.js", level: 86 },
      { name: "PostgreSQL / MySQL", level: 80 },
      { name: "Docker / CI-CD", level: 72 },
      { name: "Linux / Kali", level: 82 },
      { name: "Nmap / Nikto / Metasploit", level: 76 },
    ],
  },
];

export const marqueeTech = [
  "JAVA", "PYTHON", "REACT 19", "FASTAPI", "CREWAI", "LANGCHAIN",
  "BERT NLP", "OPENCV", "MYSQL", "POSTGRESQL", "DOCKER", "KALI LINUX",
];
