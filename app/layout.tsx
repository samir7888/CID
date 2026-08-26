import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "C.I.D. — Chodu Investigation Department",
  description:
    "Run! ACP Pradyuman is chasing you down a chaotic Indian street. Dodge obstacles, collect chuts, and survive as long as you can.",
  keywords: ["game", "endless runner", "3D", "detective", "Indian street"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-zinc-950 text-white antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
