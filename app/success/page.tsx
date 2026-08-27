"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function SuccessPage() {
    const router = useRouter();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const pollingCount = useRef(0);
    const maxPolls = 60; // Poll for up to 60 seconds (every 1 second)
    const { isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            router.push("/login?redirect=/success");
            return;
        }

        let interval: ReturnType<typeof setInterval> | null = null;

        const pollBalance = async () => {
            try {
                const response = await fetch("/api/profile");
                if (response.status === 401) {
                    router.push("/login?redirect=/success");
                    return;
                }
                if (response.ok) {
                    const profile = await response.json();
                    setBalance(profile.pink_coin_balance);
                    if (profile.pink_coin_balance > 0) {
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error("Balance polling error:", err);
            }

            pollingCount.current += 1;
            if (pollingCount.current >= maxPolls) {
                if (interval) clearInterval(interval);
                setLoading(false);
            }
        };

        // Poll immediately
        pollBalance();

        // Then poll every 1 second
        interval = setInterval(pollBalance, 1000);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoaded, isSignedIn, router]);

    return (
        <main className="commerce-page">
            <section className="commerce-panel success-panel">
                <div className="game-kicker">C.I.D. / TRANSACTION</div>
                <h1 className="commerce-title">
                    {loading ? "PROCESSING PAYMENT" : "COINS RECEIVED!"}
                </h1>

                {loading ? (
                    <>
                        <p className="commerce-copy">
                            Your payment is being processed. Your Pink Coins will appear in a moment…
                        </p>
                        <div className="commerce-loading">
                            <div className="commerce-loading-bar"><span /></div>
                            <p className="commerce-loading-text">Waiting for confirmation…</p>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="commerce-copy">
                            Your purchase is complete! {balance !== null ? `You now have ${balance.toLocaleString()} Pink Coins.` : ""}
                        </p>
                        <div className="commerce-success-action">
                            <div className="game-score-milestone" role="status">
                                <div className="game-score-milestone-title">TRANSACTION COMPLETE</div>
                                <div className="game-score-milestone-value">✓</div>
                            </div>
                        </div>
                    </>
                )}

                <div className="commerce-actions">
                    <Link href="/pink-coins" className="game-primary-action">
                        → BROWSE CHARACTERS
                    </Link>
                    <Link href="/game" className="game-secondary-action">
                        BACK TO GAME
                    </Link>
                </div>
            </section>
        </main>
    );
}
