"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function FailureContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const status = searchParams.get("status");
  const paymentId = searchParams.get("payment_id") || searchParams.get("paymentId");
  const errorMessage = searchParams.get("message") || searchParams.get("error");

  const isCancelled = reason === "cancelled" || status === "cancelled" || status === "canceled";

  return (
    <main className="commerce-page">
      <section className="commerce-panel failure-panel">
        <div className="game-kicker">C.I.D. / TRANSACTION {isCancelled ? "CANCELLED" : "FAILED"}</div>
        <h1 className="commerce-title failure-title">
          {isCancelled ? "PAYMENT CANCELLED" : "PAYMENT FAILED"}
        </h1>

        <div className="my-4">
          <p className="text-base font-bold text-zinc-300 max-w-xl leading-relaxed">
            {isCancelled
              ? "The checkout process was cancelled. No charges were made to your account."
              : errorMessage
                ? errorMessage
                : "We could not complete your transaction. If any amount was deducted from your account, it will be automatically refunded by your payment provider."}
          </p>

          <div className="commerce-failure-action my-6">
            <div className="gap-3 game-score-milestone failure-milestone flex" role="status">
              <div className="game-score-milestone-title">
                {isCancelled ? "CHECKOUT ABORTED" : "TRANSACTION INCOMPLETE"}
              </div>
              <div className="game-score-milestone-value">✕</div>
            </div>
          </div>


        </div>

        <div className="commerce-actions success-actions">
          <Link href="/pink-coins" replace className="game-primary-action">
            TRY AGAIN
          </Link>
          <Link href="/game" replace className="game-secondary-action">
            BACK TO THE GAME
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function FailurePage() {
  return (
    <Suspense
      fallback={
        <main className="commerce-page">
          <section className="commerce-panel failure-panel">
            <div className="game-kicker">C.I.D. / TRANSACTION</div>
            <h1 className="commerce-title">PAYMENT FAILED</h1>
          </section>
        </main>
      }
    >
      <FailureContent />
    </Suspense>
  );
}
