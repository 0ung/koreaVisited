// src/hooks/useCategoryData.ts
import { useState, useEffect, useMemo } from "react";

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

interface CategoryInfo {
  id: string;
  name: { ko: string; en: string; ja: string };
  description: { ko: string; en: string; ja: string };
  icon: string;
  color: string;
  gradient: string;
  total_places: number;
  avg_rating: number;
  top_regions: string[];
  trending_keywords: string[];
  subcategories: SubCategory[];
}

interface SubCategory {
  id: string;
  name: { ko: string; en: string; ja: string };
  icon: string;
  place_count: number;
}

interface CategoryStats {
  total_places: number;
  avg_rating: number;
  total_reviews: number;
  platform_coverage: {
    kakao: number;
    naver: number;
    google: number;
  };
  price_distribution: {
    level_1: number;
    level_2: number;
    level_3: number;
    level_4: number;
  };
  region_distribution: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
}

export function useCategoryData(
  categoryId: string,
  locale: string,
  selectedSubcategory: string,
  sortBy: string
) {
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(
    null
  );
  const [places, setPlaces] = useState<Place[]>([]);
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 카테고리 정보 로드
  useEffect(() => {
    const loadCategoryData = async () => {
      setIsLoading(true);

      try {
        // 실제 API: /api/categories/${categoryId}?locale=${locale}
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 목업 데이터
        const mockCategoryInfo: CategoryInfo = {
          id: categoryId,
          name: {
            ko:
              categoryId === "restaurant"
                ? "맛집"
                : categoryId === "cafe"
                ? "카페"
                : categoryId === "tourist"
                ? "관광지"
                : categoryId === "culture"
                ? "문화시설"
                : categoryId === "shopping"
                ? "쇼핑"
                : categoryId === "nature"
                ? "자연"
                : categoryId === "activity"
                ? "액티비티"
                : categoryId === "hotel"
                ? "숙박"
                : "기타",
            en:
              categoryId === "restaurant"
                ? "Restaurants"
                : categoryId === "cafe"
                ? "Cafes"
                : categoryId === "tourist"
                ? "Tourist Attractions"
                : categoryId === "culture"
                ? "Cultural Facilities"
                : categoryId === "shopping"
                ? "Shopping"
                : categoryId === "nature"
                ? "Nature"
                : categoryId === "activity"
                ? "Activities"
                : categoryId === "hotel"
                ? "Hotels"
                : "Others",
            ja:
              categoryId === "restaurant"
                ? "グルメ"
                : categoryId === "cafe"
                ? "カフェ"
                : categoryId === "tourist"
                ? "観光地"
                : categoryId === "culture"
                ? "文化施設"
                : categoryId === "shopping"
                ? "ショッピング"
                : categoryId === "nature"
                ? "自然"
                : categoryId === "activity"
                ? "アクティビティ"
                : categoryId === "hotel"
                ? "ホテル"
                : "その他",
          },
          description: {
            ko: `검증된 데이터로 엄선된 ${
              categoryId === "restaurant"
                ? "맛집"
                : categoryId === "cafe"
                ? "카페"
                : "장소"
            }들을 만나보세요.`,
            en: `Discover curated ${categoryId}s with verified data from multiple platforms.`,
            ja: `検証されたデータで厳選された${
              categoryId === "restaurant"
                ? "グルメ"
                : categoryId === "cafe"
                ? "カフェ"
                : "場所"
            }をお楽しみください。`,
          },
          icon:
            categoryId === "restaurant"
              ? "🍽️"
              : categoryId === "cafe"
              ? "☕"
              : categoryId === "tourist"
              ? "🏛️"
              : categoryId === "culture"
              ? "🎭"
              : categoryId === "shopping"
              ? "🛍️"
              : categoryId === "nature"
              ? "🌳"
              : categoryId === "activity"
              ? "🎢"
              : categoryId === "hotel"
              ? "🏨"
              : "📍",
          color:
            categoryId === "restaurant"
              ? "text-red-600"
              : categoryId === "cafe"
              ? "text-amber-600"
              : categoryId === "tourist"
              ? "text-blue-600"
              : categoryId === "culture"
              ? "text-purple-600"
              : categoryId === "shopping"
              ? "text-pink-600"
              : categoryId === "nature"
              ? "text-green-600"
              : categoryId === "activity"
              ? "text-indigo-600"
              : categoryId === "hotel"
              ? "text-gray-600"
              : "text-gray-600",
          gradient:
            categoryId === "restaurant"
              ? "from-red-500 to-orange-500"
              : categoryId === "cafe"
              ? "from-amber-500 to-yellow-500"
              : categoryId === "tourist"
              ? "from-blue-500 to-cyan-500"
              : categoryId === "culture"
              ? "from-purple-500 to-pink-500"
              : categoryId === "shopping"
              ? "from-pink-500 to-rose-500"
              : categoryId === "nature"
              ? "from-green-500 to-emerald-500"
              : categoryId === "activity"
              ? "from-indigo-500 to-blue-500"
              : categoryId === "hotel"
              ? "from-gray-500 to-slate-500"
              : "from-gray-500 to-slate-500",
          total_places: Math.floor(Math.random() * 2000) + 500,
          avg_rating: 4.0 + Math.random() * 0.8,
          top_regions: ["강남구", "마포구", "중구", "종로구", "송파구"],
          trending_keywords:
            categoryId === "restaurant"
              ? ["맛집", "한식", "일식", "브런치"]
              : categoryId === "cafe"
              ? ["디저트", "원두", "뷰맛집", "스터디"]
              : ["인기", "추천", "예약", "방문"],
          subcategories:
            categoryId === "restaurant"
              ? [
                  {
                    id: "korean",
                    name: { ko: "한식", en: "Korean", ja: "韓国料理" },
                    icon: "🥢",
                    place_count: 245,
                  },
                  {
                    id: "japanese",
                    name: { ko: "일식", en: "Japanese", ja: "日本料理" },
                    icon: "🍣",
                    place_count: 198,
                  },
                  {
                    id: "western",
                    name: { ko: "양식", en: "Western", ja: "洋食" },
                    icon: "🍝",
                    place_count: 167,
                  },
                  {
                    id: "chinese",
                    name: { ko: "중식", en: "Chinese", ja: "中華料理" },
                    icon: "🥟",
                    place_count: 134,
                  },
                  {
                    id: "dessert",
                    name: { ko: "디저트", en: "Dessert", ja: "デザート" },
                    icon: "🧁",
                    place_count: 156,
                  },
                ]
              : categoryId === "cafe"
              ? [
                  {
                    id: "specialty",
                    name: { ko: "전문점", en: "Specialty", ja: "専門店" },
                    icon: "☕",
                    place_count: 189,
                  },
                  {
                    id: "chain",
                    name: { ko: "체인점", en: "Chain", ja: "チェーン店" },
                    icon: "🏪",
                    place_count: 167,
                  },
                  {
                    id: "roastery",
                    name: {
                      ko: "로스터리",
                      en: "Roastery",
                      ja: "ロースタリー",
                    },
                    icon: "🫘",
                    place_count: 98,
                  },
                  {
                    id: "dessert_cafe",
                    name: {
                      ko: "디저트카페",
                      en: "Dessert Cafe",
                      ja: "デザートカフェ",
                    },
                    icon: "🍰",
                    place_count: 145,
                  },
                ]
              : [
                  {
                    id: "indoor",
                    name: { ko: "실내", en: "Indoor", ja: "屋内" },
                    icon: "🏢",
                    place_count: 120,
                  },
                  {
                    id: "outdoor",
                    name: { ko: "실외", en: "Outdoor", ja: "屋外" },
                    icon: "🌳",
                    place_count: 89,
                  },
                ],
        };

        const mockCategoryStats: CategoryStats = {
          total_places: mockCategoryInfo.total_places,
          avg_rating: mockCategoryInfo.avg_rating,
          total_reviews: Math.floor(Math.random() * 50000) + 10000,
          platform_coverage: {
            kakao: Math.floor(Math.random() * 30) + 70,
            naver: Math.floor(Math.random() * 30) + 65,
            google: Math.floor(Math.random() * 30) + 60,
          },
          price_distribution: {
            level_1: Math.floor(Math.random() * 200) + 100,
            level_2: Math.floor(Math.random() * 300) + 200,
            level_3: Math.floor(Math.random() * 200) + 150,
            level_4: Math.floor(Math.random() * 100) + 50,
          },
          region_distribution: [
            { region: "강남구", count: 324, percentage: 28 },
            { region: "마포구", count: 287, percentage: 25 },
            { region: "중구", count: 198, percentage: 17 },
            { region: "종로구", count: 156, percentage: 14 },
            { region: "송파구", count: 134, percentage: 12 },
            { region: "기타", count: 98, percentage: 4 },
          ],
        };

        // 목업 장소 데이터
        const mockPlaces: Place[] = Array.from({ length: 20 }, (_, i) => ({
          id: `place-${categoryId}-${i}`,
          name: {
            ko: `${mockCategoryInfo.name.ko} ${i + 1}`,
            en: `${mockCategoryInfo.name.en} ${i + 1}`,
            ja: `${mockCategoryInfo.name.ja} ${i + 1}`,
          },
          address: {
            ko: `서울시 강남구 테스트동 ${i + 1}번지`,
            en: `${i + 1} Test-dong, Gangnam-gu, Seoul`,
            ja: `ソウル市江南区テスト洞${i + 1}番地`,
          },
          lat: 37.5665 + (Math.random() - 0.5) * 0.1,
          lon: 126.978 + (Math.random() - 0.5) * 0.1,
          category_std: categoryId,
          rating_avg: 3.5 + Math.random() * 1.5,
          review_count: Math.floor(Math.random() * 1000) + 50,
          main_image_urls: [`/images/${categoryId}-${i + 1}.jpg`],
          recommendation_score: 6 + Math.random() * 4,
          crowd_index: Math.floor(Math.random() * 100),
          distance: Math.random() * 10,
          price_level: Math.floor(Math.random() * 4) + 1,
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

        setCategoryInfo(mockCategoryInfo);
        setCategoryStats(mockCategoryStats);
        setPlaces(mockPlaces);
        setFeaturedPlaces(mockPlaces.slice(0, 6));
      } catch (error) {
        console.error("Failed to load category data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId, locale]);

  // 필터링된 장소 목록
  const filteredPlaces = useMemo(() => {
    let filtered = [...places];

    // 서브카테고리 필터
    if (selectedSubcategory !== "all") {
      // 실제로는 place.subcategory_id로 필터링
      filtered = filtered.filter(() => Math.random() > 0.5); // 임시 필터링
    }

    // 정렬
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating_avg - a.rating_avg);
        break;
      case "review_count":
        filtered.sort((a, b) => b.review_count - a.review_count);
        break;
      case "price_low":
        filtered.sort((a, b) => (a.price_level || 0) - (b.price_level || 0));
        break;
      case "price_high":
        filtered.sort((a, b) => (b.price_level || 0) - (a.price_level || 0));
        break;
      default:
        filtered.sort(
          (a, b) => b.recommendation_score - a.recommendation_score
        );
    }

    return filtered;
  }, [places, selectedSubcategory, sortBy]);

  return {
    categoryInfo,
    categoryStats,
    places,
    featuredPlaces,
    filteredPlaces,
    isLoading,
  };
}
