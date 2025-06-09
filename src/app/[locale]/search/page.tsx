// src/app/[locale]/search/page.tsx - 기존 코드 확장 및 성능 최적화
"use client";

import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/utils/cn";

// 기존 UI 컴포넌트 재사용
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { storage } from "@/utils/storage";

// 동적 임포트로 코드 스플리팅 (기존 패턴 활용)
const PlaceCard = dynamic(() => import("@/components/PlaceCard"), {
  loading: () => <PlaceCardSkeleton />,
  ssr: false,
});

const MapView = dynamic(() => import("@/components/MapView"), {
  loading: () => <MapViewSkeleton />,
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
  distance?: number;
  price_level?: number;
  platform_data: {
    kakao?: { available: boolean; rating: number; review_count: number };
    naver?: { available: boolean; rating: number; review_count: number };
    google?: { available: boolean; rating: number; review_count: number };
  };
  data_quality_score: number;
  last_updated: string;
}

interface SearchFilters {
  category: string;
  location: string;
  rating: number;
  priceLevel: string;
  distance: string;
  openNow: boolean;
  dataQuality: number;
  platformCount: number;
  crowdLevel: string;
}

// 스켈레톤 컴포넌트 (기존 패턴 활용)
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

const MapViewSkeleton = () => (
  <div className="h-full bg-gray-200 rounded-lg flex items-center justify-center">
    <div className="text-gray-500">지도 로딩 중...</div>
  </div>
);

// 성능 최적화된 가상 스크롤링 훅
const useVirtualScroll = (items: Place[], itemHeight: number = 300) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;

    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 2,
      items.length
    );

    setVisibleRange({ start, end });
  }, [items.length, itemHeight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return { containerRef, visibleItems, totalHeight, offsetY };
};

// 디바운스 훅 (성능 최적화)
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// 검색 페이지 메인 컴포넌트
export default function SearchPage() {
  const t = useTranslations("Search");
  const searchParams = useSearchParams();
  const router = useRouter();

  // 상태 관리 (기존 패턴 유지)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map" | "both">("list");
  const [filters, setFilters] = useState<SearchFilters>({
    category: "",
    location: "",
    rating: 0,
    priceLevel: "",
    distance: "",
    openNow: false,
    dataQuality: 70,
    platformCount: 1,
    crowdLevel: "",
  });

  // 디바운스된 검색어
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 가상 스크롤링 (대량 데이터 성능 최적화)
  const { containerRef, visibleItems, totalHeight, offsetY } =
    useVirtualScroll(filteredPlaces);

  // 검색 API 호출 (기존 로직 최적화)
  const searchPlaces = useCallback(
    async (query: string, searchFilters: SearchFilters) => {
      if (!query.trim()) {
        setFilteredPlaces([]);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          ...Object.entries(searchFilters).reduce((acc, [key, value]) => {
            if (value) acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>),
        });

        const response = await fetch(`/api/places/search?${params}`);
        const data = await response.json();

        setPlaces(data.places || []);
        setFilteredPlaces(data.places || []);
      } catch (error) {
        console.error("검색 실패:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 실시간 필터링 (메모이제이션 활용)
  const applyFilters = useCallback(
    (searchResults: Place[], currentFilters: SearchFilters) => {
      return searchResults.filter((place) => {
        // 카테고리 필터
        if (
          currentFilters.category &&
          place.category_std !== currentFilters.category
        ) {
          return false;
        }

        // 평점 필터
        if (
          currentFilters.rating > 0 &&
          place.rating_avg < currentFilters.rating
        ) {
          return false;
        }

        // 데이터 품질 필터
        if (place.data_quality_score < currentFilters.dataQuality) {
          return false;
        }

        // 플랫폼 수 필터
        const platformCount = Object.values(place.platform_data).filter(
          (p) => p?.available
        ).length;
        if (platformCount < currentFilters.platformCount) {
          return false;
        }

        // 혼잡도 필터
        if (currentFilters.crowdLevel && place.crowd_index) {
          const crowdThresholds = { low: 40, medium: 60, high: 80 };
          const threshold =
            crowdThresholds[
              currentFilters.crowdLevel as keyof typeof crowdThresholds
            ];
          if (
            currentFilters.crowdLevel === "low" &&
            place.crowd_index > threshold
          )
            return false;
          if (
            currentFilters.crowdLevel === "medium" &&
            (place.crowd_index <= 40 || place.crowd_index > 80)
          )
            return false;
          if (
            currentFilters.crowdLevel === "high" &&
            place.crowd_index <= threshold
          )
            return false;
        }

        return true;
      });
    },
    []
  );

  // 검색 실행 (디바운스 적용)
  useEffect(() => {
    if (debouncedSearchQuery) {
      searchPlaces(debouncedSearchQuery, filters);
    }
  }, [debouncedSearchQuery, filters, searchPlaces]);

  // 필터 변경 처리
  useEffect(() => {
    const filtered = applyFilters(places, filters);
    setFilteredPlaces(filtered);
  }, [places, filters, applyFilters]);

  // 북마크 토글 (기존 로직 재사용)
  const handleBookmarkToggle = useCallback(
    async (placeId: string, isBookmarked: boolean) => {
      try {
        const method = isBookmarked ? "POST" : "DELETE";
        await fetch(`/api/user/bookmarks/${placeId}`, { method });

        // UI 즉시 업데이트 (낙관적 업데이트)
        setFilteredPlaces((prev) =>
          prev.map((place) =>
            place.id === placeId ? { ...place, isBookmarked } : place
          )
        );
      } catch (error) {
        console.error("북마크 처리 실패:", error);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 검색 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
            >
              {viewMode === "list" ? "지도" : "목록"}
            </Button>
          </div>

          {/* 빠른 필터 */}
          <div className="flex flex-wrap gap-2">
            {["맛집", "카페", "관광지", "문화"].map((category) => (
              <Button
                key={category}
                variant={filters.category === category ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    category: prev.category === category ? "" : category,
                  }))
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 상세 필터 사이드바 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">필터</h3>

                {/* 평점 필터 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    최소 평점
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        rating: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={0}>전체</option>
                    <option value={4}>4.0 이상</option>
                    <option value={4.5}>4.5 이상</option>
                  </select>
                </div>

                {/* 데이터 품질 필터 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    데이터 품질
                  </label>
                  <select
                    value={filters.dataQuality}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dataQuality: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={70}>양호 이상</option>
                    <option value={80}>우수 이상</option>
                    <option value={90}>검증됨</option>
                  </select>
                </div>

                {/* 혼잡도 필터 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    혼잡도
                  </label>
                  <select
                    value={filters.crowdLevel}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        crowdLevel: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">전체</option>
                    <option value="low">여유</option>
                    <option value="medium">보통</option>
                    <option value="high">혼잡</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 검색 결과 영역 */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PlaceCardSkeleton key={i} />
                ))}
              </div>
            ) : viewMode === "map" ? (
              <div className="h-[600px]">
                <MapView places={filteredPlaces} />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600">
                    총 {filteredPlaces.length.toLocaleString()}개의 장소
                  </p>
                </div>

                {/* 가상 스크롤링을 통한 최적화된 리스트 렌더링 */}
                <div
                  ref={containerRef}
                  className="h-[800px] overflow-auto"
                  style={{ height: "800px" }}
                >
                  <div style={{ height: totalHeight, position: "relative" }}>
                    <div
                      style={{
                        transform: `translateY(${offsetY}px)`,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {visibleItems.map((place, index) => (
                          <PlaceCard
                            key={place.id}
                            place={place}
                            locale="ko"
                            showRecommendationScore
                            showPlatformIndicator
                            showDataQuality
                            showCrowdStatus
                            onBookmarkToggle={handleBookmarkToggle}
                            priority={index < 3} // 첫 3개 이미지 우선 로딩
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
