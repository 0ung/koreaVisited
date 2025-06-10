// src/components/home/RealTimeSection.tsx
"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

// 동적 임포트
const MapView = dynamic(() => import("@/components/MapView"), {
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-2xl animate-pulse shadow-inner" />
  ),
  ssr: false,
});

export function RealTimeSection() {
  const homeT = useTranslations("Home");
  const commonT = useTranslations("Common");

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            📈 {homeT("trendingNow") || "지금 뜨는 곳"}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            실시간 데이터로 가장 핫한 트렌드를 확인하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 혼잡도 지도 */}
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                🗺️{" "}
                {homeT("realTimeCrowd") ||
                  commonT("crowdLevel") ||
                  "실시간 혼잡도"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-xl overflow-hidden">
                <MapView
                  places={[]}
                  showCrowdData={true}
                  className="rounded-xl"
                />
              </div>
              <div className="mt-6 text-gray-300 bg-white/5 rounded-lg p-4">
                <p className="font-medium">
                  {homeT("crowdDescription") ||
                    "실시간 데이터를 바탕으로 한 혼잡도 정보"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 인기 급상승 장소 */}
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                🔥 {homeT("weeklyPicks") || "이주의 추천"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 실제 데이터 로딩 상태 */}
                <div className="text-center text-gray-300 py-12">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl animate-pulse flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {commonT("loading") || "로딩 중..."}
                  </p>
                  <p className="text-sm text-gray-400">
                    실시간 트렌드 분석 중입니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
