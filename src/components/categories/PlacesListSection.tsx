// src/components/categories/PlacesListSection.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

// 동적 임포트
const PlaceCard = dynamic(() => import("@/components/PlaceCard"), {
  loading: () => <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />,
  ssr: false,
});

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

interface SubCategory {
  id: string;
  name: { ko: string; en: string; ja: string };
  icon: string;
  place_count: number;
}

interface CategoryInfo {
  name: { ko: string; en: string; ja: string };
  subcategories: SubCategory[];
}

interface PlacesListSectionProps {
  categoryInfo: CategoryInfo;
  filteredPlaces: Place[];
  selectedSubcategory: string;
  onSubcategoryChange: (subcategoryId: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (viewMode: "grid" | "list") => void;
  locale: string;
}

// 서브카테고리 필터 컴포넌트
const SubCategoryFilter = ({
  subcategories,
  selectedSubcategory,
  onSubcategoryChange,
}: {
  subcategories: SubCategory[];
  selectedSubcategory: string;
  onSubcategoryChange: (subcategoryId: string) => void;
}) => {
  const t = useTranslations("Category");

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedSubcategory === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onSubcategoryChange("all")}
      >
        {t("all")}
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
};

export function PlacesListSection({
  categoryInfo,
  filteredPlaces,
  selectedSubcategory,
  onSubcategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  locale,
}: PlacesListSectionProps) {
  const t = useTranslations("Category");

  // 정렬 옵션
  const sortOptions = [
    { value: "recommendation", label: "추천순" },
    { value: "rating", label: "평점순" },
    { value: "review_count", label: "리뷰순" },
    { value: "newest", label: "최신순" },
    { value: "price_low", label: "가격 낮은순" },
    { value: "price_high", label: "가격 높은순" },
  ];

  return (
    <>
      {/* 필터 및 정렬 섹션 */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* 서브카테고리 필터 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {t("subcategory")}
              </h3>
              <SubCategoryFilter
                subcategories={categoryInfo.subcategories}
                selectedSubcategory={selectedSubcategory}
                onSubcategoryChange={onSubcategoryChange}
              />
            </div>

            {/* 정렬 및 뷰 모드 */}
            <div className="flex items-center gap-4">
              {/* 정렬 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t("sortBy")}</span>
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
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
                  onClick={() => onViewModeChange("grid")}
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
                  onClick={() => onViewModeChange("list")}
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
            {t("total")}{" "}
            {categoryInfo.name[locale as keyof typeof categoryInfo.name]}
            <span className="text-lg text-gray-500 ml-2">
              ({filteredPlaces.length.toLocaleString()}
              {t("count")})
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
              {t("noPlacesFound")}
            </h3>
            <p className="text-gray-600 mb-6">{t("tryOtherFilters")}</p>
            <Button
              onClick={() => {
                onSubcategoryChange("all");
                onSortChange("recommendation");
              }}
            >
              {t("resetFilters")}
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
