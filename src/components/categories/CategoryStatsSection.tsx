// src/components/categories/CategoryStatsSection.tsx
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

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

interface CategoryStatsSectionProps {
  categoryStats: CategoryStats;
}

// 카테고리 통계 카드 컴포넌트
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
}) => {
  const t = useTranslations("Category");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📍</span>
          {t("regionDistribution")}
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
                  {region.count}
                  {t("count")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 가격대 분포 컴포넌트
const PriceDistribution = ({
  data,
}: {
  data: CategoryStats["price_distribution"];
}) => {
  const t = useTranslations("Category");
  const total = data.level_1 + data.level_2 + data.level_3 + data.level_4;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>💰</span>
          {t("priceDistribution")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { level: t("cheap"), count: data.level_1, color: "bg-green-500" },
            { level: t("normal"), count: data.level_2, color: "bg-blue-500" },
            {
              level: t("expensive"),
              count: data.level_3,
              color: "bg-orange-500",
            },
            { level: t("luxury"), count: data.level_4, color: "bg-purple-500" },
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
                  {item.count}
                  {t("count")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export function CategoryStatsSection({
  categoryStats,
}: CategoryStatsSectionProps) {
  const t = useTranslations("Category");

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t("categoryStatus")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <CategoryStatCard
          title={t("platformCoverage")}
          value={`${Math.round(
            (categoryStats.platform_coverage.kakao +
              categoryStats.platform_coverage.naver +
              categoryStats.platform_coverage.google) /
              3
          )}%`}
          icon="📊"
          description={t("platformCoverageDesc")}
        />
        <CategoryStatCard
          title={t("dataQuality")}
          value={t("excellent")}
          icon="✅"
          description={t("dataQualityDesc")}
        />
        <CategoryStatCard
          title={t("mostRegion")}
          value={categoryStats.region_distribution[0].region}
          icon="📍"
          description={`${categoryStats.region_distribution[0].count}${t(
            "count"
          )} ${t("places")}`}
        />
        <CategoryStatCard
          title={t("update")}
          value={t("realtime")}
          icon="🔄"
          description={t("realtimeDesc")}
        />
      </div>

      {/* 상세 통계 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegionChart data={categoryStats.region_distribution} />
        <PriceDistribution data={categoryStats.price_distribution} />
      </div>
    </section>
  );
}
