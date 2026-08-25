"use client";

import type { ObstacleConfig } from "@/lib/game/types";
import { LANE_POSITIONS } from "@/lib/game/constants";

// ============================================================
// Obstacle renders one obstacle as a typed placeholder primitive.
// Each obstacle type has a distinct shape/color so they're
// visually distinguishable before real models are swapped in.
// Swap the <mesh> for <primitive object={gltf.scene} /> later.
// ============================================================

interface ObstacleProps {
  obstacle: ObstacleConfig;
}

export default function Obstacle({ obstacle }: ObstacleProps) {
  const x = LANE_POSITIONS[obstacle.lane];
  const y = obstacle.height / 2;

  const appearance = OBSTACLE_APPEARANCE[obstacle.type];

  return (
    <mesh
      position={[x, y, obstacle.z]}
      castShadow
      receiveShadow
    >
      {appearance.geometry}
      <meshStandardMaterial
        color={appearance.color}
        roughness={0.6}
        metalness={appearance.metalness ?? 0}
      />
    </mesh>
  );
}

// ---- Visual appearance per obstacle type ----

interface ObstacleAppearance {
  geometry: React.ReactNode;
  color: string;
  metalness?: number;
}

const OBSTACLE_APPEARANCE: Record<ObstacleConfig["type"], ObstacleAppearance> = {
  "handcart": {
    geometry: <boxGeometry args={[0.9, 1.2, 1.4]} />,
    color: "#e8a020",
  },
  "auto-rickshaw": {
    geometry: <boxGeometry args={[1.8, 1.6, 2.8]} />,
    color: "#f5c842",
    metalness: 0.3,
  },
  "barricade": {
    geometry: <boxGeometry args={[1.6, 0.6, 0.3]} />,
    color: "#e03030",
  },
  "construction-barrier": {
    geometry: <boxGeometry args={[1.0, 1.8, 0.35]} />,
    color: "#f07010",
  },
  "parked-scooter": {
    geometry: <boxGeometry args={[0.5, 1.0, 1.8]} />,
    color: "#4060c0",
    metalness: 0.4,
  },
};
