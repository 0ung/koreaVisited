// src/app/[locale]/search/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/utils/cn";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { storage } from "@/utils/storage";

/* ────────────────────── 동적 컴포넌트 ────────────────────── */
const PlaceCard = dynamic(() => import("@/components/PlaceCard"), {
  loading: () => <PlaceCardSkeleton />,
  ssr: false,
});
const MapView = dynamic(() => import("@/components/MapView"), {
  loading: () => <MapViewSkeleton />,
  ssr: false,
});

/* ────────────────────── 타입 ────────────────────── */
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

/* ────────────────────── 스켈레톤 ────────────────────── */
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

const MapViewSkeleton = () => {
  const t = useTranslations("Search");
  return (
    <div className="h-full bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">{t("mapLoading")}</div>
    </div>
  );
};

/* ────────────────────── 가상 스크롤링 훅 ────────────────────── */
const useVirtualScroll = (items: Place[], itemHeight = 300) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const start = Math.floor(el.scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(el.clientHeight / itemHeight) + 2,
      items.length
    );
    setVisibleRange({ start, end });
  }, [items.length, itemHeight]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return {
    containerRef,
    visibleItems: items.slice(visibleRange.start, visibleRange.end),
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.start * itemHeight,
  };
};

/* ────────────────────── 디바운스 훅 ────────────────────── */
const useDebounce = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

/* ────────────────────── 메인 컴포넌트 ────────────────────── */
export default function SearchPage() {
  const t = useTranslations("Search");
  const searchParams = useSearchParams();
  const router = useRouter();

  /* 상태 */
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
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

  /* 디바운스 검색어 */
  const debouncedQuery = useDebounce(searchQuery, 300);

  /* 가상 스크롤 */
  const { containerRef, visibleItems, totalHeight, offsetY } =
    useVirtualScroll(filteredPlaces);

  /* ─────────────── 빠른 카테고리 버튼 ─────────────── */
  const quickCategories = useMemo(
    () => [
      { category: "맛집", label: t("quickCategoryRestaurant") },
      { category: "카페", label: t("quickCategoryCafe") },
      { category: "관광지", label: t("quickCategoryTourist") },
      { category: "문화", label: t("quickCategoryCulture") },
    ],
    [t]
  );

  /* ─────────────── 검색 API 호출 ─────────────── */
  const searchPlaces = useCallback(async (query: string, f: SearchFilters) => {
    if (!query.trim()) {
      setFilteredPlaces([]);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        ...Object.fromEntries(
          Object.entries(f).filter(([, v]) => v !== "" && v !== 0)
        ),
      });
      const res = await fetch(`/api/places/search?${params}`);
      const data = await res.json();
      setPlaces(data.places || []);
      setFilteredPlaces(data.places || []);
    } catch (e) {
      console.error("search failed:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ─────────────── 필터 적용 ─────────────── */
  const applyFilters = useCallback(
    (arr: Place[], f: SearchFilters) =>
      arr.filter((p) => {
        if (f.category && p.category_std !== f.category) return false;
        if (f.rating > 0 && p.rating_avg < f.rating) return false;
        if (p.data_quality_score < f.dataQuality) return false;
        const platformCnt = Object.values(p.platform_data).filter(
          (v) => v?.available
        ).length;
        if (platformCnt < f.platformCount) return false;
        if (f.crowdLevel && p.crowd_index != null) {
          const thresholds: Record<string, number> = {
            low: 40,
            medium: 60,
            high: 80,
          };
          const th = thresholds[f.crowdLevel];
          if (
            (f.crowdLevel === "low" && p.crowd_index > th) ||
            (f.crowdLevel === "medium" &&
              (p.crowd_index <= 40 || p.crowd_index > 80)) ||
            (f.crowdLevel === "high" && p.crowd_index <= th)
          )
            return false;
        }
        return true;
      }),
    []
  );

  /* ─────────────── 효과들 ─────────────── */
  useEffect(() => {
    if (debouncedQuery) searchPlaces(debouncedQuery, filters);
  }, [debouncedQuery, filters, searchPlaces]);

  useEffect(() => {
    setFilteredPlaces(applyFilters(places, filters));
  }, [places, filters, applyFilters]);

  /* 북마크 토글 */
  const handleBookmarkToggle = useCallback(
    async (id: string, isBookmarked: boolean) => {
      try {
        await fetch(`/api/user/bookmarks/${id}`, {
          method: isBookmarked ? "POST" : "DELETE",
        });
        setFilteredPlaces((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isBookmarked } : p))
        );
      } catch (e) {
        console.error("bookmark failed:", e);
      }
    },
    []
  );

  /* ─────────────── 렌더링 ─────────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* ─── 검색 헤더 ─── */}
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
              {viewMode === "list" ? t("mapButton") : t("listButton")}
            </Button>
          </div>

          {/* 빠른 카테고리 */}
          <div className="flex flex-wrap gap-2">
            {quickCategories.map(({ category, label }) => (
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
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* ─── 레이아웃 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드 필터 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">{t("filterTitle")}</h3>

                {/* 최소 평점 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    {t("labelMinRating")}
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        rating: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={0}>{t("optionAll")}</option>
                    <option value={4}>{t("optionRating4")}</option>
                    <option value={4.5}>{t("optionRating45")}</option>
                  </select>
                </div>

                {/* 데이터 품질 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    {t("labelDataQuality")}
                  </label>
                  <select
                    value={filters.dataQuality}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        dataQuality: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={70}>{t("optionQuality70")}</option>
                    <option value={80}>{t("optionQuality80")}</option>
                    <option value={90}>{t("optionQuality90")}</option>
                  </select>
                </div>

                {/* 혼잡도 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    {t("labelCrowdLevel")}
                  </label>
                  <select
                    value={filters.crowdLevel}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, crowdLevel: e.target.value }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">{t("optionAll")}</option>
                    <option value="low">{t("optionCrowdLow")}</option>
                    <option value="medium">{t("optionCrowdMedium")}</option>
                    <option value="high">{t("optionCrowdHigh")}</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 결과 영역 */}
          <div className="lg:col-span-3">
            {/* 결과 개수 */}
            <p className="text-gray-600 mb-4">
              {t("resultPrefix")} {filteredPlaces.length.toLocaleString()}{" "}
              {t("resultSuffix")}
            </p>

            {isLoading ? (
              /* 스켈레톤 */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PlaceCardSkeleton key={i} />
                ))}
              </div>
            ) : viewMode === "map" ? (
              /* 지도 보기 */
              <div className="h-[600px]">
                <MapView places={filteredPlaces} />
              </div>
            ) : (
              /* 목록 보기 + 가상 스크롤 */
              <div
                ref={containerRef}
                className="h-[800px] overflow-auto"
                style={{ height: 800 }}
              >
                <div style={{ height: totalHeight, position: "relative" }}>
                  <div
                    style={{
                      transform: `translateY(${offsetY}px)`,
                      position: "absolute",
                      inset: 0,
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {visibleItems.map((p, idx) => (
                        <PlaceCard
                          key={p.id}
                          place={p}
                          locale="ko"
                          showRecommendationScore
                          showPlatformIndicator
                          showDataQuality
                          showCrowdStatus
                          onBookmarkToggle={handleBookmarkToggle}
                          priority={idx < 3}
                        />
                      ))}
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
