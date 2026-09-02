"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { toast, Toaster } from "sonner";
import * as THREE from "three";
import type { GameState, ScoreState, Lane, InputAction, ObstacleConfig } from "@/lib/game/types";
import { MAX_DPR, CAMERA_OFFSET, CAMERA_LOOKAHEAD, COIN_VALUE } from "@/lib/game/constants";
import { seedRng } from "@/lib/game/random";
import SceneManager from "./SceneManager";
import GameUI from "./GameUI";
import MobileControls from "./MobileControls";
import AudioManager from "./AudioManager";
import { CHARACTER_STORAGE_KEY, DEFAULT_CHARACTER_ID, getCharacter } from "@/lib/game/characters";
import { useUser } from "@clerk/nextjs";
import type { EnvironmentTheme } from "./Environment";

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
  const [characterId, setCharacterId] = useState(() =>
    typeof window !== "undefined"
      ? getCharacter(localStorage.getItem(CHARACTER_STORAGE_KEY)).id
      : DEFAULT_CHARACTER_ID,
  );
  const [characterModelUrl, setCharacterModelUrl] = useState<string | null>(null);
  const [pinkCoinBalance, setPinkCoinBalance] = useState<number | null>(null);
  const [environmentTheme, setEnvironmentTheme] = useState<EnvironmentTheme>(() => {
    if (typeof window === "undefined") return "green";
    const stored = localStorage.getItem("cid-environment-theme");
    return stored === "city" ? "city" : "green";
  });
  const [gameState, setGameState] = useState<GameState>("MENU");
  const [score, setScore] = useState<ScoreState>(() => ({
    ...INITIAL_SCORE,
    best: typeof window !== "undefined" ? parseInt(localStorage.getItem("did-best-score") ?? "0", 10) : 0,
  }));
  const [countdown, setCountdown] = useState(3);
  const [isReviving, setIsReviving] = useState(false);
  const [showInsufficientCoins, setShowInsufficientCoins] = useState(false);
  const [rendererKey, setRendererKey] = useState(0);
  const laneRef = useRef<Lane>(1);
  const jumpRef = useRef(false);
  const slideRef = useRef(false);
  const isDeadRef = useRef(false);
  const playerHitRef = useRef(false);
  const chaseActiveRef = useRef(false);
  const chasedObstacleIdRef = useRef<string | null>(null);
  const chaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextMilestoneRef = useRef(1000);
  const [chaseActive, setChaseActive] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const gameStateRef = useRef<GameState>("MENU");
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    let cancelled = false;
    const loadSelectedCharacter = async () => {
      if (!isLoaded || !isSignedIn) return;
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) return;
        const profile = await response.json();
        if (cancelled) return;
        setPinkCoinBalance(profile.pink_coin_balance ?? 0);
        const selectedId = profile.selected_character_id as string | null;
        const selected = profile.selected_character?.id ?? getCharacter(selectedId ?? DEFAULT_CHARACTER_ID).id;
        setCharacterId(selected);
        setCharacterModelUrl(profile.selected_character?.model_url ?? null);
        localStorage.setItem(CHARACTER_STORAGE_KEY, selected);
      } catch {
        // Local storage remains the offline fallback when the database is unavailable.
      }
    };
    loadSelectedCharacter();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn]);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  useEffect(() => {
    if (gameState !== "PLAYING") return;

    while (score.total >= nextMilestoneRef.current) {
      const milestone = nextMilestoneRef.current;
      toast.custom(
        () => (
          <div className="game-score-milestone" role="status">
            <div className="game-score-milestone-title">SCORE CHECKPOINT</div>
            <div className="game-score-milestone-value">{milestone.toLocaleString()}</div>
          </div>
        ),
        { duration: 2600, position: "top-center" },
      );
      nextMilestoneRef.current += 1000;
    }
  }, [gameState, score.total]);

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
        nextMilestoneRef.current = 500;
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
      const storedBest = parseInt(localStorage.getItem("did-best-score") ?? "0", 10);
      const best = Math.max(previous.total, storedBest);
      if (previous.total > storedBest) {
        toast.custom(
          () => (
            <div className="game-new-high-score" role="status">
              <div className="game-new-high-score-title">NEW HIGH SCORE</div>
              <div className="game-new-high-score-value">{previous.total.toLocaleString()}</div>
            </div>
          ),
          { duration: 4200, position: "top-center" },
        );
      }
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

  const handleRestart = useCallback(() => {
    setShowInsufficientCoins(false);
    AudioManager.stopAll();
    startGame();
  }, [startGame]);

  const handleMainMenu = useCallback(() => {
    setShowInsufficientCoins(false);
    AudioManager.stopAll();
    setGameState("MENU");
  }, []);

  const handleContinue = useCallback(async () => {
    if (isReviving) return;

    if (!isLoaded || !isSignedIn) {
      setShowInsufficientCoins(true);
      return;
    }

    if (pinkCoinBalance !== null && pinkCoinBalance < 2) {
      setShowInsufficientCoins(true);
      return;
    }

    setIsReviving(true);
    try {
      const response = await fetch("/api/continue-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 402 || response.status === 401) {
        setShowInsufficientCoins(true);
        return;
      }

      if (!response.ok) {
        toast.error("Unable to continue run. Please try again.");
        return;
      }

      const data = await response.json();
      if (typeof data.newBalance === "number") {
        setPinkCoinBalance(data.newBalance);
      } else {
        setPinkCoinBalance((prev) => Math.max(0, (prev ?? 2) - 2));
      }

      setShowInsufficientCoins(false);
      AudioManager.stopAll();

      isDeadRef.current = false;
      playerHitRef.current = false;
      setPlayerHit(false);
      chaseActiveRef.current = false;
      chasedObstacleIdRef.current = null;
      if (chaseTimerRef.current) clearTimeout(chaseTimerRef.current);
      jumpRef.current = false;
      slideRef.current = false;

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
          jumpRef.current = false;
          slideRef.current = false;
          setGameState("PLAYING");
          AudioManager.playSound("musicLoop");
        }
      }, 1000);
    } catch {
      toast.error("Failed to continue run. Please check your connection.");
    } finally {
      setIsReviving(false);
    }
  }, [isLoaded, isSignedIn, pinkCoinBalance, isReviving]);

  const handleToggleTheme = useCallback(() => {
    setEnvironmentTheme((prev) => {
      const next: EnvironmentTheme = prev === "green" ? "city" : "green";
      localStorage.setItem("cid-environment-theme", next);
      return next;
    });
  }, []);

  const isPlaying = gameState === "PLAYING";

  const handleCanvasCreated = useCallback(
    (state: { gl: THREE.WebGLRenderer }) => {
      const canvas = state.gl.domElement;
      const onContextLost = (event: Event) => {
        event.preventDefault();
        setRendererKey((prev) => prev + 1);
      };
      canvas.addEventListener("webglcontextlost", onContextLost, false);
    },
    [],
  );

  return (
    <div className="relative w-full h-full bg-zinc-950">
      <Canvas
        key={rendererKey}
        onCreated={handleCanvasCreated}
        dpr={isMobile ? 1 : MAX_DPR}
        camera={{
          position: [CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z],
          fov: 65,
          near: 0.1,
          far: 500,
        }}
        shadows={isMobile ? false : { type: THREE.PCFShadowMap }}
        gl={{ antialias: false, powerPreference: "low-power" }}
        style={{
          position: "absolute",
          inset: 0,
          background: "#09090b",
        }}
      >
        <color attach="background" args={["#122615"]} />
        <fog attach="fog" args={["#162e19", 35, 185]} />
        <ambientLight intensity={1.15} color="#f0fdf4" />
        <directionalLight
          position={[6, 14, 6]}
          intensity={2.1}
          color="#fff9e6"
          castShadow={!isMobile}
          shadow-mapSize={isMobile ? [256, 256] : [512, 512]}
        />
        <directionalLight
          position={[-4, 8, -10]}
          intensity={0.6}
          color="#81c784"
        />

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
          characterId={characterId}
          characterModelUrl={characterModelUrl}
          environmentTheme={environmentTheme}
        />
      </Canvas>

      {/* HTML Overlay */}
      <GameUI
        gameState={gameState}
        score={score}
        onPlay={startGame}
        onRestart={handleRestart}
        onMainMenu={handleMainMenu}
        onContinue={handleContinue}
        countdown={countdown}
        pinkCoinBalance={pinkCoinBalance}
        isReviving={isReviving}
        showInsufficientCoins={showInsufficientCoins}
        onCloseInsufficientCoins={() => setShowInsufficientCoins(false)}
        environmentTheme={environmentTheme}
        onToggleTheme={handleToggleTheme}
      />

      <Toaster
        position="top-center"
        expand={false}
        visibleToasts={3}
        offset={72}
        containerAriaLabel="Game notifications"
      />

      {/* Mobile swipe handler */}
      <MobileControls onAction={handleAction} active={isPlaying} />
    </div>
  );
}
