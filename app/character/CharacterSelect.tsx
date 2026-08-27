"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CHARACTERS, CHARACTER_STORAGE_KEY, DEFAULT_CHARACTER_ID } from "@/lib/game/characters";
import CharacterPreview from "@/components/character/CharacterPreview";
import Link from "next/link";

export default function CharacterSelect() {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState(DEFAULT_CHARACTER_ID);
    const [pinkCoinBalance, setPinkCoinBalance] = useState<number | null>(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set([DEFAULT_CHARACTER_ID]));
    const [saving, setSaving] = useState(false);
    const [showInsufficientCoins, setShowInsufficientCoins] = useState(false);
    const { isLoaded, isSignedIn: clerkSignedIn } = useUser();

    useEffect(() => {
        const savedCharacter = localStorage.getItem(CHARACTER_STORAGE_KEY);
        if (savedCharacter) setSelectedId(savedCharacter);

        const loadBalance = async () => {
            if (!isLoaded) return;
            if (!clerkSignedIn) {
                setIsSignedIn(false);
                setAuthChecked(true);
                return;
            }

            try {
                setIsSignedIn(true);
                const response = await fetch("/api/profile");
                if (response.ok) {
                    const profile = await response.json();
                    setPinkCoinBalance(profile.pink_coin_balance ?? 0);
                    if (profile.selected_character_id) {
                        setSelectedId(profile.selected_character_id);
                        localStorage.setItem(CHARACTER_STORAGE_KEY, profile.selected_character_id);
                    }
                    const next = new Set<string>([DEFAULT_CHARACTER_ID]);
                    (profile.owned_character_ids as string[] | undefined)?.forEach((id) => next.add(id));
                    setUnlockedIds(next);
                }
            } catch {
                // Offline/local selection remains available for the default roster.
            } finally {
                setAuthChecked(true);
            }
        };

        loadBalance();
    }, [isLoaded, clerkSignedIn]);

    const chooseCharacter = async (id: string) => {
        if (id === "agent") return;
        if (!authChecked) return;
        if (!isSignedIn) {
            router.push(`/login?redirect=${encodeURIComponent("/character")}`);
            return;
        }

        const character = CHARACTERS.find((item) => item.id === id);
        if (!character) return;

        setSaving(true);
        try {
            if (!unlockedIds.has(id)) {
                if ((pinkCoinBalance ?? 0) < character.unlockCost) {
                    setShowInsufficientCoins(true);
                    return;
                }

                const unlockResponse = await fetch("/api/unlock-character", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ characterId: id }),
                });
                if (unlockResponse.status === 402) {
                    setShowInsufficientCoins(true);
                    return;
                }
                if (!unlockResponse.ok) throw new Error("Unable to unlock character");
                setUnlockedIds((current) => new Set(current).add(id));
                setPinkCoinBalance((current) => (current ?? 0) - character.unlockCost);
            }

            const selectResponse = await fetch("/api/select-character", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ characterId: id }),
            });
            if (!selectResponse.ok) throw new Error("Unable to select character");
            setSelectedId(id);
            localStorage.setItem(CHARACTER_STORAGE_KEY, id);
        } catch {
            setShowInsufficientCoins(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="relative character-page">
            <header className="character-header">

                <div>
                    <div className="game-kicker">C.I.D. / FIELD OPERATIONS</div>
                    <h1 className="character-title">CHOOSE YOUR RUNNER</h1>
                </div>
                <div className="character-header-tools">
                    <div className="character-index">ROSTER / {String(CHARACTERS.length).padStart(2, "0")}</div>
                    <Link href="/pink-coins" className="character-coin-balance">
                        <span className="coin-mark">◆</span>
                        <span>
                            <small>PINK COINS</small>
                            <strong>{pinkCoinBalance === null ? 0 : pinkCoinBalance.toLocaleString()}</strong>
                        </span>
                        <span className="character-coin-buy">BUY +</span>
                    </Link>
                </div>
            </header>

            <section className="character-grid" aria-label="Available characters">
                {CHARACTERS.map((character) => {
                    const unlocked = unlockedIds.has(character.id);
                    return (
                        <button
                            key={character.id}
                            className={`character-card ${selectedId === character.id ? "is-selected" : ""} ${unlocked ? "" : "is-locked"}`}
                            onClick={() => chooseCharacter(character.id)}
                            aria-pressed={selectedId === character.id}
                        >
                            <div className="character-card-preview">
                                <CharacterPreview character={character} loadModel={selectedId === character.id} />
                                <span className="character-status">
                                    {selectedId === character.id ? "SELECTED" : unlocked ? "AVAILABLE" : "LOCKED"}
                                </span>
                                {!unlocked && (
                                    <>

                                        <div className="character-price-badge">{character.unlockCost} ◆</div>
                                    </>
                                )}
                            </div>
                            <div className="character-card-copy">
                                <div className="character-card-role">{character.role}</div>
                                <h2>{character.name}</h2>
                                {unlocked ? (
                                    <p>{character.description}</p>
                                ) : (
                                    <p className="character-unlock-text">Unlock for <strong>{character.unlockCost} Pink Coins</strong></p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </section>

            <footer className="character-footer">
                <span>ACTIVE OPERATIVE: {CHARACTERS.find((character) => character.id === selectedId)?.name}</span>
                <button className="game-primary-action" onClick={() => router.push("/game")} disabled={saving}>
                    {saving ? "SAVING..." : "RUN WITH THIS CHARACTER →"}
                </button>
            </footer>

            {showInsufficientCoins && (
                <div className="absolute inset-y-0 inset-x-0 bg-black h-fit w-fit p-12 mx-auto  character-modal-backdrop" role="presentation" onClick={() => setShowInsufficientCoins(false)}>
                    <section className=" h-fit px-4 py-5" role="dialog" aria-modal="true" aria-labelledby="insufficient-coins-title" onClick={(event) => event.stopPropagation()}>
                        <div className="game-kicker">ACCESS DENIED</div>
                        <h2 id="insufficient-coins-title">INSUFFICIENT PINK COINS</h2>
                        <p>You need more Pink Coins to unlock this operative.</p>
                        <div className="character-modal-actions">
                            <button className="game-primary-action" onClick={() => router.push("/pink-coins")}>BUY PINK COINS</button>
                            <button className="game-secondary-action" onClick={() => setShowInsufficientCoins(false)}>CLOSE</button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}
