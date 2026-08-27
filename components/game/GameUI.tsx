"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GameState, ScoreState } from "@/lib/game/types";

// ============================================================
// All in-game HTML overlays — pure React, not Three.js text.
// Structured as a state-driven switcher: each GameState maps
// to a distinct panel shown as an overlay above the canvas.
// ============================================================

interface GameUIProps {
  gameState: GameState;
  score: ScoreState;
  onPlay: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  countdown: number; // 3..1..0 → game starts
}

export default function GameUI({
  gameState,
  score,
  onPlay,
  onRestart,
  onMainMenu,
  countdown,
}: GameUIProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Show mobile tutorial once per session
    const isMobile = "ontouchstart" in window;
    const seen = sessionStorage.getItem("did-tutorial-seen");
    if (!isMobile || seen || gameState !== "PLAYING") return;

    sessionStorage.setItem("did-tutorial-seen", "1");
    const show = setTimeout(() => setShowTutorial(true), 0);
    const hide = setTimeout(() => setShowTutorial(false), 3500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [gameState]);

  return (
    <div className="game-ui absolute inset-0 pointer-events-none select-none">
      {/* ── LOADING ── */}
      {gameState === "LOADING" && (
        <div className="game-screen game-loading pointer-events-auto">
          <div className="game-loading-mark">
            <div className="game-kicker">C.I.D. / RUN 01</div>
            <div className="game-loading-title">LOADING</div>
            <div className="game-loading-bar"><span /></div>
          </div>
        </div>
      )}

      {/* ── MENU ── */}
      {gameState === "MENU" && (
        <div className="game-screen game-menu pointer-events-auto">
          <div className="game-menu-content">
            <div className="game-kicker">C.I.D. / FIELD OPERATIONS</div>
            <h1 className="game-title">C.I.D.</h1>
            <div className="game-rule" />
            <div className="game-subtitle">CHODU INVESTIGATION DEPARTMENT</div>
            <p className="game-tagline">
              Run! ACP Pradyuman&apos;s lund is getting closer…
            </p>

            {/* Play button */}
            <button
              id="did-play-btn"
              onClick={onPlay}
              className="game-primary-action"
            >
              ▶ &nbsp; PLAY
            </button>
            <Link href="/character" className="game-secondary-action game-character-action">
              ◇ &nbsp; CHOOSE CHARACTER
            </Link>
        

            {/* Best score */}
            {score.best > 0 && (
              <div className="game-best-score">
                <span>BEST RUN</span><strong>{score.best.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COUNTDOWN ── */}
      {gameState === "COUNTDOWN" && (
        <div className="game-screen game-countdown">
          <div
            key={countdown}
            className="game-countdown-number"
            style={{
              textShadow: "0 0 60px #f59e0b",
              animation: "countdownPop 0.6s ease-out",
            }}
          >
            {countdown > 0 ? countdown : "GO!"}
          </div>
        </div>
      )}

      {/* ── IN-GAME HUD ── */}
      {gameState === "PLAYING" && (
        <div className="game-hud absolute inset-0 flex flex-col">
          {/* Top bar */}
          <div className="game-hud-top">
            <div className="game-stat game-stat-score">
              <div className="game-stat-label">DISTANCE SCORE</div>
              <div className="game-stat-value">
                {score.total.toLocaleString()}
              </div>
            </div>

            <div className="game-stat game-stat-coins">
              <div className="game-stat-label">CHUTS</div>
              <div className="game-stat-value">
                <span className="coin-mark">◆</span>{score.coinsCollected}
              </div>
            </div>
          </div>

          {/* Mobile tutorial overlay */}
          {showTutorial && (
            <div className="game-tutorial absolute inset-x-0 bottom-28 flex justify-center px-6">
              <div className="game-tutorial-panel">
                <div className="game-gesture-row">
                  <span>← → <span className="text-zinc-500 text-xs">lane</span></span>
                  <span>↑ <span className="text-zinc-500 text-xs">jump</span></span>
                  <span>↓ <span className="text-zinc-500 text-xs">slide</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GAME OVER ── */}
      {gameState === "GAME_OVER" && (
        <div className="game-screen game-over pointer-events-auto">
          <div className="game-over-content">
            {/* CAUGHT! headline */}
            <div
              className="game-over-title"
              style={{
                color: "#ef4444",
                textShadow: "0 0 40px #ef444488, 0 4px 0 #7f1d1d",
              }}
            >
              CAUGHT!
            </div>
            <div className="game-over-subtitle">
              ACP Pradyuman got you!
            </div>

            {/* Scores */}
            <div className="game-results">
              <ScoreLine label="Score" value={score.total.toLocaleString()} color="text-white" />
              <ScoreLine label="Chuts" value={`◆ ${score.coinsCollected}`} color="text-amber-400" />
              <ScoreLine label="Distance" value={`${Math.floor(score.distanceScore)} m`} color="text-cyan-300" />
              <div className="h-px bg-zinc-700/50 my-3" />
              <ScoreLine label="Best" value={score.best.toLocaleString()} color="text-amber-300" />
            </div>

            {/* Buttons */}
            <div className="game-actions">
              <button
                id="did-play-again-btn"
                onClick={onRestart}
                className="game-primary-action"
              >
                ▶ &nbsp; PLAY AGAIN
              </button>
              <button
                id="did-menu-btn"
                onClick={onMainMenu}
                className="game-secondary-action"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreLine({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="game-score-line">
      <span>{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}
