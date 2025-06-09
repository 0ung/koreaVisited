"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";
import { storage } from "@/utils/storage";
import ImageGallery from "@/components/ImageGallery";
import CrowdGauge from "@/components/CrowdGauge";
import UGCTips from "@/components/UGCTips";

// 타입 정의 (ETL 통합 데이터 구조)
interface PlaceDetail {
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
  tel: string;
  opening_hours: string;
  category_std: string;
  rating_avg: number; // 통합 평점
  review_count: number; // 통합 리뷰 수
  main_image_urls: string[];
  recommendation_score: number; // 데이터 기반 점수
  crowd_index: number;
  last_updated: string;
  website?: string;
  price_level?: number;
  features: string[];

  // 플랫폼별 원본 데이터
  platform_data: {
    kakao?: {
      rating: number;
      review_count: number;
      available: boolean;
      last_updated: string;
      images: string[];
    };
    naver?: {
      rating: number;
      review_count: number;
      available: boolean;
      last_updated: string;
      images: string[];
    };
    google?: {
      rating: number;
      review_count: number;
      available: boolean;
      last_updated: string;
      images: string[];
    };
  };

  // 단순 추천 문구 (AI 대신 템플릿 기반)
  data_summary: {
    best_features: string[]; // 가장 많이 언급된 특징
    visit_tips: string; // 간단한 방문 팁
    best_time: string; // 최적 방문 시간
  };

  // UGC 분석 데이터 (AI 최소)
  ugc_tips: UGCTip[];

  // 데이터 품질 정보
  data_quality: {
    completeness_score: number; // 데이터 완성도 (0-100)
    platform_consistency: number; // 플랫폼 간 일치도
    freshness_score: number; // 최신성 점수
  };
}

interface UGCTip {
  id: string;
  tip_summary_ko: string;
  tip_summary_en: string;
  tip_summary_ja: string;
  sentiment_score: number;
  tags: string[];
  images: string[];
  author: string;
  author_score: number;
  created_at: string;
  quality_score: number;
}

interface MapProvider {
  id: "kakao" | "naver" | "google";
  name: string;
  icon: string;
  color: string;
}

export default function PlaceDetailPage() {
  const t = useTranslations("PlaceDetail");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const placeId = params.id as string;

  // 상태 관리
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedMapProvider, setSelectedMapProvider] =
    useState<MapProvider["id"]>("kakao");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeDataView, setActiveDataView] = useState<"summary" | "platform">(
    "summary"
  );

  // 지도 제공업체 설정
  const mapProviders: MapProvider[] = [
    { id: "kakao", name: "카카오맵", icon: "🗺️", color: "bg-yellow-500" },
    { id: "naver", name: "네이버지도", icon: "🧭", color: "bg-green-500" },
    { id: "google", name: "구글맵", icon: "🌏", color: "bg-blue-500" },
  ];

  // 현재 언어에 맞는 텍스트 가져오기
  const getLocalizedText = (textObj: {
    ko: string;
    en: string;
    ja: string;
  }) => {
    return textObj[locale as keyof typeof textObj] || textObj.ko;
  };

  // 장소 상세 정보 로드
  useEffect(() => {
    const loadPlaceDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 실제 API: /api/places/${placeId}?locale=${locale}
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 목업 데이터 (ETL 통합 구조)
        const mockPlace: PlaceDetail = {
          id: placeId,
          name: {
            ko: "부산 감천문화마을",
            en: "Gamcheon Culture Village",
            ja: "釜山甘川文化村",
          },
          address: {
            ko: "부산광역시 사하구 감내2로 203",
            en: "203 Gamnae 2-ro, Saha-gu, Busan, South Korea",
            ja: "韓国釜山広域市沙下区甘内2路203",
          },
          lat: 35.0976,
          lon: 129.0092,
          tel: "051-204-1444",
          opening_hours: "09:00-18:00",
          category_std: "tourist",
          rating_avg: 4.3, // 3개 플랫폼 가중평균
          review_count: 4892, // 통합 리뷰 수
          main_image_urls: [
            "/images/gamcheon-1.jpg",
            "/images/gamcheon-2.jpg",
            "/images/gamcheon-3.jpg",
            "/images/gamcheon-4.jpg",
          ],
          recommendation_score: 8.6, // 데이터 기반 점수
          crowd_index: 65,
          last_updated: new Date().toISOString(),
          website: "http://www.gamcheon.or.kr",
          price_level: 1,
          features: [
            "포토존",
            "문화체험",
            "예술작품",
            "카페",
            "기념품샵",
            "전망대",
          ],

          // 플랫폼별 원본 데이터
          platform_data: {
            kakao: {
              rating: 4.2,
              review_count: 1523,
              available: true,
              last_updated: "2024-03-15T10:00:00Z",
              images: ["/images/kakao-1.jpg", "/images/kakao-2.jpg"],
            },
            naver: {
              rating: 4.4,
              review_count: 2011,
              available: true,
              last_updated: "2024-03-14T15:30:00Z",
              images: [
                "/images/naver-1.jpg",
                "/images/naver-2.jpg",
                "/images/naver-3.jpg",
              ],
            },
            google: {
              rating: 4.3,
              review_count: 1358,
              available: true,
              last_updated: "2024-03-16T09:20:00Z",
              images: ["/images/google-1.jpg"],
            },
          },

          // 단순 데이터 요약 (AI 대신)
          data_summary: {
            best_features: ["포토존", "예술작품", "전망"],
            visit_tips:
              "편한 신발 착용 권장, 계단이 많음. 입구에서 지도 필수 수령.",
            best_time: "오전 10시-오후 4시 (조명 최적, 상대적 한적)",
          },

          ugc_tips: [
            {
              id: "1",
              tip_summary_ko:
                "입구에서 지도를 꼭 받으세요! 숨은 포토존이 정말 많아요.",
              tip_summary_en:
                "Make sure to get a map at the entrance! There are many hidden photo spots.",
              tip_summary_ja:
                "入口で地図を必ずもらってください！隠れたフォトスポットがたくさんあります。",
              sentiment_score: 0.9,
              tags: ["지도", "포토존", "입구"],
              images: ["/images/tip-1.jpg"],
              author: "여행러버",
              author_score: 4.8,
              created_at: "2024-03-15T10:30:00Z",
              quality_score: 0.85,
            },
            {
              id: "2",
              tip_summary_ko:
                "계단이 많아서 편한 신발 필수! 중간에 쉴 수 있는 카페도 있어요.",
              tip_summary_en:
                "Comfortable shoes are essential due to many stairs! There are cafes to rest.",
              tip_summary_ja:
                "階段が多いので楽な靴が必須！途中で休めるカフェもあります。",
              sentiment_score: 0.8,
              tags: ["신발", "계단", "카페"],
              images: [],
              author: "부산토박이",
              author_score: 4.6,
              created_at: "2024-03-10T14:20:00Z",
              quality_score: 0.78,
            },
          ],

          data_quality: {
            completeness_score: 95,
            platform_consistency: 88,
            freshness_score: 92,
          },
        };

        setPlace(mockPlace);

        // 북마크 상태 체크
        const savedPlaces = storage.get<string[]>("savedPlaces", []);
        setIsSaved(savedPlaces.includes(placeId));
      } catch (err) {
        setError(t("loadError"));
        console.error("Place detail load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaceDetail();
  }, [placeId, locale, t]);

  // 북마크 토글
  const toggleBookmark = () => {
    const savedPlaces = storage.get<string[]>("savedPlaces", []);
    let newSavedPlaces: string[];

    if (isSaved) {
      newSavedPlaces = savedPlaces.filter((id) => id !== placeId);
    } else {
      newSavedPlaces = [...savedPlaces, placeId];
    }

    storage.set("savedPlaces", newSavedPlaces);
    setIsSaved(!isSaved);
  };

  // 지도 링크 생성
  const getMapUrl = (provider: MapProvider["id"]) => {
    if (!place) return "#";

    const { lat, lon, name } = place;
    const placeName = getLocalizedText(name);

    switch (provider) {
      case "kakao":
        return `https://map.kakao.com/link/map/${placeName},${lat},${lon}`;
      case "naver":
        return `https://map.naver.com/v5/search/${placeName}`;
      case "google":
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      default:
        return "#";
    }
  };

  // 공유 기능
  const handleShare = async () => {
    const shareData = {
      title: place ? getLocalizedText(place.name) : "",
      text: place?.data_summary.visit_tips || "",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  // 가격대 번역 함수
  const getPriceLevelText = (level: number) => {
    switch (level) {
      case 1:
        return t("cheap");
      case 2:
        return t("moderate");
      case 3:
        return t("expensive");
      case 4:
        return t("luxury");
      default:
        return t("moderate");
    }
  };

  // 혼잡도 상태 텍스트
  const getCrowdStatusText = (crowdIndex: number) => {
    if (crowdIndex <= 30) return t("optimal");
    if (crowdIndex <= 70) return t("normal");
    return t("notRecommended");
  };

  // 대기시간 텍스트
  const getWaitTimeText = (crowdIndex: number) => {
    if (crowdIndex <= 30) return t("noWait");
    if (crowdIndex <= 70) return t("shortWait");
    return t("longWait");
  };

  // 플랫폼별 데이터 비교 컴포넌트
  const PlatformDataComparison = () => {
    if (!place) return null;

    const platforms = [
      {
        id: "kakao",
        name: "카카오",
        data: place.platform_data.kakao,
        color: "bg-yellow-100 border-yellow-300",
      },
      {
        id: "naver",
        name: "네이버",
        data: place.platform_data.naver,
        color: "bg-green-100 border-green-300",
      },
      {
        id: "google",
        name: "구글",
        data: place.platform_data.google,
        color: "bg-blue-100 border-blue-300",
      },
    ].filter((p) => p.data?.available);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={cn("border-2 rounded-lg p-4", platform.color)}
          >
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              {platform.name}
              <span className="text-xs bg-white px-2 py-1 rounded">
                {t("originalData")}
              </span>
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t("rating")}:</span>
                <span className="font-medium">
                  ★ {platform.data!.rating.toFixed(1)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>{t("reviewCount")}:</span>
                <span className="font-medium">
                  {platform.data!.review_count.toLocaleString()}개
                </span>
              </div>

              <div className="flex justify-between">
                <span>{t("images")}:</span>
                <span className="font-medium">
                  {platform.data!.images.length}장
                </span>
              </div>

              <div className="text-xs text-gray-600 mt-2">
                {t("update")}:{" "}
                {new Date(platform.data!.last_updated).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 데이터 품질 정보 컴포넌트
  const DataQualityInfo = () => {
    if (!place) return null;

    const getScoreColor = (score: number) => {
      if (score >= 90) return "text-green-600 bg-green-100";
      if (score >= 70) return "text-blue-600 bg-blue-100";
      if (score >= 50) return "text-yellow-600 bg-yellow-100";
      return "text-red-600 bg-red-100";
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          📊 {t("dataQuality")}
        </h4>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div
              className={cn(
                "text-2xl font-bold mb-1 px-2 py-1 rounded",
                getScoreColor(place.data_quality.completeness_score)
              )}
            >
              {place.data_quality.completeness_score}
            </div>
            <div className="text-gray-600">{t("completeness")}</div>
          </div>

          <div className="text-center">
            <div
              className={cn(
                "text-2xl font-bold mb-1 px-2 py-1 rounded",
                getScoreColor(place.data_quality.platform_consistency)
              )}
            >
              {place.data_quality.platform_consistency}
            </div>
            <div className="text-gray-600">{t("consistency")}</div>
          </div>

          <div className="text-center">
            <div
              className={cn(
                "text-2xl font-bold mb-1 px-2 py-1 rounded",
                getScoreColor(place.data_quality.freshness_score)
              )}
            >
              {place.data_quality.freshness_score}
            </div>
            <div className="text-gray-600">{t("freshness")}</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          * {t("platformIntegration")}
        </div>
      </div>
    );
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <Skeleton variant="rectangular" className="h-80 mb-6 rounded-xl" />
          <Skeleton variant="text" className="h-8 mb-4 w-1/2" />
          <Skeleton variant="text" className="h-6 mb-6 w-3/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton variant="rectangular" className="h-48 rounded-xl" />
              <Skeleton variant="rectangular" className="h-64 rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton variant="rectangular" className="h-32 rounded-xl" />
              <Skeleton variant="rectangular" className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t("notFound")}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>{t("back")}</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* 뒤로가기 네비게이션 */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {t("back")}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  aria-label={t("share")}
                >
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </Button>

                <Button
                  variant={isSaved ? "default" : "outline"}
                  size="icon"
                  onClick={toggleBookmark}
                  aria-label={isSaved ? t("bookmarkRemove") : t("bookmarkAdd")}
                >
                  <svg
                    className={cn("w-5 h-5", isSaved && "fill-current")}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* 메인 이미지 섹션 */}
          <div className="mb-6">
            <ImageGallery
              images={place.main_image_urls}
              alt={getLocalizedText(place.name)}
              className="h-80"
              showThumbnails={false}
              autoSlide={true}
            />

            {/* 기본 정보 오버레이 */}
            <div className="relative -mt-20 z-10 mx-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {getLocalizedText(place.name)}
                    </h1>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4 fill-current text-yellow-400"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-medium">
                          {place.rating_avg.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({place.review_count.toLocaleString()}
                          {t("integratedReviews")})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 추천 점수 배지 */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {place.recommendation_score.toFixed(1)}
                      </div>
                      <div className="text-xs">{t("integratedScore")}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gray-600 mb-3">
                  <svg
                    className="w-4 h-4"
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
                  <span>{getLocalizedText(place.address)}</span>
                </div>

                {/* 플랫폼 데이터 가용성 표시 */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">{t("dataSource")}:</span>
                  {place.platform_data.kakao?.available && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      카카오
                    </span>
                  )}
                  {place.platform_data.naver?.available && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      네이버
                    </span>
                  )}
                  {place.platform_data.google?.available && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      구글
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 메인 컨텐츠 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 데이터 통합 정보 섹션 */}
              <Card className="border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      {t("verifiedDataSummary")}
                    </CardTitle>

                    <div className="flex gap-2">
                      <Button
                        variant={
                          activeDataView === "summary" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveDataView("summary")}
                      >
                        {t("summary")}
                      </Button>
                      <Button
                        variant={
                          activeDataView === "platform" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveDataView("platform")}
                      >
                        {t("platformData")}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeDataView === "summary" ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">
                          💡 {t("visitTips")}
                        </h4>
                        <p className="text-gray-800">
                          {place.data_summary.visit_tips}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <span>⏰</span> {t("bestTime")}
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {place.data_summary.best_time}
                          </p>
                        </div>
                      </div>

                      <DataQualityInfo />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">
                          {t("platformComparison")}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t("platformComparisonDesc")}
                        </p>
                      </div>
                      <PlatformDataComparison />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* UGC 팁 섹션 (AI 최소화) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {t("visitorReviews")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {place.ugc_tips.map((tip) => (
                      <div
                        key={tip.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {tip.author}
                            </span>
                            <span className="text-xs text-gray-500">
                              ★ {tip.author_score.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {tip.sentiment_score > 0.7 && (
                              <span className="text-green-600">😊</span>
                            )}
                            {tip.sentiment_score > 0.5 &&
                              tip.sentiment_score <= 0.7 && (
                                <span className="text-yellow-600">😐</span>
                              )}
                            {tip.sentiment_score <= 0.5 && (
                              <span className="text-red-600">😔</span>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-800 mb-3">
                          {locale === "ko"
                            ? tip.tip_summary_ko
                            : locale === "en"
                            ? tip.tip_summary_en
                            : tip.tip_summary_ja}
                        </p>

                        {tip.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {tip.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="bg-white text-gray-600 text-xs px-2 py-1 rounded border"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>
                            {new Date(tip.created_at).toLocaleDateString()}
                          </span>
                          <span>
                            {t("qualityScore")}:{" "}
                            {Math.round(tip.quality_score * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="text-center pt-4">
                      <Button variant="outline">{t("moreReviews")}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 멀티맵 섹션 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    {t("mapAndDirections")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 지도 제공업체 선택 */}
                    <div className="flex gap-2 mb-4">
                      {mapProviders.map((provider) => (
                        <Button
                          key={provider.id}
                          variant={
                            selectedMapProvider === provider.id
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedMapProvider(provider.id)}
                          className="flex items-center gap-2"
                        >
                          <span>{provider.icon}</span>
                          {provider.name}
                        </Button>
                      ))}
                    </div>

                    {/* 지도 영역 플레이스홀더 */}
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-green-600"
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
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {
                            mapProviders.find(
                              (p) => p.id === selectedMapProvider
                            )?.name
                          }{" "}
                          연동
                        </h3>
                        <p className="text-gray-600 mb-4">
                          실제 서비스에서는{" "}
                          {
                            mapProviders.find(
                              (p) => p.id === selectedMapProvider
                            )?.name
                          }
                          이 여기에 표시됩니다.
                        </p>
                      </div>

                      {/* 좌표 정보 표시 */}
                      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="font-medium text-sm">
                            {getLocalizedText(place.name)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {getLocalizedText(place.address)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("coordinates")}: {place.lat.toFixed(4)},{" "}
                          {place.lon.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    {/* 지도 액션 버튼들 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() =>
                          window.open(getMapUrl(selectedMapProvider), "_blank")
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        {
                          mapProviders.find((p) => p.id === selectedMapProvider)
                            ?.name
                        }
                        {t("viewOnMap")}
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${place.lat}, ${place.lon}`
                          );
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        {t("copyCoordinates")}
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                          const address = getLocalizedText(place.address);
                          navigator.clipboard.writeText(address);
                        }}
                      >
                        <svg
                          className="w-4 h-4"
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
                        {t("copyAddress")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 실시간 혼잡도 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {t("realTimeCrowd")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CrowdGauge
                    crowdIndex={place.crowd_index}
                    lastUpdated={place.last_updated}
                    size="lg"
                    showLabel={false}
                    showLastUpdated={true}
                    animated={true}
                  />

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {t("currentSuitability")}
                      </span>
                      <span className="font-medium">
                        {place.crowd_index <= 30
                          ? "😊 " + getCrowdStatusText(place.crowd_index)
                          : place.crowd_index <= 70
                          ? "😐 " + getCrowdStatusText(place.crowd_index)
                          : "😅 " + getCrowdStatusText(place.crowd_index)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {t("expectedWaitTime")}
                      </span>
                      <span className="font-medium">
                        {getWaitTimeText(place.crowd_index)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 기본 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {t("basicInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium">{t("phoneNumber")}</p>
                        <p className="text-gray-600">{place.tel}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium">{t("operatingHours")}</p>
                        <p className="text-gray-600">{place.opening_hours}</p>
                      </div>
                    </div>

                    {place.website && (
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-gray-400 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                          />
                        </svg>
                        <div>
                          <p className="font-medium">{t("website")}</p>
                          <a
                            href={place.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {t("officialWebsite")}
                          </a>
                        </div>
                      </div>
                    )}

                    {place.price_level && (
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-gray-400 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        <div>
                          <p className="font-medium">{t("priceLevel")}</p>
                          <p className="text-gray-600">
                            {"₩".repeat(place.price_level)}
                            <span className="ml-2 text-sm">
                              ({getPriceLevelText(place.price_level)})
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 편의시설 */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-medium mb-3">{t("amenitiesFeatures")}</p>
                    <div className="flex flex-wrap gap-2">
                      {place.features.map((feature, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 데이터 최종 업데이트 */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t("dataUpdate")}</span>
                      <span className="text-gray-800">
                        {new Date(place.last_updated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 빠른 액션 */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => window.open(`tel:${place.tel}`, "_self")}
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {t("callPhone")}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      window.open(getMapUrl(selectedMapProvider), "_blank")
                    }
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
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    {t("getDirections")}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShare}
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    {t("share")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* 공유 모달 */}
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={t("sharePlace")}
          size="sm"
        >
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium text-gray-900 mb-2">
                {getLocalizedText(place.name)}
              </h3>
              <p className="text-sm text-gray-600">{t("shareDescription")}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    getLocalizedText(place.name)
                  )}&url=${encodeURIComponent(window.location.href)}`;
                  window.open(url, "_blank");
                }}
              >
                🐦 {t("twitter")}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                  )}`;
                  window.open(url, "_blank");
                }}
              >
                📘 {t("facebook")}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setIsShareModalOpen(false);
                }}
                className="col-span-2"
              >
                🔗 {t("copyLink")}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
