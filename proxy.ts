import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default clerkMiddleware((auth, request: NextRequest) => {
  // Create a response
  const response = NextResponse.next();

  // Force indexing by setting proper X-Robots-Tag header
  // This will override any noindex headers set by Vercel or other sources
  response.headers.set("X-Robots-Tag", "index, follow");

  // Remove any potential noindex headers
  response.headers.delete("X-Robots-Tag-noindex");

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
