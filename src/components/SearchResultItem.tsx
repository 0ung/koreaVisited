// components/SearchResultItem.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

interface Place {
  id: string;
  name: {
    ko: string;
    en: string;
    ja: string;
  };
  address: {
    ko: string;
    en: string;
    ja: string;
  };
  lat: number;
  lon: number;
  category_std: string;
  rating_avg: number;
  review_count: number;
  main_image_urls: string[];
  recommendation_score: number;
  distance?: number;
  isOpen?: boolean;
  priceLevel?: number;
  tags: string[];
  crowd_index?: number;
}

interface SearchResultItemProps {
  place: Place;
  isSaved: boolean;
  onToggleSave: (placeId: string) => void;
  onGetDirections?: (place: Place) => void;
  viewMode?: "list" | "grid";
}

export default function SearchResultItem({
  place,
  isSaved,
  onToggleSave,
  onGetDirections,
  viewMode = "list",
}: SearchResultItemProps) {
  const t = useTranslations("Search");
  const params = useParams();
  const locale = params.locale as string;
  const [imageError, setImageError] = useState(false);

  // 현재 언어에 맞는 이름과 주소 가져오기
  const getLocalizedText = (textObj: {
    ko: string;
    en: string;
    ja: string;
  }) => {
    return textObj[locale as keyof typeof textObj] || textObj.ko;
  };

  // 혼잡도 색상
  const getCrowdColor = (crowdIndex: number) => {
    if (crowdIndex <= 30) return "text-green-600 bg-green-100";
    if (crowdIndex <= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  // 혼잡도 텍스트
  const getCrowdText = (crowdIndex: number) => {
    if (crowdIndex <= 30) return "여유";
    if (crowdIndex <= 70) return "보통";
    return "혼잡";
  };

  // 가격대 표시
  const getPriceLevel = (level?: number) => {
    if (!level) return "";
    return "₩".repeat(level);
  };

  // 카테고리 한글명
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      restaurants: "맛집",
      cafes: "카페",
      attractions: "관광지",
      hotels: "숙박",
      shopping: "쇼핑",
      nightlife: "유흥",
      culture: "문화",
      nature: "자연",
      sports: "스포츠",
    };
    return categoryMap[category] || category;
  };

  if (viewMode === "grid") {
    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
        <Link href={`/places/${place.id}`}>
          {/* 이미지 */}
          <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
            {/* 상태 배지들 */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
              {place.isOpen && (
                <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  영업중
                </span>
              )}
              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                {getCategoryName(place.category_std)}
              </span>
            </div>

            {/* 저장 버튼 */}
            <div className="absolute top-3 right-3 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleSave(place.id);
                }}
                className="w-8 h-8 bg-white/90 hover:bg-white"
              >
                <svg
                  className={cn(
                    "w-4 h-4",
                    isSaved ? "text-red-500 fill-current" : "text-gray-600"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </Button>
            </div>

            {/* 혼잡도 */}
            {place.crowd_index && (
              <div className="absolute bottom-3 left-3 z-10">
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    getCrowdColor(place.crowd_index)
                  )}
                >
                  {getCrowdText(place.crowd_index)}
                </span>
              </div>
            )}

            {/* 이미지 placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="text-white text-4xl">📸</span>
            </div>
          </div>
        </Link>

        <CardContent className="p-4">
          <Link href={`/places/${place.id}`}>
            {/* 제목과 평점 */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {getLocalizedText(place.name)}
              </h3>
              <div className="flex items-center text-sm text-yellow-500 ml-2">
                <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">{place.rating_avg}</span>
              </div>
            </div>

            {/* 주소 */}
            <p className="text-sm text-gray-500 mb-2 line-clamp-1">
              {getLocalizedText(place.address)}
            </p>

            {/* 거리와 가격 */}
            <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                {place.distance
                  ? `${Math.round(place.distance)}m`
                  : "거리 정보 없음"}
              </div>
              {place.priceLevel && (
                <span className="text-green-600 font-medium">
                  {getPriceLevel(place.priceLevel)}
                </span>
              )}
            </div>

            {/* 태그 */}
            <div className="flex flex-wrap gap-1 mb-3">
              {place.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {place.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{place.tags.length - 3}
                </span>
              )}
            </div>
          </Link>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGetDirections?.(place)}
              className="flex-1 text-xs"
            >
              길찾기
            </Button>
            <Button
              variant="default"
              size="sm"
              asChild
              className="flex-1 text-xs"
            >
              <Link href={`/places/${place.id}`}>상세보기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 리스트 뷰
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex">
        <Link href={`/places/${place.id}`} className="flex-shrink-0">
          {/* 이미지 */}
          <div className="w-48 h-32 bg-gradient-to-br from-blue-400 to-purple-500 relative">
            {/* 상태 배지 */}
            <div className="absolute top-2 left-2 z-10">
              {place.isOpen && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  영업중
                </span>
              )}
            </div>

            {/* 저장 버튼 */}
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleSave(place.id);
                }}
                className="w-8 h-8 bg-white/80 hover:bg-white"
              >
                <svg
                  className={cn(
                    "w-4 h-4",
                    isSaved ? "text-red-500 fill-current" : "text-gray-600"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </Button>
            </div>

            {/* 이미지 placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl">
              📸
            </div>
          </div>
        </Link>

        {/* 내용 */}
        <CardContent className="flex-1 p-4">
          <Link href={`/places/${place.id}`}>
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors mb-1">
                  {getLocalizedText(place.name)}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {getCategoryName(place.category_std)}
                  </span>
                  {place.priceLevel && (
                    <span className="text-green-600 font-medium">
                      {getPriceLevel(place.priceLevel)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600 ml-4">
                <svg
                  className="w-4 h-4 mr-1 text-yellow-500 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">{place.rating_avg}</span>
                <span className="text-gray-400 ml-1">
                  ({place.review_count})
                </span>
              </div>
            </div>

            {/* 주소 */}
            <p className="text-sm text-gray-500 mb-2">
              {getLocalizedText(place.address)}
            </p>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                {place.distance
                  ? `${Math.round(place.distance)}m`
                  : "거리 정보 없음"}
              </div>

              {place.crowd_index && (
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    getCrowdColor(place.crowd_index)
                  )}
                >
                  {getCrowdText(place.crowd_index)} {place.crowd_index}%
                </span>
              )}
            </div>
          </Link>

          {/* 하단 */}
          <div className="flex items-center justify-between">
            {/* 태그 */}
            <div className="flex flex-wrap gap-1 flex-1">
              {place.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGetDirections?.(place)}
              >
                길찾기
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href={`/places/${place.id}`}>상세보기</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
