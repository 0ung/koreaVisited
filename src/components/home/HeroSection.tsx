// src/components/home/HeroSection.tsx
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
      if (searchQuery.trim()) {
        onSearch(searchQuery.trim());
      }
    },
    [searchQuery, onSearch]
  );

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white py-24 overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 to-slate-300 bg-clip-text text-transparent">
            {homeT("heroTitle") || "한국의 숨은 보석을 발견하세요"}
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto">
          {homeT("heroSubtitle") || "진짜 현지인들이 추천하는 특별한 장소들"}
        </p>

        {/* 검색 바 - 글래스모피즘 */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl">
            <div className="flex items-center">
              <input
                type="text"
                placeholder={
                  commonT("searchPlaceholder") || "어디로 가실 건가요?"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 mr-3 border-0 bg-transparent text-white placeholder-gray-300 text-lg focus:outline-none focus:ring-0"
              />
              <Button
                type="submit"
                className="shrink-0 min-w-[100px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl px-8 py-4 font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                {homeT("searchButton") || commonT("search") || "검색"}
              </Button>
            </div>
          </div>
        </form>

        {/* 통계 정보 - 글래스모피즘 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 group">
            <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">
              50,000+
            </div>
            <div className="text-gray-300 font-medium">
              {homeT("statsVerifiedPlaces") || "검증된 장소"}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 group">
            <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">
              3개
            </div>
            <div className="text-gray-300 font-medium">
              {homeT("statsPlatformsIntegrated") || "플랫폼 통합"}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 group">
            <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">
              {homeT("statsRealtime") || "실시간"}
            </div>
            <div className="text-gray-300 font-medium">
              {homeT("statsCrowdInfo") || "혼잡도 정보"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
