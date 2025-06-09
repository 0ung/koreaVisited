"use client";

import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/utils/cn";

// 기존 UI 컴포넌트 재사용
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { storage } from "@/utils/storage";
import { searchUrl, searchFilters, searchHistory } from "@/utils/search";
import { debounce } from "@/utils/debounce";
import MapView from "@/components/MapView";
import PlaceCard from "@/components/PlaceCard";

// 타입 정의 (기존 코드 기반)
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
  features?: string[];
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
  freeWifi: boolean;
  parking: boolean;
  accessibility: boolean;
  dataQuality: number; // 데이터 품질 최소 점수
  platformCount: number; // 최소 플랫폼 수
}

// 뷰 모드 타입
type ViewMode = "list" | "map" | "both";

// 스켈레톤 컴포넌트들
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
  <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <Skeleton variant="circular" className="w-16 h-16 mx-auto mb-4" />
      <Skeleton variant="text" className="h-6 w-32 mx-auto mb-2" />
      <Skeleton variant="text" className="h-4 w-48 mx-auto" />
    </div>
  </div>
);

// 기본 필터 생성 함수
const getDefaultFilters = (): SearchFilters => ({
  category: "all",
  location: "",
  rating: 0,
  priceLevel: "all",
  distance: "all",
  openNow: false,
  freeWifi: false,
  parking: false,
  accessibility: false,
  dataQuality: 0,
  platformCount: 1,
});

// 필터 활성화 체크 함수
const hasActiveFilters = (filters: SearchFilters): boolean => {
  const defaultFilters = getDefaultFilters();
  return JSON.stringify(filters) !== JSON.stringify(defaultFilters);
};

// 고급 필터 컴포넌트
const AdvancedFilters = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
}: {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const t = useTranslations("Search");

  const categories = [
    { value: "all", label: "전체", icon: "🏢" },
    { value: "restaurant", label: "맛집", icon: "🍽️" },
    { value: "cafe", label: "카페", icon: "☕" },
    { value: "tourist", label: "관광", icon: "🏛️" },
    { value: "culture", label: "문화", icon: "🎭" },
    { value: "shopping", label: "쇼핑", icon: "🛍️" },
    { value: "nature", label: "자연", icon: "🌳" },
    { value: "activity", label: "액티비티", icon: "🎢" },
    { value: "hotel", label: "숙박", icon: "🏨" },
  ];

  const priceOptions = [
    { value: "all", label: "전체 가격대" },
    { value: "1", label: "₩ 저렴" },
    { value: "2", label: "₩₩ 보통" },
    { value: "3", label: "₩₩₩ 비쌈" },
    { value: "4", label: "₩₩₩₩ 고급" },
  ];

  const distanceOptions = [
    { value: "all", label: "전체" },
    { value: "1", label: "1km 이내" },
    { value: "3", label: "3km 이내" },
    { value: "5", label: "5km 이내" },
    { value: "10", label: "10km 이내" },
  ];

  return (
    <div
      className={cn(
        "bg-white border-b border-gray-200 transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-screen" : "max-h-0"
      )}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 카테고리 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              카테고리
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => onFiltersChange({ category: category.value })}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg border text-xs transition-colors",
                    filters.category === category.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <span className="text-lg mb-1">{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 평점 및 가격 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              평점 및 가격
            </label>
            <div className="space-y-3">
              {/* 평점 슬라이더 */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>최소 평점</span>
                  <span>★ {filters.rating.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.rating}
                  onChange={(e) =>
                    onFiltersChange({ rating: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* 가격대 선택 */}
              <div>
                <select
                  value={filters.priceLevel}
                  onChange={(e) =>
                    onFiltersChange({ priceLevel: e.target.value })
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                >
                  {priceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 거리 및 편의시설 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              거리 및 편의시설
            </label>
            <div className="space-y-3">
              {/* 거리 선택 */}
              <select
                value={filters.distance}
                onChange={(e) => onFiltersChange({ distance: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              >
                {distanceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* 편의시설 체크박스 */}
              <div className="space-y-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={filters.openNow}
                    onChange={(e) =>
                      onFiltersChange({ openNow: e.target.checked })
                    }
                    className="mr-2"
                  />
                  지금 영업중
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={filters.freeWifi}
                    onChange={(e) =>
                      onFiltersChange({ freeWifi: e.target.checked })
                    }
                    className="mr-2"
                  />
                  무료 Wi-Fi
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={filters.parking}
                    onChange={(e) =>
                      onFiltersChange({ parking: e.target.checked })
                    }
                    className="mr-2"
                  />
                  주차 가능
                </label>
              </div>
            </div>
          </div>

          {/* 데이터 품질 필터 (차별화 기능) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              데이터 품질
            </label>
            <div className="space-y-3">
              {/* 데이터 품질 슬라이더 */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>최소 품질 점수</span>
                  <span>{filters.dataQuality}점</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={filters.dataQuality}
                  onChange={(e) =>
                    onFiltersChange({ dataQuality: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* 플랫폼 수 필터 */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>최소 플랫폼 수</span>
                  <span>{filters.platformCount}개</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={filters.platformCount}
                  onChange={(e) =>
                    onFiltersChange({ platformCount: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* 접근성 */}
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.accessibility}
                  onChange={(e) =>
                    onFiltersChange({ accessibility: e.target.checked })
                  }
                  className="mr-2"
                />
                휠체어 접근 가능
              </label>
            </div>
          </div>
        </div>

        {/* 필터 리셋 버튼 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => {
                const defaultFilters = getDefaultFilters();
                onFiltersChange(defaultFilters);
              }}
            >
              필터 초기화
            </Button>
            <Button onClick={onToggle}>필터 적용</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 검색 결과 통계 컴포넌트
const SearchStats = ({
  totalResults,
  query,
  filters,
  processingTime,
}: {
  totalResults: number;
  query: string;
  filters: SearchFilters;
  processingTime?: number;
}) => {
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.rating > 0) count++;
    if (filters.priceLevel !== "all") count++;
    if (filters.distance !== "all") count++;
    if (
      filters.openNow ||
      filters.freeWifi ||
      filters.parking ||
      filters.accessibility
    )
      count++;
    if (filters.dataQuality > 0) count++;
    if (filters.platformCount > 1) count++;
    return count;
  }, [filters]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-blue-900">
            {query ? `"${query}"` : "전체"} 검색 결과
          </h3>
          <p className="text-sm text-blue-700">
            총 <strong>{totalResults.toLocaleString()}</strong>개 장소
            {activeFiltersCount > 0 && (
              <span> • {activeFiltersCount}개 필터 적용</span>
            )}
            {processingTime && <span> • {processingTime}ms</span>}
          </p>
        </div>

        {/* 플랫폼 통합 배지 */}
        <div className="flex gap-2">
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
            카카오
          </span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            네이버
          </span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            구글
          </span>
        </div>
      </div>
    </div>
  );
};

// 메인 컴포넌트
export default function EnhancedSearchPage() {
  const t = useTranslations("Search");
  const searchParams = useSearchParams();
  const router = useRouter();

  // 상태 관리
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchState, setSearchState] = useState({
    query: "",
    filters: getDefaultFilters(), // 새로운 함수 사용
    sortBy: "recommendation",
    page: 1,
    hasMore: true,
  });
  const [totalResults, setTotalResults] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());
  const [processingTime, setProcessingTime] = useState<number>();

  // 정렬 옵션
  const sortOptions = [
    { value: "recommendation", label: "추천순" },
    { value: "rating", label: "평점순" },
    { value: "review_count", label: "리뷰순" },
    { value: "distance", label: "거리순" },
    { value: "price_low", label: "가격 낮은순" },
    { value: "price_high", label: "가격 높은순" },
    { value: "newest", label: "최신순" },
    { value: "data_quality", label: "데이터 품질순" },
  ];

  // 빠른 필터
  const quickFilters = [
    { id: "nearMe", label: "내 주변", icon: "📍" },
    { id: "openNow", label: "지금 영업", icon: "🕐" },
    { id: "topRated", label: "평점 4.0+", icon: "⭐" },
    { id: "verified", label: "검증된 데이터", icon: "✅" },
    { id: "budget", label: "가성비", icon: "💰" },
    { id: "trending", label: "인기 급상승", icon: "🔥" },
  ];

  // 디바운스된 검색 함수
  const debouncedSearch = useCallback(
    debounce((query: string, filters: SearchFilters, sortBy: string) => {
      performSearch(query, filters, sortBy, 1);
    }, 300),
    []
  );

  // 검색 실행 함수
  const performSearch = async (
    query: string,
    filters: SearchFilters,
    sortBy: string,
    page: number = 1
  ) => {
    const startTime = Date.now();

    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // 실제 API 호출 예시
      // const response = await fetch('/api/places/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ query, filters, sortBy, page, limit: 20 })
      // });
      // const data = await response.json();

      // 목업 데이터로 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockPlaces: Place[] = Array.from({ length: 20 }, (_, i) => ({
        id: `place-${page}-${i}`,
        name: {
          ko: `${query || "테스트"} 장소 ${page * 20 + i + 1}`,
          en: `${query || "Test"} Place ${page * 20 + i + 1}`,
          ja: `${query || "テスト"}場所 ${page * 20 + i + 1}`,
        },
        address: {
          ko: `서울시 강남구 테스트동 ${i + 1}번지`,
          en: `${i + 1} Test-dong, Gangnam-gu, Seoul`,
          ja: `ソウル市江南区テスト洞${i + 1}番地`,
        },
        lat: 37.5665 + (Math.random() - 0.5) * 0.1,
        lon: 126.978 + (Math.random() - 0.5) * 0.1,
        category_std:
          filters.category !== "all" ? filters.category : "restaurant",
        rating_avg: 3.5 + Math.random() * 1.5,
        review_count: Math.floor(Math.random() * 2000) + 50,
        main_image_urls: [`/images/place-${i + 1}.jpg`],
        recommendation_score: 6 + Math.random() * 4,
        crowd_index: Math.floor(Math.random() * 100),
        distance: Math.random() * 10,
        price_level: Math.floor(Math.random() * 4) + 1,
        features: ["Wi-Fi", "주차가능", "카드결제"],
        platform_data: {
          kakao: { available: true, rating: 4.2, review_count: 150 },
          naver: {
            available: Math.random() > 0.3,
            rating: 4.1,
            review_count: 220,
          },
          google: {
            available: Math.random() > 0.4,
            rating: 4.3,
            review_count: 180,
          },
        },
        data_quality_score: Math.floor(Math.random() * 30) + 70,
        last_updated: new Date().toISOString(),
      }));

      // 필터링 적용
      let filteredPlaces = mockPlaces.filter((place) => {
        if (
          filters.category !== "all" &&
          place.category_std !== filters.category
        )
          return false;
        if (filters.rating > 0 && place.rating_avg < filters.rating)
          return false;
        if (
          filters.dataQuality > 0 &&
          place.data_quality_score < filters.dataQuality
        )
          return false;

        // 플랫폼 수 체크
        const platformCount = Object.values(place.platform_data).filter(
          (p) => p?.available
        ).length;
        if (filters.platformCount > 1 && platformCount < filters.platformCount)
          return false;

        return true;
      });

      // 정렬 적용
      switch (sortBy) {
        case "rating":
          filteredPlaces.sort((a, b) => b.rating_avg - a.rating_avg);
          break;
        case "review_count":
          filteredPlaces.sort((a, b) => b.review_count - a.review_count);
          break;
        case "distance":
          filteredPlaces.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          break;
        case "data_quality":
          filteredPlaces.sort(
            (a, b) => b.data_quality_score - a.data_quality_score
          );
          break;
        default:
          filteredPlaces.sort(
            (a, b) => b.recommendation_score - a.recommendation_score
          );
      }

      const endTime = Date.now();
      setProcessingTime(endTime - startTime);

      if (page === 1) {
        setPlaces(filteredPlaces);
      } else {
        setPlaces((prev) => [...prev, ...filteredPlaces]);
      }

      setTotalResults(filteredPlaces.length * 5); // 시뮬레이션
      setSearchState((prev) => ({
        ...prev,
        page,
        hasMore: page < 3, // 최대 3페이지로 시뮬레이션
      }));
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 검색어 변경 처리
  const handleSearchChange = (newQuery: string) => {
    setSearchState((prev) => ({ ...prev, query: newQuery }));
    debouncedSearch(newQuery, searchState.filters, searchState.sortBy);

    // 검색 기록에 추가
    if (newQuery.trim()) {
      searchHistory.addToHistory(newQuery.trim());
    }
  };

  // 필터 변경 처리
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...searchState.filters, ...newFilters };
    setSearchState((prev) => ({ ...prev, filters: updatedFilters, page: 1 }));
    performSearch(searchState.query, updatedFilters, searchState.sortBy, 1);
  };

  // 정렬 변경 처리
  const handleSortChange = (newSort: string) => {
    setSearchState((prev) => ({ ...prev, sortBy: newSort, page: 1 }));
    performSearch(searchState.query, searchState.filters, newSort, 1);
  };

  // 더 보기 (무한 스크롤)
  const loadMore = () => {
    if (!isLoadingMore && searchState.hasMore) {
      const nextPage = searchState.page + 1;
      performSearch(
        searchState.query,
        searchState.filters,
        searchState.sortBy,
        nextPage
      );
    }
  };

  // 빠른 필터 적용
  const applyQuickFilter = (filterId: string) => {
    switch (filterId) {
      case "openNow":
        handleFilterChange({ openNow: !searchState.filters.openNow });
        break;
      case "topRated":
        handleFilterChange({ rating: searchState.filters.rating >= 4 ? 0 : 4 });
        break;
      case "verified":
        handleFilterChange({
          dataQuality: searchState.filters.dataQuality >= 80 ? 0 : 80,
        });
        break;
      case "budget":
        handleFilterChange({
          priceLevel: searchState.filters.priceLevel === "1" ? "all" : "1",
        });
        break;
    }
  };

  // 북마크 토글
  const toggleSavePlace = (placeId: string) => {
    setSavedPlaces((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(placeId)) {
        newSet.delete(placeId);
      } else {
        newSet.add(placeId);
      }
      return newSet;
    });
  };

  // 초기 로드
  useEffect(() => {
    // 임시로 기본 URL 파싱 구현 (실제로는 searchUrl.parseSearchUrl 사용)
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "all";
    const rating = Number(searchParams.get("rating")) || 0;
    const sortBy = searchParams.get("sort") || "recommendation";

    const urlFilters = {
      ...getDefaultFilters(),
      category,
      rating,
    };

    setSearchState((prev) => ({
      ...prev,
      query,
      filters: urlFilters,
      sortBy,
    }));

    if (query || category !== "all" || rating > 0) {
      performSearch(query, urlFilters, sortBy);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 검색 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* 검색바 */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="장소, 카테고리, 지역을 검색하세요..."
              value={searchState.query}
              onChange={(e) => handleSearchChange(e.target.value)}
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              className="w-full text-base"
            />
          </div>

          {/* 빠른 필터 */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            {quickFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={
                  (filter.id === "openNow" && searchState.filters.openNow) ||
                  (filter.id === "topRated" &&
                    searchState.filters.rating >= 4) ||
                  (filter.id === "verified" &&
                    searchState.filters.dataQuality >= 80) ||
                  (filter.id === "budget" &&
                    searchState.filters.priceLevel === "1")
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => applyQuickFilter(filter.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span>{filter.icon}</span>
                {filter.label}
              </Button>
            ))}
          </div>

          {/* 제어 버튼들 */}
          <div className="flex items-center justify-between">
            {/* 뷰 모드 전환 */}
            <div className="flex items-center gap-4">
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  리스트
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className="rounded-none"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  지도
                </Button>
                <Button
                  variant={viewMode === "both" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("both")}
                  className="rounded-none"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                  둘다
                </Button>
              </div>

              {/* 정렬 */}
              <select
                value={searchState.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 고급 필터 토글 */}
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              고급 필터
              {hasActiveFilters(searchState.filters) && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  •
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* 고급 필터 패널 */}
        <AdvancedFilters
          filters={searchState.filters}
          onFiltersChange={handleFilterChange}
          isOpen={isFiltersOpen}
          onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
        />
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 검색 결과 통계 */}
        {(places.length > 0 || isLoading) && (
          <SearchStats
            totalResults={totalResults}
            query={searchState.query}
            filters={searchState.filters}
            processingTime={processingTime}
          />
        )}

        {/* 메인 컨텐츠 영역 */}
        <div
          className={cn(
            "grid gap-6",
            viewMode === "both" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          )}
        >
          {/* 리스트 뷰 */}
          {(viewMode === "list" || viewMode === "both") && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <PlaceCardSkeleton key={i} />
                  ))}
                </div>
              ) : places.length > 0 ? (
                <>
                  {/* 장소 카드 그리드 */}
                  <div
                    className={cn(
                      "grid gap-6",
                      viewMode === "both"
                        ? "grid-cols-1"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    )}
                  >
                    {places.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        showRecommendationScore
                        showPlatformIndicator
                        showDataQuality
                        isBookmarked={savedPlaces.has(place.id)}
                        onBookmarkToggle={toggleSavePlace}
                        className="h-full"
                      />
                    ))}
                  </div>

                  {/* 더 보기 버튼 */}
                  {searchState.hasMore && (
                    <div className="text-center pt-6">
                      <Button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        size="lg"
                        className="min-w-[200px]"
                      >
                        {isLoadingMore ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            로딩 중...
                          </>
                        ) : (
                          `더 많은 결과 보기 (${
                            totalResults - places.length
                          }개 남음)`
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                !isLoading && (
                  /* 검색 결과 없음 */
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      검색 결과가 없습니다
                    </h3>
                    <p className="text-gray-600 mb-6">
                      다른 키워드나 필터 조건을 시도해보세요
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleFilterChange(getDefaultFilters())}
                      >
                        필터 초기화
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSearchChange("")}
                      >
                        전체 장소 보기
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* 지도 뷰 */}
          {(viewMode === "map" || viewMode === "both") && (
            <div
              className={cn(
                "bg-white rounded-xl shadow-sm overflow-hidden",
                viewMode === "map" ? "h-[800px]" : "h-[600px]"
              )}
            >
              <div className="h-full">
                {isLoading ? (
                  <MapViewSkeleton />
                ) : (
                  <MapView
                    places={places}
                    onPlaceSelect={(place) => {
                      // 장소 선택 시 처리 (예: 사이드 패널 열기)
                      console.log("Selected place:", place);
                    }}
                    selectedPlace={null}
                    zoom={12}
                    center={{ lat: 37.5665, lng: 126.978 }}
                    showClusters={true}
                    showTraffic={false}
                    className="h-full"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* 검색 팁 (결과가 없을 때) */}
        {!isLoading && places.length === 0 && searchState.query && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">💡 검색 팁</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">🔍 검색 키워드</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 지역명 + 카테고리 (예: "강남 카페")</li>
                    <li>• 구체적인 장소명 (예: "경복궁")</li>
                    <li>• 음식 종류 (예: "이탈리안 레스토랑")</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">🎯 필터 활용</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 평점과 리뷰 수로 품질 확인</li>
                    <li>• 거리 필터로 접근성 고려</li>
                    <li>• 데이터 품질로 신뢰도 확인</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 인기 검색어 (결과가 없을 때) */}
        {!isLoading && places.length === 0 && !searchState.query && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">🔥 인기 검색어</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "서울 맛집",
                  "부산 카페",
                  "제주도 관광",
                  "강남 술집",
                  "홍대 클럽",
                  "명동 쇼핑",
                  "경복궁",
                  "한강공원",
                ].map((keyword) => (
                  <Button
                    key={keyword}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearchChange(keyword)}
                    className="text-sm"
                  >
                    {keyword}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
