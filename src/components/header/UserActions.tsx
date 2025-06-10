// src/components/header/UserActions.tsx
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

// 동적 임포트
const LanguageSwitcher = dynamic(() => import("../LanguageSwitcher"), {
  loading: () => <Skeleton variant="rectangular" width={60} height={32} />,
  ssr: false,
});

const UserMenu = dynamic(() => import("../UserMenu"), {
  loading: () => <Skeleton variant="circular" width={32} height={32} />,
  ssr: false,
});

const NotificationBell = dynamic(() => import("../NotificationBell"), {
  loading: () => <Skeleton variant="rectangular" width={32} height={32} />,
  ssr: false,
});

interface UserActionsProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export function UserActions({ isMenuOpen, onToggleMenu }: UserActionsProps) {
  const t = useTranslations("Header");
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex items-center space-x-2">
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
        onClick={onToggleMenu}
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
  );
}
