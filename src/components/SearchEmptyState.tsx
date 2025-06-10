// components/SearchEmptyState.tsx
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

interface SearchEmptyStateProps {
  query: string;
  onClearSearch?: () => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export default function SearchEmptyState({
  query,
  onClearSearch,
  suggestions = [],
  onSuggestionClick,
}: SearchEmptyStateProps) {
  const t = useTranslations("SearchEmpty");

  return (
    <div className="text-center py-16">
      {/* 아이콘 */}
      <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <svg
          className="w-10 h-10 text-gray-400"
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
      </div>

      {/* 메시지 */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {t("noResults")}
      </h3>

      {query ? (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          <span className="font-medium">"{query}"</span>
          {t("noResultsForQuery")}
          <br />
          {t("noResultsDescription")}
        </p>
      ) : (
        <p className="text-gray-600 mb-6">{t("searchPlaceholder")}</p>
      )}

      {/* 추천 검색어 */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            {t("suggestedKeywords")}
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="text-sm"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="space-y-3">
        {query && onClearSearch && (
          <Button variant="outline" onClick={onClearSearch} className="mr-4">
            {t("clearSearch")}
          </Button>
        )}

        <Button variant="default" onClick={() => window.history.back()}>
          {t("goBack")}
        </Button>
      </div>

      {/* 팁 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
        <h4 className="font-medium text-blue-900 mb-2">💡 {t("searchTips")}</h4>
        <ul className="text-sm text-blue-800 space-y-1 text-left">
          <li>• {t("tip1")}</li>
          <li>• {t("tip2")}</li>
          <li>• {t("tip3")}</li>
        </ul>
      </div>
    </div>
  );
}
