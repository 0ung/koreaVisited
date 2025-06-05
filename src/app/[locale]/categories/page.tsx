"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";

// 홈페이지에서 사용된 Category 인터페이스 재사용
interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

// 확장된 카테고리 인터페이스 (카테고리 페이지 전용)
interface ExtendedCategory extends Category {
  placeCount: number;
  popularPlaces: string[];
  backgroundGradient: string;
}

export default function CategoriesPage() {
  const t = useTranslations("HomePage");
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드 (홈페이지와 동일한 패턴)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 홈페이지 카테고리 데이터를 확장
        setCategories([
          {
            id: "restaurants",
            name: "맛집",
            emoji: "🍜",
            description: "현지인이 가는 진짜 맛집",
            placeCount: 2847,
            popularPlaces: ["명동 칼국수", "부산 돼지국밥", "전주 비빔밥"],
            backgroundGradient: "from-red-400 to-pink-500",
          },
          {
            id: "cafes",
            name: "카페",
            emoji: "☕",
            description: "감성 가득한 카페들",
            placeCount: 1923,
            popularPlaces: ["홍대 루프탑", "강남 디저트", "제주 오션뷰"],
            backgroundGradient: "from-amber-400 to-orange-500",
          },
          {
            id: "attractions",
            name: "관광지",
            emoji: "🏞️",
            description: "꼭 가봐야 할 명소들",
            placeCount: 1456,
            popularPlaces: ["경복궁", "부산 해운대", "제주 성산일출봉"],
            backgroundGradient: "from-green-400 to-emerald-500",
          },
          {
            id: "experience",
            name: "체험",
            emoji: "🎎",
            description: "특별한 경험을 만들어요",
            placeCount: 892,
            popularPlaces: ["한복 체험", "도자기 만들기", "템플스테이"],
            backgroundGradient: "from-purple-400 to-indigo-500",
          },
          {
            id: "shopping",
            name: "쇼핑",
            emoji: "🛍️",
            description: "기념품부터 브랜드까지",
            placeCount: 734,
            popularPlaces: ["명동거리", "동대문", "롯데월드몰"],
            backgroundGradient: "from-blue-400 to-cyan-500",
          },
          {
            id: "hotels",
            name: "숙소",
            emoji: "🏠",
            description: "편안한 하루를 위해",
            placeCount: 567,
            popularPlaces: ["한옥스테이", "부산 해변 리조트", "제주 펜션"],
            backgroundGradient: "from-teal-400 to-blue-500",
          },
        ]);
      } catch (error) {
        console.error("카테고리 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // 검색 필터링
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 - 홈페이지 스타일 재사용 */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              <span className="text-blue-600">카테고리별</span> 탐색
            </h1>
            <p className="text-xl mb-8 text-gray-600 leading-relaxed">
              {t("categoriesDescription")}
            </p>

            {/* 검색바 */}
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder="카테고리 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
                className="text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 카테고리 그리드 - 홈페이지 카드 스타일 재사용 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  className="h-40 rounded-xl"
                />
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/search?category=${category.id}`}
                >
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden">
                    {/* 그라데이션 헤더 */}
                    <div
                      className={`h-24 bg-gradient-to-r ${category.backgroundGradient} relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-4 left-4">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                          {category.emoji}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-sm font-medium">
                          {category.placeCount.toLocaleString()}개
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {category.description}
                      </p>

                      {/* 인기 장소 미리보기 */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          인기 장소
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {category.popularPlaces
                            .slice(0, 3)
                            .map((place, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                              >
                                {place}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-600 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                          둘러보기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            // 검색 결과 없음 - 홈페이지 스타일과 일관성 유지
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-600 mb-4">다른 키워드로 검색해보세요.</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                전체 카테고리 보기
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 추가 정보 섹션 */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              더 자세한 검색이 필요하신가요?
            </h2>
            <p className="text-gray-600 mb-8">
              필터와 정렬 옵션을 활용해서 완벽한 장소를 찾아보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" asChild>
                <Link href="/search">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  상세 검색
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  홈으로 돌아가기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
