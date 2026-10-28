"use client";

import {
  Component,
  Suspense,
  memo,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/* ════════════════════════════════════════════════════════════════════
   THE WORLD  — one persistent WebGL scene behind the whole page.
   Scroll drives a cinematic camera descent: surface (hero sphere
   between dark monoliths) → through a portal ring → deep void core.
   Peachworlds-style "scroll to go under".
   ════════════════════════════════════════════════════════════════════ */

/* shared mutable state — written by DOM listeners, read in useFrame.
   No react state → zero re-renders at 60fps. */
const world = {
  p: 0, // raw scroll progress 0..1 (piecewise over sections)
  t: 0, // raw scroll ratio 0..1 (unwarped — level lookup)
  sp: 0, // smoothed progress (damped in useFrame)
  v: 0, // scroll velocity magnitude 0..1
  mx: 0, // pointer -1..1
  my: 0,
};

/* ── WebGL guard so the page never dies ── */
class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ── deterministic pseudo-random for rock shapes ── */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── piecewise scroll progress measured from real section offsets ── */
const SECTION_IDS = ["top", "about", "journey", "works", "arsenal", "transmit"];
let breaks: number[] = [0, 0.16, 0.34, 0.52, 0.72, 1];
/* unwarped tops for the LEVEL label — camera path may stretch the
   last segment, but the label must flip when the real section does */
let levelBreaks: number[] = [0, 0.16, 0.34, 0.52, 0.72, 0.94];

function measureBreakpoints() {
  if (typeof document === "undefined") return;
  const vh = window.innerHeight;
  const max = Math.max(1, document.documentElement.scrollHeight - vh);
  const tops = SECTION_IDS.map((id) => {
    const el = document.getElementById(id);
    return el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY) : 0;
  });
  breaks = tops.map((t) => Math.min(1, t / max));
  breaks[0] = 0;
  breaks[breaks.length - 1] = Math.min(1, breaks[breaks.length - 1] || 1);
  if (breaks[breaks.length - 1] < 0.98) breaks[breaks.length - 1] = 1;
  levelBreaks = tops.map((t) => Math.min(1, t / max));
  levelBreaks[0] = 0;
}

/* which level does a raw scroll ratio sit in? */
function levelFromT(t: number) {
  for (let i = 0; i < levelBreaks.length - 1; i++) {
    if (t < levelBreaks[i + 1]) return i;
  }
  return levelBreaks.length - 1;
}

function progressFromScroll(y: number, max: number) {
  const t = Math.min(1, Math.max(0, y / max));
  for (let i = 0; i < breaks.length - 1; i++) {
    if (t <= breaks[i + 1] || i === breaks.length - 2) {
      const seg = Math.max(1e-5, breaks[i + 1] - breaks[i]);
      const local = Math.min(1, Math.max(0, (t - breaks[i]) / seg));
      return (i + local) / (breaks.length - 1);
    }
  }
  return t;
}

/* ════════════════════════ THE SPHERE ════════════════════════
   Near-black glossy body, breathing vertex noise, cinematic rim:
   white light from above on the surface, green edges below.   */
const SPHERE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vN;
  varying vec3 vW;
  void main() {
    vec3 p = position;
    float n =
      sin(p.x * 2.1 + uTime * 0.62) *
      sin(p.y * 1.7 + uTime * 0.51) *
      sin(p.z * 2.3 + uTime * 0.58);
    p += normal * n * uAmp;
    vN = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(p, 1.0);
    vW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const SPHERE_FRAG = /* glsl */ `
  uniform vec3 uRimWhite;
  uniform vec3 uRimGreen;
  uniform float uGreen;
  varying vec3 vN;
  varying vec3 vW;
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition - vW);
    float fr = pow(1.0 - abs(dot(N, V)), 2.4);
    float topLight = smoothstep(-0.55, 0.95, N.y);
    vec3 rim = mix(uRimWhite, uRimGreen, uGreen);
    vec3 col = vec3(0.010, 0.014, 0.012);
    col += rim * fr * (0.30 + 0.70 * topLight);
    col += uRimGreen * fr * 0.55 * uGreen;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function HeroSphere() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.035 },
      uRimWhite: { value: new THREE.Color("#d9efe5") },
      uRimGreen: { value: new THREE.Color("#00ff9d") },
      uGreen: { value: 0 },
    }),
    []
  );
  const amp = useRef(0.035);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const u = mat.current.uniforms;
    u.uTime.value = t;
    // scroll velocity inflates the breathing
    amp.current = THREE.MathUtils.damp(
      amp.current,
      0.035 + Math.min(0.16, world.v * 0.5),
      3.2,
      delta
    );
    u.uAmp.value = amp.current;
    // the deeper we go, the greener the rim
    u.uGreen.value = THREE.MathUtils.clamp(world.sp * 1.6, 0, 1);
    mesh.current.rotation.y = t * 0.05;
  });

  return (
    <mesh ref={mesh} position={[0, 0.62, 0]}>
      <sphereGeometry args={[1.58, 96, 96]} />
      <shaderMaterial
        ref={mat}
        vertexShader={SPHERE_VERT}
        fragmentShader={SPHERE_FRAG}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/* ════════════════════════ MONOLITH ROCKS ════════════════════════
   Procedural displaced icosahedra — the dark cliffs framing the
   sphere, plus shards along the descent and the deep core.       */
function RockGeometry({ seed, detail = 2 }: { seed: number; detail?: number }) {
  return useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, detail);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    const rnd = mulberry32(seed);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      const d =
        0.34 *
          (Math.sin(n.x * 3.1 + seed) *
            Math.sin(n.y * 2.7 + seed * 1.3) *
            Math.sin(n.z * 3.7 + seed * 0.7)) +
        0.14 * Math.sin(n.x * 8.0 + seed) * Math.sin(n.z * 9.0 + seed);
      v.multiplyScalar(1 + d + (rnd() - 0.5) * 0.06);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, [seed, detail]);
}

function Rock({
  seed,
  position,
  scale,
  rotation = [0, 0, 0],
  detail = 2,
}: {
  seed: number;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  detail?: number;
}) {
  const geo = RockGeometry({ seed, detail });
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.y =
      rotation[1] + Math.sin(state.clock.elapsedTime * 0.08 + seed) * 0.05;
  });
  return (
    <mesh ref={ref} geometry={geo} position={position} scale={scale} rotation={rotation}>
      <meshStandardMaterial
        color="#060807"
        roughness={0.52}
        metalness={0.22}
        flatShading
      />
    </mesh>
  );
}

function Monoliths({ lite }: { lite: boolean }) {
  return (
    <group>
      {/* surface cliffs framing the sphere (reference composition) */}
      <Rock seed={3.1} position={[-4.9, 0.35, 1.1]} scale={[2.5, 3.6, 2.3]} rotation={[0, 0.4, 0.06]} />
      <Rock seed={7.7} position={[5.2, -0.75, 2.4]} scale={[2.9, 4.0, 2.6]} rotation={[0, 1.2, -0.08]} />
      <Rock seed={11.3} position={[-2.9, -1.9, 2.6]} scale={[1.4, 2.2, 1.4]} rotation={[0, 2.1, 0.1]} />
      <Rock seed={5.9} position={[2.7, -2.4, 3.0]} scale={[1.3, 2.0, 1.3]} rotation={[0, 0.8, -0.12]} />

      {/* shards along the descent */}
      <Rock seed={13.7} position={[-3.4, -5.2, -1.0]} scale={[1.8, 2.6, 1.8]} rotation={[0, 0.3, 0.15]} />
      <Rock seed={17.1} position={[3.6, -6.8, -0.5]} scale={[2.0, 3.0, 1.9]} rotation={[0, 1.7, -0.1]} />
      {!lite && (
        <Rock seed={19.3} position={[-2.6, -9.6, -1.6]} scale={[1.5, 2.4, 1.5]} rotation={[0, 2.6, 0.08]} />
      )}

      {/* the deep core monolith — contact destination */}
      <Rock seed={23.9} position={[0, -15.1, -1.4]} scale={[1.9, 4.6, 1.9]} rotation={[0, 0.5, 0]} detail={3} />
      <Rock seed={29.7} position={[-2.6, -14.2, -0.4]} scale={[1.1, 2.0, 1.1]} rotation={[0, 1.9, 0.1]} />
      <Rock seed={31.3} position={[2.4, -14.6, -0.2]} scale={[1.0, 1.8, 1.0]} rotation={[0, 0.9, -0.1]} />
    </group>
  );
}

/* ════════════════════════ PORTAL + CORE GLOW ════════════════════════ */
function Portal() {
  const ring = useRef<THREE.Mesh>(null!);
  const light = useRef<THREE.PointLight>(null!);
  useFrame((state, delta) => {
    const base = 0.85 + Math.sin(state.clock.elapsedTime * 1.4) * 0.12;
    const m = ring.current.material as THREE.MeshBasicMaterial;
    m.opacity = base * 0.55;
    light.current.intensity = THREE.MathUtils.damp(
      light.current.intensity,
      14 + world.v * 26,
      3,
      delta
    );
  });
  return (
    <group position={[0, -2.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={ring}>
        <torusGeometry args={[4.2, 0.02, 8, 128]} />
        <meshBasicMaterial color="#00ff9d" transparent opacity={0.5} />
      </mesh>
      <mesh>
        <torusGeometry args={[4.85, 0.008, 8, 128]} />
        <meshBasicMaterial color="#eafff4" transparent opacity={0.14} />
      </mesh>
      <pointLight ref={light} color="#00ff9d" intensity={11} distance={11} decay={2} />
    </group>
  );
}

function DeepCore() {
  const light = useRef<THREE.PointLight>(null!);
  useFrame((state) => {
    light.current.intensity =
      26 + Math.sin(state.clock.elapsedTime * 0.9) * 6 + world.v * 18;
  });
  return (
    <group position={[0, -13.6, 0.6]}>
      <pointLight ref={light} color="#00ff9d" intensity={26} distance={16} decay={2} />
      <mesh>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshBasicMaterial color="#b0ffd9" />
      </mesh>
    </group>
  );
}

/* ════════════════════════ JOURNEY SPINE ════════════════════════
   Six milestone gates threaded down the void between IDENTITY
   and WORKS — one per journey phase. The camera dives THROUGH
   each ring; the nearest gate flares as you pass.             */
const SPINE_X = 0.3;
const GATE_YS = [-1.4, -1.92, -2.44, -2.96, -3.48, -4.0];
const SPINE_SPAN = GATE_YS[GATE_YS.length - 1] - GATE_YS[0];

function SpineGate({
  y,
  index,
  node,
}: {
  y: number;
  index: number;
  node: boolean;
}) {
  const ring = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const orb = useRef<THREE.Mesh>(null!);
  const seed = index * 1.7;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // flare when the camera is close to this gate
    const d = Math.abs(state.camera.position.y - y);
    const near = THREE.MathUtils.clamp(1 - d / 2.6, 0, 1);
    const pulse = 0.5 + Math.sin(t * 1.6 + seed) * 0.14;
    const m = ring.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.16 + pulse * 0.5 * (0.35 + 0.65 * near);
    const hm = halo.current.material as THREE.MeshBasicMaterial;
    hm.opacity = 0.05 + near * 0.22;
    ring.current.rotation.z = t * 0.14 * (index % 2 === 0 ? 1 : -1);
    halo.current.rotation.z = -t * 0.09;
    if (orb.current) {
      const a = t * (0.5 + index * 0.11) + seed;
      orb.current.position.set(
        Math.cos(a) * 2.14,
        Math.sin(a) * 2.14,
        Math.sin(t * 0.8 + seed) * 0.12
      );
      const om = orb.current.material as THREE.MeshBasicMaterial;
      om.opacity = 0.35 + near * 0.6;
    }
  });

  return (
    <group position={[SPINE_X, y, 0]} rotation={[0, 0, index * 0.22 - 0.5]}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.05, 0.012, 8, 96]} />
        <meshBasicMaterial color="#00ff9d" transparent opacity={0.3} />
      </mesh>
      <mesh ref={halo} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.004, 6, 96]} />
        <meshBasicMaterial color="#eafff4" transparent opacity={0.08} />
      </mesh>
      {node && (
        <mesh ref={orb}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshBasicMaterial color="#b0ffd9" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function JourneySpine({ lite }: { lite: boolean }) {
  const beam = useRef<THREE.Mesh>(null!);
  const light = useRef<THREE.PointLight>(null!);

  useFrame((state, delta) => {
    // a signal travels down the spine as the visitor descends
    const y = GATE_YS[0] + SPINE_SPAN * THREE.MathUtils.clamp(world.sp * 5, 0, 1);
    beam.current.position.y = THREE.MathUtils.damp(
      beam.current.position.y,
      y,
      3.5,
      delta
    );
    (beam.current.material as THREE.MeshBasicMaterial).opacity =
      0.1 + world.v * 0.25;
    light.current.position.y = beam.current.position.y;
    light.current.intensity = THREE.MathUtils.damp(
      light.current.intensity,
      6 + world.v * 18,
      3,
      delta
    );
  });

  return (
    <group>
      {GATE_YS.map((y, i) => (
        <SpineGate key={y} y={y} index={i} node={!lite || i % 2 === 0} />
      ))}
      {/* data beam threading the gates */}
      <mesh ref={beam} position={[SPINE_X, GATE_YS[0], 0]}>
        <cylinderGeometry args={[0.006, 0.006, SPINE_SPAN, 6, 1, true]} />
        <meshBasicMaterial color="#9dffd0" transparent opacity={0.12} />
      </mesh>
      <pointLight
        ref={light}
        color="#00ff9d"
        intensity={6}
        distance={7}
        decay={2}
        position={[SPINE_X, GATE_YS[0], 1.2]}
      />
    </group>
  );
}

/* ════════════════════════ CAMERA RIG ════════════════════════
   A Catmull path through the world; scroll drags the camera
   along it, pointer adds parallax, velocity adds roll.        */
const camPath = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0.62, 9.6), // hero — sphere framed by cliffs
    new THREE.Vector3(-1.7, -0.75, 7.8), // about — drift left
    new THREE.Vector3(0.6, -2.7, 7.2), // journey — threading the spine gates
    new THREE.Vector3(0.9, -4.6, 8.1), // works — under the crust, gate above
    new THREE.Vector3(-1.0, -8.1, 7.4), // skills — deep void
    new THREE.Vector3(0, -12.4, 8.8), // contact — facing the core
  ],
  false,
  "catmullrom",
  0.55
);
const lookPath = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0.62, 0),
    new THREE.Vector3(-0.4, -0.9, 0),
    new THREE.Vector3(0.3, -3.4, -0.4), // journey — down the spine
    new THREE.Vector3(0, -5.2, -1.6),
    new THREE.Vector3(0.2, -8.8, -0.6),
    new THREE.Vector3(0, -13.6, -1.2),
  ],
  false,
  "catmullrom",
  0.55
);

function Rig() {
  const target = useRef(new THREE.Vector3(0, 0.62, 9.6));
  const look = useRef(new THREE.Vector3(0, 0.62, 0));

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    world.sp = THREE.MathUtils.damp(world.sp, world.p, 3.4, delta);
    world.v = THREE.MathUtils.damp(world.v, 0, 2.6, delta);

    const p = THREE.MathUtils.clamp(world.sp, 0, 1);
    camPath.getPointAt(p, target.current);
    lookPath.getPointAt(p, look.current);

    target.current.x += world.mx * 0.55;
    target.current.y += world.my * 0.35;

    cam.position.lerp(target.current, 1 - Math.exp(-7 * delta));
    cam.lookAt(look.current);
    cam.rotation.z =
      cam.rotation.z + world.mx * -0.022 + world.v * 0.012 * (world.mx > 0 ? 1 : -1);
  });
  return null;
}

/* ════════════════════════ DOM SIDE ════════════════════════ */
function useWorldListeners() {
  useEffect(() => {
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;
    let pendingY: number | null = null;

    const onScroll = () => {
      pendingY = window.scrollY;
    };
    const tick = () => {
      if (pendingY !== null) {
        const now = performance.now();
        const dt = Math.max(16, now - lastT);
        const dy = pendingY - lastY;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        world.p = progressFromScroll(pendingY, max);
        world.t = Math.min(1, Math.max(0, pendingY / max));
        world.v = Math.min(1, (Math.abs(dy) / dt) * 1.4);
        lastY = pendingY;
        lastT = now;
        pendingY = null;
      }
      raf = requestAnimationFrame(tick);
    };
    const onPointer = (e: PointerEvent) => {
      world.mx = (e.clientX / window.innerWidth) * 2 - 1;
      world.my = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    measureBreakpoints();
    // re-measure once layout/fonts settle
    const t1 = setTimeout(measureBreakpoints, 600);
    const t2 = setTimeout(measureBreakpoints, 2200);
    window.addEventListener("resize", measureBreakpoints);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measureBreakpoints);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);
}

/* descent HUD — SIX LEVELS of percentage: the label names the
   level you are inside (SURFACE → TRANSMIT), the % shows depth
   inside the whole run, and the bar carries level tick marks. */
const LEVEL_NAMES = [
  "SURFACE",
  "IDENTITY",
  "JOURNEY",
  "WORKS",
  "ARSENAL",
  "TRANSMIT",
];

export function ScrollHud() {
  const pct = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const lvl = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = Math.round(world.sp * 100);
      const li = levelFromT(world.t);
      if (pct.current) pct.current.textContent = `${p}%`;
      if (label.current)
        label.current.textContent =
          world.sp < 0.02
            ? "SCROLL TO GO UNDER"
            : `DESCENDING — ${LEVEL_NAMES[li]}`;
      if (lvl.current) lvl.current.textContent = `LVL ${String(li + 1).padStart(2, "0")}/06`;
      if (bar.current) bar.current.style.height = `${world.sp * 100}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed bottom-7 right-6 z-40 flex items-end gap-3 sm:right-9"
    >
      <div className="flex flex-col items-end gap-1">
        <span ref={label} className="font-hud text-[9px] text-foreground/70">
          SCROLL TO GO UNDER
        </span>
        <span ref={pct} className="font-hud text-[13px] leading-none text-emerald-300 [text-shadow:0_0_12px_rgba(0,255,157,0.55)]">
          0%
        </span>
        <span ref={lvl} className="font-hud text-[8px] text-emerald-300/60">
          LVL 01/06
        </span>
      </div>
      <div className="relative mb-0.5 h-16 w-px overflow-visible bg-white/12">
        {/* level tick marks — one per level boundary */}
        {[20, 40, 60, 80].map((t) => (
          <span
            key={t}
            className="absolute left-[-2px] h-px w-[5px] bg-white/30"
            style={{ top: `${t}%` }}
          />
        ))}
        <div className="absolute inset-0 overflow-hidden">
          <div
            ref={bar}
            className="w-full bg-emerald-400 shadow-[0_0_8px_rgba(0,255,157,0.8)]"
          />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ THE CANVAS ════════════════════════ */
export const ScrollWorld = memo(function ScrollWorld() {
  useWorldListeners();
  const lite = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <GLBoundary>
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.62, 9.6], fov: 45, near: 0.1, far: 60 }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor("#020203");
            scene.fog = new THREE.Fog("#020203", 7.5, 24);
          }}
        >
          <ambientLight intensity={0.12} />
          <directionalLight position={[6, 9, 4]} intensity={1.5} color="#f2fff8" />
          <directionalLight position={[-6, 4, -6]} intensity={0.35} color="#cfe8dd" />
          <pointLight position={[0, 3.4, 3.6]} intensity={12} distance={10} decay={2} color="#eafff4" />

          <Suspense fallback={null}>
            <Rig />
            <HeroSphere />
            <Monoliths lite={lite} />
            <Portal />
            <JourneySpine lite={lite} />
            <DeepCore />
            <Sparkles
              count={lite ? 60 : 110}
              size={2.2}
              scale={[26, 22, 14]}
              position={[0, -6, 2]}
              speed={0.22}
              opacity={0.5}
              color="#9dffd0"
            />
            <Sparkles
              count={lite ? 80 : 140}
              size={1.4}
              scale={[42, 32, 22]}
              position={[0, -6, -6]}
              speed={0.14}
              opacity={0.32}
              color="#ffffff"
            />
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={0.55}
                luminanceThreshold={0.24}
                luminanceSmoothing={0.22}
                mipmapBlur
                radius={0.72}
              />
              <Vignette eskil={false} offset={0.2} darkness={0.82} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>
    </GLBoundary>
  );
});
