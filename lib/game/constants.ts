// ============================================================
// Core game constants — tune everything here, no magic numbers
// scattered through components.
// ============================================================

// --- Lanes ---
export const LANE_COUNT = 3;
export const LANE_WIDTH = 2; // distance between adjacent lanes
export const LANE_POSITIONS = [-LANE_WIDTH, 0, LANE_WIDTH]; // x positions for lane 0,1,2
export const LANE_SWITCH_SPEED = 10; // higher = snappier lane change (lerp speed)

// --- Player ---
export const PLAYER_START_Z = 0;
export const PLAYER_HEIGHT = 1.6;
export const PLAYER_SLIDE_HEIGHT = 0.7;

// --- Jump ---
export const JUMP_HEIGHT = 2.2;
export const JUMP_DURATION = 0.65; // seconds, full arc up+down

// --- Slide ---
export const SLIDE_DURATION = 0.7; // seconds

// --- World speed / forward motion ---
export const BASE_WORLD_SPEED = 16; // units/sec the world moves toward player
export const MAX_WORLD_SPEED = 80;
export const SPEED_RAMP_PER_SCORE = 2.419; // how fast speed climbs with score
export const SPEED_STEP_INTERVAL = 5; // seconds between timed difficulty increases

// --- Road chunks ---
export const ROAD_CHUNK_LENGTH = 30;
export const ROAD_CHUNK_COUNT = 6; // how many chunks stay pooled at once
export const ROAD_RECYCLE_Z = 15; // z behind camera at which a chunk recycles

// --- Obstacles ---
export const OBSTACLE_SPAWN_MIN_GAP = 14; // min world-z gap between spawns
export const OBSTACLE_SPAWN_MAX_GAP = 26;
export const OBSTACLE_DENSITY_STEP = 0.82;
export const CONTENT_START_DELAY = 3; // seconds after PLAYING before hazards and rewards appear

// --- Coins ("Daya Coins") ---
export const COIN_SPAWN_CHANCE = 0.55; // probability a given spawn slot has coins
export const COIN_ROTATE_SPEED = 2.5;
export const COIN_VALUE = 10;

// --- Difficulty bands (score thresholds) ---
export const DIFFICULTY_BANDS = [
  { minScore: 0, label: "easy", speedMultiplier: 1.0, chaserAggression: 0.2 },
  {
    minScore: 500,
    label: "medium",
    speedMultiplier: 1.85,
    chaserAggression: 0.45,
  },
  {
    minScore: 1500,
    label: "hard",
    speedMultiplier: 2.25,
    chaserAggression: 0.7,
  },
  {
    minScore: 3000,
    label: "very-hard",
    speedMultiplier: 2.75,
    chaserAggression: 1.0,
  },
] as const;

// --- Chaser ---
export const CHASER_BASE_DISTANCE = 4; // z-gap behind player at NORMAL state
export const CHASER_CLOSE_DISTANCE = 1.8; // z-gap when CLOSING_IN
export const CHASER_CATCH_DISTANCE = 0.6; // triggers GAME_OVER if sustained
export const CHASER_CLOSE_IN_DURATION = 1.2; // seconds spent in CLOSING_IN before easing back
export const CHASER_DRAMA_TIMESCALE = 0.4; // time-dip multiplier during closing-in beat
export const CHASER_DRAMA_BEAT_DURATION = 0.4; // seconds of the time-dip

// --- Scoring ---
export const SCORE_PER_SECOND = 10; // base distance/survival score rate

// --- Camera ---
export const CAMERA_OFFSET = { x: 0, y: 3.2, z: 6 };
export const CAMERA_LOOKAHEAD = { x: 0, y: 1, z: -4 };
export const CAMERA_PUNCH_IN_Z = 4.2; // camera z during chaser drama beat

// --- Performance ---
export const MAX_DPR: [number, number] = [1, 1.5];
