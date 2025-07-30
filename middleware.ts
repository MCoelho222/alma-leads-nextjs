import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Check if accessing admin routes
  if (url.pathname.startsWith("/admin")) {
    // Check for auth cookie
    const authCookie = request.cookies.get("admin-auth");

    if (!authCookie || authCookie.value !== "authenticated") {
      // Redirect to login page
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Check API admin routes - accept both cookie and basic auth (except logout)
  if (url.pathname.startsWith("/api/admin") && !url.pathname.startsWith("/api/admin/logout")) {
    // First check for cookie authentication (if user is logged in)
    const authCookie = request.cookies.get("admin-auth");
    if (authCookie && authCookie.value === "authenticated") {
      return NextResponse.next();
    }

    // Fallback to basic auth for API clients
    const basicAuth = request.headers.get("authorization");
    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [user, password] = atob(authValue).split(":");

      if (user === "admin" && password === "password") {
        return NextResponse.next();
      }
    }

    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
