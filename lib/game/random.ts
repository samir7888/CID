import type { Lane, ObstacleType, CoinPattern } from "./types";
import { LANE_COUNT } from "./constants";

// ============================================================
// Deterministic-friendly RNG + spawn pattern helpers.
// Using a seedable PRNG (mulberry32) instead of Math.random()
// directly means runs can be made reproducible later (e.g. for
// daily-challenge seeds), even though MVP doesn't need that yet.
// ============================================================

export function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Default RNG instance for spawners that don't need a custom seed.
// Re-seed with createRng(Date.now()) at game start for a fresh run.
let rng = mulberry32(Date.now());

export function seedRng(seed: number) {
  rng = mulberry32(seed);
}

export function randomFloat(min: number, max: number): number {
  return min + rng() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat(min, max + 1));
}

export function randomLane(): Lane {
  return randomInt(0, LANE_COUNT - 1) as Lane;
}

/** Pick a lane different from the given one — used to avoid repeating the same lane twice in a row. */
export function randomLaneExcluding(exclude: Lane): Lane {
  let lane = randomLane();
  while (lane === exclude) lane = randomLane();
  return lane;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

export function chance(probability: number): boolean {
  return rng() < probability;
}

// ---------- Spawn pattern selection ----------

const OBSTACLE_TYPES: ObstacleType[] = [
  "handcart",
  "auto-rickshaw",
  "barricade",
  "construction-barrier",
  "parked-scooter",
];

export function randomObstacleType(): ObstacleType {
  return pickRandom(OBSTACLE_TYPES);
}

const COIN_PATTERNS: CoinPattern[] = [
  "straight-line",
  "lane-sequence",
  "jump-arc",
  "zig-zag",
];

export function randomCoinPattern(): CoinPattern {
  return pickRandom(COIN_PATTERNS);
}

/**
 * Generates relative z-offsets (from a pattern's starting z) for a given
 * coin pattern. Spawner combines this with a lane per point depending on
 * pattern type — e.g. "straight-line" keeps one lane, "zig-zag" alternates.
 */
export function getCoinPatternOffsets(pattern: CoinPattern): number[] {
  switch (pattern) {
    case "straight-line":
      return [0, 1.2, 2.4, 3.6, 4.8];
    case "lane-sequence":
      return [0, 1.5, 3.0];
    case "jump-arc":
      return [0, 1.0, 2.0, 3.0, 4.0]; // paired with a y-arc by the coin spawner
    case "zig-zag":
      return [0, 1.3, 2.6, 3.9, 5.2];
  }
}
