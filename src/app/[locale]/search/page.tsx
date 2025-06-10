// src/app/[locale]/search/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/utils/cn";

import { Skeleton } from "@/components/ui/Skeleton";
import PlaceCardSkeleton from "@/components/common/PlaceCardSkeleton";
import SearchHeader from "./components/SearchHeader";
import FiltersSidebar from "./components/FiltersSidebar";
import ResultsSection from "./components/ResultsSection";
import type { Place, SearchFilters } from "@/types";
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
          <SearchHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            quickCategories={quickCategories}
            currentCategory={filters.category}
            setCategory={(cat) =>
              setFilters((prev) => ({ ...prev, category: cat }))
            }
            viewMode={viewMode}
            setViewMode={setViewMode}
            t={t}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FiltersSidebar filters={filters} setFilters={setFilters} t={t} />
            </div>
            <ResultsSection
              isLoading={isLoading}
              viewMode={viewMode}
              filteredPlaces={filteredPlaces}
              containerRef={containerRef}
              visibleItems={visibleItems}
              totalHeight={totalHeight}
              offsetY={offsetY}
              onBookmarkToggle={handleBookmarkToggle}
            />
          </div>
      </div>
    </div>
  );
}
