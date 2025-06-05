"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/utils/cn";

// 기존 UI 컴포넌트들 활용
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { User } from "./UserMenu";

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
}

interface UserType {
  name: string;
  email: string;
}

// 향상된 검색바 컴포넌트
const SearchBar: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const t = useTranslations("Search");

  // 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // 검색 제안 (디바운스)
  useEffect(() => {
    if (searchQuery.length > 1) {
      const timer = setTimeout(() => {
        // 실제로는 API 호출
        const mockSuggestions = [
          "서울 맛집",
          "부산 카페",
          "제주도 관광",
          "강남 술집",
          "홍대 클럽",
        ].filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions(mockSuggestions);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      // 최근 검색어에 추가
      const newRecent = [
        query,
        ...recentSearches.filter((item) => item !== query),
      ].slice(0, 10);
      setRecentSearches(newRecent);
      localStorage.setItem("recentSearches", JSON.stringify(newRecent));

      // 검색 실행
      console.log("검색:", query);
      setIsSearchModalOpen(false);
      setSearchQuery("");
    }
  };

  const searchIcon = (
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
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchModalOpen(true)}
          className="h-10 w-10"
          aria-label={t("openSearch")}
        >
          {searchIcon}
        </Button>

        <Modal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          title={t("searchTitle")}
          size="full"
          className="h-full"
        >
          <div className="flex flex-col h-full">
            {/* 검색 입력 */}
            <div className="sticky top-0 bg-white z-10 pb-4 border-b">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
              >
                <Input
                  type="text"
                  placeholder={t("placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={searchIcon}
                  autoFocus
                  className="text-base"
                />
              </form>
            </div>

            {/* 검색 내용 */}
            <div className="flex-1 overflow-y-auto py-4">
              {/* 최근 검색어 */}
              {recentSearches.length > 0 && !searchQuery && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    {t("recentSearches")}
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(item)}
                        className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-gray-400 mr-3"
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
                        <span className="text-gray-700">{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 검색 제안 */}
              {suggestions.length > 0 && searchQuery && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    {t("suggestions")}
                  </h3>
                  <div className="space-y-2">
                    {suggestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(item)}
                        className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {searchIcon}
                        <span className="text-gray-700 ml-3">{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 인기 검색어 */}
              {!searchQuery && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    {t("popularSearches")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["서울 맛집", "부산 여행", "제주도", "카페", "호텔"].map(
                      (item, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(item)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleSearch()}
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
          </div>
        </Modal>
      </>
    );
  }

  // 데스크톱 검색바
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
        placeholder={t("placeholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leftIcon={searchIcon}
        className="w-full"
      />
    </form>
  );
};

// 임시 인증 컨텍스트
const useAuth = () => {
  const [user, setUser] = useState<User>({
    id: "123",
    name: "123",
    email: "123",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return { user, isAuthenticated };
};

export default function Header() {
  const t = useTranslations("Navigation");
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

  // 네비게이션 아이템 정의
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
        showOnMobile: false, // 검색은 별도 버튼으로
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
              d="M19 11H5m14-7l-7 7-7-7m14 18l-7-7-7 7"
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
      },
      {
        href: "/trips",
        labelKey: "myTrips",
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        ),
        requiresAuth: true,
        showOnMobile: true,
      },
    ],
    []
  );

  const isCurrentPath = useCallback(
    (href: string) => {
      if (href === "/") {
        return pathname === "/" || pathname === "";
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => !item.requiresAuth || isAuthenticated),
    [navItems, isAuthenticated]
  );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-white transition-all duration-300",
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
              {visibleNavItems.map((item) => (
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
                  <Button variant="gradient" size="sm" asChild>
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
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="font-bold text-gray-900">TravelKorea</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMenu}
                  className="h-8 w-8"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>

              {/* 사용자 정보 (로그인시) */}
              {isAuthenticated && user && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name || "사용자"}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 메뉴 아이템들 */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-4">
                  {visibleNavItems
                    .filter((item) => item.showOnMobile !== false)
                    .map((item) => (
                      <Button
                        key={item.href}
                        variant={
                          isCurrentPath(item.href) ? "secondary" : "ghost"
                        }
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

                    {/* 기타 링크들 */}
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-full justify-start"
                      >
                        <Link href="/help" onClick={closeMenu}>
                          <svg
                            className="w-4 h-4 mr-3"
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
                          도움말
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-full justify-start"
                      >
                        <Link href="/contact" onClick={closeMenu}>
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          문의하기
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 액션 버튼 */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                {!isAuthenticated ? (
                  <div className="space-y-3">
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
                      variant="gradient"
                      size="lg"
                      asChild
                      className="w-full"
                    >
                      <Link href="/signup" onClick={closeMenu}>
                        {t("signup")}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      // 로그아웃 로직
                      closeMenu();
                    }}
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {t("logout") || "로그아웃"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
