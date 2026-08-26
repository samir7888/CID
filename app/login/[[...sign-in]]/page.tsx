"use client";

import { Suspense, useEffect } from "react";
import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

function safeRedirect(value: string | null) {
  return value?.startsWith("/") ? value : "/game";
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#f4b942",
    colorBackground: "#12181a",
    colorText: "#f8f4e8",
    colorTextSecondary: "#9da6a8",
    colorInputBackground: "#0e1314",
    colorInputText: "#f8f4e8",
    borderRadius: "0.5rem",
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace(redirectTo);
  }, [isLoaded, isSignedIn, redirectTo, router]);

  return (
    <main className="commerce-page">
      <section className="commerce-panel login-panel">
        <div className="game-kicker">C.I.D. / SECURE ACCESS</div>
        <h1 className="commerce-title">SIGN IN TO RUN</h1>
        <p className="commerce-copy">
          Continue with Google, GitHub, or email. Clerk handles the OAuth handshake.
        </p>
        <SignIn
          path="/login"
          routing="path"
          forceRedirectUrl={redirectTo}
          fallbackRedirectUrl={redirectTo}
          signUpUrl="/sign-up"
          appearance={clerkAppearance}
        />
        <button className="commerce-back" onClick={() => router.push(redirectTo)}>
          ← BACK
        </button>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="commerce-page">
          <section className="commerce-panel login-panel">
            <div className="game-kicker">C.I.D. / SECURE ACCESS</div>
            <h1 className="commerce-title">SIGN IN TO RUN</h1>
            <p className="commerce-copy">Loading sign-in…</p>
          </section>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
