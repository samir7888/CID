#!/usr/bin/env node

/**
 * Quick SEO checker script - focuses on X-Robots-Tag header
 * Run: node scripts/check-seo.js [URL]
 */

const https = require("https");
const http = require("http");

const url = process.argv[2] || "https://choducid2.vercel.app";

console.log(`Checking SEO headers for: ${url}\n`);

const client = url.startsWith("https:") ? https : http;

client
  .get(url, (res) => {
    console.log("=== HTTP HEADERS ===");

    // Check specifically for X-Robots-Tag header
    const robotsHeader = res.headers["x-robots-tag"];
    if (robotsHeader) {
      if (robotsHeader.includes("noindex")) {
        console.log("❌ FOUND NOINDEX IN X-ROBOTS-TAG HEADER:", robotsHeader);
      } else {
        console.log("✅ X-Robots-Tag header found:", robotsHeader);
      }
    } else {
      console.log(
        "ℹ️  No X-Robots-Tag header found (checking HTML meta tags...)"
      );
    }

    // Show all headers for debugging
    console.log("\nAll Response Headers:");
    Object.entries(res.headers).forEach(([key, value]) => {
      if (
        key.toLowerCase().includes("robot") ||
        key.toLowerCase().includes("index")
      ) {
        console.log(`${key}: ${value}`);
      }
    });

    let html = "";

    res.on("data", (chunk) => {
      html += chunk;
    });

    res.on("end", () => {
      console.log("\n=== HTML META TAGS ===");

      // Check for robots meta tags
      const robotsRegex = /<meta[^>]*name=["']robots["'][^>]*>/gi;
      const robotsTags = html.match(robotsRegex) || [];

      if (robotsTags.length === 0) {
        console.log("✅ No robots meta tags found (using default indexing)");
      } else {
        robotsTags.forEach((tag) => {
          if (tag.includes("noindex")) {
            console.log("❌ FOUND NOINDEX META TAG:", tag);
          } else {
            console.log("✅ Robots meta tag found:", tag);
          }
        });
      }

      console.log("\n=== DIAGNOSIS ===");
      if (robotsHeader && robotsHeader.includes("noindex")) {
        console.log("🔍 Issue: X-Robots-Tag header contains noindex");
        console.log("💡 Fix: Deploy the middleware.ts and vercel.json changes");
      } else if (robotsTags.some((tag) => tag.includes("noindex"))) {
        console.log("🔍 Issue: HTML meta tag contains noindex");
        console.log("💡 Fix: Check your metadata configuration");
      } else {
        console.log("✅ No obvious indexing issues found!");
        console.log(
          "ℹ️  If Google still shows noindex, wait 24-48 hours or resubmit in Search Console"
        );
      }
    });
  })
  .on("error", (err) => {
    console.error("Error checking URL:", err.message);
  });
