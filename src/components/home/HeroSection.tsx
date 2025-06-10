// src/components/home/HeroSection.tsx – 담담·간결 버전
"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const homeT = useTranslations("Home");
  const commonT = useTranslations("Common");

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) onSearch(searchQuery.trim());
    },
    [searchQuery, onSearch]
  );

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white py-24 overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative container mx-auto px-4 text-center">
        {/* 메인 타이틀 */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          {homeT("heroTitleSimple") || "여행지를 빠르게 찾아보세요"}
        </h1>
        <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
          {homeT("heroSubtitleSimple") || "필요한 정보만 간결하게 제공합니다"}
        </p>

        {/* 검색 바 */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-14">
          <div className="flex items-center bg-white/5 backdrop-blur-lg rounded-2xl p-2 shadow-lg">
            <input
              type="text"
              className="flex-1 bg-transparent text-white placeholder-gray-400 text-lg px-4 py-3 focus:outline-none"
              placeholder={commonT("searchPlaceholder") || "어디로 떠나시나요?"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              className="shrink-0 min-w-[96px] bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 py-3 font-semibold transition-transform hover:scale-105"
            >
              {commonT("search") || "검색"}
            </Button>
          </div>
        </form>

        {/* 간단 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-black mb-1">50,000+</div>
            <p className="text-gray-300 text-sm">
              {homeT("statsVerifiedPlaces") || "등록된 장소"}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-black mb-1">24/7</div>
            <p className="text-gray-300 text-sm">
              {homeT("statsAlwaysUpdated") || "지속 업데이트"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
