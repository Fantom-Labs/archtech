import { createServerClient } from "@supabase/ssr";
import * as jose from "jose";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/chat",
  "/calendar",
  "/settings",
  "/complete-workspace",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthPath(pathname: string) {
  return pathname === "/login" || pathname === "/signup";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* Portal público: JWT em query ou cookie */
  if (pathname.startsWith("/p/") && !pathname.startsWith("/p/invalid")) {
    const secret = process.env.PORTAL_JWT_SECRET;
    const token =
      request.nextUrl.searchParams.get("token") ??
      request.cookies.get("portal_token")?.value;

    if (!secret || secret.length < 32) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.redirect(new URL("/p/invalid", request.url));
      }
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/p/invalid", request.url));
    }

    try {
      const key = new TextEncoder().encode(secret);
      await jose.jwtVerify(token, key);
      const res = NextResponse.next();
      const slug = pathname.split("/")[2];
      if (request.nextUrl.searchParams.get("token") && slug) {
        res.cookies.set("portal_token", token, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
          path: `/p/${slug}`,
        });
      }
      return res;
    } catch {
      return NextResponse.redirect(new URL("/p/invalid", request.url));
    }
  }

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedPath(pathname)) {
    if (!user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  if (isAuthPath(pathname) && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/calendar/:path*",
    "/settings/:path*",
    "/complete-workspace",
    "/login",
    "/signup",
    "/invite/:path*",
    "/p/:path*",
  ],
};
