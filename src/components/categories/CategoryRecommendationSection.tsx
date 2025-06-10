// src/components/categories/CategoryRecommendationSection.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import type { CategoryInfo } from "@/types";

interface CategoryRecommendationSectionProps {
  categoryInfo: CategoryInfo;
  categoryId: string;
  locale: string;
  filteredPlaces: any[]; // 더보기 버튼 표시 조건용
}

export function CategoryRecommendationSection({
  categoryInfo,
  categoryId,
  locale,
  filteredPlaces,
}: CategoryRecommendationSectionProps) {
  const t = useTranslations("Category");

  return (
    <>
      {/* 더 보기 버튼 */}
      {filteredPlaces.length > 0 && (
        <div className="text-center mt-12">
          <Link href={`/search?category=${categoryId}`}>
            <Button size="lg" className="min-w-[200px]">
              {t("viewMore")}{" "}
              {categoryInfo.name[locale as keyof typeof categoryInfo.name]}{" "}
              {t("viewMorePlaces")}
            </Button>
          </Link>
        </div>
      )}

      {/* 카테고리 추천 섹션 */}
      <section className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">
          🎯 {categoryInfo.name[locale as keyof typeof categoryInfo.name]}{" "}
          {t("specialRecommendation")}
        </h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          {t("recommendationDesc")}
          {categoryInfo.name[locale as keyof typeof categoryInfo.name]}{" "}
          {t("findAllPlaces")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={`/search?category=${categoryId}&sort=rating`}>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 transition-colors">
              {t("highRatingOrder")}
            </Button>
          </Link>
          <Link href={`/search?category=${categoryId}&sort=recommendation`}>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 transition-colors">
              {t("aiRecommendationOrder")}
            </Button>
          </Link>
          <Link href={`/search?category=${categoryId}&dataQuality=80`}>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 transition-colors">
              {t("highQualityDataOnly")}
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
