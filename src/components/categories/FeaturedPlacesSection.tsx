// src/components/categories/FeaturedPlacesSection.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import type { Place, CategoryInfo } from "@/types";

// 동적 임포트
const PlaceCard = dynamic(() => import("@/components/PlaceCard"), {
  loading: () => <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />,
  ssr: false,
});


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
