"use client";

import {
  Component,
  memo,
  Suspense,
  useRef,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshReflectorMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

/* ── guards against missing WebGL so the page never dies ── */
class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ── holographic wireframe material (normal blend keeps the neon hue) ── */
function Holo({ color, opacity = 0.5 }: { color: string; opacity?: number }) {
  return (
    <meshBasicMaterial
      wireframe
      color={color}
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  );
}

/* ── pointer-tilt rig + slow auto-rotation ── */
function Rig({
  children,
  offsetX = 0,
}: {
  children: ReactNode;
  offsetX?: number;
}) {
  const outer = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    inner.current.rotation.y += delta * 0.28;
    outer.current.rotation.y = THREE.MathUtils.lerp(
      outer.current.rotation.y,
      state.pointer.x * 0.24,
      0.06
    );
    outer.current.rotation.x = THREE.MathUtils.lerp(
      outer.current.rotation.x,
      -state.pointer.y * 0.13,
      0.06
    );
    const wide = state.size.width > 900;
    outer.current.position.x = THREE.MathUtils.lerp(
      outer.current.position.x,
      wide ? offsetX : 0,
      0.08
    );
  });

  return (
    <group ref={outer}>
      <group ref={inner}>{children}</group>
    </group>
  );
}

/* ── orbiting satellite ring ── */
function OrbitRing({
  radius,
  speed,
  tilt,
  color,
}: {
  radius: number;
  speed: number;
  tilt: number;
  color: string;
}) {
  const pivot = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    pivot.current.rotation.y += delta * speed;
  });
  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh>
        <torusGeometry args={[radius, 0.01, 8, 90]} />
        <Holo color={color} opacity={0.55} />
      </mesh>
      <group ref={pivot}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.085, 14, 14]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}

/* ── the hologram library ── */
export type HoloVariant = "hero" | "001" | "002" | "003" | "004" | "005";

function Model({ variant }: { variant: HoloVariant }) {
  switch (variant) {
    case "hero": // the core — everything orbits this
      return (
        <group>
          <mesh>
            <icosahedronGeometry args={[1.22, 1]} />
            <Holo color="#4df0ff" opacity={0.5} />
          </mesh>
          <mesh scale={0.55}>
            <icosahedronGeometry args={[1.22, 0]} />
            <Holo color="#00f0ff" opacity={0.3} />
          </mesh>
          <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
            <torusGeometry args={[1.95, 0.012, 8, 110]} />
            <Holo color="#a78bfa" opacity={0.55} />
          </mesh>
          <mesh rotation={[Math.PI / 1.6, -0.5, 0]}>
            <torusGeometry args={[2.35, 0.008, 8, 110]} />
            <Holo color="#4df0ff" opacity={0.38} />
          </mesh>
          <OrbitRing radius={1.7} speed={0.9} tilt={Math.PI / 2.2} color="#f0abfc" />
        </group>
      );
    case "001": // NEBULA DASH — data sphere with scan rings
      return (
        <group>
          <mesh>
            <sphereGeometry args={[1.05, 16, 16]} />
            <Holo color="#4df0ff" opacity={0.38} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.45, 0.014, 8, 90]} />
            <Holo color="#00f0ff" opacity={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 2.7, 0.5, 0]}>
            <torusGeometry args={[1.8, 0.01, 8, 90]} />
            <Holo color="#a78bfa" opacity={0.45} />
          </mesh>
        </group>
      );
    case "002": // AURORA OS — impossible geometry knot
      return (
        <group>
          <mesh>
            <torusKnotGeometry args={[0.95, 0.3, 150, 20, 2, 3]} />
            <Holo color="#a78bfa" opacity={0.5} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.75, 0.01, 8, 90]} />
            <Holo color="#4df0ff" opacity={0.4} />
          </mesh>
        </group>
      );
    case "003": // PULSE COMMERCE — gyroscope funnel
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[0.55, 0.55, 1.1, 18, 1, true]} />
            <Holo color="#f0abfc" opacity={0.5} />
          </mesh>
          <mesh rotation={[Math.PI / 2.15, 0.3, 0]}>
            <torusGeometry args={[1.15, 0.016, 8, 90]} />
            <Holo color="#f0abfc" opacity={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 1.8, -0.4, 0]}>
            <torusGeometry args={[1.45, 0.012, 8, 90]} />
            <Holo color="#4df0ff" opacity={0.5} />
          </mesh>
          <mesh rotation={[Math.PI / 2.5, 0.8, 0]}>
            <torusGeometry args={[1.75, 0.009, 8, 90]} />
            <Holo color="#a78bfa" opacity={0.4} />
          </mesh>
        </group>
      );
    case "004": // ECHO AI — neural core with inner mind
      return (
        <group>
          <mesh>
            <dodecahedronGeometry args={[1.15, 0]} />
            <Holo color="#4df0ff" opacity={0.55} />
          </mesh>
          <mesh scale={0.52}>
            <icosahedronGeometry args={[1.15, 1]} />
            <meshBasicMaterial
              color="#00f0ff"
              transparent
              opacity={0.12}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[0.4, 0, Math.PI / 2.6]}>
            <torusGeometry args={[1.7, 0.012, 8, 100]} />
            <Holo color="#a78bfa" opacity={0.55} />
          </mesh>
        </group>
      );
    case "005": // ORBITAL CMS — satellite system
      return (
        <group>
          <mesh>
            <sphereGeometry args={[0.7, 16, 16]} />
            <Holo color="#a78bfa" opacity={0.5} />
          </mesh>
          <OrbitRing radius={1.35} speed={1.1} tilt={Math.PI / 2.6} color="#00f0ff" />
          <OrbitRing radius={1.8} speed={-0.7} tilt={Math.PI / 1.9} color="#f0abfc" />
        </group>
      );
  }
}

/**
 * HoloCanvas — a hologram projected into pitch-black 3D space:
 * wireframe neon geometry, drifting starfield, and a glossy black
 * floor that mirrors the projection (the "mirror effect").
 * Memoized so typewriter re-renders never touch the WebGL tree.
 */
export const HoloCanvas = memo(function HoloCanvas({
  variant,
  offsetX = 0,
  reflect = true,
  className = "h-full w-full",
}: {
  variant: HoloVariant;
  offsetX?: number;
  reflect?: boolean;
  className?: string;
}) {
  return (
    <GLBoundary>
      <div className={className}>
        <Canvas
          dpr={[1, 1.6]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.85, 4.9], fov: 42 }}
        >
          <fog attach="fog" args={["#050508", 7.5, 19]} />
          <ambientLight intensity={0.5} />

          <Stars
            radius={48}
            depth={38}
            count={variant === "hero" ? 1500 : 750}
            factor={2.6}
            saturation={0}
            fade
            speed={0.7}
          />

          <Suspense fallback={null}>
            <Float speed={1.7} rotationIntensity={0.35} floatIntensity={1.05}>
              <Rig offsetX={offsetX}>
                <Model variant={variant} />
              </Rig>
            </Float>
          </Suspense>

          {reflect && (
            <mesh position={[0, -1.68, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[40, 40]} />
              <MeshReflectorMaterial
                blur={[270, 60]}
                resolution={512}
                mixBlur={1}
                mixStrength={11}
                roughness={0.9}
                depthScale={1.1}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#050508"
                metalness={0.6}
                mirror={0.55}
              />
            </mesh>
          )}
        </Canvas>
      </div>
    </GLBoundary>
  );
});
