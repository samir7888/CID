"use client";

// ============================================================
// Low-poly Indian street environment: buildings on both sides,
// streetlight poles, a gradient sky dome.
// All placeholder geometry — swap for GLTF models later.
// ============================================================

export default function Environment({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <group>
      {/* Sky / fog color is handled by the Canvas fog prop in Game.tsx */}

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

// ---- Static scene data ----

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
