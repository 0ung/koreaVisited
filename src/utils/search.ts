// utils/search.ts
import { storage } from "./storage";

// 검색 기록 관리
export const searchHistory = {
  getHistory: (): string[] => {
    return storage.get<string[]>("searchHistory", []) || [];
  },

  addToHistory: (query: string): void => {
    if (!query.trim()) return;

    const history = searchHistory.getHistory();
    const filteredHistory = history.filter((item) => item !== query);
    const newHistory = [query, ...filteredHistory].slice(0, 10); // 최대 10개

    storage.set("searchHistory", newHistory);
  },

  removeFromHistory: (query: string): void => {
    const history = searchHistory.getHistory();
    const newHistory = history.filter((item) => item !== query);
    storage.set("searchHistory", newHistory);
  },

  clearHistory: (): void => {
    storage.remove("searchHistory");
  },
};

// 검색 필터 관리
export interface SearchFilters {
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

export const searchFilters = {
  getDefaultFilters: (): SearchFilters => ({
    category: "all",
    location: "",
    rating: 0,
    priceLevel: "all",
    distance: "all",
    openNow: false,
    freeWifi: false,
    parking: false,
    accessibility: false,
  }),

  saveFilters: (filters: SearchFilters): void => {
    storage.set("searchFilters", filters);
  },

  getSavedFilters: (): SearchFilters => {
    return (
      storage.get<SearchFilters>(
        "searchFilters",
        searchFilters.getDefaultFilters()
      ) || searchFilters.getDefaultFilters()
    );
  },

  hasActiveFilters: (filters: SearchFilters): boolean => {
    const defaultFilters = searchFilters.getDefaultFilters();
    return JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  },
};

// 검색 제안 생성
export const searchSuggestions = {
  getPopularSearches: (): string[] => {
    return [
      "서울 맛집",
      "부산 여행",
      "제주도 카페",
      "강남 술집",
      "홍대 클럽",
      "명동 쇼핑",
      "경복궁",
      "한강공원",
      "롯데월드",
      "이태원",
    ];
  },

  getCategoryKeywords: (category: string): string[] => {
    const categoryKeywords: Record<string, string[]> = {
      restaurants: [
        "맛집",
        "한식",
        "중식",
        "일식",
        "양식",
        "분식",
        "치킨",
        "피자",
      ],
      cafes: ["카페", "커피", "디저트", "베이커리", "브런치", "스터디카페"],
      attractions: [
        "관광지",
        "명소",
        "박물관",
        "공원",
        "궁궐",
        "타워",
        "전망대",
      ],
      hotels: ["호텔", "펜션", "게스트하우스", "리조트", "모텔"],
      shopping: ["쇼핑", "백화점", "아울렛", "시장", "편의점", "마트"],
      nightlife: ["술집", "바", "클럽", "노래방", "pc방"],
      culture: ["문화", "공연", "전시", "영화관", "도서관"],
      nature: ["자연", "산", "바다", "강", "공원", "숲"],
      sports: ["스포츠", "헬스장", "수영장", "골프", "축구", "야구"],
    };

    return categoryKeywords[category] || [];
  },

  generateAutocompleteSuggestions: (
    query: string,
    category?: string
  ): string[] => {
    if (!query.trim()) return [];

    const popular = searchSuggestions.getPopularSearches();
    const categoryKeywords = category
      ? searchSuggestions.getCategoryKeywords(category)
      : [];

    // 모든 후보 키워드
    const allKeywords = [...popular, ...categoryKeywords];

    // 쿼리와 일치하는 키워드 필터링
    const filtered = allKeywords.filter((keyword) =>
      keyword.toLowerCase().includes(query.toLowerCase())
    );

    // 지역명 + 쿼리 조합 생성
    const locations = [
      "서울",
      "부산",
      "제주",
      "대구",
      "광주",
      "대전",
      "울산",
      "인천",
    ];
    const locationSuggestions = locations.map(
      (location) => `${location} ${query}`
    );

    // 결합 및 중복 제거
    const combined = [...filtered, ...locationSuggestions]
      .filter((item, index, self) => self.indexOf(item) === index)
      .slice(0, 8);

    return combined;
  },
};

// URL 쿼리 파라미터 관리
export const searchUrl = {
  buildSearchUrl: (
    query: string,
    filters: Partial<SearchFilters>,
    sortBy?: string
  ): string => {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "boolean") {
          if (value) params.set(key, "true");
        } else {
          params.set(key, String(value));
        }
      }
    });

    if (sortBy && sortBy !== "relevance") {
      params.set("sort", sortBy);
    }

    const queryString = params.toString();
    return queryString ? `/search?${queryString}` : "/search";
  },

  parseSearchUrl: (
    searchParams: URLSearchParams
  ): {
    query: string;
    filters: SearchFilters;
    sortBy: string;
  } => {
    const query = searchParams.get("q") || "";
    const sortBy = searchParams.get("sort") || "relevance";

    const filters: SearchFilters = {
      category: searchParams.get("category") || "all",
      location: searchParams.get("location") || "",
      rating: Number(searchParams.get("rating")) || 0,
      priceLevel: searchParams.get("priceLevel") || "all",
      distance: searchParams.get("distance") || "all",
      openNow: searchParams.get("openNow") === "true",
      freeWifi: searchParams.get("freeWifi") === "true",
      parking: searchParams.get("parking") === "true",
      accessibility: searchParams.get("accessibility") === "true",
    };

    return { query, filters, sortBy };
  },
};

// 검색 결과 정렬 및 필터링
export const searchResults = {
  filterPlaces: (places: any[], filters: SearchFilters): any[] => {
    let filtered = [...places];

    // 카테고리 필터
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (place) => place.category_std === filters.category
      );
    }

    // 평점 필터
    if (filters.rating > 0) {
      filtered = filtered.filter((place) => place.rating_avg >= filters.rating);
    }

    // 거리 필터
    if (filters.distance !== "all") {
      const maxDistance = Number(filters.distance);
      filtered = filtered.filter(
        (place) => !place.distance || place.distance <= maxDistance
      );
    }

    // 가격대 필터
    if (filters.priceLevel !== "all") {
      const priceLevel = Number(filters.priceLevel);
      filtered = filtered.filter((place) => place.priceLevel === priceLevel);
    }

    // 영업중 필터
    if (filters.openNow) {
      filtered = filtered.filter((place) => place.isOpen);
    }

    // 기타 편의시설 필터들은 실제 데이터에 해당 필드가 있을 때 구현

    return filtered;
  },

  sortPlaces: (places: any[], sortBy: string): any[] => {
    const sorted = [...places];

    switch (sortBy) {
      case "rating":
        return sorted.sort((a, b) => b.rating_avg - a.rating_avg);

      case "distance":
        return sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      case "price_low":
        return sorted.sort((a, b) => (a.priceLevel || 0) - (b.priceLevel || 0));

      case "price_high":
        return sorted.sort((a, b) => (b.priceLevel || 0) - (a.priceLevel || 0));

      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );

      case "popular":
        return sorted.sort((a, b) => b.review_count - a.review_count);

      default: // relevance
        return sorted.sort(
          (a, b) => b.recommendation_score - a.recommendation_score
        );
    }
  },
};

// 검색 분석 및 트래킹
export const searchAnalytics = {
  trackSearch: (
    query: string,
    filters: SearchFilters,
    resultCount: number
  ): void => {
    // 실제로는 analytics 서비스로 전송
    console.log("Search tracked:", {
      query,
      filters,
      resultCount,
      timestamp: new Date().toISOString(),
    });
  },

  trackPlaceClick: (placeId: string, query: string, position: number): void => {
    console.log("Place click tracked:", {
      placeId,
      query,
      position,
      timestamp: new Date().toISOString(),
    });
  },

  trackFilterUsage: (filterType: string, filterValue: any): void => {
    console.log("Filter usage tracked:", {
      filterType,
      filterValue,
      timestamp: new Date().toISOString(),
    });
  },
};

// 지리적 거리 계산
export const geoUtils = {
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 미터 단위 거리
  },

  getCurrentLocation: (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분 캐시
        }
      );
    });
  },

  addDistanceToPlaces: async (places: any[]): Promise<any[]> => {
    try {
      const userLocation = await geoUtils.getCurrentLocation();

      return places.map((place) => ({
        ...place,
        distance: geoUtils.calculateDistance(
          userLocation.lat,
          userLocation.lon,
          place.lat,
          place.lon
        ),
      }));
    } catch (error) {
      console.warn("Could not get user location:", error);
      return places;
    }
  },
};
