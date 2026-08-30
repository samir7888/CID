"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import GreenEnvironment from "./GreenEnvironment";

// ============================================================
// Environment Controller:
// Supports "dynamic" (smoothly alternates between Green Fields &
// City Street every 2000 score points) as well as fixed "green" and "city".
// Smoothly cross-fades scenery, Three.js fog, and background colors.
// ============================================================

export type EnvironmentTheme = "dynamic" | "green" | "city";

interface EnvironmentProps {
  theme?: EnvironmentTheme;
  isMobile?: boolean;
  active?: boolean;
  score?: number;
  timescale?: number;
}

export function getActiveThemeForScore(
  score: number,
  baseTheme: EnvironmentTheme = "dynamic",
): "green" | "city" {
  if (baseTheme === "green") return "green";
  if (baseTheme === "city") return "city";

  // Dynamic mode: Alternates every 2000 score points
  // 0 - 1999: Green Fields
  // 2000 - 3999: City Street
  // 4000 - 5999: Green Fields
  // 6000 - 7999: City Street ...
  const cycle = Math.floor(score / 2000);
  return cycle % 2 === 0 ? "green" : "city";
}

export default function Environment({
  theme = "dynamic",
  isMobile = false,
  active = true,
  score = 0,
  timescale = 1,
}: EnvironmentProps) {
  // 1 = 100% Green Fields, 0 = 100% City Street
  const greenWeightRef = useRef(theme === "city" ? 0 : 1);

  useFrame(() => {
    const targetTheme = getActiveThemeForScore(score, theme);
    const targetWeight = targetTheme === "green" ? 1 : 0;

    // Smooth continuous lerp (approx 1.5s visual blend)
    greenWeightRef.current = THREE.MathUtils.lerp(
      greenWeightRef.current,
      targetWeight,
      0.035,
    );
  });

  const greenWeight = greenWeightRef.current;
  const cityWeight = 1 - greenWeight;

  return (
    <>
      {/* Dynamic atmospheric color controller for Fog & Scene Background */}
      <AtmosphereController greenWeight={greenWeight} />

      {/* Green Fields Environment */}
      {greenWeight > 0.005 && (
        <GreenEnvironment
          isMobile={isMobile}
          active={active}
          score={score}
          timescale={timescale}
          weight={greenWeight}
        />
      )}

      {/* City / Street Environment */}
      {cityWeight > 0.005 && (
        <CityEnvironment
          isMobile={isMobile}
          weight={cityWeight}
        />
      )}
    </>
  );
}

// ============================================================
// Atmosphere Controller: Smoothly interpolates WebGL Background & Fog
// ============================================================

function AtmosphereController({ greenWeight }: { greenWeight: number }) {
  const { scene } = useThree();

  const greenBg = useMemo(() => new THREE.Color("#122615"), []);
  const cityBg = useMemo(() => new THREE.Color("#1a1a2e"), []);
  const greenFog = useMemo(() => new THREE.Color("#162e19"), []);
  const cityFog = useMemo(() => new THREE.Color("#1a1a2e"), []);

  const currentBg = useRef(new THREE.Color("#122615"));
  const currentFog = useRef(new THREE.Color("#162e19"));

  useFrame(() => {
    const targetBg = cityBg.clone().lerp(greenBg, greenWeight);
    const targetFog = cityFog.clone().lerp(greenFog, greenWeight);

    currentBg.current.lerp(targetBg, 0.05);
    currentFog.current.lerp(targetFog, 0.05);

    if (scene.fog) {
      scene.fog.color.copy(currentFog.current);
    }
    if (scene.background && scene.background instanceof THREE.Color) {
      scene.background.copy(currentBg.current);
    }
  });

  return null;
}

// ============================================================
// City / Urban Environment with Smooth Vertical Rise / Sink Transition
// ============================================================

interface CityEnvironmentProps {
  isMobile?: boolean;
  weight?: number;
}

function CityEnvironment({ isMobile = false, weight = 1 }: CityEnvironmentProps) {
  const safeWeight = Math.max(0, Math.min(1, weight));

  return (
    <group
      position={[0, (1 - safeWeight) * -14, 0]}
      scale={[1, THREE.MathUtils.lerp(0.1, 1, safeWeight), 1]}
    >
      {/* Ground plane extending far ahead */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -100]} receiveShadow>
        <planeGeometry args={[60, 250]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>

      {/* Sidewalks */}
      <mesh position={[-4.5, 0.05, -100]} receiveShadow>
        <boxGeometry args={[2, 0.1, 250]} />
        <meshStandardMaterial color="#888880" />
      </mesh>
      <mesh position={[4.5, 0.05, -100]} receiveShadow>
        <boxGeometry args={[2, 0.1, 250]} />
        <meshStandardMaterial color="#888880" />
      </mesh>

      {/* Buildings — left side */}
      {BUILDING_DATA_LEFT.map((b) => (
        <mesh key={b.key} position={b.pos} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={b.color} />
        </mesh>
      ))}

      {/* Buildings — right side */}
      {BUILDING_DATA_RIGHT.map((b) => (
        <mesh key={b.key} position={b.pos} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={b.color} />
        </mesh>
      ))}

      {/* Streetlight poles — left */}
      {POLE_ZS.filter((_, index) => !isMobile || index % 2 === 0).map((z) => (
        <group key={`pl${z}`} position={[-5.5, 0, z]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 4, 6]} />
            <meshStandardMaterial color="#666" />
          </mesh>
          <mesh position={[0.4, 3.8, 0]}>
            <boxGeometry args={[0.8, 0.15, 0.15]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          <pointLight position={[0.4, 3.6, 0]} intensity={isMobile ? 3 : 6} distance={12} color="#ffe8a0" />
        </group>
      ))}

      {/* Streetlight poles — right */}
      {POLE_ZS.filter((_, index) => !isMobile || index % 2 === 0).map((z) => (
        <group key={`pr${z}`} position={[5.5, 0, z]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 4, 6]} />
            <meshStandardMaterial color="#666" />
          </mesh>
          <mesh position={[-0.4, 3.8, 0]}>
            <boxGeometry args={[0.8, 0.15, 0.15]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          <pointLight position={[-0.4, 3.6, 0]} intensity={isMobile ? 3 : 6} distance={12} color="#ffe8a0" />
        </group>
      ))}
    </group>
  );
}

// ---- Static city scene data ----

const BUILDING_COLORS = [
  "#c4a882", "#d4956a", "#b8c4a0", "#a0b4c0",
  "#cc9966", "#b0a878", "#c8b48c", "#9aabba",
];

function buildingData(side: "left" | "right") {
  const xBase = side === "left" ? -9 : 9;
  return Array.from({ length: 16 }, (_, i) => {
    const z = -10 - i * 14;
    const width = 6 + (i % 3) * 2;
    const height = 4 + (i % 5) * 2;
    const depth = 5;
    const color = BUILDING_COLORS[i % BUILDING_COLORS.length];
    const xOff = side === "left" ? -width / 2 : width / 2;
    return {
      key: `${side}-${i}`,
      pos: [xBase + xOff, height / 2, z] as [number, number, number],
      size: [width, height, depth] as [number, number, number],
      color,
    };
  });
}

const BUILDING_DATA_LEFT = buildingData("left");
const BUILDING_DATA_RIGHT = buildingData("right");

const POLE_ZS = Array.from({ length: 20 }, (_, i) => -5 - i * 12);
