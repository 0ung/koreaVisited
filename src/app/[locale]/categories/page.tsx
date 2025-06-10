// src/app/[locale]/categories/[categoryId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  CategoryHeroSection,
  CategoryStatsSection,
  FeaturedPlacesSection,
  TrendingKeywordsSection,
  PlacesListSection,
  CategoryRecommendationSection,
} from "@/components/categories";
import { useCategoryData } from "@/hooks/useCategoryData";

export default function CategoryPage() {
  const t = useTranslations("Category");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const categoryId = params.categoryId as string;

  // 필터 상태
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommendation");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 데이터 관리 (커스텀 훅으로 분리)
  const {
    categoryInfo,
    categoryStats,
    places,
    featuredPlaces,
    filteredPlaces,
    isLoading,
  } = useCategoryData(categoryId, locale, selectedSubcategory, sortBy);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <Skeleton variant="rectangular" className="h-64 mb-8 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                className="h-32 rounded-xl"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                className="h-64 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categoryInfo || !categoryStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t("categoryNotFound")}
          </h2>
          <p className="text-gray-600 mb-4">{t("categoryNotExists")}</p>
          <Button onClick={() => router.back()}>{t("goBack")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 카테고리 Hero 섹션 */}
      <CategoryHeroSection
        categoryInfo={categoryInfo}
        categoryStats={categoryStats}
        locale={locale}
      />

      <div className="container mx-auto px-4 py-8">
        {/* 통계 카드 섹션 */}
        <CategoryStatsSection categoryStats={categoryStats} />

        {/* 추천 장소 섹션 */}
        <FeaturedPlacesSection
          categoryInfo={categoryInfo}
          featuredPlaces={featuredPlaces}
          categoryId={categoryId}
          locale={locale}
        />

        {/* 트렌딩 키워드 섹션 */}
        <TrendingKeywordsSection
          categoryInfo={categoryInfo}
          categoryId={categoryId}
        />

        {/* 장소 목록 섹션 */}
        <PlacesListSection
          categoryInfo={categoryInfo}
          filteredPlaces={filteredPlaces}
          selectedSubcategory={selectedSubcategory}
          onSubcategoryChange={setSelectedSubcategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          locale={locale}
        />

        {/* 카테고리 추천 섹션 */}
        <CategoryRecommendationSection
          categoryInfo={categoryInfo}
          categoryId={categoryId}
          locale={locale}
          filteredPlaces={filteredPlaces}
        />
      </div>
    </div>
  );
}
