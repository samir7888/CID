"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/db/supabase";

export default function SuccessPage() {
    const router = useRouter();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [pollingCount, setPollingCount] = useState(0);
    const maxPolls = 60; // Poll for up to 60 seconds (every 1 second)

    useEffect(() => {
        const supabase = createBrowserSupabase();
        let interval: ReturnType<typeof setInterval> | null = null;

        const pollBalance = async () => {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) {
                    router.push("/login?redirect=/success");
                    return;
                }

                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("pink_coin_balance")
                    .eq("id", user.id)
                    .single();

                if (!profileError && profile) {
                    setBalance(profile.pink_coin_balance);
                    // If balance > 0, coins have been credited
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
    }, [router]);

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
