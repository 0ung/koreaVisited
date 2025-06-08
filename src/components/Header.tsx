"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";

// 동적 임포트로 코드 스플리팅
const LanguageSwitcher = dynamic(() => import("./LanguageSwitcher"), {
  loading: () => <Skeleton variant="rectangular" width={60} height={32} />,
  ssr: false,
});

const UserMenu = dynamic(() => import("./UserMenu"), {
  loading: () => <Skeleton variant="circular" width={32} height={32} />,
  ssr: false,
});

const NotificationBell = dynamic(() => import("./NotificationBell"), {
  loading: () => <Skeleton variant="rectangular" width={32} height={32} />,
  ssr: false,
});

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  badge?: number;
  requiresAuth?: boolean;
  showOnMobile?: boolean;
  isAdminOnly?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

// 향상된 검색바 컴포넌트
const SearchBar: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const t = useTranslations("Header");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const searchIcon = (
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchModalOpen(true)}
          className="h-10 w-10"
          aria-label={t("search")}
        >
          {searchIcon}
        </Button>

        <Modal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          title={t("search")}
          size="full"
        >
          <div className="space-y-4">
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={searchIcon}
              autoFocus
            />
            <div className="flex space-x-3">
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="flex-1"
              >
                {t("search")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSearchModalOpen(false)}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
      className="w-full"
    >
      <Input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leftIcon={searchIcon}
        className="w-full"
      />
    </form>
  );
};

// 임시 인증 컨텍스트 (실제로는 AuthContext 사용)
const useAuth = () => {
  const [user] = useState<User | null>({
    id: "123",
    name: "여행러버",
    email: "user@example.com",
    role: "user", // admin | user
  });
  const [isAuthenticated] = useState(false); // 실제로는 true/false 토글

  return { user, isAuthenticated };
};

export default function Header() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 메뉴 관리
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // ESC 키 및 메뉴 외부 클릭 처리
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isMenuOpen) {
        const target = e.target as Element;
        if (!target.closest("[data-mobile-menu]")) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("click", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // 네비게이션 아이템 정의 (새 페이지들 추가)
  const navItems: NavItem[] = useMemo(
    () => [
      {
        href: "/",
        labelKey: "home",
        icon: (
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
        showOnMobile: true,
      },
      {
        href: "/search",
        labelKey: "search",
        icon: (
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        ),
        showOnMobile: false,
      },
      {
        href: "/categories",
        labelKey: "categories",
        icon: (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        ),
        showOnMobile: true,
      },
      {
        href: "/bookmarks",
        labelKey: "bookmarks",
        icon: (
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
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        ),
        requiresAuth: true,
        showOnMobile: true,
        badge: 3, // 예시 배지
      },
      {
        href: "/profile",
        labelKey: "profile",
        icon: (
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ),
        requiresAuth: true,
        showOnMobile: true,
      },
      {
        href: "/help",
        labelKey: "help",
        icon: (
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
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        showOnMobile: true,
      },
      {
        href: "/settings",
        labelKey: "settings",
        icon: (
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
        requiresAuth: true,
        showOnMobile: true,
      },
      {
        href: "/admin/dashboard",
        labelKey: "adminDashboard",
        icon: (
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ),
        requiresAuth: true,
        isAdminOnly: true,
        showOnMobile: true,
      },
    ],
    []
  );

  // 현재 경로 확인
  const isCurrentPath = useCallback(
    (href: string) => {
      if (href === "/") {
        return pathname === "/" || pathname === "";
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // 표시할 네비게이션 아이템 필터링
  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      // 인증이 필요한 아이템
      if (item.requiresAuth && !isAuthenticated) {
        return false;
      }

      // 관리자 전용 아이템
      if (item.isAdminOnly && (!user || user.role !== "admin")) {
        return false;
      }

      return true;
    });
  }, [navItems, isAuthenticated, user]);

  // 모바일에서 표시할 아이템들
  const mobileNavItems = useMemo(() => {
    return visibleNavItems.filter((item) => item.showOnMobile);
  }, [visibleNavItems]);

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
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                aria-label={t("homeLink")}
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="hidden sm:block">TravelKorea</span>
              </Link>
            </div>

            {/* 데스크톱 네비게이션 */}
            <div className="hidden lg:flex items-center space-x-1">
              {visibleNavItems.slice(0, 6).map((item) => (
                <Button
                  key={item.href}
                  variant={isCurrentPath(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link
                    href={item.href}
                    className="flex items-center space-x-1"
                    aria-current={isCurrentPath(item.href) ? "page" : undefined}
                  >
                    {item.icon}
                    <span>{t(item.labelKey)}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                </Button>
              ))}
            </div>

            {/* 데스크톱 검색바 */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <SearchBar />
            </div>

            {/* 우측 액션 버튼들 */}
            <div className="flex items-center space-x-2">
              {/* 모바일 검색 버튼 */}
              <div className="lg:hidden">
                <SearchBar isMobile />
              </div>

              {/* 알림 (인증된 사용자만) */}
              {isAuthenticated && <NotificationBell />}

              {/* 언어 스위처 */}
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* 사용자 메뉴 / 로그인 버튼 */}
              {isAuthenticated ? (
                <UserMenu user={user} />
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">{t("login")}</Link>
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href="/signup">{t("signup")}</Link>
                  </Button>
                </div>
              )}

              {/* 모바일 메뉴 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="lg:hidden h-10 w-10"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={t("toggleMenu")}
                data-mobile-menu
              >
                <svg
                  className={cn(
                    "w-6 h-6 transition-transform duration-200",
                    isMenuOpen && "rotate-90"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* 모바일 사이드 메뉴 오버레이 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* 백드롭 */}
          <div className="fixed inset-0 bg-black/50 transition-opacity" />

          {/* 사이드 메뉴 */}
          <div
            className={cn(
              "fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
            data-mobile-menu
          >
            <div className="flex flex-col h-full">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="font-bold text-lg">TravelKorea</span>
                </div>
                <Button variant="ghost" size="icon" onClick={closeMenu}>
                  <svg
                    className="w-6 h-6"
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
                </Button>
              </div>

              {/* 네비게이션 링크들 */}
              <div className="flex-1 py-4 overflow-y-auto">
                <div className="space-y-1 px-4">
                  {mobileNavItems.map((item) => (
                    <Button
                      key={item.href}
                      variant={isCurrentPath(item.href) ? "secondary" : "ghost"}
                      size="lg"
                      asChild
                      className="w-full justify-start h-12"
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="flex items-center space-x-3"
                        aria-current={
                          isCurrentPath(item.href) ? "page" : undefined
                        }
                      >
                        {item.icon}
                        <span className="text-base">{t(item.labelKey)}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-auto">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                      </Link>
                    </Button>
                  ))}
                </div>

                {/* 추가 메뉴들 */}
                <div className="mt-6 px-4">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      {t("settings") || "설정"}
                    </p>

                    {/* 언어 설정 */}
                    <div className="mb-4">
                      <LanguageSwitcher />
                    </div>

                    {/* 로그인/로그아웃 버튼 */}
                    {!isAuthenticated && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="lg"
                          asChild
                          className="w-full"
                        >
                          <Link href="/login" onClick={closeMenu}>
                            {t("login")}
                          </Link>
                        </Button>
                        <Button
                          variant="default"
                          size="lg"
                          asChild
                          className="w-full"
                        >
                          <Link href="/signup" onClick={closeMenu}>
                            {t("signup")}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
