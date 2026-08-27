"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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

export default function SignUpPage() {
  const router = useRouter();
  return (
    <main className="commerce-page">
      <section className="commerce-panel login-panel">
        <div className="game-kicker">C.I.D. / SECURE ACCESS</div>
        <h1 className="commerce-title">CREATE ACCESS</h1>
        <p className="commerce-copy">
          Sign up with OAuth or email so your Pink Coins and roster stay on this account.
        </p>
        <SignUp
          path="/sign-up"
          routing="path"
          forceRedirectUrl="/game"
          fallbackRedirectUrl="/game"
          signInUrl="/login"
          appearance={clerkAppearance}
        />
        <button className="commerce-back" onClick={() => router.replace("/login")}>
          ← BACK TO SIGN IN
        </button>
      </section>
    </main>
  );
}
