import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://choducid2.vercel.app";
const SITE_NAME = "C.I.D. — Chodu Investigation Department";
const SITE_DESCRIPTION =
  "Play C.I.D. — the ultimate free browser game where ACP Pradyuman chases you through chaotic Indian streets! Dodge obstacles, collect pink chuts, unlock CID characters and survive as long as you can in this addictive 3D endless runner.";

// Force indexing to be enabled - remove any conditional logic that might prevent it

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "C.I.D. Game — Play Free Chodu CID Endless Runner Online",
    template: "%s | C.I.D. Game",
  },

  description: SITE_DESCRIPTION,

  keywords: [
    "chodu cid game",
    "cid game",
    "cid game online",
    "play cid game free",
    "ACP Pradyuman game",
    "ACP Pradyuman run game",
    "endless runner Indian game",
    "3D browser game India",
    "CID TV show game",
    "chodu investigation department",
    "cid run game",
    "Indian street runner game",
    "dodge obstacles game browser",
    "free online game India",
    "ACP Pradyuman chase game",
    "Daya cid game",
    "modi cid game",
    "pink chuts game",
  ],

  authors: [{ name: "Chodu CID Team" }],
  creator: "Chodu CID Team",
  publisher: "Chodu CID Team",

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "C.I.D. Game — Play Free Chodu CID Endless Runner Online",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "C.I.D. Game — Run from ACP Pradyuman!",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "C.I.D. Game — Run from ACP Pradyuman! Free Online 3D Game",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },

  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },

  manifest: "/manifest.webmanifest",

  alternates: {
    canonical: SITE_URL,
  },

  category: "games",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en-IN">
        <body className="bg-zinc-950 text-white antialiased">
          <JsonLd />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
