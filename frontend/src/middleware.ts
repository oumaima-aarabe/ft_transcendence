import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

// List of public routes that don't require authentication
const publicRoutes = ["/", "/auth"];

// List of protected routes
const protectedRoutes = [
  "/dashboard",
  "/chat",
  "/game",
  "/tournaments",
  "/settings",
  "/profile",
];

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
        const tokenData = JSON.parse(atob(accessToken.split(".")[1]));
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
  if (protectedRoutes.some((route) => pathname.endsWith(route))) {
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
