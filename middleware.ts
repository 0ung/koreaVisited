import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 보호된 경로 정의 (locale 포함)
  const protectedPaths = ["/dashboard", "/profile", "/bookmarks", "/admin"];
  const isProtectedPath = protectedPaths.some(
    (path) => pathname.includes(path) // locale 때문에 includes 사용
  );

  if (isProtectedPath) {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      // locale 유지하면서 리다이렉트
      const locale = pathname.split("/")[1];
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // i18n 미들웨어 실행
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"], // i18n 설정 사용
};
