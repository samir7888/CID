"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  CHASER_BASE_DISTANCE,
  CHASER_CLOSE_DISTANCE,
  CHASER_DRAMA_BEAT_DURATION,
} from "@/lib/game/constants";
import {
  getChaserBaseDistance,
} from "@/lib/game/difficulty";
import type { ChaserState } from "@/lib/game/types";
import AudioManager from "./AudioManager";

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
  active: boolean;
  score: number;
  playerLaneX: number;
  chaseActive: boolean;
  playerHit: boolean; // true the instant the player collides with an obstacle
  gameOver: boolean;
  onDramaBeat?: () => void; // fired once per CLOSING_IN transition
  onCatch?: () => void; // fired when chaser reaches catch distance during PLAYER_HIT
}

export default function Chaser({
  active,
  score,
  playerLaneX,
  chaseActive,
  playerHit,
  gameOver,
  onDramaBeat,
  onCatch,
}: ChaserProps) {
  const meshRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const cidTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.fillStyle = "#0b1220";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#d8b15a";
    context.lineWidth = 8;
    context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    context.fillStyle = "#f5e6b3";
    context.font = "800 72px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("CID", canvas.width / 2, canvas.height / 2 + 4);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const state = useRef<ChaserState>("NORMAL");
  const stateElapsed = useRef(0);
  const distanceBehind = useRef(CHASER_BASE_DISTANCE);
  const closeInCooldown = useRef(0);
  const currentX = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (!active) {
      state.current = "NORMAL";
      stateElapsed.current = 0;
      closeInCooldown.current = 0;
      distanceBehind.current = CHASER_BASE_DISTANCE;
      currentX.current = 0;
      meshRef.current.position.set(0, 0, CHASER_BASE_DISTANCE);
      return;
    }

    stateElapsed.current += delta;
    closeInCooldown.current = Math.max(0, closeInCooldown.current - delta);

    const targetBaseDistance = getChaserBaseDistance(score);

    // --- State transitions ---
    if (gameOver) {
      state.current = "GAME_OVER";
    } else if (playerHit && state.current !== "PLAYER_HIT") {
      state.current = "PLAYER_HIT";
      stateElapsed.current = 0;
    } else if (chaseActive) {
      if (state.current !== "CLOSING_IN") {
        state.current = "CLOSING_IN";
        stateElapsed.current = 0;
        onDramaBeat?.();
        AudioManager.playSound("chaserVoice");
      }
    } else if (state.current === "CLOSING_IN") {
      state.current = "NORMAL";
      stateElapsed.current = 0;
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
    if (state.current === "FAR_BEHIND")
      targetDistance = targetBaseDistance * 1.6;

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

    const runPhase = performance.now() * 0.01;
    if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
      leftLegRef.current.rotation.x = Math.sin(runPhase) * 0.45;
      rightLegRef.current.rotation.x = Math.sin(runPhase + Math.PI) * 0.45;
      leftArmRef.current.rotation.x = Math.sin(runPhase + Math.PI) * 0.3;
      rightArmRef.current.rotation.x = Math.sin(runPhase) * 0.3;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, CHASER_BASE_DISTANCE]}>
      <mesh castShadow position={[0, 0.88, 0]}>
        <capsuleGeometry args={[0.34, 0.62, 6, 12]} />
        <meshStandardMaterial color="#1d3140" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0.34]}>
        <boxGeometry args={[0.34, 0.2, 0.04]} />
        <meshStandardMaterial color="#d0a548" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, 1.58, 0]}>
        <sphereGeometry args={[0.24, 16, 12]} />
        <meshStandardMaterial color="#a8664f" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 1.76, 0]} scale={[1.15, 0.38, 1.15]}>
        <sphereGeometry args={[0.24, 16, 8]} />
        <meshStandardMaterial color="#141922" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, 1.82, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.08, 16]} />
        <meshStandardMaterial color="#141922" roughness={0.65} />
      </mesh>

      <mesh position={[0, 1.1, 0.36]}>
        <planeGeometry args={[0.7, 0.35]} />
        <meshBasicMaterial map={cidTexture} toneMapped={false} />
      </mesh>

      <group ref={leftArmRef} position={[-0.36, 1.02, 0]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.11, 0.35, 5, 8]} />
          <meshStandardMaterial color="#1d3140" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshStandardMaterial color="#a8664f" roughness={0.9} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.36, 1.02, 0]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.11, 0.35, 5, 8]} />
          <meshStandardMaterial color="#1d3140" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshStandardMaterial color="#a8664f" roughness={0.9} />
        </mesh>
      </group>

      <group ref={leftLegRef} position={[-0.15, 0.55, 0]}>
        <mesh castShadow position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.13, 0.44, 5, 8]} />
          <meshStandardMaterial color="#202b3b" roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0, -0.58, 0.06]}>
          <boxGeometry args={[0.22, 0.13, 0.36]} />
          <meshStandardMaterial color="#11151d" roughness={0.9} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.15, 0.55, 0]}>
        <mesh castShadow position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.13, 0.44, 5, 8]} />
          <meshStandardMaterial color="#202b3b" roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0, -0.58, 0.06]}>
          <boxGeometry args={[0.22, 0.13, 0.36]} />
          <meshStandardMaterial color="#11151d" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
