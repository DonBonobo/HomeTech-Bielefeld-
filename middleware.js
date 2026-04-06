import { NextResponse } from "next/server";
import { sanitizePathname } from "@/lib/auth";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const sanitizedPathname = sanitizePathname(url.pathname, url.pathname);

  if (sanitizedPathname !== url.pathname) {
    url.pathname = sanitizedPathname;
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
