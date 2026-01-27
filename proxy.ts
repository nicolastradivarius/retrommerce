import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const LOCALES = ["es", "en"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "es";

function isSupportedLocale(locale: string): locale is Locale {
  return (LOCALES as readonly string[]).includes(locale);
}

function getLocale(request: NextRequest): Locale {
  // 1) Cookie wins (user explicit choice)
  const cookieLocale = request.cookies.get("locale")?.value;
  if (cookieLocale && isSupportedLocale(cookieLocale)) return cookieLocale;

  // 2) Accept-Language fallback
  const header = request.headers.get("accept-language") || "";
  const candidates = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    // Normalize: "en-US" -> "en"
    const base = candidate.toLowerCase().split("-")[0] || "";
    if (isSupportedLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

function splitLocaleFromPath(pathname: string): {
  locale: Locale | null;
  basePath: string;
} {
  // Matches: "/es" or "/es/..."
  const match = pathname.match(/^\/([a-zA-Z-]+)(\/.*)?$/);
  if (!match) return { locale: null, basePath: pathname };

  // Extract possible locale and rest of the path
  const detectedLocale = (match[1] || "").toLowerCase();
  if (!isSupportedLocale(detectedLocale))
    return { locale: null, basePath: pathname };

  const remainingPath = match[2] || "";
  return {
    locale: detectedLocale,
    basePath: remainingPath === "" ? "/" : remainingPath,
  };
}

function isPublicOrInternalPath(pathname: string): boolean {
  // Skip Next internals & API; also skip obvious file requests (favicon, images, etc.)
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  // Heuristic: if it looks like a file request ("/logo.png"), ignore
  if (pathname.includes(".") && !pathname.endsWith(".json")) return true;
  return false;
}

const redirectToLogin = (request: NextRequest, locale: Locale | null) => {
  const loginPath = locale ? `/${locale}/login` : "/login";
  const loginUrl = new URL(loginPath, request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
};

const redirectToRoleHome = (
  role: string,
  request: NextRequest,
  locale: Locale | null,
) => {
  const target = role === "ADMIN" ? "/admin" : "/user";
  const targetPath = locale ? `/${locale}${target}` : target;
  const url = new URL(targetPath, request.url);
  return NextResponse.redirect(url);
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (isPublicOrInternalPath(pathname)) return NextResponse.next();

  // Locale routing: if there is no locale prefix, redirect to one.
  const { locale: localeInPath, basePath } = splitLocaleFromPath(pathname);
  if (!localeInPath) {
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Auth routing: only guard specific sections (basePath is without locale).
  const isProtected =
    basePath.startsWith("/admin") || basePath.startsWith("/user");
  if (!isProtected) return NextResponse.next();

  // If the server isn't configured with a JWT secret, we cannot validate sessions.
  // Treat the request as unauthenticated and send the user to the login page.
  if (!JWT_SECRET) return redirectToLogin(request, localeInPath);

  // Read the JWT from a cookie set by the app after login.
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return redirectToLogin(request, localeInPath);

  // Decode and validate the JWT. We only care about the user's role for routing.
  let payload: { role?: string } = {};
  try {
    payload = jwt.verify(token, JWT_SECRET) as { role?: string };
  } catch (error) {
    console.error("JWT verification failed", error);
    return redirectToLogin(request, localeInPath);
  }

  // Guard admin routes: only ADMIN users are allowed.
  if (basePath.startsWith("/admin")) {
    if (payload.role !== "ADMIN")
      return redirectToRoleHome(payload.role ?? "", request, localeInPath);
  }

  // Guard user routes: only USER users are allowed.
  if (basePath.startsWith("/user")) {
    if (payload.role !== "USER")
      return redirectToRoleHome(payload.role ?? "", request, localeInPath);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) in matcher itself
    "/((?!_next).*)",
  ],
};
