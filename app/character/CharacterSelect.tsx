"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CHARACTERS, CHARACTER_STORAGE_KEY, DEFAULT_CHARACTER_ID } from "@/lib/game/characters";
import CharacterPreview from "@/components/character/CharacterPreview";

export default function CharacterSelect() {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState(DEFAULT_CHARACTER_ID);

    useEffect(() => {
        const savedCharacter = localStorage.getItem(CHARACTER_STORAGE_KEY);
        if (savedCharacter) setSelectedId(savedCharacter);
    }, []);

    const chooseCharacter = (id: string) => {
        setSelectedId(id);
        localStorage.setItem(CHARACTER_STORAGE_KEY, id);
    };

    return (
        <main className="character-page">
            <header className="character-header">

                <div>
                    <div className="game-kicker">C.I.D. / FIELD OPERATIONS</div>
                    <h1 className="character-title">CHOOSE YOUR RUNNER</h1>
                </div>
                <div className="character-index">ROSTER / {String(CHARACTERS.length).padStart(2, "0")}</div>
            </header>

            <section className="character-grid" aria-label="Available characters">
                {CHARACTERS.map((character) => (
                    <button
                        key={character.id}
                        className={`character-card ${selectedId === character.id ? "is-selected" : ""}`}
                        onClick={() => chooseCharacter(character.id)}
                        aria-pressed={selectedId === character.id}
                    >
                        <div className="character-card-preview">
                            <CharacterPreview character={character} loadModel={selectedId === character.id} />
                            <span className="character-status">{selectedId === character.id ? "SELECTED" : "AVAILABLE"}</span>
                        </div>
                        <div className="character-card-copy">
                            <div className="character-card-role">{character.role}</div>
                            <h2>{character.name}</h2>
                            <p>{character.description}</p>
                        </div>
                    </button>
                ))}
            </section>

            <footer className="character-footer">
                <span>ACTIVE OPERATIVE: {CHARACTERS.find((character) => character.id === selectedId)?.name}</span>
                <button className="game-primary-action" onClick={() => router.push("/game")}>RUN WITH THIS CHARACTER →</button>
            </footer>
        </main>
    );
}
