import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Debug - C.I.D. Game",
  robots: {
    index: true,
    follow: true,
  },
};

export default function SEODebugPage() {
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "monospace",
        background: "#000",
        color: "#0f0",
      }}
    >
      <h1>SEO Debug Information</h1>

      <h2>Environment Variables:</h2>
      <pre>{JSON.stringify(envInfo, null, 2)}</pre>

      <h2>Expected Meta Tags:</h2>
      <ul>
        <li>robots: index, follow</li>
        <li>googlebot: index, follow</li>
        <li>No noindex tags should be present</li>
      </ul>

      <h2>Check Page Source:</h2>
      <p>
        View page source to verify no &lt;meta name="robots"
        content="noindex"&gt; tags exist
      </p>

      <h2>Common Fixes:</h2>
      <ul>
        <li>Ensure NEXT_PUBLIC_SITE_URL is set correctly in production</li>
        <li>
          Check if VERCEL_ENV=preview is causing issues (should only affect
          preview deployments)
        </li>
        <li>Verify no middleware is adding noindex headers</li>
        <li>Clear Google Search Console cache and resubmit</li>
      </ul>
    </div>
  );
}
