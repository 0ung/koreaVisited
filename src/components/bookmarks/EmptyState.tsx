// src/components/bookmarks/EmptyState.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  hasSearchQuery: boolean;
  onClearSearch: () => void;
}

export function EmptyState({ hasSearchQuery, onClearSearch }: EmptyStateProps) {
  const bookmarksT = useTranslations("Bookmarks");
  const commonT = useTranslations("Common");

  return (
    <div className="text-center py-16">
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
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasSearchQuery
          ? commonT("noResults") || "검색 결과가 없습니다"
          : bookmarksT("noBookmarks") || "아직 북마크한 장소가 없어요"}
      </h3>
      <p className="text-gray-600 mb-6">
        {hasSearchQuery
          ? commonT("tryAgain") || "다른 키워드로 검색해보세요"
          : bookmarksT("noBookmarksDescription") ||
            "마음에 드는 장소를 북마크에 저장해보세요"}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {hasSearchQuery ? (
          <Button variant="outline" onClick={onClearSearch}>
            {bookmarksT("allCategories") || "전체 북마크 보기"}
          </Button>
        ) : (
          <>
            <Button variant="gradient" asChild>
              <Link href="/search">
                {bookmarksT("exploreButton") || "장소 찾아보기"}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories">
                {commonT("exploreCategories") || "카테고리별 둘러보기"}
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
