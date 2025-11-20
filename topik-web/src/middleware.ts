import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { QUESTION_TYPES } from "./config/topik-write.config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const questionPathMatch = pathname.match(/^\/question\/\d+\/\d+\/(\d+)/);
  const questionNumber = questionPathMatch ? questionPathMatch[1] : null;

  if (pathname.startsWith("/question") && !questionNumber) {
    return NextResponse.redirect(new URL(`/question/2025/1/${QUESTION_TYPES[0]}`, request.url));
  }

  const sessionCookie = request.cookies.get("session_id");
  const userCookie = request.cookies.get("user_id");

  if (!sessionCookie || !userCookie) {
    request.cookies.delete("session_id");
    request.cookies.delete("user_id");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && userCookie && pathname === "/login") {
    return NextResponse.redirect(new URL(`/question/2025/1/${QUESTION_TYPES[0]}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/question/:path*"],
};
