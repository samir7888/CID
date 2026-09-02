"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getWorldSpeed } from "@/lib/game/difficulty";

// ============================================================
// Lush Green Countryside Environment:
// Road surrounded by rolling green fields, smooth procedural trees,
// rustic fences, bushes, mossy boulders, and distant hills.
// Built purely with Three.js geometry and optimized for 60fps.
// ============================================================

interface GreenEnvironmentProps {
  isMobile?: boolean;
  active?: boolean;
  score?: number;
  timescale?: number;
  weight?: number;
}

const SEGMENT_COUNT = 8;
const SEGMENT_LENGTH = 32;
const TOTAL_SPAN = SEGMENT_COUNT * SEGMENT_LENGTH; // 256 units
const RECYCLE_Z = 20;

export default function GreenEnvironment({
  isMobile = false,
  active = true,
  score = 0,
  timescale = 1,
  weight = 1,
}: GreenEnvironmentProps) {
  const segmentsRef = useRef<THREE.Group[]>([]);
  const foliageGroupRefs = useRef<(THREE.Group | null)[]>([]);

  // Pre-generate stable procedural layout for each segment
  const segmentsData = useMemo(() => {
    return Array.from({ length: SEGMENT_COUNT }, (_, segIdx) => {
      const baseZ = -segIdx * SEGMENT_LENGTH;
      const seed = segIdx * 137.5;

      // Left & Right trees
      const treeCountPerSide = isMobile ? 2 : 3;
      const leftTrees = Array.from({ length: treeCountPerSide }, (_, i) => {
        const localZ = -(i * (SEGMENT_LENGTH / treeCountPerSide) + ((seed * (i + 1)) % 3));
        const xDist = 7.5 + ((seed * (i + 3)) % 18);
        const type = (i + segIdx) % 3; // 0 = Pine, 1 = Oak, 2 = Birch
        const scale = 0.85 + ((seed * (i + 7)) % 0.4);
        return { id: `lt-${segIdx}-${i}`, x: -xDist, z: localZ, type, scale };
      });

      const rightTrees = Array.from({ length: treeCountPerSide }, (_, i) => {
        const localZ = -(i * (SEGMENT_LENGTH / treeCountPerSide) + ((seed * (i + 5)) % 3));
        const xDist = 7.5 + ((seed * (i + 2)) % 18);
        const type = (i + segIdx + 1) % 3;
        const scale = 0.85 + ((seed * (i + 9)) % 0.4);
        return { id: `rt-${segIdx}-${i}`, x: xDist, z: localZ, type, scale };
      });

      // Roadside wooden fences (left & right)
      const fencePosts = Array.from({ length: Math.floor(SEGMENT_LENGTH / 5) }, (_, i) => -(i * 5));

      // Rocks and bushes
      const rockCount = 2;
      const rocks = Array.from({ length: rockCount }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (5.5 + ((seed * (i + 4)) % 8));
        const z = -((seed * (i + 11)) % SEGMENT_LENGTH);
        const scale = 0.4 + ((seed * (i + 13)) % 0.5);
        return { id: `rk-${segIdx}-${i}`, x, z, scale };
      });

      const bushCount = isMobile ? 2 : 3;
      const bushes = Array.from({ length: bushCount }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (5.8 + ((seed * (i + 8)) % 12));
        const z = -((seed * (i + 17)) % SEGMENT_LENGTH);
        const scale = 0.6 + ((seed * (i + 19)) % 0.6);
        return { id: `bs-${segIdx}-${i}`, x, z, scale };
      });

      return {
        key: `seg-${segIdx}`,
        initialZ: baseZ,
        leftTrees,
        rightTrees,
        fencePosts,
        rocks,
        bushes,
      };
    });
  }, [isMobile]);

  // Handle endless scrolling & gentle wind sway
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Subtle wind sway on tree foliage
    foliageGroupRefs.current.forEach((ref, idx) => {
      if (ref) {
        const offset = idx * 0.4;
        ref.rotation.z = Math.sin(time * 1.6 + offset) * 0.035;
        ref.rotation.x = Math.cos(time * 1.2 + offset) * 0.025;
      }
    });

    if (!active) return;

    const speed = getWorldSpeed(score) * timescale;
    const move = speed * delta;

    segmentsRef.current.forEach((group) => {
      if (!group) return;
      group.position.z += move;

      // Wrap segment around when it moves behind the camera
      if (group.position.z > RECYCLE_Z) {
        group.position.z -= TOTAL_SPAN;
      }
    });
  });

  return (
    <group
      position={[0, (1 - weight) * -8, 0]}
      scale={[1, THREE.MathUtils.lerp(0.1, 1, Math.max(0, Math.min(1, weight))), 1]}
    >
      {/* ── Static Wide Grass Plains ── */}
      {/* Left green field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-54, -0.04, -100]} receiveShadow>
        <planeGeometry args={[100, 300]} />
        <meshStandardMaterial color="#275629" roughness={0.9} />
      </mesh>

      {/* Right green field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[54, -0.04, -100]} receiveShadow>
        <planeGeometry args={[100, 300]} />
        <meshStandardMaterial color="#275629" roughness={0.9} />
      </mesh>

      {/* Earthy grass verges along road sides */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, -0.02, -100]} receiveShadow>
        <planeGeometry args={[1.5, 300]} />
        <meshStandardMaterial color="#416b34" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, -0.02, -100]} receiveShadow>
        <planeGeometry args={[1.5, 300]} />
        <meshStandardMaterial color="#416b34" roughness={0.85} />
      </mesh>

      {/* Distant soft green hills on the horizon */}
      <mesh position={[-45, 12, -180]} scale={[40, 24, 20]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#1a3b1d" roughness={1} />
      </mesh>
      <mesh position={[45, 14, -190]} scale={[46, 28, 22]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#18361b" roughness={1} />
      </mesh>
      <mesh position={[0, 8, -210]} scale={[60, 20, 25]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#142c16" roughness={1} />
      </mesh>

      {/* ── Scrolling Segments (Trees, Fences, Bushes, Rocks) ── */}
      {segmentsData.map((seg, segIdx) => (
        <group
          key={seg.key}
          ref={(el) => {
            if (el) segmentsRef.current[segIdx] = el;
          }}
          position={[0, 0, seg.initialZ]}
        >
          {/* Left roadside wooden fence */}
          <WoodenFence posts={seg.fencePosts} xPos={-4.35} />

          {/* Right roadside wooden fence */}
          <WoodenFence posts={seg.fencePosts} xPos={4.35} />

          {/* Left trees */}
          {seg.leftTrees.map((tree, tIdx) => (
            <TreeInstance
              key={tree.id}
              x={tree.x}
              z={tree.z}
              type={tree.type}
              scale={tree.scale}
              foliageRefCallback={(el) => {
                const globalIdx = segIdx * 10 + tIdx;
                foliageGroupRefs.current[globalIdx] = el;
              }}
            />
          ))}

          {/* Right trees */}
          {seg.rightTrees.map((tree, tIdx) => (
            <TreeInstance
              key={tree.id}
              x={tree.x}
              z={tree.z}
              type={tree.type}
              scale={tree.scale}
              foliageRefCallback={(el) => {
                const globalIdx = segIdx * 10 + 5 + tIdx;
                foliageGroupRefs.current[globalIdx] = el;
              }}
            />
          ))}

{/* Boulders / Rocks */}
          {seg.rocks.map((rk) => (
            <mesh key={rk.id} position={[rk.x, 0.25 * rk.scale, rk.z]} scale={rk.scale} receiveShadow>
              <dodecahedronGeometry args={[0.75, 0]} />
              <meshStandardMaterial color="#5e685f" roughness={0.9} />
            </mesh>
          ))}

          {/* Bushes */}
          {seg.bushes.map((b) => (
            <BushInstance key={b.id} x={b.x} z={b.z} scale={b.scale} />
          ))}
        </group>
      ))}
    </group>
  );
}

// ============================================================
// Procedural Tree Component: Smooth, Stylized, 3 Types
// ============================================================

function TreeInstance({
  x,
  z,
  type,
  scale,
  foliageRefCallback,
}: {
  x: number;
  z: number;
  type: number;
  scale: number;
  foliageRefCallback: (el: THREE.Group | null) => void;
}) {
  if (type === 0) {
    // ── Type 0: Layered Evergreen Pine ──
    return (
      <group position={[x, 0, z]} scale={scale}>
        {/* Trunk */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.18, 0.32, 2.2, 6]} />
          <meshStandardMaterial color="#4a2e1b" roughness={0.9} />
        </mesh>
        {/* Foliage cluster */}
        <group ref={foliageRefCallback} position={[0, 0, 0]}>
          <mesh position={[0, 2.3, 0]}>
            <coneGeometry args={[1.7, 2.0, 6]} />
            <meshStandardMaterial color="#1e5428" roughness={0.75} />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
            <coneGeometry args={[1.2, 1.8, 6]} />
            <meshStandardMaterial color="#2f733a" roughness={0.75} />
          </mesh>
        </group>
      </group>
    );
  }

  if (type === 1) {
    // ── Type 1: Lush Round Oak Tree ──
    return (
      <group position={[x, 0, z]} scale={scale}>
        {/* Trunk */}
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.26, 0.42, 2.8, 6]} />
          <meshStandardMaterial color="#543722" roughness={0.88} />
        </mesh>
        {/* Canopy spheres */}
        <group ref={foliageRefCallback} position={[0, 3.6, 0]}>
          {/* Main sphere */}
          <mesh>
            <sphereGeometry args={[1.55, 10, 8]} />
            <meshStandardMaterial color="#2d7336" roughness={0.8} />
          </mesh>
          {/* Side overlapping canopy clusters */}
          <mesh position={[0.7, -0.3, 0.4]} scale={0.78}>
            <sphereGeometry args={[1.3, 8, 6]} />
            <meshStandardMaterial color="#388543" roughness={0.8} />
          </mesh>
          <mesh position={[-0.6, -0.2, -0.3]} scale={0.82}>
            <sphereGeometry args={[1.3, 8, 6]} />
            <meshStandardMaterial color="#25632d" roughness={0.8} />
          </mesh>
        </group>
      </group>
    );
  }

  // ── Type 2: Slender Birch / Poplar ──
  return (
    <group position={[x, 0, z]} scale={scale}>
      {/* Light-colored trunk */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.16, 0.26, 3.6, 6]} />
        <meshStandardMaterial color="#ded7cb" roughness={0.7} />
      </mesh>
      {/* Tall slender foliage */}
      <group ref={foliageRefCallback} position={[0, 3.8, 0]}>
        <mesh scale={[1, 1.6, 1]}>
          <sphereGeometry args={[1.15, 10, 8]} />
          <meshStandardMaterial color="#4ea147" roughness={0.78} />
        </mesh>
        <mesh position={[0, 0.8, 0]} scale={[0.75, 1.2, 0.75]}>
          <sphereGeometry args={[1.0, 8, 6]} />
          <meshStandardMaterial color="#63b35c" roughness={0.78} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================
// Bush / Shrub Component
// ============================================================

function BushInstance({ x, z, scale }: { x: number; z: number; scale: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.45, 0]} receiveShadow>
        <sphereGeometry args={[0.55, 8, 6]} />
        <meshStandardMaterial color="#357833" roughness={0.85} />
      </mesh>
      <mesh position={[0.3, 0.35, 0.2]} scale={0.75} receiveShadow>
        <sphereGeometry args={[0.5, 6, 5]} />
        <meshStandardMaterial color="#448d42" roughness={0.85} />
      </mesh>
    </group>
  );
}

// ============================================================
// Wooden Roadside Fence
// ============================================================

function WoodenFence({ posts, xPos }: { posts: number[]; xPos: number }) {
  return (
    <group position={[xPos, 0, 0]}>
      {posts.map((pz, idx) => (
        <group key={`post-${pz}`}>
          {/* Vertical wooden post */}
          <mesh position={[0, 0.45, pz]} receiveShadow>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#593b22" roughness={0.9} />
          </mesh>

          {/* Horizontal rails connecting to next post */}
          {idx < posts.length - 1 && (
            <>
              <mesh position={[0, 0.65, pz - 2.5]} receiveShadow>
                <boxGeometry args={[0.06, 0.08, 5]} />
                <meshStandardMaterial color="#66462c" roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.35, pz - 2.5]} receiveShadow>
                <boxGeometry args={[0.06, 0.08, 5]} />
                <meshStandardMaterial color="#66462c" roughness={0.9} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}
