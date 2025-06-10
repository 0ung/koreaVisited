// src/components/categories/CategoryHeroSection.tsx
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";

interface CategoryInfo {
  id: string;
  name: { ko: string; en: string; ja: string };
  description: { ko: string; en: string; ja: string };
  icon: string;
  gradient: string;
}

interface CategoryStats {
  total_places: number;
  avg_rating: number;
  total_reviews: number;
}

interface CategoryHeroSectionProps {
  categoryInfo: CategoryInfo;
  categoryStats: CategoryStats;
  locale: string;
}

export function CategoryHeroSection({
  categoryInfo,
  categoryStats,
  locale,
}: CategoryHeroSectionProps) {
  const t = useTranslations("Category");

  return (
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
              <div className="text-sm text-white/80">{t("totalPlaces")}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">
                ★ {categoryStats.avg_rating.toFixed(1)}
              </div>
              <div className="text-sm text-white/80">{t("avgRating")}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">
                {categoryStats.total_reviews.toLocaleString()}
              </div>
              <div className="text-sm text-white/80">{t("totalReviews")}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">3{t("count")}</div>
              <div className="text-sm text-white/80">
                {t("platformIntegration")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
