// components/CrowdGauge.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { formatRelativeTime } from "@/utils/formatting";

interface CrowdGaugeProps {
  crowdIndex: number;
  lastUpdated?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showPercentage?: boolean;
  showStatus?: boolean;
  showLastUpdated?: boolean;
  animated?: boolean;
  className?: string;
}

export default function CrowdGauge({
  crowdIndex,
  lastUpdated,
  size = "md",
  showLabel = true,
  showPercentage = true,
  showStatus = true,
  showLastUpdated = false,
  animated = true,
  className,
}: CrowdGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  // 애니메이션 효과
  useEffect(() => {
    if (!animated) {
      setAnimatedValue(crowdIndex);
      return;
    }

    const timer = setTimeout(() => {
      setAnimatedValue(crowdIndex);
    }, 100);

    return () => clearTimeout(timer);
  }, [crowdIndex, animated]);

  // 크기 설정
  const sizeConfig = {
    sm: {
      container: "w-16 h-16",
      text: "text-sm",
      strokeWidth: "1.5",
    },
    md: {
      container: "w-24 h-24",
      text: "text-lg",
      strokeWidth: "2",
    },
    lg: {
      container: "w-32 h-32",
      text: "text-2xl",
      strokeWidth: "2.5",
    },
  };

  // 혼잡도 상태
  const getCrowdStatus = (index: number) => {
    if (index <= 30) {
      return {
        text: "여유",
        color: "#10B981", // green-500
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        emoji: "😊",
      };
    }
    if (index <= 70) {
      return {
        text: "보통",
        color: "#F59E0B", // yellow-500
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        emoji: "😐",
      };
    }
    return {
      text: "혼잡",
      color: "#EF4444", // red-500
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      emoji: "😅",
    };
  };

  // 추천 메시지
  const getRecommendation = (index: number) => {
    if (index <= 30) return "지금이 방문하기 좋은 시간입니다!";
    if (index <= 70) return "적당한 사람들이 있어요";
    return "많은 사람들이 방문 중이에요";
  };

  const status = getCrowdStatus(crowdIndex);
  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * 15.9155; // SVG circle 반지름
  const strokeDashoffset =
    circumference - (animatedValue / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* 제목 */}
      {showLabel && (
        <h3 className="font-medium text-gray-900 mb-3 text-center">
          실시간 혼잡도
        </h3>
      )}

      {/* 게이지 */}
      <div className={cn("relative", config.container)}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          {/* 배경 원 */}
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={config.strokeWidth}
          />
          {/* 진행 원 */}
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={status.color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={animated ? "transition-all duration-1000 ease-out" : ""}
          />
        </svg>

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <span className={cn("font-bold", config.text)}>{crowdIndex}%</span>
          )}
          {size !== "sm" && (
            <span className="text-xs text-gray-500 mt-1">{status.emoji}</span>
          )}
        </div>
      </div>

      {/* 상태 텍스트 */}
      {showStatus && (
        <div
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-full font-medium mt-3",
            status.bgColor,
            status.textColor
          )}
        >
          <div className="w-2 h-2 rounded-full bg-current"></div>
          {status.text}
        </div>
      )}

      {/* 추천 메시지 */}
      {size === "lg" && (
        <p className="text-sm text-gray-600 text-center mt-2 max-w-xs">
          {getRecommendation(crowdIndex)}
        </p>
      )}

      {/* 마지막 업데이트 */}
      {showLastUpdated && lastUpdated && (
        <p className="text-xs text-gray-400 mt-2">
          {formatRelativeTime(lastUpdated)} 업데이트
        </p>
      )}
    </div>
  );
}

// 간단한 인라인 버전 (검색 결과 등에서 사용)
export function CrowdIndicator({
  crowdIndex,
  size = "sm",
  className,
}: {
  crowdIndex: number;
  size?: "xs" | "sm";
  className?: string;
}) {
  const status =
    crowdIndex <= 30
      ? { text: "여유", color: "bg-green-500" }
      : crowdIndex <= 70
      ? { text: "보통", color: "bg-yellow-500" }
      : { text: "혼잡", color: "bg-red-500" };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5",
        size === "xs" ? "text-xs" : "text-sm",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full",
          status.color,
          size === "xs" ? "w-2 h-2" : "w-3 h-3"
        )}
      ></div>
      <span className="font-medium text-gray-700">{status.text}</span>
      <span className="text-gray-500">({crowdIndex}%)</span>
    </div>
  );
}

// 미니 게이지 (카드 등에서 사용)
export function MiniCrowdGauge({
  crowdIndex,
  className,
}: {
  crowdIndex: number;
  className?: string;
}) {
  const status =
    crowdIndex <= 30
      ? { color: "#10B981" }
      : crowdIndex <= 70
      ? { color: "#F59E0B" }
      : { color: "#EF4444" };

  return (
    <div className={cn("relative w-8 h-8", className)}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={status.color}
          strokeWidth="3"
          strokeDasharray={`${crowdIndex}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium">{crowdIndex}</span>
      </div>
    </div>
  );
}
