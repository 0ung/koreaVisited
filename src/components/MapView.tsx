// src/components/MapView.tsx - 번역 처리된 버전
"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";
import type { Place } from "@/types";

// Props 확장
interface MapViewProps {
  places: Place[];
  onPlaceSelect?: (place: Place) => void;
  selectedPlace?: Place | null;
  zoom?: number;
  center?: { lat: number; lng: number };
  showClusters?: boolean;
  showTraffic?: boolean;
  showCrowdData?: boolean;
  className?: string;
}

interface MapMarker {
  place: Place;
  x: number;
  y: number;
  cluster?: boolean;
  clusterCount?: number;
}

// 기존 마커 클러스터링 함수 (그대로 유지)
const clusterMarkers = (places: Place[], zoom: number): MapMarker[] => {
  const clusterDistance = Math.max(50, 100 - zoom * 5);
  const markers: MapMarker[] = [];
  const processed = new Set<string>();

  places.forEach((place) => {
    if (processed.has(place.id)) return;

    const x = ((place.lon - 126.8) / 0.4) * 100;
    const y = ((37.7 - place.lat) / 0.3) * 100;

    const nearbyPlaces = places.filter((otherPlace) => {
      if (processed.has(otherPlace.id) || otherPlace.id === place.id)
        return false;

      const otherX = ((otherPlace.lon - 126.8) / 0.4) * 100;
      const otherY = ((37.7 - otherPlace.lat) / 0.3) * 100;
      const distance = Math.sqrt(
        Math.pow(x - otherX, 2) + Math.pow(y - otherY, 2)
      );

      return distance < clusterDistance;
    });

    if (nearbyPlaces.length > 0) {
      nearbyPlaces.forEach((p) => processed.add(p.id));
      processed.add(place.id);

      markers.push({
        place,
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
        cluster: true,
        clusterCount: nearbyPlaces.length + 1,
      });
    } else {
      processed.add(place.id);
      markers.push({
        place,
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
        cluster: false,
      });
    }
  });

  return markers;
};

// 혼잡도 오버레이 컴포넌트
const CrowdOverlay = memo(({ places }: { places: Place[] }) => {
  const crowdHeatmapData = useMemo(() => {
    return places
      .filter((place) => place.crowd_index !== undefined)
      .map((place) => ({
        x: Math.max(5, Math.min(95, ((place.lon - 126.8) / 0.4) * 100)),
        y: Math.max(5, Math.min(95, ((37.7 - place.lat) / 0.3) * 100)),
        intensity: place.crowd_index!,
        id: place.id,
      }));
  }, [places]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {crowdHeatmapData.map((point) => (
        <div
          key={point.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: "40px",
            height: "40px",
          }}
        >
          <div
            className={cn(
              "w-full h-full rounded-full opacity-40",
              point.intensity <= 30
                ? "bg-green-400"
                : point.intensity <= 70
                ? "bg-yellow-400"
                : "bg-red-400"
            )}
            style={{
              filter: "blur(8px)",
              transform: `scale(${Math.max(0.5, point.intensity / 100)})`,
            }}
          />
        </div>
      ))}
    </div>
  );
});

CrowdOverlay.displayName = "CrowdOverlay";

// 마커 컴포넌트 확장
const MapMarker = memo(
  ({
    marker,
    isSelected,
    onClick,
    showCrowdData,
  }: {
    marker: MapMarker;
    isSelected: boolean;
    onClick: () => void;
    showCrowdData?: boolean;
  }) => {
    const t = useTranslations("MapView");

    const getCategoryColor = (category: string) => {
      const colors = {
        restaurant: "bg-red-500",
        cafe: "bg-amber-500",
        tourist: "bg-blue-500",
        culture: "bg-purple-500",
        shopping: "bg-pink-500",
        nature: "bg-green-500",
        activity: "bg-indigo-500",
        hotel: "bg-gray-500",
      };
      return colors[category as keyof typeof colors] || "bg-gray-500";
    };

    const getCrowdBorderColor = (crowdIndex?: number) => {
      if (!showCrowdData || crowdIndex === undefined) return "border-white";

      if (crowdIndex <= 30) return "border-green-400";
      if (crowdIndex <= 70) return "border-yellow-400";
      return "border-red-400";
    };

    if (marker.cluster) {
      return (
        <button
          onClick={onClick}
          className={cn(
            "absolute transform -translate-x-1/2 -translate-y-1/2 z-10",
            "bg-blue-600 text-white rounded-full border-2 shadow-lg",
            "min-w-[32px] h-8 px-2 text-sm font-bold",
            "hover:bg-blue-700 transition-colors",
            "flex items-center justify-center",
            isSelected && "ring-2 ring-blue-300 scale-110",
            getCrowdBorderColor(marker.place.crowd_index)
          )}
          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          title={t("clusterTooltip", {
            count: marker.clusterCount === undefined ? 0 : marker.clusterCount,
          })}
        >
          {marker.clusterCount}
        </button>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={onClick}
          className={cn(
            "absolute transform -translate-x-1/2 -translate-y-1/2 z-10",
            "w-8 h-8 rounded-full border-2 shadow-lg",
            "hover:scale-110 transition-transform",
            getCategoryColor(marker.place.category_std),
            isSelected && "ring-2 ring-blue-300 scale-125",
            getCrowdBorderColor(marker.place.crowd_index)
          )}
          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          title={marker.place.name.ko}
        >
          <span className="text-white text-xs font-bold">
            {marker.place.category_std === "restaurant"
              ? "🍽️"
              : marker.place.category_std === "cafe"
              ? "☕"
              : marker.place.category_std === "tourist"
              ? "🏛️"
              : marker.place.category_std === "culture"
              ? "🎭"
              : marker.place.category_std === "shopping"
              ? "🛍️"
              : marker.place.category_std === "nature"
              ? "🌳"
              : marker.place.category_std === "activity"
              ? "🎢"
              : marker.place.category_std === "hotel"
              ? "🏨"
              : "📍"}
          </span>
        </button>

        {/* 혼잡도 펄스 효과 */}
        {showCrowdData &&
          marker.place.crowd_index !== undefined &&
          marker.place.crowd_index > 70 && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            >
              <div className="w-12 h-12 bg-red-400 rounded-full opacity-30 animate-ping" />
            </div>
          )}
      </div>
    );
  }
);

MapMarker.displayName = "MapMarker";

// PlacePopup 컴포넌트
const PlacePopup = memo(
  ({ place, onClose }: { place: Place; onClose: () => void }) => {
    const t = useTranslations("MapView");

    const getPlatformCount = (platformData: Place["platform_data"]) => {
      return Object.values(platformData).filter((p) => p?.available).length;
    };

    const getCrowdStatus = (crowdIndex?: number) => {
      if (crowdIndex === undefined) return "";
      if (crowdIndex <= 30) return t("crowdLow");
      if (crowdIndex <= 70) return t("crowdMedium");
      return t("crowdHigh");
    };

    return (
      <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl border z-20 max-w-sm mx-auto">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {place.name.ko}
              </h3>
              <p className="text-sm text-gray-600">{place.address.ko}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="font-medium">{place.rating_avg.toFixed(1)}</span>
              <span className="text-sm text-gray-500">
                ({place.review_count.toLocaleString()})
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-purple-600">💎</span>
              <span className="text-sm font-medium">
                {place.recommendation_score.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-blue-600">📊</span>
              <span className="text-sm">
                {t("platformCount", {
                  count: getPlatformCount(place.platform_data),
                })}
              </span>
            </div>
          </div>

          {place.crowd_index !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">{t("realtimeCrowd")}</span>
                <span
                  className={cn(
                    "font-medium",
                    place.crowd_index <= 30
                      ? "text-green-600"
                      : place.crowd_index <= 70
                      ? "text-yellow-600"
                      : "text-red-600"
                  )}
                >
                  {getCrowdStatus(place.crowd_index)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    place.crowd_index <= 30
                      ? "bg-green-500"
                      : place.crowd_index <= 70
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                  style={{ width: `${place.crowd_index}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() =>
                window.open(
                  `https://map.kakao.com/link/search/${place.name.ko}`,
                  "_blank"
                )
              }
              className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded text-sm font-medium hover:bg-yellow-600 transition-colors"
            >
              {t("kakaoMap")}
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://map.naver.com/v5/search/${place.name.ko}`,
                  "_blank"
                )
              }
              className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-600 transition-colors"
            >
              {t("naverMap")}
            </button>
            <button
              onClick={() => window.open(`/places/${place.id}`, "_blank")}
              className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              {t("viewDetails")}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

PlacePopup.displayName = "PlacePopup";

// 메인 MapView 컴포넌트
const MapView = memo<MapViewProps>(
  ({
    places,
    onPlaceSelect,
    selectedPlace,
    zoom = 12,
    center = { lat: 37.5665, lng: 126.978 },
    showClusters = true,
    showTraffic = false,
    showCrowdData = false,
    className,
  }) => {
    const t = useTranslations("MapView");
    const [selectedMarker, setSelectedMarker] = useState<Place | null>(null);
    const [mapZoom, setMapZoom] = useState(zoom);

    // 기존 마커 클러스터링 로직 유지
    const markers = useMemo(() => {
      if (!showClusters) {
        return places.map((place) => ({
          place,
          x: Math.max(5, Math.min(95, ((place.lon - 126.8) / 0.4) * 100)),
          y: Math.max(5, Math.min(95, ((37.7 - place.lat) / 0.3) * 100)),
          cluster: false,
        }));
      }
      return clusterMarkers(places, mapZoom);
    }, [places, mapZoom, showClusters]);

    const handleMarkerClick = useCallback(
      (marker: MapMarker) => {
        setSelectedMarker(marker.place);
        onPlaceSelect?.(marker.place);
      },
      [onPlaceSelect]
    );

    const handleZoomIn = () => setMapZoom((prev) => Math.min(18, prev + 1));
    const handleZoomOut = () => setMapZoom((prev) => Math.max(8, prev - 1));

    return (
      <div className={cn("relative bg-gray-100 overflow-hidden", className)}>
        {/* 기존 지도 배경 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50">
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 100 100"
          >
            <defs>
              <pattern
                id="roads"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path d="M0 10 L20 10" stroke="#666" strokeWidth="0.5" />
                <path d="M10 0 L10 20" stroke="#666" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#roads)" />
          </svg>

          {/* 지역 표시 */}
          <div className="absolute top-4 left-4 bg-white/80 rounded px-2 py-1 text-xs font-medium">
            {t("seoulCity")}
          </div>
          <div className="absolute top-1/4 right-1/4 bg-white/60 rounded px-2 py-1 text-xs">
            {t("gangnamGu")}
          </div>
          <div className="absolute bottom-1/3 left-1/3 bg-white/60 rounded px-2 py-1 text-xs">
            {t("jungGu")}
          </div>
          <div className="absolute top-1/3 left-1/4 bg-white/60 rounded px-2 py-1 text-xs">
            {t("mapoGu")}
          </div>

          {/* 한강 */}
          <div className="absolute top-1/2 left-0 right-0 h-3 bg-blue-300/40 transform -translate-y-1/2 -rotate-12"></div>
        </div>

        {/* 혼잡도 오버레이 */}
        {showCrowdData && <CrowdOverlay places={places} />}

        {/* 마커들 */}
        {markers.map((marker, index) => (
          <MapMarker
            key={`marker-${marker.place.id}-${index}`}
            marker={marker}
            isSelected={selectedMarker?.id === marker.place.id}
            onClick={() => handleMarkerClick(marker)}
            showCrowdData={showCrowdData}
          />
        ))}

        {/* 줌 컨트롤 */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden z-10">
          <button
            onClick={handleZoomIn}
            className="block w-10 h-10 flex items-center justify-center hover:bg-gray-50 border-b"
            title={t("zoomIn")}
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="block w-10 h-10 flex items-center justify-center hover:bg-gray-50"
            title={t("zoomOut")}
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
                d="M18 12H6"
              />
            </svg>
          </button>
        </div>

        {/* 범례 */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <h4 className="text-xs font-semibold mb-2">{t("legend")}</h4>
          <div className="space-y-2">
            {/* 카테고리 */}
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">
                {t("categories")}
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{t("restaurant")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span>{t("cafe")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>{t("tourist")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{t("nature")}</span>
                </div>
              </div>
            </div>

            {/* 혼잡도 범례 */}
            {showCrowdData && (
              <div className="border-t pt-2">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {t("crowdLevel")}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span>{t("crowdLow")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span>{t("crowdMedium")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span>{t("crowdHigh")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="text-sm">
            <div className="font-semibold text-gray-900 mb-1">
              {t("totalPlaces", { count: places.length })}
            </div>
            <div className="text-gray-600 text-xs">
              {t("zoomLevel", { level: mapZoom })} |
              {showClusters
                ? t("clustersCount", {
                    count: markers.filter((m) => m.cluster).length,
                  })
                : t("individualMarkers")}
              {showCrowdData && <span> | {t("crowdDisplayOn")}</span>}
            </div>
          </div>
        </div>

        {/* 선택된 장소 팝업 */}
        {selectedMarker && (
          <PlacePopup
            place={selectedMarker}
            onClose={() => setSelectedMarker(null)}
          />
        )}

        {/* 로딩 오버레이 */}
        {places.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
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
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("noPlacesToShow")}
              </h3>
              <p className="text-gray-600">{t("noPlacesDesc")}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MapView.displayName = "MapView";

export default MapView;
