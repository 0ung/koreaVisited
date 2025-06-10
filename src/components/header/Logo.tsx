// src/components/header/Logo.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Logo() {
  const t = useTranslations("Header");

  return (
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
  );
}
