import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("admin_session")?.value;
  const session = token ? await decryptSession(token) : undefined;

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
