"use client";
import { RefObject } from "react";
import dynamic from "next/dynamic";
import PlaceCardSkeleton from "@/components/common/PlaceCardSkeleton";
import type { Place } from "@/types";

const PlaceCard = dynamic(() => import("@/components/PlaceCard"), {
  loading: () => <PlaceCardSkeleton />,
  ssr: false,
});
const MapView = dynamic(() => import("@/components/MapView"), {
  loading: () => <div className="h-full bg-gray-200" />,
  ssr: false,
});

interface Props {
  isLoading: boolean;
  viewMode: "list" | "map";
  filteredPlaces: Place[];
  containerRef: RefObject<HTMLDivElement>;
  visibleItems: Place[];
  totalHeight: number;
  offsetY: number;
  onBookmarkToggle: (id: string, isBookmarked: boolean) => void;
}

export default function ResultsSection({
  isLoading,
  viewMode,
  filteredPlaces,
  containerRef,
  visibleItems,
  totalHeight,
  offsetY,
  onBookmarkToggle,
}: Props) {
  return (
    <div className="lg:col-span-3">
      <p className="text-gray-600 mb-4">
        결과 {filteredPlaces.length.toLocaleString()}개
      </p>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PlaceCardSkeleton key={i} />
          ))}
        </div>
      ) : viewMode === "map" ? (
        <div className="h-[600px]">
          <MapView places={filteredPlaces} />
        </div>
      ) : (
        <div
          ref={containerRef}
          className="h-[800px] overflow-auto"
          style={{ height: 800 }}
        >
          <div style={{ height: totalHeight, position: "relative" }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: "absolute",
                inset: 0,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleItems.map((p, idx) => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    locale="ko"
                    showRecommendationScore
                    showPlatformIndicator
                    showDataQuality
                    showCrowdStatus
                    onBookmarkToggle={onBookmarkToggle}
                    priority={idx < 3}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
