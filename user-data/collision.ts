import { PLAYER_HEIGHT, PLAYER_SLIDE_HEIGHT, LANE_POSITIONS } from "./constants";
import type { ObstacleConfig, CoinConfig, PlayerState, Lane } from "./types";

// ============================================================
// Simple bounding-box / distance-based collision.
// No physics engine needed for this game — everything here is
// axis-aligned box overlap on the lane (x) and forward (z) axes,
// plus a height (y) check for jump/slide interactions.
// ============================================================

const PLAYER_WIDTH = 0.8;
const PLAYER_DEPTH = 0.6;

// Player's collision box changes shape while sliding — shorter
// but the game treats it as still occupying the lane.
function getPlayerBox(player: PlayerState) {
  const height = player.isSliding ? PLAYER_SLIDE_HEIGHT : PLAYER_HEIGHT;
  const x = player.currentX;
  return {
    minX: x - PLAYER_WIDTH / 2,
    maxX: x + PLAYER_WIDTH / 2,
    minY: player.y,
    maxY: player.y + height,
    minZ: -PLAYER_DEPTH / 2,
    maxZ: PLAYER_DEPTH / 2,
  };
}

function getObstacleBox(obstacle: ObstacleConfig) {
  const x = LANE_POSITIONS[obstacle.lane];
  return {
    minX: x - obstacle.width / 2,
    maxX: x + obstacle.width / 2,
    minY: 0,
    maxY: obstacle.height,
    minZ: obstacle.z - obstacle.depth / 2,
    maxZ: obstacle.z + obstacle.depth / 2,
  };
}

function boxesOverlap(
  a: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number },
  b: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }
) {
  return (
    a.minX < b.maxX &&
    a.maxX > b.minX &&
    a.minY < b.maxY &&
    a.maxY > b.minY &&
    a.minZ < b.maxZ &&
    a.maxZ > b.minZ
  );
}

/**
 * Checks the player against a list of obstacles and returns the first
 * one that's actually hit, or null if the player is clear.
 *
 * Slideable obstacles (e.g. low barriers) are only a hit if the player
 * is NOT currently sliding. Non-slideable obstacles are always a hit
 * on overlap regardless of slide state (you can't slide under a bus).
 */
export function checkObstacleCollision(
  player: PlayerState,
  obstacles: ObstacleConfig[]
): ObstacleConfig | null {
  const playerBox = getPlayerBox(player);

  for (const obstacle of obstacles) {
    if (obstacle.lane !== player.lane) continue; // cheap early-out before box math

    const obstacleBox = getObstacleBox(obstacle);
    if (!boxesOverlap(playerBox, obstacleBox)) continue;

    if (obstacle.slideable && player.isSliding) continue; // safely under it

    return obstacle;
  }

  return null;
}

/**
 * Checks the player against coins and returns the IDs of any newly
 * collected coins this frame. Caller is responsible for marking them
 * collected / removing them from state.
 */
export function checkCoinCollisions(player: PlayerState, coins: CoinConfig[]): string[] {
  const playerBox = getPlayerBox(player);
  const collected: string[] = [];

  for (const coin of coins) {
    if (coin.collected) continue;
    if (coin.lane !== player.lane) continue;

    const coinBox = {
      minX: LANE_POSITIONS[coin.lane] - 0.4,
      maxX: LANE_POSITIONS[coin.lane] + 0.4,
      minY: coin.y - 0.4,
      maxY: coin.y + 0.4,
      minZ: coin.z - 0.4,
      maxZ: coin.z + 0.4,
    };

    if (boxesOverlap(playerBox, coinBox)) {
      collected.push(coin.id);
    }
  }

  return collected;
}

/**
 * Distance-based check for the chaser "catching" the player — simpler
 * than a full box check since it's just a z-gap threshold combined
 * with the chaser being in a catch-capable state.
 */
export function isChaserCatchDistance(distanceBehind: number, catchDistance: number): boolean {
  return distanceBehind <= catchDistance;
}

/** Utility used by spawners to avoid placing an obstacle and a coin in the same lane+z slot. */
export function laneOverlapsExisting(lane: Lane, z: number, existingZs: number[], minGap: number): boolean {
  return existingZs.some((existingZ) => Math.abs(existingZ - z) < minGap);
}
