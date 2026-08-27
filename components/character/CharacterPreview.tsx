"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";
import type { CharacterDefinition } from "@/lib/game/characters";

export default function CharacterPreview({ character, loadModel = true }: { character: CharacterDefinition; loadModel?: boolean }) {
    const shouldLoadModel = Boolean(character.modelPath && loadModel);
    const [modelReady, setModelReady] = useState(false);

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
                ) : character.modelPath && <ModelPreview path={character.modelPath!}
                    scale={character.modelScale} yOffset={character.modelYOffset} onLoaded={() => setModelReady(true)} />
                }
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



