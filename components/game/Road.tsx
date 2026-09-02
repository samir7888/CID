"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type {
  RoadChunkData,
  ObstacleConfig,
  CoinConfig,
  Lane,
  PlayerState,
} from "@/lib/game/types";
import {
  ROAD_CHUNK_LENGTH,
  ROAD_CHUNK_COUNT,
  ROAD_RECYCLE_Z,
  OBSTACLE_SPAWN_MIN_GAP,
  OBSTACLE_SPAWN_MAX_GAP,
  COIN_SPAWN_CHANCE,
  OBSTACLE_DENSITY_STEP,
  SPEED_STEP_INTERVAL,
} from "@/lib/game/constants";
import { getWorldSpeed, getObstacleSpawnGap } from "@/lib/game/difficulty";
import {
  randomObstacleType,
  randomCoinPattern,
  getCoinPatternOffsets,
  randomLane,
  randomLaneExcluding,
  chance,
} from "@/lib/game/random";
import { checkObstacleCollision, checkCoinCollisions } from "@/lib/game/collision";
import RoadChunk from "./RoadChunk";

// ============================================================
// Road manages a pool of ROAD_CHUNK_COUNT chunks, recycling them
// from behind the camera to in front with new obstacles/coins.
// Movement is applied in useFrame — the road moves toward the
// player, not the other way round.
// ============================================================

interface RoadProps {
  active: boolean;
  score: number;
  gameOver: boolean;
  playerState: PlayerState;
  timescale: number; // 1 = normal, <1 = drama-beat slow-mo
  onObstacleHit: (obstacle: ObstacleConfig) => void;
  onCoinsCollected: (ids: string[]) => void;
}

let obstacleSeq = 0;
let coinSeq = 0;

function spawnObstaclesForChunk(
  chunkZ: number,
  score: number,
  difficultyStep = 0,
  initial = false,
): ObstacleConfig[] {
  const obstacles: ObstacleConfig[] = [];
  const baseGap = getObstacleSpawnGap(score, OBSTACLE_SPAWN_MIN_GAP, OBSTACLE_SPAWN_MAX_GAP);
  const gap = Math.max(
    OBSTACLE_SPAWN_MIN_GAP * 0.65,
    baseGap * Math.pow(OBSTACLE_DENSITY_STEP, difficultyStep),
  );

  let z = initial ? -36 : -gap;
  const endZ = initial ? -ROAD_CHUNK_LENGTH - 8 : -ROAD_CHUNK_LENGTH + 4;

  while (z >= endZ) {
    const type = randomObstacleType();
    const lane = chunkZ === 0 && obstacles.length === 0 ? 1 : randomLane();

    const dims = OBSTACLE_DIMS[type];
    obstacles.push({
      id: `obs-${obstacleSeq++}`,
      type,
      lane,
      z,
      ...dims,
    });

    z -= gap + dims.depth / 2;
  }

  return obstacles;
}

function spawnCoinsForChunk(
  chunkZ: number,
  existingObstacleZs: number[],
  initial = false,
): CoinConfig[] {
  const coins: CoinConfig[] = [];
  if (!chance(COIN_SPAWN_CHANCE)) return coins;

  const pattern = randomCoinPattern();
  const offsets = getCoinPatternOffsets(pattern);
  const startZ = initial ? -34 : -8;
  let lane: Lane = randomLane();

  offsets.forEach((offset, i) => {
    const z = startZ - offset;
    if (existingObstacleZs.some((oz) => Math.abs(oz - z) < 2)) return; // avoid obstacle slots

    // For zig-zag and lane-sequence, alternate lanes
    if (pattern === "zig-zag" && i > 0) lane = randomLaneExcluding(lane);
    if (pattern === "lane-sequence" && i > 0) lane = ((lane + 1) % 3) as Lane;

    // For jump-arc, elevate middle coins
    const arcY =
      pattern === "jump-arc"
        ? Math.sin((i / (offsets.length - 1)) * Math.PI) * 1.4
        : 0;

    coins.push({
      id: `coin-${coinSeq++}`,
      lane,
      z,
      y: arcY,
      collected: false,
    });
  });

  return coins;
}

// Obstacle dimension presets per type
const OBSTACLE_DIMS: Record<
  ObstacleConfig["type"],
  { width: number; height: number; depth: number; slideable: boolean }
> = {
  "handcart": { width: 0.9, height: 1.2, depth: 1.4, slideable: false },
  "auto-rickshaw": { width: 1.8, height: 1.6, depth: 2.8, slideable: false },
  "barricade": { width: 1.6, height: 0.6, depth: 0.3, slideable: true },
  "construction-barrier": { width: 1.0, height: 1.8, depth: 0.35, slideable: false },
  "parked-scooter": { width: 0.5, height: 1.0, depth: 1.8, slideable: false },
};

export default function Road({
  active,
  score,
  gameOver,
  playerState,
  timescale,
  onObstacleHit,
  onCoinsCollected,
}: RoadProps) {
  const [, setPoolVersion] = useState(0);
  const runInitialized = useRef(false);

  // Initialize chunk pool
  const chunks = useRef<RoadChunkData[]>(
    Array.from({ length: ROAD_CHUNK_COUNT }, (_, i) => {
      const z = -i * ROAD_CHUNK_LENGTH;
      return {
        id: `chunk-${i}`,
        z,
        obstacles: spawnObstaclesForChunk(z, 0, 0, true),
        coins: spawnCoinsForChunk(z, [], true),
      };
    })
  );

  const lastCollidedObstacleId = useRef<string | null>(null);
  const elapsedSeconds = useRef(0);

  useFrame((_, delta) => {
    if (!active || gameOver) {
      runInitialized.current = false;
      elapsedSeconds.current = 0;
      return;
    }

    elapsedSeconds.current += delta;
    const difficultyStep = Math.floor(elapsedSeconds.current / SPEED_STEP_INTERVAL);

    if (!runInitialized.current) {
      chunks.current.forEach((chunk, index) => {
        chunk.z = -index * ROAD_CHUNK_LENGTH;
        chunk.obstacles = spawnObstaclesForChunk(chunk.z, score, difficultyStep, true);
        chunk.coins = spawnCoinsForChunk(chunk.z, chunk.obstacles.map((obstacle) => obstacle.z), true);
      });
      runInitialized.current = true;
      setPoolVersion((version) => version + 1);
    }

    const speed = getWorldSpeed(score) * timescale;
    const move = speed * delta;

    // Move every pooled chunk; its children stay in local chunk coordinates.
    for (const chunk of chunks.current) {
      chunk.z += move;

      // Recycle chunk that has scrolled past camera
      if (chunk.z - ROAD_CHUNK_LENGTH > ROAD_RECYCLE_Z) {
        // Find the furthest-back chunk
        let minZ = Infinity;
        for (const c of chunks.current) if (c.z < minZ) minZ = c.z;
        chunk.z = minZ - ROAD_CHUNK_LENGTH;

        const newObstacles = spawnObstaclesForChunk(chunk.z, score, difficultyStep);
        const newCoins = spawnCoinsForChunk(chunk.z, newObstacles.map((o) => o.z));
        chunk.obstacles = newObstacles;
        chunk.coins = newCoins;
        setPoolVersion((version) => version + 1);
      }
    }

    // --- Collision checks ---
    if (!playerState.isDead) {
      // Convert local chunk coordinates into world coordinates for collision.
      // Only obstacles/coins near the player matter (z in [-20, 10]).
      const allObs = [],
        allCoins = [];
      for (const chunk of chunks.current) {
        for (const obstacle of chunk.obstacles) {
          const oz = chunk.z + obstacle.z;
          if (oz > -20 && oz < 10) allObs.push({ ...obstacle, z: oz });
        }
        for (const coin of chunk.coins) {
          const cz = chunk.z + coin.z;
          if (cz > -20 && cz < 10) allCoins.push({ ...coin, z: cz });
        }
      }

      const hit = checkObstacleCollision(playerState, allObs);
      if (!hit) lastCollidedObstacleId.current = null;
      if (hit && hit.id !== lastCollidedObstacleId.current) {
        lastCollidedObstacleId.current = hit.id;
        onObstacleHit(hit);
      }

      const collectedIds = checkCoinCollisions(playerState, allCoins);
      if (collectedIds.length > 0) {
        // Mark as collected in the chunk data
        for (const chunk of chunks.current) {
          for (const coin of chunk.coins) {
            if (collectedIds.includes(coin.id)) coin.collected = true;
          }
        }
        onCoinsCollected(collectedIds);
      }
    }
  });

  return (
    <>
      {chunks.current.map((chunk) => (
        <RoadChunk key={chunk.id} chunk={chunk} />
      ))}
    </>
  );
}
