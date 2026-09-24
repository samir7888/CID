"use client";

/**
 * Debugging component to help identify indexing issues
 * Only shows in development mode
 */
export default function IndexingDebug() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        background: "#000",
        color: "#0f0",
        padding: "10px",
        fontSize: "12px",
        fontFamily: "monospace",
        border: "1px solid #0f0",
        zIndex: 9999,
      }}
    >
      <div>ENV: {process.env.NODE_ENV}</div>
      <div>VERCEL_ENV: {process.env.NEXT_PUBLIC_VERCEL_ENV || "undefined"}</div>
      <div>SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL || "fallback"}</div>
      <div>Meta robots: index=true, follow=true</div>
    </div>
  );
}
