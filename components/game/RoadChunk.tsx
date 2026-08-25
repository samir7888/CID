"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RoadChunkData } from "@/lib/game/types";
import { LANE_POSITIONS, ROAD_CHUNK_LENGTH } from "@/lib/game/constants";
import Obstacle from "./Obstacle";
import Coin from "./Coin";

// ============================================================
// A single road chunk: dark asphalt + lane dashes + sidewalk strips.
// Obstacles and coins are rendered as children.
// Position is driven externally (from Road.tsx via ref).
// ============================================================

interface RoadChunkProps {
  chunk: RoadChunkData;
}

export default function RoadChunk({ chunk }: RoadChunkProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) groupRef.current.position.z = chunk.z;
  });

  return (
    <group ref={groupRef} position={[0, 0, chunk.z]}>
      {/* Asphalt base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -ROAD_CHUNK_LENGTH / 2]} receiveShadow>
        <planeGeometry args={[7.5, ROAD_CHUNK_LENGTH]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>

      {/* Lane markings — dashed white lines */}
      {LANE_DASH_ZS.map((dz, i) => (
        <mesh
          key={`dash-l-${i}`}
          position={[-1, 0.01, dz]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.08, 1.2]} />
          <meshStandardMaterial color="#ffffff" opacity={0.55} transparent />
        </mesh>
      ))}
      {LANE_DASH_ZS.map((dz, i) => (
        <mesh
          key={`dash-r-${i}`}
          position={[1, 0.01, dz]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.08, 1.2]} />
          <meshStandardMaterial color="#ffffff" opacity={0.55} transparent />
        </mesh>
      ))}

      {/* Obstacles */}
      {chunk.obstacles.map((obs) => (
        <Obstacle key={obs.id} obstacle={obs} />
      ))}

      {/* Coins */}
      {chunk.coins.map((coin) => (
        <Coin key={coin.id} coin={coin} />
      ))}
    </group>
  );
}

// Pre-compute dash z positions for this chunk
const DASH_SPACING = 3;
const LANE_DASH_ZS = Array.from(
  { length: Math.floor(ROAD_CHUNK_LENGTH / DASH_SPACING) },
  (_, i) => -(i * DASH_SPACING + 1)
);

// Re-export lane positions for use in spawners
export { LANE_POSITIONS };
