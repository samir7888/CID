// ============================================================
// Shared types — single source of truth for game data shapes
// ============================================================

export type Lane = 0 | 1 | 2;

// ---------- Game state machine ----------
export type GameState =
  | "LOADING"
  | "MENU"
  | "COUNTDOWN"
  | "PLAYING"
  | "PAUSED"
  | "GAME_OVER";

// ---------- Player ----------
export type PlayerAnimState =
  | "idle"
  | "running"
  | "jumping"
  | "sliding"
  | "falling";

export interface PlayerState {
  lane: Lane;
  targetLaneX: number;
  currentX: number;
  y: number;
  animState: PlayerAnimState;
  isJumping: boolean;
  jumpElapsed: number; // seconds into current jump
  isSliding: boolean;
  slideElapsed: number; // seconds into current slide
  isDead: boolean;
}

// ---------- Chaser ----------
export type ChaserState =
  | "NORMAL"
  | "CLOSING_IN"
  | "FAR_BEHIND"
  | "PLAYER_HIT"
  | "GAME_OVER";

export interface ChaserRuntimeState {
  state: ChaserState;
  distanceBehind: number; // current z-gap behind player
  stateElapsed: number; // seconds spent in current state
  dramaBeatActive: boolean; // true while the punch-in/time-dip is playing
}

// ---------- Obstacles ----------
export type ObstacleType =
  | "handcart"
  | "auto-rickshaw"
  | "barricade"
  | "construction-barrier"
  | "parked-scooter";

export interface ObstacleConfig {
  id: string;
  type: ObstacleType;
  lane: Lane;
  z: number;
  width: number;
  height: number;
  depth: number;
  // true if the obstacle can be passed by sliding under it (e.g. low barriers)
  slideable: boolean;
}

// ---------- Coins ----------
export type CoinPattern =
  | "straight-line"
  | "lane-sequence"
  | "jump-arc"
  | "zig-zag";

export interface CoinConfig {
  id: string;
  lane: Lane;
  z: number;
  y: number; // allows arced/elevated coin patterns
  collected: boolean;
}

// ---------- Road chunks ----------
export interface RoadChunkData {
  id: string;
  z: number; // current world z position of the chunk's start
  obstacles: ObstacleConfig[];
  coins: CoinConfig[];
}

// ---------- Difficulty ----------
export interface DifficultyBand {
  minScore: number;
  label: "easy" | "medium" | "hard" | "very-hard";
  speedMultiplier: number;
  chaserAggression: number; // 0..1, feeds chaser's CLOSING_IN frequency
}

// ---------- Score ----------
export interface ScoreState {
  distanceScore: number;
  coinScore: number;
  survivalScore: number;
  total: number;
  coinsCollected: number;
  best: number;
}

// ---------- Audio ----------
export type SoundId =
  | "coin"
  | "jump"
  | "land"
  | "collision"
  | "footstep"
  | "chaserWarning"
  | "chaserVoice"
  | "gameOver"
  | "menuSelect"
  | "menuMusic"
  | "musicLoop";

// ---------- Input ----------
export type InputAction = "left" | "right" | "jump" | "slide";
