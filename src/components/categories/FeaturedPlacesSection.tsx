// src/components/categories/FeaturedPlacesSection.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";

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

interface CategoryInfo {
  id: string;
  name: { ko: string; en: string; ja: string };
}

interface FeaturedPlacesSectionProps {
  categoryInfo: CategoryInfo;
  featuredPlaces: Place[];
  categoryId: string;
  locale: string;
}

export function FeaturedPlacesSection({
  categoryInfo,
  featuredPlaces,
  categoryId,
  locale,
}: FeaturedPlacesSectionProps) {
  const t = useTranslations("Category");

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          🏆 {categoryInfo.name[locale as keyof typeof categoryInfo.name]}{" "}
          {t("best")}
        </h2>
        <Link href={`/search?category=${categoryId}`}>
          <Button variant="outline" size="sm">
            {t("viewAll")}
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
  );
}
