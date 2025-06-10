// src/components/bookmarks/BookmarkCard.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

interface BookmarkedPlace {
  id: string;
  name: { ko: string; en: string; ja: string };
  address: { ko: string; en: string; ja: string };
  category_std: string;
  rating_avg: number;
  review_count: number;
  main_image_urls: string[];
  recommendation_score: number;
  tags: string[];
  bookmarked_at: string;
  visited?: boolean;
  notes?: string;
}

interface BookmarkCardProps {
  place: BookmarkedPlace;
  viewMode: "grid" | "list";
  locale: string;
  onRemoveBookmark: (placeId: string) => void;
  onToggleVisited: (placeId: string) => void;
}

export function BookmarkCard({
  place,
  viewMode,
  locale,
  onRemoveBookmark,
  onToggleVisited,
}: BookmarkCardProps) {
  const bookmarksT = useTranslations("Bookmarks");
  const commonT = useTranslations("Common");
  const homeT = useTranslations("Home");

  // 현재 언어에 맞는 텍스트 가져오기
  const getLocalizedText = (textObj: {
    ko: string;
    en: string;
    ja: string;
  }) => {
    return textObj[locale as keyof typeof textObj] || textObj.ko;
  };

  // 카테고리 한글명
  const getCategoryName = (category: string) => {
    const categoryKey = `categories.${category}`;
    const translated = homeT(categoryKey);

    if (translated === categoryKey) {
      const categoryMap: Record<string, string> = {
        restaurants: "맛집",
        cafes: "카페",
        attractions: "관광지",
        hotels: "숙박",
        shopping: "쇼핑",
        nightlife: "나이트라이프",
        culture: "문화",
        nature: "자연",
        sports: "스포츠",
      };
      return categoryMap[category] || category;
    }

    return translated;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {viewMode === "grid" ? (
        // 그리드 뷰
        <>
          <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
            {/* 방문 배지 */}
            {place.visited && (
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  {bookmarksT("visitedOn") || "방문완료"}
                </span>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleVisited(place.id)}
                className="w-8 h-8 bg-white/90 hover:bg-white"
                title={
                  place.visited
                    ? bookmarksT("neverVisited") || "미방문으로 변경"
                    : bookmarksT("visitedOn") || "방문완료로 변경"
                }
              >
                <svg
                  className={cn(
                    "w-4 h-4",
                    place.visited ? "text-green-600" : "text-gray-600"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveBookmark(place.id)}
                className="w-8 h-8 bg-white/90 hover:bg-white text-red-600"
                title={bookmarksT("removeBookmark") || "북마크 제거"}
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>

            {/* 이미지 placeholder */}
            <div className="w-full h-full flex items-center justify-center text-white text-4xl">
              📸
            </div>
          </div>

          <CardContent className="p-4">
            <Link href={`/places/${place.id}`}>
              <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                {getLocalizedText(place.name)}
              </h3>
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {getCategoryName(place.category_std)}
                </span>
                <div className="flex items-center text-yellow-500">
                  <svg
                    className="w-4 h-4 mr-1 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">{place.rating_avg}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {getLocalizedText(place.address)}
              </p>
            </Link>

            {place.notes && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <span className="text-yellow-800">💡 {place.notes}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1 mb-3">
              {place.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="text-xs text-gray-400">
              {new Date(place.bookmarked_at).toLocaleDateString(
                locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US"
              )}{" "}
              {commonT("saved") || "저장"}
            </div>
          </CardContent>
        </>
      ) : (
        // 리스트 뷰
        <div className="flex">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl relative">
            📸
            {place.visited && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link href={`/places/${place.id}`}>
                  <h3 className="font-bold text-lg text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                    {getLocalizedText(place.name)}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {getCategoryName(place.category_std)}
                  </span>
                  <div className="flex items-center text-sm text-yellow-500">
                    <svg
                      className="w-4 h-4 mr-1 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {place.rating_avg}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {getLocalizedText(place.address)}
                </p>
                {place.notes && (
                  <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                    💡 {place.notes}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveBookmark(place.id)}
                  className="h-8 w-8 text-red-600"
                  title={bookmarksT("removeBookmark") || "북마크 제거"}
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      )}
    </Card>
  );
}
