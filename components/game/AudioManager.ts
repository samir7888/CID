import type { SoundId } from "@/lib/game/types";
import { Howl, Howler } from "howler";

// ============================================================
// Centralized audio manager using Howler.js.
// All sounds go through here — no component imports Howler directly.
// Gracefully skips if no audio files exist (MVP mode).
// Must be initialized after a user interaction to satisfy mobile
// autoplay restrictions.
// ============================================================

let initialized = false;

// Sound instances — lazily created
const sounds: Partial<Record<SoundId, Howl>> = {};

// Volume channels
let musicVolume = 0.4;
let sfxVolume = 0.8;
let duringPlayingSound: Howl | null = null;
let duringPlayingTimer: ReturnType<typeof setTimeout> | null = null;
let duringPlayingActive = false;

const SOUND_PATHS: Record<SoundId, string[]> = {
  coin: ["/sounds/collecting-coin/chodu-cid-chut.mp3"],
  jump: ["/sounds/during-playing/chodu-cid-ek-baar.mp3"],
  land: ["/sounds/during-playing/chodu-cid-jhaat.mp3"],
  collision: ["/sounds/after-caught/chodu-cid-rapta.mp3"],
  footstep: ["/sounds/during-playing/chodu-cid-pakad-le.mp3"],
  chaserWarning: ["/sounds/during-playing/chodu-cid-ek-baar.mp3"],
  chaserVoice: [
    "/sounds/during-playing/chodu-cid-ek-baar.mp3",
    "/sounds/during-playing/chodu-cid-jhaat.mp3",
    "/sounds/during-playing/chodu-cid-pakad-le.mp3",
    "/sounds/during-playing/chodu-cid-teri-maiya.mp3",
  ],
  gameOver: [
    "/sounds/after-caught/chodu-cid-rapta.mp3",
    "/sounds/after-caught/whoooooo-yeleeee-laudeeee_Nk6JpCP.mp3",
  ],
  menuSelect: ["/sounds/before-playing/cid-song.mp3"],
  menuMusic: ["/sounds/before-playing/cid-song.mp3"],
  musicLoop: [],
};

const DURING_PLAYING_PATHS = [
  "/sounds/during-playing/chodu-cid-ek-baar.mp3",
  "/sounds/during-playing/chodu-cid-jhaat.mp3",
  "/sounds/during-playing/chodu-cid-pakad-le.mp3",
  "/sounds/during-playing/chodu-cid-teri-maiya.mp3",
];

const MUSIC_SOUNDS: SoundId[] = ["menuMusic", "musicLoop"];
const LOOP_SOUNDS: SoundId[] = ["menuMusic", "footstep"];
const ONE_SHOT_COOLDOWNS: Partial<Record<SoundId, number>> = {
  chaserVoice: 2500,
};
const lastPlayedAt: Partial<Record<SoundId, number>> = {};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function clearDuringPlayingTimer() {
  if (duringPlayingTimer) clearTimeout(duringPlayingTimer);
  duringPlayingTimer = null;
}

function playDuringPlayingSound() {
  if (!initialized || !duringPlayingActive || duringPlayingSound?.playing())
    return;

  duringPlayingSound = new Howl({
    src: [pickRandom(DURING_PLAYING_PATHS)],
    volume: musicVolume,
    onend: () => {
      duringPlayingSound = null;
      if (!duringPlayingActive) return;
      const delay = 2000 + Math.random() * 1000;
      duringPlayingTimer = setTimeout(() => {
        duringPlayingTimer = null;
        playDuringPlayingSound();
      }, delay);
    },
    onloaderror: () => {
      duringPlayingSound = null;
    },
  });
  duringPlayingSound.play();
}

function getOrCreateSound(id: SoundId): Howl | null {
  if (sounds[id]) return sounds[id]!;

  const isMusic = MUSIC_SOUNDS.includes(id);
  const isLoop = LOOP_SOUNDS.includes(id);

  const sound = new Howl({
    src: [pickRandom(SOUND_PATHS[id])],
    volume: isMusic ? musicVolume : sfxVolume,
    loop: isLoop,
    onloaderror: () => {},
  });

  sounds[id] = sound;
  return sound;
}

const AudioManager = {
  init() {
    if (initialized || typeof window === "undefined") return;
    initialized = true;
    // Howler is auto-initialized on import; just mark ready
    Howler.volume(1);
  },

  playSound(id: SoundId) {
    if (!initialized) return;

    if (id === "musicLoop" || id === "chaserWarning" || id === "chaserVoice") {
      duringPlayingActive = true;
      playDuringPlayingSound();
      return;
    }

    const sound = getOrCreateSound(id);
    if (!sound) return;

    // Don't restart looping sounds already playing
    if (LOOP_SOUNDS.includes(id) && sound.playing()) return;

    const cooldown = ONE_SHOT_COOLDOWNS[id];
    const now = performance.now();
    if (cooldown && sound.playing()) return;
    if (cooldown && now - (lastPlayedAt[id] ?? -Infinity) < cooldown) return;

    if (cooldown) lastPlayedAt[id] = now;
    sound.play();
  },

  stopSound(id: SoundId) {
    if (id === "musicLoop" || id === "chaserWarning" || id === "chaserVoice") {
      duringPlayingActive = false;
      clearDuringPlayingTimer();
      duringPlayingSound?.stop();
      duringPlayingSound = null;
      return;
    }
    sounds[id]?.stop();
  },

  stopAll() {
    duringPlayingActive = false;
    clearDuringPlayingTimer();
    duringPlayingSound?.stop();
    duringPlayingSound = null;
    Object.values(sounds).forEach((s) => s?.stop());
    Object.keys(lastPlayedAt).forEach((id) => {
      delete lastPlayedAt[id as SoundId];
    });
  },

  setMusicVolume(v: number) {
    musicVolume = Math.max(0, Math.min(1, v));
    duringPlayingSound?.volume(musicVolume);
    MUSIC_SOUNDS.forEach((id) => sounds[id]?.volume(musicVolume));
  },

  setSfxVolume(v: number) {
    sfxVolume = Math.max(0, Math.min(1, v));
    Object.keys(sounds)
      .filter((id) => !MUSIC_SOUNDS.includes(id as SoundId))
      .forEach((id) => sounds[id as SoundId]?.volume(sfxVolume));
  },
};

export default AudioManager;
