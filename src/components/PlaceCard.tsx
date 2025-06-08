"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { cn } from "@/utils/cn";

// 기존 UI 컴포넌트 재사용
import { Button } from "@/components/ui/Button";

// 타입 정의 (ETL 데이터 구조)
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
  rating_avg: number; // 플랫폼 통합 평점
  review_count: number; // 통합 리뷰 수
  category_std: string; // 표준 카테고리
  main_image_urls: string[];
  recommendation_score: number; // 통합 점수
  platform_data: {
    kakao?: { rating: number; review_count: number; available: boolean };
    naver?: { rating: number; review_count: number; available: boolean };
    google?: { rating: number; review_count: number; available: boolean };
  };
  last_updated: string; // ETL 마지막 업데이트
  data_quality_score: number; // 데이터 품질 점수 (0-100)
}

interface PlaceCardProps {
  place: Place;
  locale?: string;
  showRecommendationScore?: boolean;
  showPlatformIndicator?: boolean;
  showDataQuality?: boolean;
  showLastUpdated?: boolean;
  className?: string;
  onBookmarkToggle?: (placeId: string, isBookmarked: boolean) => void;
  isBookmarked?: boolean;
}

// 플랫폼 데이터 표시 컴포넌트
const PlatformDataIndicator = memo(
  ({ platformData }: { platformData: Place["platform_data"] }) => {
    const platforms = useMemo(() => {
      const result = [];

      if (platformData.kakao?.available) {
        result.push({
          name: "카카오",
          color: "bg-yellow-500",
          rating: platformData.kakao.rating,
          reviews: platformData.kakao.review_count,
        });
      }

      if (platformData.naver?.available) {
        result.push({
          name: "네이버",
          color: "bg-green-500",
          rating: platformData.naver.rating,
          reviews: platformData.naver.review_count,
        });
      }

      if (platformData.google?.available) {
        result.push({
          name: "구글",
          color: "bg-blue-500",
          rating: platformData.google.rating,
          reviews: platformData.google.review_count,
        });
      }

      return result;
    }, [platformData]);

    if (platforms.length === 0) return null;

    return (
      <div className="flex items-center gap-1">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className={cn("w-3 h-3 rounded-full", platform.color)}
            title={`${platform.name}: ★${platform.rating.toFixed(
              1
            )} (${platform.reviews.toLocaleString()})`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">
          {platforms.length}개 플랫폼
        </span>
      </div>
    );
  }
);

PlatformDataIndicator.displayName = "PlatformDataIndicator";

// 통합 평점 표시 컴포넌트 (플랫폼별 비교)
const IntegratedRating = memo(({ place }: { place: Place }) => {
  const stars = useMemo(() => {
    const fullStars = Math.floor(place.rating_avg);
    const hasHalfStar = place.rating_avg % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">
            ☆
          </span>
        ))}
      </>
    );
  }, [place.rating_avg]);

  // 플랫폼별 평점 분산도 계산
  const ratingVariance = useMemo(() => {
    const availableRatings = [];
    if (place.platform_data.kakao?.available)
      availableRatings.push(place.platform_data.kakao.rating);
    if (place.platform_data.naver?.available)
      availableRatings.push(place.platform_data.naver.rating);
    if (place.platform_data.google?.available)
      availableRatings.push(place.platform_data.google.rating);

    if (availableRatings.length < 2) return 0;

    const avg =
      availableRatings.reduce((sum, rating) => sum + rating, 0) /
      availableRatings.length;
    const variance =
      availableRatings.reduce(
        (sum, rating) => sum + Math.pow(rating - avg, 2),
        0
      ) / availableRatings.length;

    return Math.sqrt(variance);
  }, [place.platform_data]);

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <div className="flex">{stars}</div>
        <span className="text-sm font-medium text-gray-900">
          {place.rating_avg.toFixed(1)}
        </span>
        <span className="text-sm text-gray-600">
          ({place.review_count.toLocaleString()})
        </span>
      </div>

      {/* 평점 신뢰도 표시 */}
      {ratingVariance < 0.3 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-green-600">✓</span>
          <span className="text-xs text-green-600">평점 일치도 높음</span>
        </div>
      )}
    </div>
  );
});

IntegratedRating.displayName = "IntegratedRating";

// 데이터 품질 배지 컴포넌트
const DataQualityBadge = memo(({ score }: { score: number }) => {
  const { label, color } = useMemo(() => {
    if (score >= 90)
      return { label: "최고", color: "bg-green-100 text-green-800" };
    if (score >= 70)
      return { label: "우수", color: "bg-blue-100 text-blue-800" };
    if (score >= 50)
      return { label: "양호", color: "bg-yellow-100 text-yellow-800" };
    return { label: "기본", color: "bg-gray-100 text-gray-800" };
  }, [score]);

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", color)}>
      {label}
    </span>
  );
});

DataQualityBadge.displayName = "DataQualityBadge";

// 추천 점수 배지 컴포넌트 (AI 없이 데이터 기반)
const RecommendationBadge = memo(({ score }: { score: number }) => {
  const { level, bgColor, textColor } = useMemo(() => {
    if (score >= 9) {
      return {
        level: "BEST",
        bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
        textColor: "text-white",
      };
    } else if (score >= 8) {
      return {
        level: "HOT",
        bgColor: "bg-gradient-to-r from-red-500 to-orange-500",
        textColor: "text-white",
      };
    } else if (score >= 7) {
      return {
        level: "추천",
        bgColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
        textColor: "text-white",
      };
    } else {
      return { level: "", bgColor: "", textColor: "" };
    }
  }, [score]);

  if (!level) return null;

  return (
    <div
      className={cn(
        "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold",
        bgColor,
        textColor
      )}
    >
      {level}
    </div>
  );
});

RecommendationBadge.displayName = "RecommendationBadge";

// 북마크 버튼 컴포넌트
const BookmarkButton = memo(
  ({
    isBookmarked,
    onToggle,
    placeId,
  }: {
    isBookmarked: boolean;
    onToggle?: (placeId: string, isBookmarked: boolean) => void;
    placeId: string;
  }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 200);

        onToggle?.(placeId, !isBookmarked);
      },
      [isBookmarked, onToggle, placeId]
    );

    return (
      <button
        onClick={handleClick}
        className={cn(
          "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all transform",
          isBookmarked
            ? "bg-red-500 text-white scale-110"
            : "bg-white/80 text-gray-400 hover:text-red-500",
          isAnimating && "scale-125"
        )}
        aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
      >
        {isBookmarked ? "❤️" : "🤍"}
      </button>
    );
  }
);

BookmarkButton.displayName = "BookmarkButton";

// 마지막 업데이트 시간 표시
const LastUpdatedInfo = memo(({ lastUpdated }: { lastUpdated: string }) => {
  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(lastUpdated).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return "방금 전";
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <span>🔄</span>
      <span>{timeAgo} 업데이트</span>
    </div>
  );
});

LastUpdatedInfo.displayName = "LastUpdatedInfo";

// 이미지 에러 처리 훅
const useImageError = (urls: string[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleImageError = useCallback(() => {
    if (currentIndex < urls.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setHasError(false);
    } else {
      setHasError(true);
    }
  }, [currentIndex, urls.length]);

  const currentUrl = urls[currentIndex];
  const fallbackUrl = "/images/placeholder-place.jpg";

  return {
    src: hasError ? fallbackUrl : currentUrl,
    onError: handleImageError,
  };
};

// 메인 PlaceCard 컴포넌트
const PlaceCard = memo<PlaceCardProps>(
  ({
    place,
    locale = "ko",
    showRecommendationScore = false,
    showPlatformIndicator = false,
    showDataQuality = false,
    showLastUpdated = false,
    className,
    onBookmarkToggle,
    isBookmarked = false,
  }) => {
    const t = useTranslations("PlaceCard");

    const { src, onError } = useImageError(place.main_image_urls);

    // 다국어 처리
    const placeName = useMemo(
      () => place.name[locale as keyof typeof place.name] || place.name.ko,
      [place.name, locale]
    );

    const placeAddress = useMemo(
      () =>
        place.address[locale as keyof typeof place.address] || place.address.ko,
      [place.address, locale]
    );

    // 카테고리 표시명
    const categoryDisplay = useMemo(() => {
      const categoryMap: Record<
        string,
        { ko: string; en: string; ja: string; icon: string }
      > = {
        restaurant: { ko: "맛집", en: "Restaurant", ja: "グルメ", icon: "🍽️" },
        cafe: { ko: "카페", en: "Cafe", ja: "カフェ", icon: "☕" },
        tourist: { ko: "관광지", en: "Tourist Spot", ja: "観光地", icon: "🏛️" },
        culture: { ko: "문화", en: "Culture", ja: "文化", icon: "🎭" },
        shopping: {
          ko: "쇼핑",
          en: "Shopping",
          ja: "ショッピング",
          icon: "🛍️",
        },
        nature: { ko: "자연", en: "Nature", ja: "自然", icon: "🌳" },
        activity: {
          ko: "액티비티",
          en: "Activity",
          ja: "アクティビティ",
          icon: "🎢",
        },
        hotel: { ko: "숙박", en: "Hotel", ja: "ホテル", icon: "🏨" },
      };

      const category =
        categoryMap[place.category_std] || categoryMap.restaurant;
      return {
        name: category[locale as keyof typeof category] || category.ko,
        icon: category.icon,
      };
    }, [place.category_std, locale]);

    return (
      <Link
        href={`/places/${place.id}`}
        className={cn(
          "group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
          "transform hover:-translate-y-1",
          className
        )}
      >
        {/* 이미지 영역 */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={src}
            alt={placeName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={onError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={false}
          />

          {/* 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* 추천 점수 배지 */}
          {showRecommendationScore && place.recommendation_score && (
            <RecommendationBadge score={place.recommendation_score} />
          )}

          {/* 북마크 버튼 */}
          <BookmarkButton
            isBookmarked={isBookmarked}
            onToggle={onBookmarkToggle}
            placeId={place.id}
          />

          {/* 데이터 품질 배지 */}
          {showDataQuality && (
            <div className="absolute bottom-3 left-3">
              <DataQualityBadge score={place.data_quality_score} />
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="p-4 space-y-3">
          {/* 카테고리 및 플랫폼 정보 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{categoryDisplay.icon}</span>
              <span className="text-sm text-gray-600">
                {categoryDisplay.name}
              </span>
            </div>

            {showPlatformIndicator && (
              <PlatformDataIndicator platformData={place.platform_data} />
            )}
          </div>

          {/* 장소명 */}
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {placeName}
          </h3>

          {/* 주소 */}
          <p className="text-sm text-gray-600 line-clamp-1">{placeAddress}</p>

          {/* 통합 평점 */}
          <IntegratedRating place={place} />

          {/* 추천 점수 표시 */}
          {showRecommendationScore && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-600 font-medium">
                추천 점수: {place.recommendation_score.toFixed(1)}
              </span>
            </div>
          )}

          {/* 마지막 업데이트 정보 */}
          {showLastUpdated && (
            <LastUpdatedInfo lastUpdated={place.last_updated} />
          )}
        </div>
      </Link>
    );
  }
);

PlaceCard.displayName = "PlaceCard";

export default PlaceCard;
