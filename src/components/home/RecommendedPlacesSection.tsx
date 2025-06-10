// src/components/home/RecommendedPlacesSection.tsx
"use client";

import { useTranslations } from "next-intl";
import { useMemo, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useImagePreload } from "@/utils/performance";
import { useCachedFetch, memoryCache } from "@/utils/cache";
import type { Place } from "@/types";
import PlaceCardSkeleton from "@/components/common/PlaceCardSkeleton";

// 동적 임포트
const PlaceCard = dynamic(() => import("@/components/PlaceCard"), {
  loading: () => <PlaceCardSkeleton />,
  ssr: false,
});



export function RecommendedPlacesSection() {
  const homeT = useTranslations("Home");
  const commonT = useTranslations("Common");

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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            {homeT("featuredPlaces") || "추천 장소"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🏆 {homeT("featuredPlaces") || "추천 장소"}
            </h2>
            <p className="text-xl text-gray-600">AI가 엄선한 특별한 장소들</p>
          </div>
          <Link href="/search?sort=recommendation">
            <Button
              variant="outline"
              className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl"
            >
              {homeT("exploreMore") || commonT("showMore") || "더보기"} →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {recommendedPlaces?.map((place, index) => (
            <div
              key={place.id}
              className="group transform hover:-translate-y-2 transition-all duration-300"
            >
              <PlaceCard
                place={place}
                locale="ko"
                variant={index < 2 ? "featured" : "default"}
                showRecommendationScore
                showPlatformIndicator
                showDataQuality
                onBookmarkToggle={handleBookmarkToggle}
                priority={index < 4} // 첫 4개 이미지 우선 로딩
                className="h-full shadow-lg hover:shadow-2xl border-0 rounded-2xl overflow-hidden bg-white"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
