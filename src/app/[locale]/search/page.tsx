"use client";

import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";
import { debounce } from "@/utils/debounce";
import SearchResultItem from "@/components/SearchResultItem";
import SearchEmptyState from "@/components/SearchEmptyState";
import {
  searchHistory,
  searchSuggestions,
  searchUrl,
  searchResults,
  searchAnalytics,
  geoUtils,
} from "@/utils/search";

// 타입 정의
interface Place {
  id: string;
  name: {
    ko: string;
    en: string;
    ja: string;
  };
  address: {
    ko: string;
    en: string;
    ja: string;
  };
  lat: number;
  lon: number;
  category_std: string;
  rating_avg: number;
  review_count: number;
  main_image_urls: string[];
  recommendation_score: number;
  distance?: number;
  isOpen?: boolean;
  priceLevel?: number;
  tags: string[];
  crowd_index?: number;
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
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  sortBy: string;
  viewMode: "list" | "map";
  page: number;
  hasMore: boolean;
}

export default function SearchPage() {
  const t = useTranslations("Search");
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useParams().locale as string; // 현재 언어 가져오기

  // 상태 관리
  const [searchState, setSearchState] = useState<SearchState>({
    query: searchParams.get("q") || "",
    filters: {
      category: searchParams.get("category") || "all",
      location: "",
      rating: 0,
      priceLevel: "all",
      distance: "all",
      openNow: false,
      freeWifi: false,
      parking: false,
      accessibility: false,
    },
    sortBy: "relevance",
    viewMode: "list",
    page: 1,
    hasMore: true,
  });

  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());

  // 카테고리 정의
  const categories = [
    { id: "all", name: t("categories.all"), icon: "🔍" },
    { id: "restaurants", name: t("categories.restaurants"), icon: "🍜" },
    { id: "cafes", name: t("categories.cafes"), icon: "☕" },
    { id: "attractions", name: t("categories.attractions"), icon: "🏞️" },
    { id: "hotels", name: t("categories.hotels"), icon: "🏨" },
    { id: "shopping", name: t("categories.shopping"), icon: "🛍️" },
    { id: "nightlife", name: t("categories.nightlife"), icon: "🌙" },
    { id: "culture", name: t("categories.culture"), icon: "🎎" },
    { id: "nature", name: t("categories.nature"), icon: "🌿" },
    { id: "sports", name: t("categories.sports"), icon: "⚽" },
  ];

  // 정렬 옵션
  const sortOptions = [
    { value: "relevance", label: t("sorting.relevance") },
    { value: "rating", label: t("sorting.rating") },
    { value: "distance", label: t("sorting.distance") },
    { value: "price_low", label: t("sorting.price_low") },
    { value: "price_high", label: t("sorting.price_high") },
    { value: "newest", label: t("sorting.newest") },
    { value: "popular", label: t("sorting.popular") },
  ];

  // 빠른 필터
  const quickFilters = [
    { id: "nearMe", label: t("quickFilters.nearMe"), icon: "📍" },
    { id: "openNow", label: t("quickFilters.openNow"), icon: "🕐" },
    { id: "topRated", label: t("quickFilters.topRated"), icon: "⭐" },
    { id: "budget", label: t("quickFilters.budget"), icon: "💰" },
    { id: "luxury", label: t("quickFilters.luxury"), icon: "👑" },
    { id: "trending", label: t("quickFilters.trending"), icon: "🔥" },
  ];

  // 디바운스된 검색 함수
  const debouncedSearch = useCallback(
    debounce((query: string, filters: SearchFilters, sortBy: string) => {
      performSearch(query, filters, sortBy, 1);
    }, 300),
    []
  );

  // 검색 실행
  const performSearch = async (
    query: string,
    filters: SearchFilters,
    sortBy: string,
    page: number = 1
  ) => {
    setIsLoading(true);

    try {
      // 실제 API 호출 (locale 포함)
      // const response = await fetch('/api/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     query,
      //     filters,
      //     sortBy,
      //     page,
      //     locale // 언어 정보 전달
      //   })
      // });
      // const data = await response.json();

      // 현재는 목업 데이터로 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 목업 데이터
      const mockPlaces: Place[] = [
        {
          id: "1",
          name: {
            ko: "부산 감천문화마을",
            en: "Gamcheon Culture Village",
            ja: "釜山甘川文化村",
          },
          address: {
            ko: "부산 사하구 감내2로 203",
            en: "203 Gamnae 2-ro, Saha-gu, Busan",
            ja: "釜山沙下区甘内2路203",
          },
          lat: 35.0976,
          lon: 129.0092,
          category_std: "attractions",
          rating_avg: 4.5,
          review_count: 1250,
          main_image_urls: ["/images/gamcheon.jpg"],
          recommendation_score: 9.2,
          distance: 1200,
          isOpen: true,
          priceLevel: 1,
          tags: ["포토존", "예술", "언덕마을"],
          crowd_index: 65,
        },
        {
          id: "2",
          name: {
            ko: "홍대 합정역 카페거리",
            en: "Hongdae Hapjeong Cafe Street",
            ja: "弘大合井駅カフェ街",
          },
          address: {
            ko: "서울 마포구 와우산로",
            en: "Wausan-ro, Mapo-gu, Seoul",
            ja: "ソウル麻浦区ワウ山路",
          },
          lat: 37.5547,
          lon: 126.9236,
          category_std: "cafes",
          rating_avg: 4.3,
          review_count: 890,
          main_image_urls: ["/images/hongdae-cafe.jpg"],
          recommendation_score: 8.7,
          distance: 800,
          isOpen: true,
          priceLevel: 2,
          tags: ["트렌디", "인스타", "데이트"],
          crowd_index: 78,
        },
        {
          id: "3",
          name: {
            ko: "명동 칼국수 골목",
            en: "Myeongdong Kalguksu Alley",
            ja: "明洞カルグクス横丁",
          },
          address: {
            ko: "서울 중구 명동2가",
            en: "Myeongdong 2-ga, Jung-gu, Seoul",
            ja: "ソウル中区明洞2街",
          },
          lat: 37.5636,
          lon: 126.9834,
          category_std: "restaurants",
          rating_avg: 4.7,
          review_count: 2100,
          main_image_urls: ["/images/myeongdong-food.jpg"],
          recommendation_score: 9.1,
          distance: 1500,
          isOpen: true,
          priceLevel: 1,
          tags: ["현지맛집", "저렴", "전통"],
          crowd_index: 45,
        },
      ];

      // 필터링 로직
      let filteredPlaces = mockPlaces;

      if (filters.category !== "all") {
        filteredPlaces = filteredPlaces.filter(
          (place) => place.category_std === filters.category
        );
      }

      if (filters.rating > 0) {
        filteredPlaces = filteredPlaces.filter(
          (place) => place.rating_avg >= filters.rating
        );
      }

      if (filters.openNow) {
        filteredPlaces = filteredPlaces.filter((place) => place.isOpen);
      }

      // 정렬 로직
      switch (sortBy) {
        case "rating":
          filteredPlaces.sort((a, b) => b.rating_avg - a.rating_avg);
          break;
        case "distance":
          filteredPlaces.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          break;
        case "popular":
          filteredPlaces.sort((a, b) => b.review_count - a.review_count);
          break;
        default:
          filteredPlaces.sort(
            (a, b) => b.recommendation_score - a.recommendation_score
          );
      }

      if (page === 1) {
        setPlaces(filteredPlaces);
      } else {
        setPlaces((prev) => [...prev, ...filteredPlaces]);
      }

      setTotalResults(filteredPlaces.length);
      setSearchState((prev) => ({
        ...prev,
        page,
        hasMore: filteredPlaces.length >= 20,
      }));
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어 변경 처리
  const handleSearchChange = (newQuery: string) => {
    setSearchState((prev) => ({ ...prev, query: newQuery }));
    debouncedSearch(newQuery, searchState.filters, searchState.sortBy);
  };

  // 필터 변경 처리
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...searchState.filters, ...newFilters };
    setSearchState((prev) => ({ ...prev, filters: updatedFilters }));
    performSearch(searchState.query, updatedFilters, searchState.sortBy);
  };

  // 정렬 변경 처리
  const handleSortChange = (newSort: string) => {
    setSearchState((prev) => ({ ...prev, sortBy: newSort }));
    performSearch(searchState.query, searchState.filters, newSort);
  };

  // 장소 저장 토글
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

  // 빠른 필터 적용
  const applyQuickFilter = (filterId: string) => {
    switch (filterId) {
      case "openNow":
        handleFilterChange({ openNow: !searchState.filters.openNow });
        break;
      case "topRated":
        handleFilterChange({
          rating: searchState.filters.rating === 4 ? 0 : 4,
        });
        break;
      // 다른 빠른 필터들도 구현 가능
    }
  };

  // 초기 검색 실행
  useEffect(() => {
    const urlData = searchUrl.parseSearchUrl(searchParams);
    setSearchState((prev) => ({
      ...prev,
      query: urlData.query,
      filters: urlData.filters,
      sortBy: urlData.sortBy,
    }));

    if (urlData.query) {
      performSearch(urlData.query, urlData.filters, urlData.sortBy);
    }
  }, []);

  // 검색어를 히스토리에 추가
  const addToSearchHistory = (query: string) => {
    if (query.trim()) {
      searchHistory.addToHistory(query.trim());
    }
  };

  // 혼잡도 색상
  const getCrowdColor = (crowdIndex: number) => {
    if (crowdIndex <= 30) return "text-green-600 bg-green-100";
    if (crowdIndex <= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 검색 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* 검색바 */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder={t("placeholder")}
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
                  (filter.id === "topRated" && searchState.filters.rating >= 4)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => applyQuickFilter(filter.id)}
                className="whitespace-nowrap flex-shrink-0"
              >
                <span className="mr-1">{filter.icon}</span>
                {filter.label}
              </Button>
            ))}
          </div>

          {/* 결과 수 & 컨트롤 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {totalResults > 0 && t("results.found", { count: totalResults })}
            </div>

            <div className="flex items-center gap-2">
              {/* 정렬 */}
              <select
                value={searchState.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* 필터 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterModalOpen(true)}
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {t("filters.title")}
              </Button>

              {/* 뷰 모드 토글 */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant={
                    searchState.viewMode === "list" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() =>
                    setSearchState((prev) => ({ ...prev, viewMode: "list" }))
                  }
                  className="rounded-none"
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
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </Button>
                <Button
                  variant={searchState.viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() =>
                    setSearchState((prev) => ({ ...prev, viewMode: "map" }))
                  }
                  className="rounded-none"
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-6">
        {searchState.viewMode === "list" ? (
          /* 리스트 뷰 */
          <div className="space-y-4">
            {isLoading && places.length === 0 ? (
              // 로딩 스켈레톤
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="flex">
                    <Skeleton variant="rectangular" className="w-48 h-32" />
                    <CardContent className="flex-1 p-4">
                      <Skeleton variant="text" className="h-6 mb-2 w-3/4" />
                      <Skeleton variant="text" className="h-4 mb-2 w-1/2" />
                      <Skeleton variant="text" lines={2} className="mb-3" />
                      <div className="flex gap-2">
                        <Skeleton variant="rectangular" className="h-6 w-16" />
                        <Skeleton variant="rectangular" className="h-6 w-16" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : places.length > 0 ? (
              places.map((place, index) => (
                <SearchResultItem
                  key={place.id}
                  place={place}
                  isSaved={savedPlaces.has(place.id)}
                  onToggleSave={toggleSavePlace}
                  onGetDirections={(place) => {
                    // 길찾기 로직 (카카오맵, 네이버지도, 구글맵 등)
                    console.log("길찾기:", place);
                  }}
                  viewMode="list"
                />
              ))
            ) : (
              // 검색 결과 없음
              <SearchEmptyState
                query={searchState.query}
                onClearSearch={() => {
                  setSearchState((prev) => ({ ...prev, query: "" }));
                  setPlaces([]);
                }}
                suggestions={searchSuggestions.getPopularSearches().slice(0, 6)}
                onSuggestionClick={handleSearchChange}
              />
            )}

            {/* 더 보기 버튼 */}
            {places.length > 0 && searchState.hasMore && (
              <div className="text-center py-6">
                <Button
                  variant="outline"
                  onClick={() =>
                    performSearch(
                      searchState.query,
                      searchState.filters,
                      searchState.sortBy,
                      searchState.page + 1
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? "로딩중..." : t("results.loadMore")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* 지도 뷰 */
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              지도 뷰
            </h3>
            <p className="text-gray-600 mb-4">
              지도 기능은 곧 구현될 예정입니다.
            </p>
            <p className="text-sm text-gray-500">
              카카오맵, 네이버지도, 구글맵 연동을 통한 멀티맵 기능을 제공할
              예정입니다.
            </p>
          </div>
        )}
      </div>

      {/* 필터 모달 */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title={t("filters.title")}
        size="lg"
      >
        <div className="space-y-6">
          {/* 카테고리 */}
          <div>
            <h4 className="font-semibold mb-3">{t("filters.category")}</h4>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    searchState.filters.category === category.id
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleFilterChange({ category: category.id })}
                  className="justify-start"
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 평점 */}
          <div>
            <h4 className="font-semibold mb-3">{t("filters.rating")}</h4>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <Button
                  key={rating}
                  variant={
                    searchState.filters.rating === rating
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleFilterChange({ rating })}
                >
                  {rating === 0 ? "전체" : `${rating}⭐ 이상`}
                </Button>
              ))}
            </div>
          </div>

          {/* 거리 */}
          <div>
            <h4 className="font-semibold mb-3">{t("filters.distance")}</h4>
            <select
              value={searchState.filters.distance}
              onChange={(e) => handleFilterChange({ distance: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">전체</option>
              <option value="500">500m 이내</option>
              <option value="1000">1km 이내</option>
              <option value="2000">2km 이내</option>
              <option value="5000">5km 이내</option>
            </select>
          </div>

          {/* 가격대 */}
          <div>
            <h4 className="font-semibold mb-3">{t("filters.price")}</h4>
            <div className="flex gap-2">
              {[
                { value: "all", label: "전체" },
                { value: "1", label: "₩ 저렴" },
                { value: "2", label: "₩₩ 보통" },
                { value: "3", label: "₩₩₩ 비쌈" },
                { value: "4", label: "₩₩₩₩ 고급" },
              ].map((price) => (
                <Button
                  key={price.value}
                  variant={
                    searchState.filters.priceLevel === price.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    handleFilterChange({ priceLevel: price.value })
                  }
                >
                  {price.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 기타 옵션 */}
          <div>
            <h4 className="font-semibold mb-3">기타 옵션</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchState.filters.openNow}
                  onChange={(e) =>
                    handleFilterChange({ openNow: e.target.checked })
                  }
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">{t("filters.openNow")}</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchState.filters.freeWifi}
                  onChange={(e) =>
                    handleFilterChange({ freeWifi: e.target.checked })
                  }
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">{t("filters.freeWifi")}</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchState.filters.parking}
                  onChange={(e) =>
                    handleFilterChange({ parking: e.target.checked })
                  }
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">{t("filters.parking")}</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchState.filters.accessibility}
                  onChange={(e) =>
                    handleFilterChange({ accessibility: e.target.checked })
                  }
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">{t("filters.accessibility")}</span>
              </label>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setSearchState((prev) => ({
                  ...prev,
                  filters: {
                    category: "all",
                    location: "",
                    rating: 0,
                    priceLevel: "all",
                    distance: "all",
                    openNow: false,
                    freeWifi: false,
                    parking: false,
                    accessibility: false,
                  },
                }));
              }}
              className="flex-1"
            >
              {t("filters.clearFilters")}
            </Button>
            <Button
              onClick={() => {
                performSearch(
                  searchState.query,
                  searchState.filters,
                  searchState.sortBy
                );
                setIsFilterModalOpen(false);
              }}
              className="flex-1"
            >
              {t("filters.applyFilters")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
