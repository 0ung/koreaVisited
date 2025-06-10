// src/components/header/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { MobileMenu } from "./MobileMenu";
import { UserActions } from "./UserActions";

export function Header() {
  const { isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 로딩 중이면 스켈레톤 표시
  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center space-x-2">
              <Skeleton variant="rectangular" width={200} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md transition-all duration-200",
          isScrolled
            ? "shadow-lg border-b border-gray-200"
            : "shadow-sm border-b border-gray-100"
        )}
      >
        <nav
          className="container mx-auto px-4 sm:px-6 lg:px-8"
          role="navigation"
        >
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <Logo />

            {/* 데스크톱 네비게이션 */}
            <Navigation />

            {/* 우측 액션 버튼들 */}
            <UserActions
              isMenuOpen={isMenuOpen}
              onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        </nav>
      </header>

      {/* 모바일 메뉴 */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
