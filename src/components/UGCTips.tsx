// components/UGCTips.tsx
"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import { formatRelativeTime } from "@/utils/formatting";

interface UGCTip {
  id: string;
  tip_summary: string;
  sentiment_score: number;
  tags: string[];
  images: string[];
  author: string;
  author_score: number;
  created_at: string;
  quality_score: number;
}

interface UGCTipsProps {
  tips: UGCTip[];
  maxVisible?: number;
  showHeader?: boolean;
  title?: string;
  className?: string;
}

export default function UGCTips({
  tips,
  maxVisible = 3,
  showHeader = true,
  title,
  className,
}: UGCTipsProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("UGCTips");
  const [showAllTips, setShowAllTips] = useState(false);

  // 성능 최적화: 메모이제이션된 유틸리티 함수들
  const sentimentUtils = useMemo(
    () => ({
      getSentimentColor: (score: number) => {
        if (score >= 0.8) return "text-green-600";
        if (score >= 0.6) return "text-yellow-600";
        return "text-gray-600";
      },
      getSentimentDisplay: (score: number) => {
        if (score >= 0.8) return { emoji: "👍", text: t("sentimentRecommend") };
        if (score >= 0.6) return { emoji: "👌", text: t("sentimentGood") };
        return { emoji: "😐", text: t("sentimentAverage") };
      },
    }),
    [t]
  );

  const qualityUtils = useMemo(
    () => ({
      getQualityBadge: (score: number) => {
        if (score >= 0.8)
          return {
            text: t("qualityHigh"),
            color: "bg-green-100 text-green-800",
          };
        if (score >= 0.6)
          return { text: t("qualityGood"), color: "bg-blue-100 text-blue-800" };
        return null;
      },
    }),
    [t]
  );

  // 작성자 이니셜 생성 (성능 최적화: 메모이제이션)
  const getAuthorInitial = useMemo(
    () => (name: string) => name.charAt(0).toUpperCase(),
    []
  );

  const displayedTips = showAllTips ? tips : tips.slice(0, maxVisible);

  // 목업 데이터 (단일)
  const mockTip: UGCTip = {
    id: "tip-001",
    tip_summary:
      "이곳은 새벽 6시에 가면 사람이 적어서 조용히 구경할 수 있어요. 특히 해돋이 보기 좋고, 근처 카페에서 따뜻한 커피 마시면서 여유롭게 시간 보낼 수 있습니다.",
    sentiment_score: 0.85,
    tags: ["새벽방문", "해돋이", "조용함", "카페추천"],
    images: ["image1.jpg", "image2.jpg"],
    author: "김여행",
    author_score: 4.2,
    created_at: "2025-06-08T06:30:00Z",
    quality_score: 0.9,
  };

  // 실제 데이터가 없으면 목업 데이터 사용
  const actualTips = tips.length > 0 ? tips : [mockTip];

  if (!actualTips || actualTips.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
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
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("emptyTitle")}
          </h3>
          <p className="text-gray-600">{t("emptyDescription")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-purple-600"
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
              {title || t("title")}
              <span className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full font-medium">
                {t("countLabel", { count: actualTips.length })}
              </span>
            </div>

            {actualTips.length > maxVisible && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllTips(!showAllTips)}
              >
                {showAllTips ? t("actionsCollapse") : t("actionsShowMore")}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {displayedTips.map((tip) => {
          const sentiment = sentimentUtils.getSentimentDisplay(
            tip.sentiment_score
          );
          const qualityBadge = qualityUtils.getQualityBadge(tip.quality_score);

          return (
            <div
              key={tip.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              {/* 작성자 정보 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                    {getAuthorInitial(tip.author)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {tip.author}
                      </span>
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4 fill-current text-yellow-500"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {tip.author_score}
                        </span>
                      </div>
                      {qualityBadge && (
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            qualityBadge.color
                          )}
                        >
                          {qualityBadge.text}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{formatRelativeTime(tip.created_at, locale)}</span>
                      <span
                        className={cn(
                          "font-medium",
                          sentimentUtils.getSentimentColor(tip.sentiment_score)
                        )}
                      >
                        {sentiment.emoji} {sentiment.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 팁 내용 */}
              <p className="text-gray-800 leading-relaxed mb-3">
                {tip.tip_summary}
              </p>

              {/* 이미지들 (있는 경우) */}
              {tip.images && tip.images.length > 0 && (
                <div className="mb-3">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {tip.images.slice(0, 3).map((image, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center text-white"
                      >
                        📷
                      </div>
                    ))}
                    {tip.images.length > 3 && (
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-sm">
                        +{tip.images.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 태그 */}
              <div className="flex flex-wrap gap-2">
                {tip.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {/* 더보기 버튼 (하단) */}
        {!showHeader && actualTips.length > maxVisible && !showAllTips && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAllTips(true)}
              className="w-full"
            >
              {t("actionsShowMoreCount", {
                count: actualTips.length - maxVisible,
              })}
            </Button>
          </div>
        )}

        {/* 팁 작성 유도 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
              ✨
            </div>
            <div>
              <h4 className="font-medium text-purple-900 mb-1">
                {t("writePromptTitle")}
              </h4>
              <p className="text-sm text-purple-700">
                {t("writePromptDescription")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            {t("writePromptAction")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 간단한 팁 카드 (다른 곳에서 재사용 가능)
export function TipCard({
  tip,
  compact = false,
}: {
  tip: UGCTip;
  compact?: boolean;
}) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("UGCTips");

  const sentiment = useMemo(() => {
    if (tip.sentiment_score >= 0.8)
      return { emoji: "👍", color: "text-green-600" };
    if (tip.sentiment_score >= 0.6)
      return { emoji: "👌", color: "text-yellow-600" };
    return { emoji: "😐", color: "text-gray-600" };
  }, [tip.sentiment_score]);

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow",
        compact && "p-3"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium",
            compact ? "w-8 h-8 text-sm" : "w-10 h-10"
          )}
        >
          {tip.author.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn("font-medium", compact ? "text-sm" : "text-base")}
            >
              {tip.author}
            </span>
            <span className={cn("text-xs", sentiment.color)}>
              {sentiment.emoji}
            </span>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(tip.created_at, locale)}
            </span>
          </div>
          <p
            className={cn(
              "text-gray-800 leading-relaxed",
              compact ? "text-sm line-clamp-2" : "text-base"
            )}
          >
            {tip.tip_summary}
          </p>
          {!compact && tip.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tip.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 팁 통계 컴포넌트
export function TipStats({ tips }: { tips: UGCTip[] }) {
  const t = useTranslations("UGCTips");

  const stats = useMemo(() => {
    const totalTips = tips.length;
    const averageSentiment =
      tips.length > 0
        ? tips.reduce((sum, tip) => sum + tip.sentiment_score, 0) / totalTips
        : 0;
    const highQualityTips = tips.filter(
      (tip) => tip.quality_score >= 0.8
    ).length;
    const recentTips = tips.filter((tip) => {
      const tipDate = new Date(tip.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return tipDate > weekAgo;
    }).length;

    return {
      totalTips,
      averageSentiment,
      highQualityTips,
      recentTips,
    };
  }, [tips]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-3 bg-purple-50 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">
          {stats.totalTips}
        </div>
        <div className="text-sm text-purple-700">{t("statsTotalTips")}</div>
      </div>
      <div className="text-center p-3 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">
          {(stats.averageSentiment * 100).toFixed(0)}%
        </div>
        <div className="text-sm text-green-700">{t("statsSatisfaction")}</div>
      </div>
      <div className="text-center p-3 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">
          {stats.highQualityTips}
        </div>
        <div className="text-sm text-blue-700">{t("statsHighQuality")}</div>
      </div>
      <div className="text-center p-3 bg-orange-50 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">
          {stats.recentTips}
        </div>
        <div className="text-sm text-orange-700">{t("statsRecentWeek")}</div>
      </div>
    </div>
  );
}
