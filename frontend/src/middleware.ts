import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

// List of public routes that don't require authentication
const publicRoutes = ["/", "/auth"];

// List of protected routes that actually exist in the app
const protectedRoutes = [
  "/chat",
  "/game",
  "/tournaments",
  "/settings",
  "/profile",
];

// Combine all valid routes
const validRoutes = [...publicRoutes, ...protectedRoutes];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken");

  // Get locale from URL (will be in the format /en/path, /fr/path, etc.)
  const pathnameSegments = pathname.split("/");
  const locale =
    (pathnameSegments[1] as (typeof routing.locales)[number]) ||
    routing.defaultLocale;
  
  // Handle root path redirect
  if (pathname === "/") {
    if (accessToken) {
      try {
        const tokenData = JSON.parse(atob(accessToken.value.split(".")[1]));
        const isTokenValid = tokenData.exp * 1000 > Date.now();
        if (isTokenValid) {
          return NextResponse.redirect(
            new URL(`/${locale}/profile/me`, request.url)
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
    return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
  }
  
  // Check if the path is valid by comparing with valid routes
  // Strip locale from pathname for comparison
  const pathWithoutLocale = pathname.replace(new RegExp(`^\\/${locale}`), '');
  const isValidPath = validRoutes.some(route => 
    pathWithoutLocale === route || 
    pathWithoutLocale.startsWith(`${route}/`)
  );
  
  // If not a valid path, let Next.js handle it (will show 404 page)
  if (!isValidPath && locale && pathWithoutLocale !== '') {
    // Let Next.js handle 404s properly by passing to intlMiddleware
    return intlMiddleware(request);
  }

  // Allow access to public routes without authentication
  if (publicRoutes.some((route) => pathname.endsWith(route))) {
    // If user is already authenticated, redirect to their dashboard
    if (accessToken) {
      return NextResponse.redirect(
        new URL(`/${locale}/profile/me`, request.url)
      );
    }
    return intlMiddleware(request);
  }

  // For protected routes, check if user is authenticated
  if (protectedRoutes.some((route) => pathname.endsWith(route) || pathname.includes(`${route}/`))) {
    if (!accessToken) {
      return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
    }
  }

  // For all other routes, use the next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except static files and api routes
    "/((?!api|_next|public|.*\\.(?:jpg|jpeg|gif|png|svg|ico)$|favicon.ico).*)",
    // Match all localized pathnames
    "/",
    "/(fr|en|it|es)/:path*",
  ],
};
