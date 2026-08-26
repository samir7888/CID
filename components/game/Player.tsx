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
import type { Lane, PlayerAnimState, PlayerState } from "@/lib/game/types";
import { getCharacter } from "@/lib/game/characters";
import { useGLTF } from "@react-three/drei";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

// ============================================================
// Player is a "dumb" visual component driven by refs/props from
// GameManager, not by React state — per-frame position updates
// happen via useFrame + direct mesh mutation so we never trigger
// a React re-render on movement.
//
// Lightweight procedural player; gameplay state and collision remain in this wrapper.
// ============================================================

export interface PlayerHandle {
  getWorldX: () => number;
  getWorldY: () => number;
  isSliding: () => boolean;
  isJumping: () => boolean;
}

interface PlayerProps {
  active: boolean;
  lane: Lane;
  jumpRequested: boolean;
  slideRequested: boolean;
  isDead: boolean;
  playerState?: PlayerState;
  onAnimStateChange?: (state: PlayerAnimState) => void;
  onJumpConsumed?: () => void;
  onSlideConsumed?: () => void;
  characterId: string;
  modelUrl?: string | null;
}

export default function Player({
  active,
  lane,
  jumpRequested,
  slideRequested,
  isDead,
  playerState,
  onJumpConsumed,
  onSlideConsumed,
  characterId,
  modelUrl,
}: PlayerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const selectedCharacter = getCharacter(characterId);
  const modelPath = modelUrl || selectedCharacter.modelPath;

  // Internal motion state lives in refs, not useState — this runs every
  // frame and must not cause React re-renders.
  const currentX = useRef(LANE_POSITIONS[lane]);
  const jumpElapsed = useRef<number | null>(null); // null = not jumping
  const slideElapsed = useRef<number | null>(null); // null = not sliding

  useFrame((_, delta) => {
    if (!meshRef.current || !characterRef.current) return;
    if (!active || isDead) {
      jumpElapsed.current = null;
      slideElapsed.current = null;
      currentX.current = LANE_POSITIONS[lane];
      meshRef.current.position.x = currentX.current;
      meshRef.current.position.y = 0;
      meshRef.current.scale.y = 1;
      characterRef.current.rotation.z = 0;
      characterRef.current.rotation.x = 0;
      characterRef.current.position.y = 0;
      if (playerState) {
        playerState.y = 0;
        playerState.isJumping = false;
        playerState.isSliding = false;
      }
      return;
    }

    // --- Lane interpolation ---
    const targetX = LANE_POSITIONS[lane];
    currentX.current = THREE.MathUtils.lerp(
      currentX.current,
      targetX,
      1 - Math.exp(-LANE_SWITCH_SPEED * delta) // frame-rate independent lerp
    );

    // --- Jump start ---
    if (
      jumpRequested &&
      jumpElapsed.current === null &&
      slideElapsed.current === null
    ) {
      jumpElapsed.current = 0;
      onJumpConsumed?.();
    }

    // --- Slide start ---
    if (
      slideRequested &&
      slideElapsed.current === null &&
      jumpElapsed.current === null
    ) {
      slideElapsed.current = 0;
      onSlideConsumed?.();
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
    meshRef.current.position.y = y;
    meshRef.current.scale.y = heightScale;

    characterRef.current.rotation.z = THREE.MathUtils.lerp(
      characterRef.current.rotation.z,
      (targetX - currentX.current) * -0.08,
      0.2
    );

    const runPhase = performance.now() * 0.012;
    const runAmount = jumpElapsed.current === null && slideElapsed.current === null ? 0.55 : 0.12;
    if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
      leftLegRef.current.rotation.x = Math.sin(runPhase) * runAmount;
      rightLegRef.current.rotation.x = Math.sin(runPhase + Math.PI) * runAmount;
      leftArmRef.current.rotation.x = Math.sin(runPhase + Math.PI) * runAmount * 0.7;
      rightArmRef.current.rotation.x = Math.sin(runPhase) * runAmount * 0.7;
    }

    if (modelPath) {
      characterRef.current.position.y = Math.abs(Math.sin(runPhase * 0.5)) * 0.035;
      characterRef.current.rotation.x = Math.sin(runPhase) * 0.025;
    }

    if (playerState) {
      playerState.currentX = currentX.current;
      playerState.targetLaneX = targetX;
      playerState.y = y;
      playerState.isJumping = jumpElapsed.current !== null;
      playerState.jumpElapsed = jumpElapsed.current ?? 0;
      playerState.isSliding = slideElapsed.current !== null;
      playerState.slideElapsed = slideElapsed.current ?? 0;
      playerState.animState = playerState.isJumping
        ? "jumping"
        : playerState.isSliding
          ? "sliding"
          : "running";
    }
  });

  return (
    <group ref={meshRef} position={[LANE_POSITIONS[lane], 0, 0]}>
      <group ref={characterRef}>
        {!modelPath && (
          <>
            <group position={[0, 0.05, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.42, 0.18, 0.55]} />
                <meshStandardMaterial color="#191b25" roughness={0.85} />
              </mesh>
            </group>
            <mesh castShadow position={[0, 0.88, 0]}>
              <capsuleGeometry args={[0.28, 0.58, 6, 12]} />
              <meshStandardMaterial color={isDead ? "#4b5563" : "#d95b35"} roughness={0.72} />
            </mesh>
            <mesh castShadow position={[0, 0.92, 0.28]}>
              <boxGeometry args={[0.28, 0.22, 0.04]} />
              <meshStandardMaterial color="#f2c14e" metalness={0.35} roughness={0.4} />
            </mesh>
            <mesh castShadow position={[0, 1.58, 0]}>
              <sphereGeometry args={[0.23, 16, 12]} />
              <meshStandardMaterial color="#b96f50" roughness={0.9} />
            </mesh>
            <mesh castShadow position={[0, 1.75, -0.01]} scale={[1.08, 0.42, 1.08]}>
              <sphereGeometry args={[0.23, 16, 8]} />
              <meshStandardMaterial color="#171923" roughness={0.55} />
            </mesh>
            <group ref={leftArmRef} position={[-0.31, 1.02, 0]}>
              <mesh castShadow position={[0, -0.23, 0]}>
                <capsuleGeometry args={[0.1, 0.32, 5, 8]} />
                <meshStandardMaterial color="#d95b35" roughness={0.72} />
              </mesh>
            </group>
            <group ref={rightArmRef} position={[0.31, 1.02, 0]}>
              <mesh castShadow position={[0, -0.23, 0]}>
                <capsuleGeometry args={[0.1, 0.32, 5, 8]} />
                <meshStandardMaterial color="#d95b35" roughness={0.72} />
              </mesh>
            </group>
            <group ref={leftLegRef} position={[-0.14, 0.55, 0]}>
              <mesh castShadow position={[0, -0.3, 0]}>
                <capsuleGeometry args={[0.12, 0.42, 5, 8]} />
                <meshStandardMaterial color="#26364d" roughness={0.8} />
              </mesh>
            </group>
            <group ref={rightLegRef} position={[0.14, 0.55, 0]}>
              <mesh castShadow position={[0, -0.3, 0]}>
                <capsuleGeometry args={[0.12, 0.42, 5, 8]} />
                <meshStandardMaterial color="#26364d" roughness={0.8} />
              </mesh>
            </group>
          </>
        )}
        {modelPath && (
          <ImportedCharacter
            path={modelPath}
            scale={selectedCharacter.modelScale}
            yOffset={selectedCharacter.modelYOffset}
            isDead={isDead}
          />
        )}
      </group>
    </group>
  );
}

function ImportedCharacter({
  path,
  scale = 1,
  yOffset = 0,
  isDead,
}: {
  path: string;
  scale?: number;
  yOffset?: number;
  isDead: boolean;
}) {
  const { scene } = useGLTF(path);
  const model = SkeletonUtils.clone(scene);

  return (
    <primitive
      object={model}
      scale={scale}
      position={[0, yOffset, 0]}
      rotation={[0, Math.PI, 0]}
      visible={!isDead}
    />
  );
}

useGLTF.preload("/models/girl.glb");
useGLTF.preload("/models/modi.glb");
