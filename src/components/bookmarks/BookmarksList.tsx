// src/components/bookmarks/BookmarksList.tsx
import { Skeleton } from "@/components/ui/Skeleton";
import { BookmarkCard } from "./BookmarkCard";
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

interface BookmarksListProps {
  places: BookmarkedPlace[];
  viewMode: "grid" | "list";
  isLoading: boolean;
  onRemoveBookmark: (placeId: string) => void;
  onToggleVisited: (placeId: string) => void;
  locale: string;
}

export function BookmarksList({
  places,
  viewMode,
  isLoading,
  onRemoveBookmark,
  onToggleVisited,
  locale,
}: BookmarksListProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            className="h-64 rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      )}
    >
      {places.map((place) => (
        <BookmarkCard
          key={place.id}
          place={place}
          viewMode={viewMode}
          locale={locale}
          onRemoveBookmark={onRemoveBookmark}
          onToggleVisited={onToggleVisited}
        />
      ))}
    </div>
  );
}
