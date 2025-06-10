// src/components/header/Navigation.tsx
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useNavItems } from "./useNavItems";

export function Navigation() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const navItems = useNavItems();

  // 현재 경로 확인
  const isCurrentPath = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
    return pathname.startsWith(href);
  };

  // 표시할 네비게이션 아이템 필터링
  const visibleNavItems = navItems.filter((item) => {
    // 인증이 필요한 아이템
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }

    // 관리자 전용 아이템
    if (item.isAdminOnly && (!user || user.role !== "ADMIN")) {
      return false;
    }

    return true;
  });

  return (
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
          </Link>
        </Button>
      ))}
    </div>
  );
}
