"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  LANE_POSITIONS,
  LANE_SWITCH_SPEED,
  JUMP_HEIGHT,
  JUMP_DURATION,
  SLIDE_DURATION,
  PLAYER_HEIGHT,
  PLAYER_SLIDE_HEIGHT,
} from "@/lib/game/constants";
import type { Lane, PlayerAnimState } from "@/lib/game/types";

// ============================================================
// Player is a "dumb" visual component driven by refs/props from
// GameManager, not by React state — per-frame position updates
// happen via useFrame + direct mesh mutation so we never trigger
// a React re-render on movement.
//
// Placeholder geometry (capsule) — swap the <mesh> below for a
// <primitive object={gltf.scene} /> once a real model exists;
// everything else (lane/jump/slide math) stays the same.
// ============================================================

export interface PlayerHandle {
  getWorldX: () => number;
  getWorldY: () => number;
  isSliding: () => boolean;
  isJumping: () => boolean;
}

interface PlayerProps {
  lane: Lane;
  jumpRequested: boolean;
  slideRequested: boolean;
  isDead: boolean;
  onAnimStateChange?: (state: PlayerAnimState) => void;
  onJumpConsumed?: () => void;
  onSlideConsumed?: () => void;
}

export default function Player({
  lane,
  jumpRequested,
  slideRequested,
  isDead,
}: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Internal motion state lives in refs, not useState — this runs every
  // frame and must not cause React re-renders.
  const currentX = useRef(LANE_POSITIONS[lane]);
  const jumpElapsed = useRef<number | null>(null); // null = not jumping
  const slideElapsed = useRef<number | null>(null); // null = not sliding

  useFrame((_, delta) => {
    if (!meshRef.current || isDead) return;

    // --- Lane interpolation ---
    const targetX = LANE_POSITIONS[lane];
    currentX.current = THREE.MathUtils.lerp(
      currentX.current,
      targetX,
      1 - Math.exp(-LANE_SWITCH_SPEED * delta) // frame-rate independent lerp
    );

    // --- Jump start ---
    if (jumpRequested && jumpElapsed.current === null && slideElapsed.current === null) {
      jumpElapsed.current = 0;
    }

    // --- Slide start ---
    if (slideRequested && slideElapsed.current === null && jumpElapsed.current === null) {
      slideElapsed.current = 0;
    }

    // --- Jump progression (simple parabolic arc, not physics-based) ---
    let y = 0;
    if (jumpElapsed.current !== null) {
      jumpElapsed.current += delta;
      const t = jumpElapsed.current / JUMP_DURATION;
      if (t >= 1) {
        jumpElapsed.current = null;
        y = 0;
      } else {
        // parabola: 0 at t=0, peak at t=0.5, 0 at t=1
        y = JUMP_HEIGHT * (1 - Math.pow(2 * t - 1, 2));
      }
    }

    // --- Slide progression ---
    let heightScale = 1;
    if (slideElapsed.current !== null) {
      slideElapsed.current += delta;
      if (slideElapsed.current >= SLIDE_DURATION) {
        slideElapsed.current = null;
        heightScale = 1;
      } else {
        heightScale = PLAYER_SLIDE_HEIGHT / PLAYER_HEIGHT;
      }
    }

    meshRef.current.position.x = currentX.current;
    meshRef.current.position.y = y + (PLAYER_HEIGHT * heightScale) / 2;
    meshRef.current.scale.y = heightScale;
  });

  return (
    <mesh ref={meshRef} castShadow position={[LANE_POSITIONS[lane], PLAYER_HEIGHT / 2, 0]}>
      <capsuleGeometry args={[0.4, PLAYER_HEIGHT - 0.8, 4, 8]} />
      <meshStandardMaterial color={isDead ? "#555555" : "#ff6b35"} />
    </mesh>
  );
}
