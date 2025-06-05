"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface Place {
  id: string;
  name: string;
  location: string;
  image: string;
  description: string;
  tags: string[];
  isPopular?: boolean;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export default function HomePage() {
  const t = useTranslations("HomePage");
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        setFeaturedPlaces([
          {
            id: "1",
            name: "부산 감천문화마을",
            location: "부산 사하구",
            image: "/images/gamcheon.jpg",
            description:
              "색색깔의 집들이 절벽에 다닥다닥 붙어있는 모습이 마치 레고블럭 같아요",
            tags: ["포토존", "예술", "언덕마을"],
            isPopular: true,
          },
          {
            id: "2",
            name: "전주 한옥마을",
            location: "전주 완산구",
            image: "/images/jeonju.jpg",
            description: "한복 입고 걸으면 조선시대로 시간여행 온 기분이에요",
            tags: ["한복체험", "전통", "먹거리"],
          },
          {
            id: "3",
            name: "제주 성산일출봉",
            location: "제주 서귀포시",
            image: "/images/seongsan.jpg",
            description: "새벽에 오르면 정말 감동적인 일출을 볼 수 있어요",
            tags: ["일출", "자연", "트레킹"],
          },
          {
            id: "4",
            name: "경주 대릉원",
            location: "경주 중구",
            image: "/images/daereungwon.jpg",
            description: "고분들 사이를 걷다보면 천년의 이야기가 들려와요",
            tags: ["역사", "고분", "산책"],
          },
        ]);

        setCategories([
          {
            id: "1",
            name: "맛집",
            emoji: "🍜",
            description: "현지인이 가는 진짜 맛집",
          },
          {
            id: "2",
            name: "카페",
            emoji: "☕",
            description: "감성 가득한 카페들",
          },
          {
            id: "3",
            name: "관광지",
            emoji: "🏞️",
            description: "꼭 가봐야 할 명소들",
          },
          {
            id: "4",
            name: "체험",
            emoji: "🎎",
            description: "특별한 경험을 만들어요",
          },
          {
            id: "5",
            name: "쇼핑",
            emoji: "🛍️",
            description: "기념품부터 브랜드까지",
          },
          {
            id: "6",
            name: "숙소",
            emoji: "🏠",
            description: "편안한 하루를 위해",
          },
        ]);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0">
          {/* 장식용 도형들 */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-green-200 to-green-300 rounded-full opacity-25 animate-pulse delay-500"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 sm:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
              <span className="text-blue-600">{t("title")}</span>
            </h1>
            <p className="text-xl sm:text-2xl mb-12 text-gray-600 leading-relaxed">
              {t("description")}
            </p>

            {/* 메인 검색바 */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
                <div className="flex items-center flex-1 px-4">
                  <svg
                    className="w-6 h-6 text-gray-400 mr-3"
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
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 h-12 text-lg bg-transparent border-none outline-none placeholder:text-gray-500"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold flex-shrink-0"
                >
                  {t("searchButton")}
                </Button>
              </div>
            </div>

            {/* 인기 검색어 */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-wrap justify-center items-center gap-3">
                <span className="text-gray-500 text-sm font-medium">
                  {t("popularSearches")}:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "부산 해운대",
                    "제주도",
                    "전주 맛집",
                    "경복궁",
                    "홍대 카페",
                  ].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => {
                        setSearchQuery(keyword);
                        window.location.href = `/search?q=${encodeURIComponent(
                          keyword
                        )}`;
                      }}
                      className="px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-full border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("whatAreYouLookingFor")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("categoriesDescription")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    className="h-32 rounded-2xl"
                  />
                ))
              : categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className="group"
                  >
                    <Card className="h-32 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-white border-0 shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                          {category.emoji}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-500 leading-tight">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* 추천 장소 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t("recommendedPlaces")}
              </h2>
              <p className="text-gray-600 text-lg">{t("placesDescription")}</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:block">
              <Link href="/places">{t("viewAll")}</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton variant="rectangular" className="h-48" />
                    <CardContent className="p-4">
                      <Skeleton variant="text" className="h-6 mb-2" />
                      <Skeleton variant="text" className="h-4 mb-2 w-3/4" />
                      <Skeleton variant="text" lines={2} />
                    </CardContent>
                  </Card>
                ))
              : featuredPlaces.map((place) => (
                  <Link key={place.id} href={`/places/${place.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
                      <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
                        {place.isPopular && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                              인기
                            </span>
                          </div>
                        )}
                        {/* 이미지 placeholder */}
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <span className="text-white text-4xl">📸</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {place.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {place.location}
                        </p>
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-2">
                          {place.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {place.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>

          {/* 모바일 전체보기 버튼 */}
          <div className="text-center mt-8 sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/places">{t("viewAll")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 여행 팁 섹션 */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("travelTips")}
            </h2>
            <p className="text-gray-600 text-lg">{t("tipsDescription")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚌</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("tips.transport")}
              </h3>
              <p className="text-gray-600">{t("tips.transportDesc")}</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("tips.food")}
              </h3>
              <p className="text-gray-600">{t("tips.foodDesc")}</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("tips.money")}
              </h3>
              <p className="text-gray-600">{t("tips.moneyDesc")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
