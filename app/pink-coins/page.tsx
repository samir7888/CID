"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/db/supabase";
import type { PinkCoinPackage } from "@/lib/game/inventory-types";

export default function PinkCoinsPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PinkCoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserSupabase();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!authError) setUser(user);

      const { data: pkgs, error: pkgError } = await supabase
        .from("pink_coin_packages")
        .select("*")
        .eq("active", true)
        .order("price_minor");
      if (!pkgError && pkgs) setPackages(pkgs);
      setLoading(false);
    };
    load();
  }, []);

  async function handleBuy(packageId: string) {
    if (!user) {
      router.push(`/login?redirect=/pink-coins`);
      return;
    }

    setCheckingOut(packageId);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setCheckingOut(null);
    }
  }

  return (
    <main className="commerce-page">
      <section className="commerce-panel store-panel">
        <div className="game-kicker">C.I.D. / COSMETICS</div>
        <h1 className="commerce-title">PINK COINS</h1>
        <p className="commerce-copy">Unlock premium characters and cosmetics with Pink Coins. Purchase now, enjoy forever.</p>

        {loading ? (
          <div className="store-loading">Loading packages...</div>
        ) : (
          <>
            <div className="store-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} className="store-card">
                  <div className="store-coin-badge">
                    <span className="coin-mark">◆</span>
                    <span>{pkg.pink_coins}</span>
                  </div>
                  <div className="store-card-content">
                    <h3 className="store-card-name">{pkg.name}</h3>
                    <div className="store-card-price">
                      ${(pkg.price_minor / 100).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleBuy(pkg.id)}
                      disabled={checkingOut === pkg.id}
                      className="game-primary-action store-buy-btn"
                    >
                      {checkingOut === pkg.id ? "PROCESSING..." : "BUY NOW"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {error && <p className="commerce-message error" role="alert">{error}</p>}
            {!user && (
              <p className="commerce-note">
                You'll be asked to log in when you click Buy.
              </p>
            )}
          </>
        )}

        <button className="commerce-back" onClick={() => router.back()}>← BACK</button>
      </section>
    </main>
  );
}
