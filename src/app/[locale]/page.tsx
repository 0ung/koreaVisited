// src/app/[locale]/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { useEffect, useCallback } from "react";
import { performanceMonitor } from "@/utils/performance";

// 홈 섹션 컴포넌트들 import
import {
  HeroSection,
  CategorySection,
  RecommendedPlacesSection,
  HowItWorksSection,
  RealTimeSection,
} from "@/components/home";

export default function HomePage() {
  const homeT = useTranslations("Home");
  const commonT = useTranslations("Common");

  // 성능 측정
  useEffect(() => {
    performanceMonitor.mark("HomePage-start");

    return () => {
      performanceMonitor.mark("HomePage-end");
      performanceMonitor.measure(
        "HomePage-render",
        "HomePage-start",
        "HomePage-end"
      );
    };
  }, []);

  const handleSearch = useCallback((query: string) => {
    // 검색 히스토리 저장
    if (typeof window !== "undefined") {
      try {
        const searchHistory = JSON.parse(
          localStorage.getItem("searchHistory") || "[]"
        );
        const updatedHistory = [
          query,
          ...searchHistory.filter((q: string) => q !== query),
        ].slice(0, 10);
        localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("검색 히스토리 저장 실패:", error);
      }

      // 검색 페이지로 이동
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* 히어로 섹션 */}
      <HeroSection onSearch={handleSearch} />

      {/* 카테고리 섹션 */}
      <CategorySection />

      {/* 추천 장소 섹션 */}
      <RecommendedPlacesSection />

      {/* 이용 방법 섹션 */}
      <HowItWorksSection />

      {/* 실시간 정보 섹션 */}
      <RealTimeSection />
    </div>
  );
}
