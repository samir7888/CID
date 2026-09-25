import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId } = await auth();
  const { pathname } = request.nextUrl;

  // Define protected API routes that require authentication
  const protectedApiRoutes = [
    "/api/profile",
    "/api/select-character",
    "/api/unlock-character",
    "/api/continue-run",
    "/api/checkout",
  ];

  // Define protected page routes
  const protectedPageRoutes = ["/character"];

  // Check if current path is protected
  const isProtectedApi = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedPage = protectedPageRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected pages to login
  if (isProtectedPage && !userId) {
    const signInUrl = new URL("/login", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Return 401 for protected API routes without auth
  if (isProtectedApi && !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create response
  const response = NextResponse.next();

  // For public routes (homepage, game, etc.), ensure they're crawlable
  const publicRoutes = [
    "/",
    "/game",
    "/pink-coins",
    "/login",
    "/sign-up",
    "/success",
    "/failure",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute || (!isProtectedApi && !isProtectedPage)) {
    response.headers.set("X-Robots-Tag", "index, follow");
    // Remove any noindex headers
    response.headers.delete("X-Robots-Tag-noindex");
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, but run for all pages and API routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
