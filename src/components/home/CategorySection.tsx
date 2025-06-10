// src/components/home/CategorySection.tsx
"use client";

import { useTranslations } from "next-intl";
import { useMemo, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCachedFetch } from "@/utils/cache";

interface CategoryStats {
  category: string;
  count: number;
  avg_rating: number;
  icon: string;
  color: string;
}

// 스켈레톤 컴포넌트
const CategoryCardSkeleton = () => (
  <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton
          variant="circular"
          className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300"
        />
        <div className="flex-1">
          <Skeleton
            variant="text"
            className="h-5 w-20 mb-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"
          />
          <Skeleton
            variant="text"
            className="h-4 w-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full"
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

export function CategorySection() {
  const homeT = useTranslations("Home");
  const commonT = useTranslations("Common");

  // 캐시된 카테고리 데이터 fetch
  const { data: categories, loading: categoriesLoading } = useCachedFetch<
    CategoryStats[]
  >(
    "/api/categories/stats",
    {},
    600000 // 10분 캐시
  );

  const categoryIcons = useMemo(
    () => ({
      restaurants: { icon: "🍽️", color: "from-red-500 to-orange-500" },
      cafes: { icon: "☕", color: "from-amber-500 to-yellow-500" },
      attractions: { icon: "🏛️", color: "from-blue-500 to-indigo-500" },
      culture: { icon: "🎭", color: "from-purple-500 to-pink-500" },
      shopping: { icon: "🛍️", color: "from-green-500 to-emerald-500" },
      nature: { icon: "🌳", color: "from-teal-500 to-cyan-500" },
      nightlife: { icon: "🎢", color: "from-violet-500 to-purple-500" },
      accommodation: { icon: "🏨", color: "from-indigo-500 to-blue-500" },
    }),
    []
  );

  // 카테고리명 번역 함수
  const getCategoryName = useCallback(
    (category: string) => {
      const translated = homeT(
        `categories${category.charAt(0).toUpperCase() + category.slice(1)}`
      );

      if (translated.startsWith("categories")) {
        const fallbackMap: Record<string, string> = {
          restaurants: "맛집",
          cafes: "카페",
          attractions: "관광지",
          culture: "문화",
          shopping: "쇼핑",
          nature: "자연",
          nightlife: "나이트라이프",
          accommodation: "숙박",
        };
        return fallbackMap[category] || category;
      }

      return translated;
    },
    [homeT]
  );

  if (categoriesLoading) {
    return (
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
            {homeT("popularCategories") || "인기 카테고리"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ✨ {homeT("popularCategories") || "인기 카테고리"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI가 분석한 트렌드 데이터로 가장 핫한 장소들을 만나보세요
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categories?.map((category, index) => {
            const iconInfo =
              categoryIcons[category.category as keyof typeof categoryIcons];

            return (
              <Link
                key={category.category}
                href={`/categories/${category.category}`}
                className="group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                  {/* 배경 그라디언트 */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      iconInfo?.color || "from-gray-400 to-gray-500"
                    } opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  <CardContent className="relative p-8">
                    <div className="text-center">
                      <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                        {iconInfo?.icon || "📍"}
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors duration-300">
                        {getCategoryName(category.category)}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="font-semibold">
                          {category.count.toLocaleString()}
                          {commonT("countPlaces") || "개 장소"}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="font-semibold">
                            {category.avg_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* 호버 시 버튼 */}
                  <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105">
                      둘러보기
                    </button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
