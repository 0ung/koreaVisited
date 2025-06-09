"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/utils/cn";

// 기존 UI 컴포넌트 재사용
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { storage } from "@/utils/storage";

// 동적 임포트
const PlaceCard = dynamic(() => import("@/components/PlaceCard"), {
  loading: () => <PlaceCardSkeleton />,
  ssr: false,
});

// 타입 정의
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

// 스켈레톤 컴포넌트
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

// 카테고리 통계 컴포넌트
const CategoryStatCard = ({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

// 지역별 분포 차트 컴포넌트
const RegionChart = ({
  data,
}: {
  data: CategoryStats["region_distribution"];
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <span>📍</span>
        지역별 분포
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {data.slice(0, 6).map((region, index) => (
          <div
            key={region.region}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                  index === 0
                    ? "bg-blue-500"
                    : index === 1
                    ? "bg-green-500"
                    : index === 2
                    ? "bg-orange-500"
                    : "bg-gray-500"
                )}
              >
                {index + 1}
              </div>
              <span className="font-medium">{region.region}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${region.percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 min-w-[3rem]">
                {region.count}개
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// 가격대 분포 컴포넌트
const PriceDistribution = ({
  data,
}: {
  data: CategoryStats["price_distribution"];
}) => {
  const total = data.level_1 + data.level_2 + data.level_3 + data.level_4;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>💰</span>
          가격대 분포
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { level: "₩ 저렴", count: data.level_1, color: "bg-green-500" },
            { level: "₩₩ 보통", count: data.level_2, color: "bg-blue-500" },
            { level: "₩₩₩ 비쌈", count: data.level_3, color: "bg-orange-500" },
            { level: "₩₩₩₩ 고급", count: data.level_4, color: "bg-purple-500" },
          ].map((item) => (
            <div key={item.level} className="flex items-center justify-between">
              <span className="font-medium">{item.level}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      item.color
                    )}
                    style={{
                      width: `${total > 0 ? (item.count / total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 min-w-[3rem]">
                  {item.count}개
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 서브카테고리 필터 컴포넌트
const SubCategoryFilter = ({
  subcategories,
  selectedSubcategory,
  onSubcategoryChange,
}: {
  subcategories: SubCategory[];
  selectedSubcategory: string;
  onSubcategoryChange: (subcategoryId: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    <Button
      variant={selectedSubcategory === "all" ? "default" : "outline"}
      size="sm"
      onClick={() => onSubcategoryChange("all")}
    >
      전체
    </Button>
    {subcategories.map((subcat) => (
      <Button
        key={subcat.id}
        variant={selectedSubcategory === subcat.id ? "default" : "outline"}
        size="sm"
        onClick={() => onSubcategoryChange(subcat.id)}
        className="flex items-center gap-2"
      >
        <span>{subcat.icon}</span>
        {subcat.name.ko}
        <span className="text-xs">({subcat.place_count})</span>
      </Button>
    ))}
  </div>
);

// 메인 카테고리 페이지 컴포넌트
export default function CategoryPage() {
  const t = useTranslations("CategoryPage");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const categoryId = params.categoryId as string;

  // 상태 관리
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(
    null
  );
  const [places, setPlaces] = useState<Place[]>([]);
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommendation");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 정렬 옵션
  const sortOptions = [
    { value: "recommendation", label: "추천순" },
    { value: "rating", label: "평점순" },
    { value: "review_count", label: "리뷰순" },
    { value: "newest", label: "최신순" },
    { value: "price_low", label: "가격 낮은순" },
    { value: "price_high", label: "가격 높은순" },
  ];

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
              <PlaceCardSkeleton key={i} />
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
            카테고리를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            요청하신 카테고리가 존재하지 않습니다.
          </p>
          <Button onClick={() => router.back()}>이전으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 카테고리 Hero 섹션 */}
      <section
        className={cn(
          "relative bg-gradient-to-br text-white overflow-hidden",
          categoryInfo.gradient
        )}
      >
        <div className="absolute inset-0 bg-black/20">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-6xl">{categoryInfo.icon}</div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {categoryInfo.name[locale as keyof typeof categoryInfo.name]}
                </h1>
                <p className="text-xl md:text-2xl text-white/90">
                  {
                    categoryInfo.description[
                      locale as keyof typeof categoryInfo.description
                    ]
                  }
                </p>
              </div>
            </div>

            {/* 실시간 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  {categoryStats.total_places.toLocaleString()}
                </div>
                <div className="text-sm text-white/80">총 장소</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  ★ {categoryStats.avg_rating.toFixed(1)}
                </div>
                <div className="text-sm text-white/80">평균 평점</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  {categoryStats.total_reviews.toLocaleString()}
                </div>
                <div className="text-sm text-white/80">총 리뷰</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">3개</div>
                <div className="text-sm text-white/80">플랫폼 통합</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 통계 카드 섹션 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            카테고리 현황
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CategoryStatCard
              title="플랫폼 커버리지"
              value={`${Math.round(
                (categoryStats.platform_coverage.kakao +
                  categoryStats.platform_coverage.naver +
                  categoryStats.platform_coverage.google) /
                  3
              )}%`}
              icon="📊"
              description="3개 플랫폼 평균"
            />
            <CategoryStatCard
              title="데이터 품질"
              value="우수"
              icon="✅"
              description="검증된 정보만 제공"
            />
            <CategoryStatCard
              title="최다 지역"
              value={categoryStats.region_distribution[0].region}
              icon="📍"
              description={`${categoryStats.region_distribution[0].count}개 장소`}
            />
            <CategoryStatCard
              title="업데이트"
              value="실시간"
              icon="🔄"
              description="지속적인 데이터 갱신"
            />
          </div>

          {/* 상세 통계 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RegionChart data={categoryStats.region_distribution} />
            <PriceDistribution data={categoryStats.price_distribution} />
          </div>
        </section>

        {/* 추천 장소 섹션 */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🏆 {categoryInfo.name[locale as keyof typeof categoryInfo.name]}{" "}
              베스트
            </h2>
            <Link href={`/search?category=${categoryId}`}>
              <Button variant="outline" size="sm">
                전체 보기
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                showRecommendationScore
                showDataQuality
                className="h-full"
              />
            ))}
          </div>
        </section>

        {/* 트렌딩 키워드 섹션 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🔥 인기 검색 키워드
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {categoryInfo.trending_keywords.map((keyword, index) => (
                  <Link
                    key={keyword}
                    href={`/search?q=${keyword}&category=${categoryId}`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <span className="text-orange-500 font-bold">
                        #{index + 1}
                      </span>
                      {keyword}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 필터 및 정렬 섹션 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* 서브카테고리 필터 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  세부 카테고리
                </h3>
                <SubCategoryFilter
                  subcategories={categoryInfo.subcategories}
                  selectedSubcategory={selectedSubcategory}
                  onSubcategoryChange={setSelectedSubcategory}
                />
              </div>

              {/* 정렬 및 뷰 모드 */}
              <div className="flex items-center gap-4">
                {/* 정렬 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">정렬:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 뷰 모드 */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
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
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 장소 목록 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              전체 {categoryInfo.name[locale as keyof typeof categoryInfo.name]}
              <span className="text-lg text-gray-500 ml-2">
                ({filteredPlaces.length.toLocaleString()}개)
              </span>
            </h2>
          </div>

          {filteredPlaces.length > 0 ? (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {filteredPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  showRecommendationScore
                  showPlatformIndicator
                  showDataQuality
                  className={viewMode === "list" ? "flex-row" : "h-full"}
                />
              ))}
            </div>
          ) : (
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
                조건에 맞는 장소가 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
                다른 서브카테고리나 정렬 옵션을 시도해보세요
              </p>
              <Button
                onClick={() => {
                  setSelectedSubcategory("all");
                  setSortBy("recommendation");
                }}
              >
                필터 초기화
              </Button>
            </div>
          )}
        </section>

        {/* 더 보기 버튼 */}
        {filteredPlaces.length > 0 && (
          <div className="text-center mt-12">
            <Link href={`/search?category=${categoryId}`}>
              <Button size="lg" className="min-w-[200px]">
                더 많은{" "}
                {categoryInfo.name[locale as keyof typeof categoryInfo.name]}{" "}
                보기
              </Button>
            </Link>
          </div>
        )}

        {/* 카테고리 추천 섹션 */}
        <section className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            🎯 {categoryInfo.name[locale as keyof typeof categoryInfo.name]}{" "}
            전문 추천
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            3개 플랫폼의 데이터를 종합 분석하여
            {categoryInfo.name[locale as keyof typeof categoryInfo.name]} 분야의
            숨겨진 명소부터 인기 장소까지 모두 찾아보세요
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/search?category=${categoryId}&sort=rating`}>
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                평점 높은 순
              </Button>
            </Link>
            <Link href={`/search?category=${categoryId}&sort=recommendation`}>
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                AI 추천순
              </Button>
            </Link>
            <Link href={`/search?category=${categoryId}&dataQuality=80`}>
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                고품질 데이터만
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
