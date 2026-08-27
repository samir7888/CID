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
    colorBackground: "#182426",
    colorText: "#f8f4e8",
    colorTextSecondary: "#c4c9bd",
    colorInputBackground: "#f3f0df",
    colorInputText: "#182426",
    borderRadius: "0.125rem",
  },
  elements: {
    card: {
      backgroundColor: "#182426",
      border: "1px solid rgba(248, 244, 232, 0.18)",
      boxShadow: "none",
    },
    headerTitle: {
      color: "#f8f4e8",
      fontFamily: "'Barlow Condensed', Impact, sans-serif",
      fontSize: "2rem",
      letterSpacing: "0.04em",
    },
    headerSubtitle: { color: "#c4c9bd" },
    formFieldLabel: { color: "#f4b942" },
    formFieldInput: {
      color: "#182426",
      backgroundColor: "#f3f0df",
      border: "2px solid #c4c9bd",
    },
    formFieldInputShowPasswordButton: { color: "#536466" },
    formFieldAction: { color: "#ffb84d" },
    formButtonPrimary: {
      color: "#182426",
      backgroundColor: "#f4b942",
      fontWeight: "800",
      letterSpacing: "0.08em",
    },
    socialButtonsBlockButton: {
      color: "#f8f4e8",
      backgroundColor: "#253536",
      border: "1px solid rgba(248, 244, 232, 0.3)",
    },
    socialButtonsBlockButtonText: { color: "#f8f4e8" },
    dividerLine: { backgroundColor: "rgba(248, 244, 232, 0.2)" },
    dividerText: { color: "#c4c9bd" },
    footerActionText: { color: "#c4c9bd" },
    footerActionLink: { color: "#ffb84d" },
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
        <button className="commerce-back" onClick={() => router.replace(redirectTo)}>
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
