# Build a 3D Endless Runner Web Game: "D.I.D. — Dramatic Investigation Department"

You are an experienced web game developer and Three.js/React developer.

Build a mobile-first 3D endless runner game inspired by the _gameplay structure_ of Subway Surfers, but with completely original characters, assets, sounds, branding, and gameplay content.

## Theme

An Indian detective-drama parody, **not** using any real show's name, characters, or branding:

> "A wanted man is sprinting down a chaotic Indian street while a comically over-dramatic old-school detective chases him, blowing a whistle and yelling one-liners. The player switches between 3 lanes, jumps, slides, dodges obstacles, collects **'Daya Coins'**, and survives as long as possible before getting caught."

Keep it inspired-by, not a copy: no real show title, real character names, real logos, real music, or real dialogue. Original comedic voice throughout.

---

## 1. Technology Stack

- Next.js
- React
- TypeScript
- React Three Fiber
- Three.js
- @react-three/drei
- Howler.js for audio
- Rapier only if physics are actually needed
- Tailwind CSS for surrounding UI
- GLB/GLTF for 3D models

Clean, modular architecture. Must run in-browser on desktop, Android, and iOS. No backend/database for MVP.

---

## 2. Project Architecture

```
app/
├── page.tsx
├── game/
│   └── page.tsx

components/
└── game/
    ├── Game.tsx
    ├── Player.tsx
    ├── Chaser.tsx
    ├── Road.tsx
    ├── RoadChunk.tsx
    ├── Obstacle.tsx
    ├── Coin.tsx
    ├── Environment.tsx
    ├── GameManager.tsx
    ├── GameUI.tsx
    ├── MobileControls.tsx
    └── AudioManager.ts

lib/
└── game/
    ├── constants.ts
    ├── types.ts
    ├── collision.ts
    ├── difficulty.ts
    └── random.ts

public/
├── models/
├── textures/
├── sounds/
└── fonts/
```

---

## 3. Camera

Third-person, following from behind and slightly above. Player Z-position stays roughly fixed; the world moves toward the player (road chunks, obstacles, coins) to create forward motion. Recycle old objects/chunks — don't move the player thousands of units forward.

---

## 4. Three-Lane System

- Lane 0 = x: -2, Lane 1 = x: 0, Lane 2 = x: 2 (configurable spacing)
- Player auto-runs forward
- Left / Center / Right lane switching with smooth interpolation, never teleporting
- Hard-clamp movement inside the 3 lanes

---

## 5. Player

Placeholder capsule/box to start — idle, running, jumping, sliding, and falling/death states. Architecture must allow swapping in a GLB character later without a rewrite.

---

## 6. Controls

**Desktop (keyboard):** Arrow/WASD for left/right, Up/W/Space to jump, Down/S to slide.

**Mobile (touch):** Swipe left/right to change lanes, swipe up to jump, swipe down to slide. Tolerant swipe detection, prevent page scroll while playing, canvas fills the mobile viewport correctly.

---

## 7. Jump

Simple arcade jump — configurable height/duration, no realistic physics, collision detection while airborne.

---

## 8. Slide

Lowers collision height for a configurable duration, lets the player pass under certain obstacles, auto-returns to running.

---

## 9. Obstacles

Indian-street-inspired, placeholder primitives to start: handcart, auto-rickshaw, barricade, pothole, construction barrier, stray cow silhouette (generic, not tied to any real branding), parked scooter. Each obstacle: position, lane, width/height/depth, collision bounds, optional type. Procedural spawner — don't hand-place everything.

---

## 10. Collectibles — "Daya Coins"

Rotating, glowing, spawn-in-lane collectibles. Patterns: single, straight line, lane sequence, jumping-coin arc, zig-zag. On collection: increment counter/score, play sound, small VFX. Modular pattern system for adding more later.

_(Naming note: comedy here should come from the chase and the detective's over-the-top reactions, not from crude wordplay in the collectible name.)_

---

## 11. Collision System

Simple bounding-box/distance-based detection. Player-vs-obstacle → death state, stop movement, death animation, collision sound, game-over UI. Player-vs-coin → increment, remove, sound.

---

## 12. The Chaser — "ACP Pradyuman" (placeholder name)

A grizzled, overly dramatic detective placeholder character who:

- Runs behind the player
- Has simple states: `NORMAL → CLOSING_IN → FAR_BEHIND → PLAYER_HIT → GAME_OVER`
- Closes distance when the player fumbles (near-misses, slow reactions)
- Triggers comedic "dramatic zoom + freeze-frame" beats when he gets close (classic detective-drama parody beat — sudden camera punch-in, brief slow-mo, a sting sound effect) — this is the single biggest lever for making the chase _feel_ alive without complex AI
- No sophisticated AI needed — state machine is enough

**Flow polish suggestion:** every time the chaser transitions into `CLOSING_IN`, trigger a 300–500ms time-scale dip (not full pause) + whistle-blow SFX + a short camera shake. This reads as tension without hurting playability, and it's the core "detective drama" comedic beat the whole game should be built around.

---

## 13. Endless Road

Reusable, pooled road chunks (5+), recycled from back to front with new obstacle/coin patterns generated each recycle. No continuous create/destroy of hundreds of objects.

---

## 14. Environment

Low-poly Indian street feel: road, lane markings, sidewalks, generic buildings, trees, poles, shopfronts, background traffic. Placeholder-quality is fine for MVP; swap in better GLBs later.

---

## 15. Difficulty Curve

Progressive increase in world speed, obstacle frequency/combinations, coin pattern complexity, and chaser pressure. Example bands: 0–500 easy, 500–1500 medium, 1500–3000 hard, 3000+ very hard. Configurable constants, no sudden spikes.

---

## 16. Scoring

Distance + coins + survival time. Display score, coin count, current speed. Store best score in `localStorage`. No backend leaderboard yet.

---

## 17. Game States

`LOADING → MENU → (COUNTDOWN) → PLAYING → PAUSED / GAME_OVER`, restartable without page reload.

---

## 18. Audio System (Howler.js)

Centralized `AudioManager` with methods like `playSound("coin")`, `playSound("jump")`, `playSound("collision")`, `playSound("footstep")`, `playSound("chaserWarning")`, `playSound("gameOver")`. Separate channels for music, footsteps, jump/land, collection, collision, game-over, chaser-warning, near-miss tension, menu SFX. Respect mobile autoplay restrictions (start audio only after user interaction). Keep audio logic out of random components — all through the manager.

---

## 19. Contextual Sound Cues

- Normal running → ambient street music
- Player near an obstacle → tension sting
- Chaser closing in → whistle-blow / warning sting
- Coin collected → collection chime
- Crash → collision sound + comedic "caught!" stinger
- Game over → game-over jingle

Built so custom comedy SFX can be swapped in later without touching game logic.

---

## 20. UI

**Main Menu:**

```
D.I.D.
DRAMATIC INVESTIGATION DEPARTMENT

[ PLAY ]
```

**In-game HUD:** Score, Coins.

**Game Over:**

```
CAUGHT!

Score: 1234
Coins: 27
Best: 4521

[ PLAY AGAIN ]
[ MAIN MENU ]
```

HTML/React overlays for all UI text, not Three.js text rendering.

---

## 21. Mobile UI

Fully playable without a keyboard. First-run subtle swipe tutorial overlay (← → swipe, ↑ jump, ↓ slide) that doesn't block much of the screen.

---

## 22. Performance Requirements

Low-poly/GLB models, compressed assets, limited dynamic lights/shadows, no heavy post-processing, reused geometry/materials, object pooling, capped DPR (`dpr={[1, 1.5]}`), avoid React state for per-frame values, minimize re-renders. Target mid-range Android.

---

## 23. Responsive Rendering

Adapts to mobile portrait/landscape, tablet, desktop. No fixed-resolution assumptions.

---

## 24. Loading Screen

"Loading D.I.D. …" with progress if practical. No blank screen during asset load.

---

## 25. Code Quality

Proper TypeScript, clear interfaces, avoid `any`, no god-components — separate rendering, logic, input, collision, audio, UI, difficulty, and spawning. Comments only where non-obvious.

---

## 26. Development Phases

**Phase 1 (MVP core):** scene → camera → road → 3 lanes → placeholder player → auto-run → lane switching → jump → obstacle → collision → game over.

**Phase 2:** coins → score → endless road pooling → difficulty scaling.

**Phase 3:** chaser state machine + dramatic-zoom tension beats → character models/animations → fuller environment.

**Phase 4:** full audio system → mobile gesture polish → UI polish → loading screen → performance pass.

Don't move to the next phase until the current one is solid.

---

## 27. Placeholder Assets

Primitive geometry until real assets exist: player = capsule/box, chaser = differently-colored capsule/box, vehicles = boxes, coin = torus/cylinder, road = plane, buildings = boxes. Architecture should make swapping in real GLBs trivial.

---

## 28. Explicitly Out of Scope for MVP (future ideas only)

Multiple playable characters, multiple chasers, skins, power-ups (magnet/shield/speed), alternate environments, missions, achievements, online leaderboard, accounts, multiplayer, daily challenges, custom sound packs, ads/monetization.

---

## 29. Design Principle

Fast, funny, responsive, easy to understand, mobile-friendly, lightweight. Comedy comes from the chaser's over-the-top reactions, environment details, sound design, and near-miss drama beats — not mechanical complexity.

**Core loop:**
Run → Change lanes → Jump/Slide → Collect coins → Dodge obstacles → Chaser closes in → Speed increases → Caught → Game over → Try again

---

## 30. Files Already Implemented — Do Not Recreate, Wire Into These

The following files already exist in this project. **Read them before writing any other code.** Import from them — do not redefine constants, types, or logic that already live here, and do not change their exported function/type signatures without a clear reason.

### `lib/game/constants.ts`

All tunable numbers: lane positions (`LANE_POSITIONS`), lane switch speed, jump height/duration, slide duration, world speed range (`BASE_WORLD_SPEED`/`MAX_WORLD_SPEED`), road chunk sizing/pooling, obstacle spawn gaps, coin config, `DIFFICULTY_BANDS` (score thresholds → speed multiplier + chaser aggression), chaser distances (`CHASER_BASE_DISTANCE`/`CHASER_CLOSE_DISTANCE`/`CHASER_CATCH_DISTANCE`), the drama-beat timing (`CHASER_DRAMA_TIMESCALE`, `CHASER_DRAMA_BEAT_DURATION`), camera offsets, and `MAX_DPR`. Any new component that needs a magic number should import it from here instead of hardcoding it.

### `lib/game/types.ts`

Single source of truth for shapes: `Lane` (`0 | 1 | 2`), `GameState`, `PlayerAnimState` + `PlayerState`, `ChaserState` + `ChaserRuntimeState`, `ObstacleType` + `ObstacleConfig`, `CoinPattern` + `CoinConfig`, `RoadChunkData`, `DifficultyBand`, `ScoreState`, `SoundId`, `InputAction`. Every new file should import its types from here rather than inlining local interfaces for the same concepts.

### `lib/game/collision.ts`

Pure functions, no React/Three imports:

- `checkObstacleCollision(player: PlayerState, obstacles: ObstacleConfig[])` → returns the hit `ObstacleConfig` or `null`. Already handles slide-under logic (a `slideable` obstacle only blocks if the player isn't sliding).
- `checkCoinCollisions(player: PlayerState, coins: CoinConfig[])` → returns array of collected coin IDs.
- `isChaserCatchDistance(distanceBehind, catchDistance)` → boolean.
- `laneOverlapsExisting(lane, z, existingZs, minGap)` → spawner helper to avoid stacking objects.

`GameManager.tsx` should call `checkObstacleCollision`/`checkCoinCollisions` once per frame with the current player state and the active road chunk's obstacle/coin arrays — not reimplement box-overlap logic elsewhere.

### `lib/game/difficulty.ts`

- `getDifficultyBand(score)` → current `DifficultyBand` from `constants.ts`.
- `getWorldSpeed(score)` → the actual speed to move road/obstacles/coins this frame.
- `getChaserAggression(score)` → 0..1, feeds chaser beat frequency.
- `getChaserBaseDistance(score)` → shrinks as difficulty rises.
- `shouldTriggerCloseIn(score, randomRoll)` → used by `Chaser.tsx` each tick to decide whether to start a `CLOSING_IN` beat.
- `getObstacleSpawnGap(score, minGap, maxGap)` → feeds the road/obstacle spawner.

`Road.tsx`/`RoadChunk.tsx`/`Obstacle.tsx` should call `getWorldSpeed` and `getObstacleSpawnGap` rather than hardcoding speed or gap values.

### `lib/game/random.ts`

Seedable RNG (`mulberry32`) instead of raw `Math.random()`, so runs can be made reproducible later:

- `seedRng(seed)`, `randomFloat`, `randomInt`, `randomLane`, `randomLaneExcluding(exclude)`, `pickRandom`, `chance(probability)`.
- `randomObstacleType()`, `randomCoinPattern()`, `getCoinPatternOffsets(pattern)` — spawners should use these instead of ad-hoc random logic.

### `components/game/Player.tsx`

Already implements lane interpolation, jump arc, and slide, all driven through `useFrame` + refs (no per-frame React state, per the performance requirement). Placeholder capsule geometry — swap the `<mesh>`/`<capsuleGeometry>` for `<primitive object={gltf.scene} />` later without touching the motion logic. Props: `lane`, `jumpRequested`, `slideRequested`, `isDead`. **`GameManager.tsx` owns the input state and passes it down as props** — `Player.tsx` does not read input directly.

### `components/game/Chaser.tsx`

Implements the `NORMAL → CLOSING_IN → FAR_BEHIND → PLAYER_HIT → GAME_OVER` state machine described in section 12, using `getChaserAggression`/`getChaserBaseDistance`/`shouldTriggerCloseIn` from `difficulty.ts`. Exposes `onDramaBeat` (fires once when `CLOSING_IN` starts — this is the hook for the camera punch-in + time-dip + whistle SFX) and `onCatch` (fires when the chase should end the game). Props: `score`, `playerLaneX`, `playerHit`, `gameOver`. Placeholder capsule geometry, same swap-later pattern as `Player.tsx`.

### How the remaining pieces should connect

```
GameManager.tsx (owns GameState, score, input state)
  ├─ reads input (keyboard/swipe) → sets { lane, jumpRequested, slideRequested }
  ├─ calls getWorldSpeed(score) each frame → moves RoadChunk/Obstacle/Coin positions
  ├─ calls checkObstacleCollision / checkCoinCollisions each frame
  ├─ passes player state down to <Player />
  ├─ passes score + playerHit + gameOver down to <Chaser />
  ├─ on <Chaser onDramaBeat> → triggers camera punch-in (CAMERA_PUNCH_IN_Z) + time-dip
  │  (CHASER_DRAMA_TIMESCALE for CHASER_DRAMA_BEAT_DURATION) + AudioManager.playSound("chaserWarning")
  ├─ on <Chaser onCatch> → transitions GameState to GAME_OVER
  └─ renders <GameUI /> reading GameState/score, not game internals
```

Build `GameManager.tsx`, `Road.tsx`/`RoadChunk.tsx`, `Obstacle.tsx`, `Coin.tsx`, `Environment.tsx`, `GameUI.tsx`, `MobileControls.tsx`, and `AudioManager.ts` next, wiring into the files above rather than duplicating their logic.

---

## 31. First Implementation Requirement — Build ONLY This First

1. Next.js setup
2. React Three Fiber scene
3. Third-person camera
4. Three-lane road
5. Placeholder player
6. Auto-run illusion (world moves, not player)
7. Left/right lane switching
8. Jump
9. One obstacle type
10. Collision detection
11. Game-over state
12. Restart button
13. Basic score
14. Mobile swipe controls

After this MVP, explain clearly:

- What files were created and what each does
- How to run the game
- How to replace placeholder models
- How to add sounds
- How to change lane width
- How to change game speed
- How to change jump height
- How to add new obstacles

Prioritize a working, playable game over excessive architecture — don't over-engineer.
