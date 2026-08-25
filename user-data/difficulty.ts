import {
  DIFFICULTY_BANDS,
  BASE_WORLD_SPEED,
  MAX_WORLD_SPEED,
  SPEED_RAMP_PER_SCORE,
  CHASER_BASE_DISTANCE,
  CHASER_CLOSE_DISTANCE,
} from "./constants";
import type { DifficultyBand } from "./types";

// ============================================================
// Difficulty scaling — pure functions, no side effects, so
// GameManager can call these every frame/tick without worrying
// about state mutation ordering.
// ============================================================

/** Returns the active difficulty band for a given score. */
export function getDifficultyBand(score: number): DifficultyBand {
  // DIFFICULTY_BANDS is ordered ascending by minScore — walk backwards
  // to find the highest band the score qualifies for.
  let active: DifficultyBand = DIFFICULTY_BANDS[0];
  for (const band of DIFFICULTY_BANDS) {
    if (score >= band.minScore) active = band;
  }
  return active;
}

/**
 * World speed grows smoothly with score rather than jumping at band
 * boundaries — the band's speedMultiplier acts as a ceiling multiplier
 * so transitions between bands still feel continuous.
 */
export function getWorldSpeed(score: number): number {
  const band = getDifficultyBand(score);
  const ramped = BASE_WORLD_SPEED + score * SPEED_RAMP_PER_SCORE;
  const capped = Math.min(ramped, BASE_WORLD_SPEED * band.speedMultiplier);
  return Math.min(capped, MAX_WORLD_SPEED);
}

/**
 * Chaser aggression (0..1) controls how often/how long the chaser
 * dips into CLOSING_IN. Higher aggression = more frequent drama beats
 * and a smaller gap during NORMAL state.
 */
export function getChaserAggression(score: number): number {
  return getDifficultyBand(score).chaserAggression;
}

/** Baseline chaser distance shrinks slightly as aggression rises. */
export function getChaserBaseDistance(score: number): number {
  const aggression = getChaserAggression(score);
  // interpolate between the base and close distance as aggression climbs
  return CHASER_BASE_DISTANCE - aggression * (CHASER_BASE_DISTANCE - CHASER_CLOSE_DISTANCE) * 0.5;
}

/**
 * Rough probability check used by the chaser's tick logic to decide
 * whether to trigger a CLOSING_IN drama beat this tick. Callers should
 * gate this behind a cooldown so beats don't spam every frame.
 */
export function shouldTriggerCloseIn(score: number, randomRoll: number): boolean {
  const aggression = getChaserAggression(score);
  // aggression 0.2 (easy) -> ~2% chance per tick, aggression 1.0 (very hard) -> ~10% chance per tick
  const chance = 0.02 + aggression * 0.08;
  return randomRoll < chance;
}

/** Obstacle spawn gap shrinks as difficulty rises, within the configured min/max range. */
export function getObstacleSpawnGap(score: number, minGap: number, maxGap: number): number {
  const band = getDifficultyBand(score);
  // higher speedMultiplier -> tighter gaps, but never below minGap
  const tightened = maxGap - (maxGap - minGap) * (band.speedMultiplier - 1) * 1.2;
  return Math.max(minGap, tightened);
}
