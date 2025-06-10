// src/components/categories/TrendingKeywordsSection.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface CategoryInfo {
  trending_keywords: string[];
}

interface TrendingKeywordsSectionProps {
  categoryInfo: CategoryInfo;
  categoryId: string;
}

export function TrendingKeywordsSection({
  categoryInfo,
  categoryId,
}: TrendingKeywordsSectionProps) {
  const t = useTranslations("Category");

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🔥 {t("trendingKeywords")}
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
                  className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
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
  );
}
