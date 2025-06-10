// src/components/bookmarks/BookmarksHeader.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface BookmarksHeaderProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  sortBy: "recent" | "name" | "rating";
  setSortBy: (sort: "recent" | "name" | "rating") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateFolder: () => void;
}

export function BookmarksHeader({
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  onCreateFolder,
}: BookmarksHeaderProps) {
  const bookmarksT = useTranslations("Bookmarks");
  const commonT = useTranslations("Common");

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {bookmarksT("myBookmarks")}
            </h1>
            <p className="text-gray-600">
              {bookmarksT("noBookmarksDescription")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={onCreateFolder}
              className="flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {commonT("createFolder") || "폴더 만들기"}
            </Button>
            <Button variant="gradient" asChild>
              <Link href="/search">{bookmarksT("exploreButton")}</Link>
            </Button>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4">
          {/* 검색바 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={commonT("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 정렬 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="recent">{bookmarksT("sortByDate")}</option>
            <option value="name">{bookmarksT("sortByName")}</option>
            <option value="rating">{bookmarksT("sortByRating")}</option>
          </select>

          {/* 뷰 모드 */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
              title="그리드 보기"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
              title="리스트 보기"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
