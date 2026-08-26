"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";
import type { CharacterDefinition } from "@/lib/game/characters";

export default function CharacterPreview({ character, loadModel = true }: { character: CharacterDefinition; loadModel?: boolean }) {
    const shouldLoadModel = Boolean(character.modelPath && loadModel);
    const [modelReady, setModelReady] = useState(false);
    const { progress } = useProgress();

    useEffect(() => {
        setModelReady(false);
    }, [character.id, shouldLoadModel]);

    return (
        <div className="character-preview-stage">
            <Canvas camera={{ position: [0, 1.05, 3.2], fov: 34 }} dpr={[1, 1.5]}>
                <ambientLight intensity={1.7} />
                <directionalLight position={[2, 4, 3]} intensity={2.5} />
                {shouldLoadModel ? (
                    <ModelPreview path={character.modelPath!} scale={character.modelScale} yOffset={character.modelYOffset} onLoaded={() => setModelReady(true)} />
                ) : character.modelPath ? <PreviewPlaceholder /> : <AgentPreview />}
            </Canvas>
            {shouldLoadModel && !modelReady && (
                <div className="character-download-status" role="status">
                    DOWNLOADING
                </div>
            )}
        </div>
    );
}

function ModelPreview({ path, scale = 1, yOffset = 0, onLoaded }: { path: string; scale?: number; yOffset?: number; onLoaded: () => void }) {
    const { scene } = useGLTF(path);
    const groupRef = useRef<THREE.Group>(null);
    useEffect(() => {
        onLoaded();
    }, [onLoaded]);
    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.35;
    });
    return <group ref={groupRef}><primitive object={scene} scale={scale} position={[0, yOffset - 0.9, 0]} rotation={[0, Math.PI, 0]} /></group>;
}

function AgentPreview() {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current) groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.04;
    });
    return (
        <group ref={groupRef} position={[0, -0.55, 0]} scale={0.72}>
            <mesh castShadow position={[0, 0.88, 0]}><capsuleGeometry args={[0.28, 0.58, 6, 12]} /><meshStandardMaterial color="#d95b35" /></mesh>
            <mesh castShadow position={[0, 1.58, 0]}><sphereGeometry args={[0.23, 16, 12]} /><meshStandardMaterial color="#b96f50" /></mesh>
            <mesh castShadow position={[0, 1.75, 0]} scale={[1.08, 0.42, 1.08]}><sphereGeometry args={[0.23, 16, 8]} /><meshStandardMaterial color="#171923" /></mesh>
            <mesh castShadow position={[0, 0.25, 0]}><boxGeometry args={[0.48, 0.28, 0.5]} /><meshStandardMaterial color="#26364d" /></mesh>
        </group>
    );
}

function PreviewPlaceholder() {
    return (
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.55, 1.15, 0.38]} />
            <meshStandardMaterial color="#26364d" roughness={0.8} />
        </mesh>
    );
}