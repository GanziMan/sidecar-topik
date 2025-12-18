import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { QUESTION_TYPES } from "./config/question.config";
import { ACCESS_TOKEN } from "./config/shared";
import { getSession } from "./lib/serverActions/auth";
import { deleteAuthCookies } from "./lib/serverActions/cookies";
import { Role } from "./types/common.types";

const REDIRECT_PATHS = ["/login", "/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await getSession();
  const isAdmin = session?.roles?.includes(Role.ADMIN);

  const accessToken = request.cookies.get(ACCESS_TOKEN);

  if (accessToken && REDIRECT_PATHS.includes(pathname)) {
    if (isAdmin) {
      return NextResponse.redirect(new URL(`/admin/question/2025/1/${QUESTION_TYPES[0]}`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/question/2025/1/${QUESTION_TYPES[0]}`, request.url));
    }
  }

  if (!accessToken && !REDIRECT_PATHS.includes(pathname)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    await deleteAuthCookies();
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|icons|file.svg|globe.svg).*)"],
};
