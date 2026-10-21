import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, MEMBER_COOKIE, verifySession } from "@/lib/session-token";

/**
 * First line of defence only — every admin/member page and action ALSO calls
 * requireAdmin()/requireMember(), which re-checks the DB (CLAUDE.md §5 Security).
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const ok = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
    if (!ok) return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (pathname.startsWith("/member")) {
    const ok = await verifySession(req.cookies.get(MEMBER_COOKIE)?.value, "member");
    if (!ok) {
      const url = new URL("/claim", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/admin") || pathname.startsWith("/member")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
  }
  return res;
}

export const config = { matcher: ["/admin/:path*", "/member/:path*"] };
