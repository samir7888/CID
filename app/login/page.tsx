"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/db/supabase";

function safeRedirect(value: string | null) {
  return value?.startsWith("/") ? value : "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      const supabase = createBrowserSupabase();
      const go = (sessionPresent: boolean) => {
        if (!cancelled && sessionPresent) router.replace(redirectTo);
      };
      supabase.auth.getSession().then(({ data }) => go(Boolean(data.session)));
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        go(Boolean(session));
      });
      return () => {
        cancelled = true;
        subscription.unsubscribe();
      };
    } catch {
      return () => { cancelled = true; };
    }
  }, [redirectTo, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/login?redirect=${encodeURIComponent(redirectTo)}` },
    });
    setBusy(false);
    setMessage(error ? error.message : "Check your email for the sign-in link.");
  }

  return (
    <main className="commerce-page">
      <section className="commerce-panel login-panel">
        <div className="game-kicker">C.I.D. / SECURE ACCESS</div>
        <h1 className="commerce-title">SIGN IN TO RUN</h1>
        <p className="commerce-copy">Use your email to receive a one-tap access link. No password, no friction.</p>
        <form onSubmit={submit} className="commerce-form">
          <label htmlFor="email">EMAIL ADDRESS</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" />
          <button className="game-primary-action" disabled={busy}>{busy ? "SENDING..." : "EMAIL ME A LOGIN LINK"}</button>
        </form>
        {message && <p className="commerce-message" role="status">{message}</p>}
        <button className="commerce-back" onClick={() => router.push(redirectTo)}>← BACK</button>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="commerce-page">
        <section className="commerce-panel login-panel">
          <div className="game-kicker">C.I.D. / SECURE ACCESS</div>
          <h1 className="commerce-title">SIGN IN TO RUN</h1>
          <p className="commerce-copy">Loading sign-in…</p>
        </section>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
