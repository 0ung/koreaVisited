// src/components/RouteGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";

interface RouteGuardProps {
  children: React.ReactNode;
  requiresAuth?: boolean; // 로그인 필요 (USER 이상)
  adminOnly?: boolean; // 관리자 전용 (ADMIN만)
}

/**
 * 기본 라우트 보호 컴포넌트
 * - guest: 공개 페이지만 접근 가능
 * - user: 로그인 필요 페이지 접근 가능
 * - admin: 모든 페이지 접근 가능
 */
export default function RouteGuard({
  children,
  requiresAuth = false,
  adminOnly = false,
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 로딩 중이면 대기
    if (isLoading) return;

    // 관리자 전용 페이지 체크
    if (adminOnly) {
      if (!isAuthenticated || user?.role !== "ADMIN") {
        setIsRedirecting(true);
        router.replace("/login");
        return;
      }
    }

    // 인증 필수 페이지 체크
    if (requiresAuth && !isAuthenticated) {
      setIsRedirecting(true);
      router.replace("/login");
      return;
    }

    setIsRedirecting(false);
  }, [isAuthenticated, user, isLoading, adminOnly, requiresAuth, router]);

  // 로딩 중이거나 리다이렉트 중일 때
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton variant="rectangular" className="h-8 w-64 mb-6" />
          <div className="grid gap-6">
            <Skeleton variant="rectangular" className="h-32" />
            <Skeleton variant="rectangular" className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  // 권한 없으면 렌더링 안함
  if (adminOnly && (!isAuthenticated || user?.role !== "ADMIN")) {
    return null;
  }

  if (requiresAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
