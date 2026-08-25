"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  CHASER_BASE_DISTANCE,
  CHASER_CLOSE_DISTANCE,
  CHASER_CLOSE_IN_DURATION,
  CHASER_DRAMA_BEAT_DURATION,
} from "@/lib/game/constants";
import { getChaserAggression, getChaserBaseDistance, shouldTriggerCloseIn } from "@/lib/game/difficulty";
import { chance } from "@/lib/game/random";
import type { ChaserState } from "@/lib/game/types";

// ============================================================
// Chaser — simple state machine, no pathfinding/AI needed.
// The comedic "detective drama" beat lives here: whenever the
// chaser flips into CLOSING_IN, it exposes a drama-beat flag for
// one short window so GameManager can trigger the camera punch-in
// + time-dip + whistle SFX in sync.
//
// Placeholder geometry — swap for a GLTF detective model later.
// ============================================================

export interface ChaserHandle {
  getState: () => ChaserState;
  getDistanceBehind: () => number;
}

interface ChaserProps {
  score: number;
  playerLaneX: number;
  playerHit: boolean; // true the instant the player collides with an obstacle
  gameOver: boolean;
  onDramaBeat?: () => void; // fired once per CLOSING_IN transition
  onCatch?: () => void; // fired when chaser reaches catch distance during PLAYER_HIT
}

export default function Chaser({
  score,
  playerLaneX,
  playerHit,
  gameOver,
  onDramaBeat,
  onCatch,
}: ChaserProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const state = useRef<ChaserState>("NORMAL");
  const stateElapsed = useRef(0);
  const distanceBehind = useRef(CHASER_BASE_DISTANCE);
  const closeInCooldown = useRef(0);
  const currentX = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    stateElapsed.current += delta;
    closeInCooldown.current = Math.max(0, closeInCooldown.current - delta);

    const targetBaseDistance = getChaserBaseDistance(score);

    // --- State transitions ---
    if (gameOver) {
      state.current = "GAME_OVER";
    } else if (playerHit && state.current !== "PLAYER_HIT") {
      state.current = "PLAYER_HIT";
      stateElapsed.current = 0;
    } else if (state.current === "NORMAL") {
      // Randomly roll into CLOSING_IN based on current difficulty aggression,
      // gated by a cooldown so beats feel like distinct moments, not noise.
      if (closeInCooldown.current === 0 && shouldTriggerCloseIn(score, Math.random())) {
        state.current = "CLOSING_IN";
        stateElapsed.current = 0;
        closeInCooldown.current = 4; // seconds before another beat can trigger
        onDramaBeat?.();
      }
    } else if (state.current === "CLOSING_IN") {
      if (stateElapsed.current >= CHASER_CLOSE_IN_DURATION) {
        state.current = "NORMAL";
        stateElapsed.current = 0;
      }
    } else if (state.current === "PLAYER_HIT") {
      // Chaser rushes in to "catch" the player — after a short beat,
      // signal the catch so GameManager can trigger GAME_OVER.
      if (stateElapsed.current >= CHASER_DRAMA_BEAT_DURATION) {
        onCatch?.();
      }
    }

    // --- Distance target based on state ---
    let targetDistance = targetBaseDistance;
    if (state.current === "CLOSING_IN") targetDistance = CHASER_CLOSE_DISTANCE;
    if (state.current === "PLAYER_HIT") targetDistance = 0.3;
    if (state.current === "FAR_BEHIND") targetDistance = targetBaseDistance * 1.6;

    distanceBehind.current = THREE.MathUtils.lerp(
      distanceBehind.current,
      targetDistance,
      1 - Math.exp(-6 * delta)
    );

    // --- Chaser drifts toward the player's lane, slightly delayed ---
    currentX.current = THREE.MathUtils.lerp(
      currentX.current,
      playerLaneX,
      1 - Math.exp(-4 * delta)
    );

    meshRef.current.position.x = currentX.current;
    meshRef.current.position.z = distanceBehind.current;
  });

  return (
    <mesh ref={meshRef} castShadow position={[0, 0.9, CHASER_BASE_DISTANCE]}>
      <capsuleGeometry args={[0.42, 1.0, 4, 8]} />
      <meshStandardMaterial color="#2b2d42" />
    </mesh>
  );
}
