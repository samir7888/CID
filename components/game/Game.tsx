"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { GameState, ScoreState, Lane, InputAction, ObstacleConfig } from "@/lib/game/types";
import { MAX_DPR, CAMERA_OFFSET, CAMERA_LOOKAHEAD, COIN_VALUE } from "@/lib/game/constants";
import { seedRng } from "@/lib/game/random";
import SceneManager from "./SceneManager";
import GameUI from "./GameUI";
import MobileControls from "./MobileControls";
import AudioManager from "./AudioManager";

// ============================================================
// Game — top-level component.
// Owns all React state (GameState, score) so that GameUI (HTML)
// and SceneManager (Canvas) share the same source of truth
// without any portal hacks.
//
// SceneManager handles Three.js scene, player, road, chaser.
// GameUI handles all HTML overlays.
// ============================================================

const INITIAL_SCORE: ScoreState = {
  distanceScore: 0,
  coinScore: 0,
  survivalScore: 0,
  total: 0,
  coinsCollected: 0,
  best: 0,
};

export default function Game() {
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
  const [gameState, setGameState] = useState<GameState>("MENU");
  const [score, setScore] = useState<ScoreState>(() => ({
    ...INITIAL_SCORE,
    best: typeof window !== "undefined" ? parseInt(localStorage.getItem("did-best-score") ?? "0", 10) : 0,
  }));
  const [countdown, setCountdown] = useState(3);
  const laneRef = useRef<Lane>(1);
  const jumpRef = useRef(false);
  const slideRef = useRef(false);
  const isDeadRef = useRef(false);
  const playerHitRef = useRef(false);
  const chaseActiveRef = useRef(false);
  const chasedObstacleIdRef = useRef<string | null>(null);
  const chaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [chaseActive, setChaseActive] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const gameStateRef = useRef<GameState>("MENU");

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  useEffect(() => {
    const startMenuMusic = () => {
      if (gameStateRef.current !== "MENU") return;
      AudioManager.init();
      AudioManager.playSound("menuMusic");
    };
    if (gameState === "MENU") {
      startMenuMusic();
      window.addEventListener("pointerdown", startMenuMusic);
      window.addEventListener("keydown", startMenuMusic);
    } else {
      AudioManager.stopSound("menuMusic");
    }
    return () => {
      window.removeEventListener("pointerdown", startMenuMusic);
      window.removeEventListener("keydown", startMenuMusic);
    };
  }, [gameState]);

  const handleAction = useCallback((action: InputAction) => {
    if (gameStateRef.current !== "PLAYING") return;
    if (action === "left") laneRef.current = Math.max(0, laneRef.current - 1) as Lane;
    if (action === "right") laneRef.current = Math.min(2, laneRef.current + 1) as Lane;
    if (action === "jump") { jumpRef.current = true; AudioManager.playSound("jump"); }
    if (action === "slide") slideRef.current = true;
  }, []);

  const startGame = useCallback(() => {
    AudioManager.init();
    AudioManager.stopSound("menuMusic");
    setGameState("COUNTDOWN");
    setCountdown(3);
    let remaining = 3;
    const interval = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        isDeadRef.current = false;
        playerHitRef.current = false;
        setPlayerHit(false);
        chaseActiveRef.current = false;
        chasedObstacleIdRef.current = null;
        if (chaseTimerRef.current) clearTimeout(chaseTimerRef.current);
        laneRef.current = 1;
        jumpRef.current = false;
        slideRef.current = false;
        seedRng(Date.now());
        const best = parseInt(localStorage.getItem("did-best-score") ?? "0", 10);
        setScore({ ...INITIAL_SCORE, best });
        setGameState("PLAYING");
        AudioManager.playSound("musicLoop");
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const held = new Set<string>();
    const onKeyDown = (event: KeyboardEvent) => {
      if (held.has(event.code)) return;
      held.add(event.code);
      if (gameStateRef.current === "MENU" && (event.code === "Enter" || event.code === "Space")) {
        startGame();
        return;
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") handleAction("left");
      if (event.code === "ArrowRight" || event.code === "KeyD") handleAction("right");
      if (event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Space") handleAction("jump");
      if (event.code === "ArrowDown" || event.code === "KeyS") handleAction("slide");
    };
    const onKeyUp = (event: KeyboardEvent) => held.delete(event.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleAction, startGame]);

  const handleGameOver = useCallback(() => {
    if (gameStateRef.current !== "PLAYING") return;
    isDeadRef.current = true;
    AudioManager.stopSound("musicLoop");
    AudioManager.playSound("collision");
    AudioManager.playSound("gameOver");
    setScore((previous) => {
      const best = Math.max(previous.total, previous.best);
      localStorage.setItem("did-best-score", String(best));
      return { ...previous, best };
    });
    setGameState("GAME_OVER");
  }, []);

  const handleObstacleHit = useCallback((obstacle: ObstacleConfig) => {
    if (obstacle.type !== "barricade") {
      handleGameOver();
      return;
    }

    const sameObstacle = chasedObstacleIdRef.current === obstacle.id;
    if (chaseActiveRef.current && sameObstacle) {
      playerHitRef.current = true;
      setPlayerHit(true);
      return;
    }

    chasedObstacleIdRef.current = obstacle.id;
    chaseActiveRef.current = true;
    setChaseActive(true);
    if (chaseTimerRef.current) clearTimeout(chaseTimerRef.current);
    chaseTimerRef.current = setTimeout(() => {
      chaseActiveRef.current = false;
      chasedObstacleIdRef.current = null;
      playerHitRef.current = false;
      setPlayerHit(false);
      setChaseActive(false);
    }, 6000);
  }, [handleGameOver]);

  const handleCoinsCollected = useCallback((ids: string[]) => {
    AudioManager.playSound("coin");
    setScore((previous) => {
      const coinScore = previous.coinScore + ids.length * COIN_VALUE;
      const total = Math.floor(previous.distanceScore + coinScore + previous.survivalScore);
      return { ...previous, coinScore, coinsCollected: previous.coinsCollected + ids.length, total };
    });
  }, []);

  const handleScoreTick = useCallback((survivalDelta: number, distanceDelta: number) => {
    setScore((previous) => {
      const survivalScore = previous.survivalScore + survivalDelta;
      const distanceScore = previous.distanceScore + distanceDelta;
      const total = Math.floor(distanceScore + previous.coinScore + survivalScore);
      return { ...previous, distanceScore, survivalScore, total, best: Math.max(total, previous.best) };
    });
  }, []);

  const handleRestart = useCallback(() => { AudioManager.stopAll(); startGame(); }, [startGame]);
  const handleMainMenu = useCallback(() => { AudioManager.stopAll(); setGameState("MENU"); }, []);
  const isPlaying = gameState === "PLAYING";

  return (
    <div className="relative w-full h-full bg-zinc-950">
      <Canvas
        dpr={isMobile ? 1 : MAX_DPR}
        camera={{
          position: [CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z],
          fov: 65,
          near: 0.1,
          far: 500,
        }}
        shadows={isMobile ? false : { type: THREE.PCFShadowMap }}
        gl={{ antialias: false, powerPreference: "low-power" }}
        style={{ position: "absolute", inset: 0, background: "#1a1a2e" }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight
          position={[5, 12, 5]}
          intensity={1.8}
          castShadow={!isMobile}
          shadow-mapSize={isMobile ? [256, 256] : [512, 512]}
        />
        <directionalLight position={[-4, 8, -10]} intensity={0.5} color="#8090ff" />

        {/* Fog for depth */}
        <fog attach="fog" args={["#1a1a2e", 30, 180]} />

        {/* Scene */}
        <SceneManager
          gameState={gameState}
          isMobile={isMobile}
          chaseActive={chaseActive}
          playerHit={playerHit}
          laneRef={laneRef}
          jumpRef={jumpRef}
          slideRef={slideRef}
          isDeadRef={isDeadRef}
          scoreTotal={score.total}
          onObstacleHit={handleObstacleHit}
          onCoinsCollected={handleCoinsCollected}
          onGameOver={handleGameOver}
          onScoreTick={handleScoreTick}
        />
      </Canvas>

      {/* HTML Overlay */}
      <GameUI
        gameState={gameState}
        score={score}
        onPlay={startGame}
        onRestart={handleRestart}
        onMainMenu={handleMainMenu}
        countdown={countdown}
      />

      {/* Mobile swipe handler */}
      <MobileControls onAction={handleAction} active={isPlaying} />
    </div>
  );
}
