"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CoinConfig } from "@/lib/game/types";
import { LANE_POSITIONS, COIN_ROTATE_SPEED } from "@/lib/game/constants";

// ============================================================
// Coin — spinning golden torus. Disappears when collected.
// Emissive glow gives that "pick me up" look without post-processing.
// ============================================================

interface CoinProps {
  coin: CoinConfig;
}

export default function Coin({ coin }: CoinProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (coin.collected) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;
    meshRef.current.rotation.y += COIN_ROTATE_SPEED * delta;
  });

  if (coin.collected) return null;

  const x = LANE_POSITIONS[coin.lane];

  return (
    <mesh
      ref={meshRef}
      position={[x, coin.y + 0.6, coin.z]}
      castShadow
    >
      <torusGeometry args={[0.28, 0.09, 12, 24]} />
      <meshStandardMaterial
        color="#ffd700"
        emissive="#ffb800"
        emissiveIntensity={0.6}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}
