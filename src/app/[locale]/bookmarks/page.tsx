// src/app/[locale]/bookmarks/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  BookmarksHeader,
  FolderSidebar,
  BookmarksList,
  EmptyState,
  CreateFolderModal,
} from "@/components/bookmarks";
import { useBookmarksData } from "@/hooks/useBookmarksData";

export default function BookmarksPage() {
  const params = useParams();
  const locale = params.locale as string;
  const commonT = useTranslations("Common");

  // 상태 관리
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "rating">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

  // 데이터 관리 (커스텀 훅으로 분리)
  const {
    bookmarkedPlaces,
    folders,
    isLoading,
    removeBookmark,
    toggleVisited,
    createFolder,
    filteredPlaces,
  } = useBookmarksData(locale, selectedFolder, searchQuery, sortBy);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <BookmarksHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onCreateFolder={() => setIsCreateFolderModalOpen(true)}
        />

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* 사이드바 - 폴더 목록 */}
            <FolderSidebar
              folders={folders}
              selectedFolder={selectedFolder}
              onSelectFolder={setSelectedFolder}
            />

            {/* 메인 콘텐츠 */}
            <div className="flex-1">
              {isLoading ? (
                <BookmarksList
                  places={[]}
                  viewMode={viewMode}
                  isLoading={true}
                  onRemoveBookmark={removeBookmark}
                  onToggleVisited={toggleVisited}
                  locale={locale}
                />
              ) : filteredPlaces.length > 0 ? (
                <BookmarksList
                  places={filteredPlaces}
                  viewMode={viewMode}
                  isLoading={false}
                  onRemoveBookmark={removeBookmark}
                  onToggleVisited={toggleVisited}
                  locale={locale}
                />
              ) : (
                <EmptyState
                  hasSearchQuery={!!searchQuery}
                  onClearSearch={() => setSearchQuery("")}
                />
              )}
            </div>
          </div>
        </div>

        {/* 폴더 생성 모달 */}
        <CreateFolderModal
          isOpen={isCreateFolderModalOpen}
          onClose={() => setIsCreateFolderModalOpen(false)}
          onCreateFolder={createFolder}
        />
      </div>
    </ProtectedRoute>
  );
}
