import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminAsset = pathname === "/admin/login";
  const isAdminApiLogin = pathname === "/api/admin/login";

  if (isAdminAsset || isAdminApiLogin) return NextResponse.next();

  const isProtectedAdminPage = pathname.startsWith("/admin");
  const isProtectedAdminApi = pathname.startsWith("/api/admin");

  if (!isProtectedAdminPage && !isProtectedAdminApi) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    if (isProtectedAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
