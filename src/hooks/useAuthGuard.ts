// hooks/useAuthGuard.ts
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const locale = pathname.split("/")[1] || "ko";
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  return {
    isAuthenticated,
    isLoading,
  };
}
