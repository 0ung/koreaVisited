// src/components/PlaceCard.tsx - 번역 처리된 버전
"use client";

import { useState, useMemo, useCallback, memo, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import type { Place } from "@/types";

interface PlaceCardProps {
  place: Place;
  locale?: string;
  variant?: "default" | "compact" | "featured";
  showRecommendationScore?: boolean;
  showPlatformIndicator?: boolean;
  showDataQuality?: boolean;
  showCrowdStatus?: boolean;
  className?: string;
  onBookmarkToggle?: (placeId: string, isBookmarked: boolean) => void;
  isBookmarked?: boolean;
  priority?: boolean; // 이미지 우선순위 최적화
}

// 이미지 오류 처리 훅 (기존 코드 활용)
const useImageError = (imageUrls: string[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageError = useCallback(() => {
    setCurrentIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : prev));
  }, [imageUrls.length]);

  return {
    src: imageUrls[currentIndex] || "/images/placeholder.jpg",
    onError: handleImageError,
  };
};

// 플랫폼 데이터 표시 컴포넌트
const PlatformIndicator = memo(
  ({ platformData }: { platformData: Place["platform_data"] }) => {
    const t = useTranslations("PlaceCard");

    const platforms = useMemo(() => {
      const result = [];
      if (platformData.kakao?.available)
        result.push({ name: t("kakao"), color: "bg-yellow-500" });
      if (platformData.naver?.available)
        result.push({ name: t("naver"), color: "bg-green-500" });
      if (platformData.google?.available)
        result.push({ name: t("google"), color: "bg-blue-500" });
      return result;
    }, [platformData, t]);

    return (
      <div className="flex items-center gap-1">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className={cn("w-3 h-3 rounded-full", platform.color)}
            title={platform.name}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">
          {t("platformCount", { count: platforms.length })}
        </span>
      </div>
    );
  }
);

PlatformIndicator.displayName = "PlatformIndicator";

// 혼잡도 표시 컴포넌트
const CrowdIndicator = memo(({ crowdIndex }: { crowdIndex?: number }) => {
  const t = useTranslations("PlaceCard");

  if (!crowdIndex) return null;

  const { level, color, emoji } = useMemo(() => {
    if (crowdIndex >= 80)
      return { level: t("crowdVeryBusy"), color: "text-red-600", emoji: "🔴" };
    if (crowdIndex >= 60)
      return { level: t("crowdBusy"), color: "text-orange-600", emoji: "🟠" };
    if (crowdIndex >= 40)
      return { level: t("crowdNormal"), color: "text-yellow-600", emoji: "🟡" };
    return { level: t("crowdEmpty"), color: "text-green-600", emoji: "🟢" };
  }, [crowdIndex, t]);

  return (
    <div className="flex items-center gap-1">
      <span>{emoji}</span>
      <span className={cn("text-xs font-medium", color)}>{level}</span>
    </div>
  );
});

CrowdIndicator.displayName = "CrowdIndicator";

// 데이터 품질 배지
const QualityBadge = memo(({ score }: { score: number }) => {
  const t = useTranslations("PlaceCard");

  if (score < 70) return null;

  const { label, bgColor } = useMemo(() => {
    if (score >= 90)
      return {
        label: t("qualityVerified"),
        bgColor: "bg-green-100 text-green-800",
      };
    if (score >= 80)
      return {
        label: t("qualityExcellent"),
        bgColor: "bg-blue-100 text-blue-800",
      };
    return {
      label: t("qualityGood"),
      bgColor: "bg-yellow-100 text-yellow-800",
    };
  }, [score, t]);

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", bgColor)}>
      {label}
    </span>
  );
});

QualityBadge.displayName = "QualityBadge";

// 메인 PlaceCard 컴포넌트
const PlaceCard = memo<PlaceCardProps>(
  ({
    place,
    locale = "ko",
    variant = "default",
    showRecommendationScore = false,
    showPlatformIndicator = true,
    showDataQuality = false,
    showCrowdStatus = false,
    className,
    onBookmarkToggle,
    isBookmarked = false,
    priority = false,
  }) => {
    const t = useTranslations("PlaceCard");
    const { src, onError } = useImageError(place.main_image_urls);

    // 다국어 처리 (기존 로직 유지)
    const placeName = useMemo(
      () => place.name[locale as keyof typeof place.name] || place.name.ko,
      [place.name, locale]
    );

    const placeAddress = useMemo(
      () =>
        place.address[locale as keyof typeof place.address] || place.address.ko,
      [place.address, locale]
    );

    // 북마크 토글 (기존 로직 최적화)
    const handleBookmarkClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onBookmarkToggle?.(place.id, !isBookmarked);
      },
      [place.id, isBookmarked, onBookmarkToggle]
    );

    // 카드 변형별 스타일
    const cardStyles = useMemo(() => {
      const baseStyle =
        "bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md";

      switch (variant) {
        case "compact":
          return cn(baseStyle, "max-w-sm");
        case "featured":
          return cn(baseStyle, "border-2 border-blue-200 shadow-lg");
        default:
          return baseStyle;
      }
    }, [variant]);

    return (
      <Link href={`/places/${place.id}`} className={cn(cardStyles, className)}>
        <div className="relative">
          {/* 이미지 (Next.js Image 최적화 활용) */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={src}
              alt={placeName}
              fill
              className="object-cover transition-transform hover:scale-105"
              onError={onError}
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* 북마크 버튼 */}
            <button
              onClick={handleBookmarkClick}
              className={cn(
                "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isBookmarked
                  ? "bg-red-500 text-white"
                  : "bg-white/80 text-gray-400 hover:text-red-500"
              )}
              aria-label={isBookmarked ? t("removeBookmark") : t("addBookmark")}
            >
              {isBookmarked ? "❤️" : "🤍"}
            </button>

            {/* 추천 점수 배지 */}
            {showRecommendationScore && place.recommendation_score >= 8 && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {t("recommended")}
              </div>
            )}
          </div>

          {/* 카드 내용 */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                {placeName}
              </h3>
              {showDataQuality && (
                <QualityBadge score={place.data_quality_score} />
              )}
            </div>

            <p className="text-sm text-gray-600 line-clamp-1 mb-3">
              {placeAddress}
            </p>

            {/* 평점 및 리뷰 */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">
                  {place.rating_avg.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {t("reviewCount", { count: place.review_count })}
              </span>
            </div>

            {/* 하단 정보 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showPlatformIndicator && (
                  <PlatformIndicator platformData={place.platform_data} />
                )}
                {showCrowdStatus && (
                  <CrowdIndicator crowdIndex={place.crowd_index} />
                )}
              </div>

              {/* UGC 요약 정보 */}
              {place.ugc_summary && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="text-green-600">
                    👍 {place.ugc_summary.positive_count}
                  </span>
                  <span className="text-red-600">
                    👎 {place.ugc_summary.negative_count}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }
);

PlaceCard.displayName = "PlaceCard";

export default PlaceCard;
export type { Place, PlaceCardProps };
