"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [pollingCount, setPollingCount] = useState(0);
    const maxPolls = 60; // Poll for up to 60 seconds (every 1 second)
    const { isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        const status = searchParams.get("status");
        if (status === "failed" || status === "cancelled" || status === "canceled" || status === "error") {
            router.replace(`/failure?${searchParams.toString()}`);
            return;
        }

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

            setPollingCount((prev) => {
                const next = prev + 1;
                if (next >= maxPolls) {
                    if (interval) clearInterval(interval);
                    setLoading(false);
                }
                return next;
            });
        };

        // Poll immediately
        pollBalance();

        // Then poll every 1 second
        interval = setInterval(pollBalance, 1000);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoaded, isSignedIn, router, searchParams]);

    return (
        <main className="commerce-page">
            <section className="commerce-panel success-panel">
                <div className="game-kicker">C.I.D. / TRANSACTION</div>
                <h1 className="commerce-title">
                    {loading ? "PROCESSING PAYMENT" : "COINS RECEIVED!"}
                </h1>

                {loading ? (
                    <>
                        <p className="commerce-copy success-copy">
                            Payment received. We are adding your Pink Coins now.
                        </p>
                        <div className="commerce-loading">
                            <div className="commerce-loading-bar"><span /></div>
                            <p className="commerce-loading-text">Waiting for confirmation…</p>
                        </div>
                    </>
                ) : (
                    <div className="my-4">
                        <p className=" text-base font-bold">
                            Purchase complete. {balance !== null ? `Balance: ${balance.toLocaleString()} Pink Coins.` : "Your coins are ready."}
                        </p>
                        <div className="commerce-success-action m-4">
                            <div className="gap-3 game-score-milestone flex " role="status">
                                <div className="game-score-milestone-title">TRANSACTION COMPLETE</div>
                                <div className="game-score-milestone-value">✓</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="commerce-actions success-actions">
                    <Link href="/game" replace className="game-primary-action">
                        Back to the Game
                    </Link>
                    <Link href="/character" replace className="game-secondary-action">
                        VIEW CHARACTERS
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default function SuccessPage() {
    return (
        <Suspense
            fallback={
                <main className="commerce-page">
                    <section className="commerce-panel success-panel">
                        <div className="game-kicker">C.I.D. / TRANSACTION</div>
                        <h1 className="commerce-title">PROCESSING PAYMENT</h1>
                    </section>
                </main>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
