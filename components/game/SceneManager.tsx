"use client";

import { useRef, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Lane, GameState, PlayerState, ObstacleConfig } from "@/lib/game/types";
import {
  LANE_POSITIONS,
  CAMERA_OFFSET,
  CAMERA_LOOKAHEAD,
  CHASER_DRAMA_TIMESCALE,
  CHASER_DRAMA_BEAT_DURATION,
  SCORE_PER_SECOND,
} from "@/lib/game/constants";
import { getWorldSpeed } from "@/lib/game/difficulty";
import Player from "./Player";
import Chaser from "./Chaser";
import Road from "./Road";
import Environment, { type EnvironmentTheme } from "./Environment";
import AudioManager from "./AudioManager";

// ============================================================
// SceneManager runs INSIDE the Canvas.
// It drives the Three.js scene each frame:
//   - Camera smooth follow + drama punch-in
//   - Score tick via callback
//   - Passes lane/jump/slide refs to Player
//   - Passes score/hit/gameOver to Chaser
// State is intentionally stored in refs so useFrame never
// triggers React re-renders (per performance requirements).
// ============================================================

interface SceneManagerProps {
  gameState: GameState;
  isMobile: boolean;
  chaseActive: boolean;
  playerHit: boolean;
  laneRef: React.RefObject<Lane>;
  jumpRef: React.MutableRefObject<boolean>;
  slideRef: React.MutableRefObject<boolean>;
  isDeadRef: React.MutableRefObject<boolean>;
  scoreTotal: number;
  onObstacleHit: (obstacle: ObstacleConfig) => void;
  onCoinsCollected: (ids: string[]) => void;
  onGameOver: () => void;
  onScoreTick: (survivalDelta: number, distanceDelta: number) => void;
  characterId: string;
  characterModelUrl: string | null;
  environmentTheme?: EnvironmentTheme;
}

export default function SceneManager({
  gameState,
  isMobile,
  chaseActive,
  playerHit,
  laneRef,
  jumpRef,
  slideRef,
  isDeadRef,
  scoreTotal,
  onObstacleHit,
  onCoinsCollected,
  onGameOver,
  onScoreTick,
  characterId,
  characterModelUrl,
  environmentTheme = "dynamic",
}: SceneManagerProps) {
  const { camera } = useThree();

  // Drama beat state — lives in refs, not state
  const timescaleRef = useRef(1);
  const dramaBeatElapsed = useRef(0);
  const isDramaBeat = useRef(false);
  const dramaCameraZ = useRef(CAMERA_OFFSET.z);
  const gameOverFired = useRef(false);

  // Player state snapshot updated every frame for Road collision
  const playerStateRef = useRef<PlayerState>({
    lane: 1,
    targetLaneX: LANE_POSITIONS[1],
    currentX: LANE_POSITIONS[1],
    y: 0,
    animState: "running",
    isJumping: false,
    jumpElapsed: 0,
    isSliding: false,
    slideElapsed: 0,
    isDead: false,
  });

  // Reset drama beat and dead flag when game restarts
  const isPlaying = gameState === "PLAYING";
  if (gameState === "PLAYING" && gameOverFired.current) {
    gameOverFired.current = false;
    timescaleRef.current = 1;
    isDramaBeat.current = false;
    dramaBeatElapsed.current = 0;
  }

  const handleDramaBeat = useCallback(() => {
    isDramaBeat.current = true;
    dramaBeatElapsed.current = 0;
    timescaleRef.current = CHASER_DRAMA_TIMESCALE;
    AudioManager.playSound("chaserWarning");
  }, []);

  const handleChaserCatch = useCallback(() => {
    if (gameOverFired.current) return;
    gameOverFired.current = true;
    onGameOver();
  }, [onGameOver]);

  const consumeJump = useCallback(() => {
    jumpRef.current = false;
  }, [jumpRef]);

  const consumeSlide = useCallback(() => {
    slideRef.current = false;
  }, [slideRef]);

  useFrame((_, delta) => {
    if (gameState !== "PLAYING") return;

    // Drama beat countdown
    if (isDramaBeat.current) {
      dramaBeatElapsed.current += delta;
      if (dramaBeatElapsed.current >= CHASER_DRAMA_BEAT_DURATION) {
        isDramaBeat.current = false;
        timescaleRef.current = 1;
      }
    }

    // Score tick
    if (!isDeadRef.current) {
      const scaledDelta = delta * timescaleRef.current;
      onScoreTick(
        SCORE_PER_SECOND * scaledDelta,
        getWorldSpeed(scoreTotal) * scaledDelta,
      );
    }

    // Sync player state snapshot for Road's collision checks
    const ps = playerStateRef.current;
    ps.lane = laneRef.current ?? 1;
    ps.isDead = isDeadRef.current;
    // Camera follow
    const targetCamZ = CAMERA_OFFSET.z;
    dramaCameraZ.current = THREE.MathUtils.lerp(dramaCameraZ.current, targetCamZ, 0.07);

    const cameraTargetX = isMobile ? ps.currentX : CAMERA_OFFSET.x;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraTargetX, 0.12);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, CAMERA_OFFSET.y, 0.08);
    camera.position.z = dramaCameraZ.current;
    camera.lookAt(isMobile ? ps.currentX : CAMERA_LOOKAHEAD.x, CAMERA_LOOKAHEAD.y, CAMERA_LOOKAHEAD.z);
  });

  return (
    <>
      <Environment
        theme={environmentTheme}
        isMobile={isMobile}
        active={isPlaying}
        score={scoreTotal}
        timescale={timescaleRef.current}
      />

      <Road
        active={isPlaying}
        score={scoreTotal}
        gameOver={gameState === "GAME_OVER"}
        playerState={playerStateRef.current}
        timescale={timescaleRef.current}
        onObstacleHit={onObstacleHit}
        onCoinsCollected={onCoinsCollected}
      />

      <Player
        active={isPlaying}
        lane={laneRef.current ?? 1}
        jumpRequested={jumpRef.current}
        slideRequested={slideRef.current}
        isDead={isDeadRef.current}
        playerState={playerStateRef.current}
        onJumpConsumed={consumeJump}
        onSlideConsumed={consumeSlide}
        characterId={characterId}
        modelUrl={characterModelUrl}
      />

      <Chaser
        active={isPlaying}
        score={scoreTotal}
        playerLaneX={LANE_POSITIONS[laneRef.current ?? 1]}
        chaseActive={chaseActive}
        playerHit={playerHit}
        gameOver={gameState === "GAME_OVER"}
        onDramaBeat={handleDramaBeat}
        onCatch={handleChaserCatch}
      />
    </>
  );
}
