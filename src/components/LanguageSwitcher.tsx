"use client";

import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // ESC 키 처리
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const languages = {
    ko: { name: "한국어", flag: "🇰🇷", shortName: "KR" },
    en: { name: "English", flag: "🇺🇸", shortName: "EN" },
    ja: { name: "日本語", flag: "🇯🇵", shortName: "JP" },
  };

  const currentLanguage = languages[locale as keyof typeof languages];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button 컴포넌트 사용 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-2 h-10 px-3",
          isOpen && "ring-2 ring-blue-500 border-blue-500"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="언어 선택"
        rightIcon={
          <svg
            className={cn(
              "w-4 h-4 text-gray-500 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        }
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">{currentLanguage.shortName}</span>
      </Button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in slide-in-from-top-2 duration-200">
          {routing.locales.map((lang) => {
            const language = languages[lang as keyof typeof languages];
            const isSelected = lang === locale;

            return (
              <Button
                key={lang}
                variant="ghost"
                size="sm"
                onClick={() => handleLanguageChange(lang)}
                className={cn(
                  "w-full justify-start h-auto py-2 px-3 rounded-none",
                  "hover:bg-gray-50 focus:bg-gray-50",
                  isSelected && "bg-blue-50 text-blue-700 hover:bg-blue-50"
                )}
                role="option"
                aria-selected={isSelected}
                leftIcon={<span className="text-base">{language.flag}</span>}
                rightIcon={
                  isSelected ? (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : null
                }
              >
                <span className="text-sm font-medium">{language.name}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
