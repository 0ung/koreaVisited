import { NextRequest, NextResponse } from "next/server";

/**
 * 간단한 라우트 보호 미들웨어
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트나 정적 파일은 제외
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 로케일 추출
  const locale = pathname.split("/")[1] || "ko";
  const route = pathname.replace(`/${locale}`, "") || "/";

  // 관리자 전용 페이지들
  const adminRoutes = ["/dashboard", "/admin"];

  // 인증 필수 페이지들 (개인정보 관련)
  const authRequiredRoutes = ["/settings", "/bookmarks", "/profile"];

  // 쿠키에서 세션 확인 (간단한 체크)
  const hasSession = request.cookies.has("JSESSIONID");

  // 관리자 페이지 접근 시 로그인 페이지로 리다이렉트
  if (adminRoutes.some((adminRoute) => route.startsWith(adminRoute))) {
    if (!hasSession) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // 인증 필수 페이지 접근 시 로그인 페이지로 리다이렉트
  if (authRequiredRoutes.some((authRoute) => route.startsWith(authRoute))) {
    if (!hasSession) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 정적 파일과 API 제외하고 모든 경로에 적용
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
