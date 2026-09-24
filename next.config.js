/** @type {import('next').NextConfig} */
const nextConfig = {
  // Move it out of experimental
  allowedDevOrigins: ["hug-likewise-captive.ngrok-free.dev"],

  // Ensure proper headers for SEO
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
