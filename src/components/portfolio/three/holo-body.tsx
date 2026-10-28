"use client";

import {
  Component,
  memo,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";
import { HOLO_EDGES } from "./holo-edges";

/* ════════════════════════════════════════════════════════════════════
   HOLO-BODY — a professional full-body hologram built from the real
   photo cutout (public/holo/fullbody.png).  Photoreal body treated
   with a hologram shader: build-in materialize sweep, scan beam,
   glitch slices, flicker — plus silhouette particle field, echo
   depth layers, emitter stage rings and a mirror floor.
   ════════════════════════════════════════════════════════════════════ */

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ── shared mutable world state (no re-renders) ── */
const holo = { px: 0, py: 0 };

/* ── body proportions: image is 342x1100 ── */
const BODY_H = 3.0;
const BODY_W = BODY_H * (342 / 1100); // ≈ 0.93
const FLOOR_Y = -BODY_H / 2 - 0.02;

/* ── the hologram body shader ───────────────────────────────────────
   uv.y = 1 is the head, 0 the feet.
   uBuild  : 0→1 materialize sweep (feet first, bright edge line)
   uScan   : looping scan beam y (0..1)
   uGlitch : slice-displacement activity                        */
const BODY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const BODY_FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uBuild;
  uniform float uScan;
  uniform vec3 uNeon;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec2 uv = vUv;

    /* occasional horizontal glitch slices */
    float band = floor(uv.y * 26.0);
    float gate = step(0.93, hash(band + floor(uTime * 7.0) * 13.7));
    float drive = gate * (0.5 + 0.5 * sin(uTime * 41.0 + band));
    uv.x += (hash(band * 3.1 + floor(uTime * 7.0)) - 0.5) * 0.018 * drive;

    vec4 tex = texture2D(uTex, uv);

    /* fine holographic scanlines + slow roll */
    float lines = 0.965 + 0.035 * sin((vUv.y + uTime * 0.028) * 900.0);
    /* subtle flicker */
    float flick = 0.955 + 0.045 * hash(floor(uTime * 24.0));

    vec3 col = tex.rgb * lines * flick;

    /* cinematic lift — keep the suit/face readable on pitch black */
    col = col * 1.28 + vec3(0.016, 0.024, 0.019);
    /* whisper of mint in the shadows to unify with the theme */
    col += uNeon * 0.02 * (1.0 - smoothstep(0.0, 0.55, dot(col, vec3(0.333))));

    /* travelling scan beam (bottom -> top) — thin light line */
    float d = abs(vUv.y - uScan);
    float beam = smoothstep(0.022, 0.001, d);
    col += uNeon * beam * 0.5;

    /* materialize build-in: feet-first reveal with hot edge */
    float cut = smoothstep(uBuild, uBuild - 0.035, vUv.y);
    float edge = smoothstep(0.045, 0.0, abs(vUv.y - uBuild)) * step(uBuild, 0.999);

    float alpha = tex.a * cut;
    col += uNeon * edge * 1.6 * tex.a;

    if (alpha < 0.012) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ── additive silhouette halo (same cutout alpha, neon color) ── */
const HALO_FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uNeon;
  varying vec2 vUv;
  void main() {
    float a = texture2D(uTex, vUv).a;
    float pulse = 0.82 + 0.18 * sin(uTime * 2.1);
    gl_FragColor = vec4(uNeon, a * uOpacity * pulse);
  }
`;
const HALO_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function HaloLayer({
  z,
  scale,
  opacity,
  tex,
}: {
  z: number;
  scale: number;
  opacity: number;
  tex: THREE.Texture;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uNeon: { value: new THREE.Color("#00ff9d") },
    }),
    [tex, opacity]
  );
  useFrame((state) => {
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh position={[0, 0, z]} scale={[scale, scale, 1]}>
      <planeGeometry args={[BODY_W, BODY_H]} />
      <shaderMaterial
        ref={mat}
        vertexShader={HALO_VERT}
        fragmentShader={HALO_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ── THE BODY ── */
function HoloBody() {
  // imperative load: avoids mutating hook-returned texture objects
  const tex = useMemo(() => {
    const t = new THREE.TextureLoader().load("/holo/fullbody.png");
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);

  const mat = useRef<THREE.ShaderMaterial>(null!);
  const started = useRef<number | null>(null);
  const scanRef = useRef<THREE.Mesh>(null!);
  const group = useRef<THREE.Group>(null!);

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uTime: { value: 0 },
      uBuild: { value: 0 },
      uScan: { value: 0 },
      uNeon: { value: new THREE.Color("#00ff9d") },
    }),
    [tex]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const u = mat.current.uniforms;
    u.uTime.value = t;

    // materialize sweep on first appearance
    if (started.current === null) started.current = t;
    const bt = Math.min(1, (t - started.current) / 2.1);
    u.uBuild.value = 1 - Math.pow(1 - bt, 3); // easeOutCubic

    // looping scan beam
    u.uScan.value = (t * 0.24) % 1.15;

    // beam strip outside the body, synced
    if (scanRef.current) {
      const sy = u.uScan.value;
      scanRef.current.position.y = sy * BODY_H - BODY_H / 2;
      const m = scanRef.current.material as THREE.MeshBasicMaterial;
      const fade = sy > 1 ? Math.max(0, 1 - (sy - 1) * 6.6) : 1;
      m.opacity = 0.2 * fade * (0.6 + 0.4 * Math.sin(t * 6.0));
    }

    // pointer sway + idle bob
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        holo.px * 0.085,
        0.05
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -holo.py * 0.035,
        0.05
      );
      group.current.position.y = Math.sin(t * 0.9) * 0.016;
    }
  });

  return (
    <group ref={group}>
      {/* echo depth layers behind (parallax) */}
      <HaloLayer z={-0.075} scale={1.028} opacity={0.16} tex={tex} />
      <HaloLayer z={-0.15} scale={1.06} opacity={0.07} tex={tex} />

      {/* rim halo just behind the body */}
      <HaloLayer z={-0.02} scale={1.012} opacity={0.34} tex={tex} />

      {/* photoreal hologram body */}
      <mesh>
        <planeGeometry args={[BODY_W, BODY_H]} />
        <shaderMaterial
          ref={mat}
          vertexShader={BODY_VERT}
          fragmentShader={BODY_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* scan beam light-strip extending past the silhouette */}
      <mesh ref={scanRef} position={[0, 0, 0.02]}>
        <planeGeometry args={[BODY_W * 1.12, 0.008]} />
        <meshBasicMaterial
          color="#7dffc0"
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ── silhouette edge particles drifting off the cutout ── */
function EdgeParticles() {
  const ref = useRef<THREE.Points>(null!);
  const { positions, phases } = useMemo(() => {
    const n = HOLO_EDGES.length;
    const positions = new Float32Array(n * 3);
    const phases = new Float32Array(n);
    HOLO_EDGES.forEach(([nx, ny], i) => {
      positions[i * 3] = (nx - 0.5) * BODY_W;
      positions[i * 3 + 1] = BODY_H / 2 - ny * BODY_H;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      phases[i] = Math.random() * Math.PI * 2;
    });
    return { positions, phases };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const geo = ref.current.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < phases.length; i++) {
      const ph = phases[i];
      arr[i * 3] += Math.sin(t * 0.7 + ph) * 0.00035;
      arr[i * 3 + 1] += Math.cos(t * 0.55 + ph) * 0.00045;
    }
    pos.needsUpdate = true;
    const m = ref.current.material as THREE.PointsMaterial;
    m.opacity = 0.5 + 0.22 * Math.sin(t * 1.7);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.014}
        color="#9dffd0"
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* ── emitter stage under the feet ── */
function Stage() {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m1 = ring1.current.material as THREE.MeshBasicMaterial;
    const m2 = ring2.current.material as THREE.MeshBasicMaterial;
    m1.opacity = 0.6 + 0.2 * Math.sin(t * 2.2);
    m2.opacity = 0.26 + 0.1 * Math.sin(t * 1.4 + 1.3);
    ring2.current.rotation.z = t * 0.2;
  });
  return (
    <group position={[0, FLOOR_Y + 0.001, 0]}>
      <mesh ref={ring1} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.46, 0.485, 56]} />
        <meshBasicMaterial
          color="#00ff9d"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ring2} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.627, 72]} />
        <meshBasicMaterial
          color="#34d399"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <circleGeometry args={[0.5, 48]} />
        <meshBasicMaterial
          color="#00ff9d"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight position={[0, 0.25, 0.4]} color="#00ff9d" intensity={2.6} distance={2.6} decay={2} />
    </group>
  );
}

/* ── pointer listener (DOM side, zero re-render) ── */
function useHoloPointer() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      holo.px = (e.clientX / window.innerWidth) * 2 - 1;
      holo.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}

/* ── pause rendering offscreen ── */
function useVisible() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), {
      threshold: 0.02,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

/**
 * HoloBodyCanvas — professional full-body hologram of the real person:
 * photo-real cutout with hologram shader treatment, silhouette particles,
 * depth echo layers, emitter stage and mirror floor.
 */
export const HoloBodyCanvas = memo(function HoloBodyCanvas({
  className = "h-full w-full",
}: {
  className?: string;
}) {
  useHoloPointer();
  const { ref, visible } = useVisible();

  return (
    <GLBoundary>
      <div className={className} ref={ref}>
        <Canvas
          dpr={[1, 1.6]}
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.12, 4.85], fov: 40 }}
        >
          <fog attach="fog" args={["#050508", 8.5, 20]} />
          <ambientLight intensity={0.4} />

          <Stars radius={44} depth={34} count={700} factor={2.4} saturation={0} fade speed={0.6} />

          <Suspense fallback={null}>
            <HoloBody />
            <EdgeParticles />
            <Stage />

            {/* mirror floor */}
            <mesh position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[30, 30]} />
              <MeshReflectorMaterial
                blur={[280, 60]}
                resolution={512}
                mixBlur={1}
                mixStrength={10}
                roughness={0.88}
                depthScale={1.1}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#050508"
                metalness={0.6}
                mirror={0.5}
              />
            </mesh>
          </Suspense>
        </Canvas>
      </div>
    </GLBoundary>
  );
});
