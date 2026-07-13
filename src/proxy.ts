import { type NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/session";
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (["/admin/login","/api/admin/login","/api/admin/logout","/api/payment/webhook"].includes(pathname))
    return NextResponse.next();
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi  = pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  const session = await verifySessionToken(request.cookies.get(COOKIE_NAME)?.value);
  if (!session) {
    if (isAdminApi) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
    const u = new URL("/admin/login", request.url);
    u.searchParams.set("next", pathname);
    return NextResponse.redirect(u);
  }
  // Reject non-JSON mutating admin API calls (CSRF defence)
  if (isAdminApi && ["POST","PATCH","PUT","DELETE"].includes(request.method)) {
    const ct = request.headers.get("content-type") ?? "";
    if (!ct.includes("application/json") && !ct.includes("multipart/form-data"))
      return NextResponse.json({ error:"Content-Type must be application/json" }, { status:415 });
  }
  return NextResponse.next();
}
export const config = { matcher:["/admin/:path*","/api/admin/:path*","/api/payment/webhook"] };
