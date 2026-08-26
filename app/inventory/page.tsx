"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/db/supabase";
import { CHARACTER_STORAGE_KEY } from "@/lib/game/characters";

export default function InventoryPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<InventoryCharacter[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedCharacters, setUnlockedCharacters] = useState<Set<string>>(new Set());
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserSupabase();

      // Get user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      let loadedUser: { id: string; email?: string } | null = null;
      let loadedUnlocked = new Set<string>();
      if (!authError && authUser) {
        loadedUser = authUser;
        setUser(authUser);

        // Get profile and unlocked characters
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        if (profileData) setProfile(profileData);

        const { data: userChars } = await supabase
          .from("user_characters")
          .select("character_id")
          .eq("user_id", authUser.id);
        if (userChars) {
          loadedUnlocked = new Set(userChars.map((uc) => uc.character_id));
          setUnlockedCharacters(loadedUnlocked);
        }
      }

      // Get all characters
      const { data: chars, error: charError } = await supabase
        .from("characters")
        .select("*");

      if (!charError && chars) {
        setCharacters(
          chars.map((c) => ({
            ...c,
            unlocked: loadedUser ? loadedUnlocked.has(c.id) || c.is_default : c.is_default,
          }))
        );
      }

      setLoading(false);
    };

    load();
  }, []);

  async function handleUnlock(characterId: string) {
    if (!user) {
      router.push(`/login?redirect=/inventory`);
      return;
    }

    setUnlocking(characterId);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/unlock-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unlock failed");
      }

      // Update unlocked set
      const newUnlocked = new Set(unlockedCharacters);
      newUnlocked.add(characterId);
      setUnlockedCharacters(newUnlocked);

      setSuccessMessage("Character unlocked!");
      setTimeout(() => setSuccessMessage(""), 3000);
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const nextProfile = await profileRes.json();
        setProfile((current) => current
          ? { ...current, pink_coin_balance: nextProfile.pink_coin_balance ?? current.pink_coin_balance }
          : current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUnlocking(null);
    }
  }

  async function handleSelect(characterId: string) {
    if (!user) {
      router.push(`/login?redirect=/inventory`);
      return;
    }

    setSelecting(characterId);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/select-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Selection failed");
      }

      // Update profile
      setProfile((p) => p ? { ...p, selected_character_id: characterId } : null);
      localStorage.setItem(CHARACTER_STORAGE_KEY, characterId);
      setSuccessMessage("Character selected!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Selection failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSelecting(null);
    }
  }

  return (
    <main className="commerce-page">
      <section className="commerce-panel inventory-panel">
        <div className="game-kicker">C.I.D. / AGENT DATABASE</div>
        <h1 className="commerce-title">CHARACTER INVENTORY</h1>
        <p className="commerce-copy">
          {user
            ? `You have ${profile?.pink_coin_balance || 0} Pink Coins. Unlock premium characters to customize your runs.`
            : "Browse our agent roster. Log in to unlock premium characters."}
        </p>

        {user && profile && (
          <div className="inventory-user-info">
            <div className="inventory-balance">
              <span className="coin-mark">◆</span>
              <span className="balance-value">{profile.pink_coin_balance.toLocaleString()}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="store-loading">Loading characters...</div>
        ) : (
          <>
            <div className="inventory-grid">
              {characters.map((character) => {
                const isUnlocked =
                  character.is_default || unlockedCharacters.has(character.id);
                const isSelected = profile?.selected_character_id === character.id;

                return (
                  <div
                    key={character.id}
                    className={`inventory-card ${isUnlocked ? "unlocked" : "locked"} ${isSelected ? "selected" : ""
                      }`}
                  >
                    {!isUnlocked && (
                      <div className="inventory-lock-badge">
                        <span className="lock-icon">🔒</span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="inventory-selected-badge">
                        <span className="checkmark">✓</span>
                      </div>
                    )}

                    <div className="inventory-card-content">
                      <h3 className="inventory-card-name">{character.name}</h3>
                      <p className="inventory-card-role">{character.description || ""}</p>

                      <div className="inventory-card-actions">
                        {isUnlocked ? (
                          <>
                            <button
                              onClick={() => handleSelect(character.id)}
                              disabled={selecting === character.id || isSelected}
                              className={`game-primary-action inventory-select-btn ${isSelected ? "selected" : ""
                                }`}
                            >
                              {selecting === character.id
                                ? "SELECTING..."
                                : isSelected
                                  ? "ACTIVE"
                                  : "SELECT"}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleUnlock(character.id)}
                            disabled={unlocking === character.id}
                            className="game-primary-action inventory-unlock-btn"
                          >
                            {unlocking === character.id
                              ? "UNLOCKING..."
                              : `UNLOCK (${character.cost}◆)`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <p className="commerce-message error" role="alert">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="commerce-message success" role="status">
                {successMessage}
              </p>
            )}

            {!user && (
              <p className="commerce-note">
                Log in to unlock and select premium characters.
              </p>
            )}
          </>
        )}

        <button className="commerce-back" onClick={() => router.back()}>
          ← BACK
        </button>
      </section>
    </main>
  );
}
