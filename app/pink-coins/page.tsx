"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type { PinkCoinPackage } from "@/lib/game/inventory-types";

function formatPrice(priceMinor: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(priceMinor / 100);
}

export default function PinkCoinsPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PinkCoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();

  useEffect(() => {
    const load = async () => {
      if (!isLoaded) return;
      if (isSignedIn && clerkUser) {
        setUser({ id: clerkUser.id, email: clerkUser.primaryEmailAddress?.emailAddress });
      } else {
        setUser(null);
      }

      const response = await fetch("/api/packages");
      if (response.ok) {
        const pkgs = await response.json();
        setPackages(pkgs);
      }
      setLoading(false);
    };
    load();
  }, [isLoaded, isSignedIn, clerkUser]);

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
      window.location.assign(data.url);
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
        ) : packages.length === 0 ? (
          <p className="commerce-message error" role="alert">
            No packages are available right now. Try again later.
          </p>
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
                      {formatPrice(pkg.price_minor, pkg.currency)}
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
                You&apos;ll be asked to log in when you click Buy.
              </p>
            )}
          </>
        )}

        <button className="commerce-back" onClick={() => router.back()}>← BACK</button>
      </section>
    </main>
  );
}
