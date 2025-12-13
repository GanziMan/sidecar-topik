import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { QUESTION_TYPES } from "./config/question.config";
import { SESSION_ID, USER_ID } from "./config/shared";
import { getSession } from "./lib/serverActions/auth";
import { deleteAuthCookies } from "./lib/serverActions/cookies";
import { Role } from "./types/common.types";

const REDIRECT_PATHS = ["/login", "/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await getSession();
  const isAdmin = session?.roles?.includes(Role.ADMIN);

  const sessionCookie = request.cookies.get(SESSION_ID);
  const userCookie = request.cookies.get(USER_ID);

  if (sessionCookie && userCookie && REDIRECT_PATHS.includes(pathname)) {
    if (isAdmin) {
      return NextResponse.redirect(new URL(`/admin/question/2025/1/${QUESTION_TYPES[0]}`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/question/2025/1/${QUESTION_TYPES[0]}`, request.url));
    }
  }

  if ((!sessionCookie || !userCookie) && !REDIRECT_PATHS.includes(pathname)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    await deleteAuthCookies();
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|icons|file.svg|globe.svg).*)"],
};
