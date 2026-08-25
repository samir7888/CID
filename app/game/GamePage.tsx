"use client";

import dynamic from "next/dynamic";

// Dynamically import Game with SSR disabled — Three.js requires browser APIs
const Game = dynamic(() => import("@/components/game/Game"), {
  ssr: false,
  loading: () => (
    <div className="game-ui game-screen game-loading">
      <div className="game-loading-mark">
        <div className="game-kicker">C.I.D. / RUN 01</div>
        <div className="game-loading-title">LOADING</div>
        <div className="game-loading-bar"><span /></div>
      </div>
    </div>
  ),
});

export default function GamePage() {
  return (
    <main className="w-screen h-screen overflow-hidden relative">
      <Game />
    </main>
  );
}
