// src/components/header/MobileMenu.tsx
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";
import { useNavItems } from "./useNavItems";

// 동적 임포트
const LanguageSwitcher = dynamic(() => import("../LanguageSwitcher"), {
  loading: () => <Skeleton variant="rectangular" width={60} height={32} />,
  ssr: false,
});

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const navItems = useNavItems();

  // ESC 키 및 메뉴 외부 클릭 처리
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen) {
        const target = e.target as Element;
        if (!target.closest("[data-mobile-menu]")) {
          onClose();
        }
      }
    };

    if (isOpen) {
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
  }, [isOpen, onClose]);

  // 현재 경로 확인
  const isCurrentPath = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
    return pathname.startsWith(href);
  };

  // 모바일에서 표시할 아이템들
  const mobileNavItems = navItems.filter((item) => {
    // 인증이 필요한 아이템
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }

    // 관리자 전용 아이템
    if (item.isAdminOnly && (!user || user.role !== "ADMIN")) {
      return false;
    }

    // 모바일에서 표시할 아이템만
    return item.showOnMobile;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 백드롭 */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" />

      {/* 사이드 메뉴 */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
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
            <Button variant="ghost" size="icon" onClick={onClose}>
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
                    onClick={onClose}
                    className="flex items-center space-x-3"
                    aria-current={isCurrentPath(item.href) ? "page" : undefined}
                  >
                    {item.icon}
                    <span className="text-base">{t(item.labelKey)}</span>
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
                      <Link href="/login" onClick={onClose}>
                        {t("login")}
                      </Link>
                    </Button>
                    <Button
                      variant="default"
                      size="lg"
                      asChild
                      className="w-full"
                    >
                      <Link href="/signup" onClick={onClose}>
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
  );
}
