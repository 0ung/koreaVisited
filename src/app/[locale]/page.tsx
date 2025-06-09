// src/app/[locale]/page.tsx - 기존 구조 기반 성능 최적화된 메인 페이지
"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/utils/cn";

// 기존 UI 컴포넌트 재사용
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

// 성능 최적화 유틸리티 사용 (올바른 분리)
import { useImagePreload, performanceMonitor } from "@/utils/performance";
import { useCachedFetch, memoryCache } from "@/utils/cache";

// 동적 임포트 (기존 패턴 활용)
const PlaceCard = dynamic(() => import("@/components/PlaceCard"), {
  loading: () => <PlaceCardSkeleton />,
  ssr: false,
});

const MapView = dynamic(() => import("@/components/MapView"), {
  loading: () => <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />,
  ssr: false,
});

// 기존 타입 재사용
interface Place {
  id: string;
  name: { ko: string; en: string; ja: string };
  address: { ko: string; en: string; ja: string };
  lat: number;
  lon: number;
  category_std: string;
  rating_avg: number;
  review_count: number;
  main_image_urls: string[];
  recommendation_score: number;
  crowd_index?: number;
  platform_data: {
    kakao?: { available: boolean; rating: number; review_count: number };
    naver?: { available: boolean; rating: number; review_count: number };
    google?: { available: boolean; rating: number; review_count: number };
  };
  data_quality_score: number;
  last_updated: string;
}

interface CategoryStats {
  category: string;
  count: number;
  avg_rating: number;
  icon: string;
  color: string;
}

// 스켈레톤 컴포넌트 (기존 패턴)
const PlaceCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <Skeleton variant="rectangular" className="w-full h-48" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" className="h-6 w-3/4" />
      <Skeleton variant="text" className="h-4 w-full" />
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="h-4 w-20" />
        <Skeleton variant="text" className="h-4 w-16" />
      </div>
    </div>
  </div>
);

const CategoryCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton variant="text" className="h-5 w-20 mb-2" />
          <Skeleton variant="text" className="h-4 w-32" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// 히어로 섹션 컴포넌트
const HeroSection = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const t = useTranslations("Home");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        onSearch(searchQuery.trim());
      }
    },
    [searchQuery, onSearch]
  );

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {t("heroTitle")}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90">
          {t("heroSubtitle")}
        </p>

        {/* 검색 바 */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex items-center bg-white rounded-full p-2 shadow-lg">
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent text-gray-900 text-lg"
            />
            <Button type="submit" className="rounded-full px-8">
              {t("search")}
            </Button>
          </div>
        </form>

        {/* 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold">50,000+</div>
            <div className="text-white/80">검증된 장소</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold">3개</div>
            <div className="text-white/80">플랫폼 통합</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold">실시간</div>
            <div className="text-white/80">혼잡도 정보</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 카테고리 섹션 컴포넌트
const CategorySection = () => {
  const t = useTranslations("Home");

  // 캐시된 카테고리 데이터 fetch
  const { data: categories, loading: categoriesLoading } = useCachedFetch<
    CategoryStats[]
  >(
    "/api/categories/stats",
    {},
    600000 // 10분 캐시
  );

  const categoryIcons = useMemo(
    () => ({
      restaurant: { icon: "🍽️", color: "from-red-500 to-orange-500" },
      cafe: { icon: "☕", color: "from-yellow-500 to-amber-500" },
      tourist: { icon: "🏛️", color: "from-blue-500 to-indigo-500" },
      culture: { icon: "🎭", color: "from-purple-500 to-pink-500" },
      shopping: { icon: "🛍️", color: "from-green-500 to-emerald-500" },
      nature: { icon: "🌳", color: "from-teal-500 to-cyan-500" },
      activity: { icon: "🎢", color: "from-violet-500 to-purple-500" },
      hotel: { icon: "🏨", color: "from-indigo-500 to-blue-500" },
    }),
    []
  );

  if (categoriesLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">카테고리</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t("categoriesTitle")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories?.map((category) => {
            const iconInfo =
              categoryIcons[category.category as keyof typeof categoryIcons];

            return (
              <Link
                key={category.category}
                href={`/categories/${category.category}`}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div
                        className={cn(
                          "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl",
                          "bg-gradient-to-br",
                          iconInfo?.color || "from-gray-400 to-gray-500"
                        )}
                      >
                        {iconInfo?.icon || "📍"}
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-blue-600">
                        {t(`categories.${category.category}`)}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <div>{category.count.toLocaleString()}개 장소</div>
                        <div>★ {category.avg_rating.toFixed(1)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// 추천 장소 섹션
const RecommendedPlacesSection = () => {
  const t = useTranslations("Home");

  // 캐시된 추천 장소 데이터
  const { data: recommendedPlaces, loading: placesLoading } = useCachedFetch<
    Place[]
  >(
    "/api/places/recommended?limit=8",
    {},
    300000 // 5분 캐시
  );

  // 이미지 프리로딩
  const imageUrls = useMemo(
    () =>
      recommendedPlaces?.flatMap((place) =>
        place.main_image_urls.slice(0, 1)
      ) || [],
    [recommendedPlaces]
  );

  useImagePreload(imageUrls);

  const handleBookmarkToggle = useCallback(
    async (placeId: string, isBookmarked: boolean) => {
      try {
        const method = isBookmarked ? "POST" : "DELETE";
        await fetch(`/api/user/bookmarks/${placeId}`, { method });

        // 캐시 무효화
        memoryCache.delete("/api/places/recommended?limit=8:");
      } catch (error) {
        console.error("북마크 처리 실패:", error);
      }
    },
    []
  );

  if (placesLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">추천 장소</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold">{t("recommendedTitle")}</h2>
          <Link href="/search?sort=recommendation">
            <Button variant="outline">{t("viewAll")}</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedPlaces?.map((place, index) => (
            <PlaceCard
              key={place.id}
              place={place}
              locale="ko"
              variant={index < 2 ? "featured" : "default"}
              showRecommendationScore
              showPlatformIndicator
              showDataQuality
              onBookmarkToggle={handleBookmarkToggle}
              priority={index < 4} // 첫 4개 이미지 우선 로딩
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// 메인 페이지 컴포넌트
export default function HomePage() {
  const t = useTranslations("Home");

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
      const searchHistory = JSON.parse(
        localStorage.getItem("searchHistory") || "[]"
      );
      const updatedHistory = [
        query,
        ...searchHistory.filter((q: string) => q !== query),
      ].slice(0, 10);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

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

      {/* 실시간 정보 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("realTimeTitle")}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 혼잡도 지도 */}
            <Card>
              <CardHeader>
                <CardTitle>실시간 혼잡도</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <MapView
                    places={[]}
                    showCrowdData={true}
                    className="rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 인기 급상승 장소 */}
            <Card>
              <CardHeader>
                <CardTitle>인기 급상승</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 이 부분은 실시간 데이터로 채워질 예정 */}
                  <div className="text-center text-gray-500 py-8">
                    실시간 인기 장소 로딩 중...
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
