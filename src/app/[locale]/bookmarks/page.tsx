"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cn } from "@/utils/cn";
import { storage } from "@/utils/storage";

// 기존 Place 인터페이스 재사용
interface BookmarkedPlace {
  id: string;
  name: {
    ko: string;
    en: string;
    ja: string;
  };
  address: {
    ko: string;
    en: string;
    ja: string;
  };
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

interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  placeIds: string[];
  created_at: string;
}

export default function BookmarksPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<BookmarkedPlace[]>(
    []
  );
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "rating">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#3B82F6");

  // 현재 언어에 맞는 텍스트 가져오기
  const getLocalizedText = (textObj: {
    ko: string;
    en: string;
    ja: string;
  }) => {
    return textObj[locale as keyof typeof textObj] || textObj.ko;
  };

  // 북마크 데이터 로드
  useEffect(() => {
    const loadBookmarks = async () => {
      setIsLoading(true);

      try {
        // 실제로는 API 호출: /api/bookmarks?locale=${locale}
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 목업 데이터
        const mockBookmarkedPlaces: BookmarkedPlace[] = [
          {
            id: "1",
            name: {
              ko: "부산 감천문화마을",
              en: "Gamcheon Culture Village",
              ja: "釜山甘川文化村",
            },
            address: {
              ko: "부산 사하구 감내2로 203",
              en: "203 Gamnae 2-ro, Saha-gu, Busan",
              ja: "釜山沙下区甘内2路203",
            },
            category_std: "attractions",
            rating_avg: 4.5,
            review_count: 1250,
            main_image_urls: ["/images/gamcheon.jpg"],
            recommendation_score: 9.2,
            tags: ["포토존", "예술", "언덕마을"],
            bookmarked_at: "2024-03-15T10:30:00Z",
            visited: false,
            notes: "꼭 일출 시간에 가보기!",
          },
          {
            id: "2",
            name: {
              ko: "홍대 합정역 카페거리",
              en: "Hongdae Hapjeong Cafe Street",
              ja: "弘大合井駅カフェ街",
            },
            address: {
              ko: "서울 마포구 와우산로",
              en: "Wausan-ro, Mapo-gu, Seoul",
              ja: "ソウル麻浦区ワウ山路",
            },
            category_std: "cafes",
            rating_avg: 4.3,
            review_count: 890,
            main_image_urls: ["/images/hongdae-cafe.jpg"],
            recommendation_score: 8.7,
            tags: ["트렌디", "인스타", "데이트"],
            bookmarked_at: "2024-03-10T14:20:00Z",
            visited: true,
          },
          {
            id: "3",
            name: {
              ko: "명동 칼국수 골목",
              en: "Myeongdong Kalguksu Alley",
              ja: "明洞カルグクス横丁",
            },
            address: {
              ko: "서울 중구 명동2가",
              en: "Myeongdong 2-ga, Jung-gu, Seoul",
              ja: "ソウル中区明洞2街",
            },
            category_std: "restaurants",
            rating_avg: 4.7,
            review_count: 2100,
            main_image_urls: ["/images/myeongdong-food.jpg"],
            recommendation_score: 9.1,
            tags: ["현지맛집", "저렴", "전통"],
            bookmarked_at: "2024-03-08T09:15:00Z",
            visited: false,
          },
        ];

        const mockFolders: BookmarkFolder[] = [
          {
            id: "all",
            name: "전체",
            color: "#6B7280",
            placeIds: ["1", "2", "3"],
            created_at: "2024-03-01T00:00:00Z",
          },
          {
            id: "busan-trip",
            name: "부산 여행",
            description: "부산 여행 계획",
            color: "#3B82F6",
            placeIds: ["1"],
            created_at: "2024-03-10T00:00:00Z",
          },
          {
            id: "seoul-cafes",
            name: "서울 카페",
            description: "서울 가볼만한 카페들",
            color: "#10B981",
            placeIds: ["2"],
            created_at: "2024-03-12T00:00:00Z",
          },
        ];

        setBookmarkedPlaces(mockBookmarkedPlaces);
        setFolders(mockFolders);
        setSelectedFolder("all");
      } catch (error) {
        console.error("북마크 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [locale]);

  // 카테고리 한글명 (기존 SearchResultItem 컴포넌트에서 재사용)
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      restaurants: "맛집",
      cafes: "카페",
      attractions: "관광지",
      hotels: "숙박",
      shopping: "쇼핑",
      nightlife: "유흥",
      culture: "문화",
      nature: "자연",
      sports: "스포츠",
    };
    return categoryMap[category] || category;
  };

  // 필터링 및 정렬
  const getFilteredAndSortedPlaces = () => {
    let filtered = bookmarkedPlaces;

    // 폴더 필터링
    if (selectedFolder && selectedFolder !== "all") {
      const folder = folders.find((f) => f.id === selectedFolder);
      if (folder) {
        filtered = filtered.filter((place) =>
          folder.placeIds.includes(place.id)
        );
      }
    }

    // 검색 필터링
    if (searchQuery) {
      filtered = filtered.filter(
        (place) =>
          getLocalizedText(place.name)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          getLocalizedText(place.address)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          place.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return getLocalizedText(a.name).localeCompare(
            getLocalizedText(b.name)
          );
        case "rating":
          return b.rating_avg - a.rating_avg;
        case "recent":
        default:
          return (
            new Date(b.bookmarked_at).getTime() -
            new Date(a.bookmarked_at).getTime()
          );
      }
    });

    return filtered;
  };

  const filteredPlaces = getFilteredAndSortedPlaces();

  // 북마크 삭제
  const removeBookmark = (placeId: string) => {
    setBookmarkedPlaces((prev) => prev.filter((place) => place.id !== placeId));
    // 실제로는 API 호출
  };

  // 폴더 생성
  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: BookmarkFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      color: newFolderColor,
      placeIds: [],
      created_at: new Date().toISOString(),
    };

    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setNewFolderColor("#3B82F6");
    setIsCreateFolderModalOpen(false);
  };

  // 방문 상태 토글
  const toggleVisited = (placeId: string) => {
    setBookmarkedPlaces((prev) =>
      prev.map((place) =>
        place.id === placeId ? { ...place, visited: !place.visited } : place
      )
    );
  };

  return (
    //TODO
    // <ProtectedRoute>
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                내 북마크
              </h1>
              <p className="text-gray-600">
                저장한 장소들을 관리하고 여행 계획을 세워보세요
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateFolderModalOpen(true)}
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
                폴더 만들기
              </Button>
              <Button variant="gradient" asChild>
                <Link href="/search">새 장소 찾기</Link>
              </Button>
            </div>
          </div>

          {/* 필터 및 검색 */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            {/* 검색바 */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="북마크한 장소 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg
                    className="w-5 h-5"
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
                }
              />
            </div>

            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="recent">최근 순</option>
              <option value="name">이름 순</option>
              <option value="rating">평점 순</option>
            </select>

            {/* 뷰 모드 */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 사이드바 - 폴더 목록 */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">폴더</h3>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      selectedFolder === folder.id
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: folder.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{folder.name}</div>
                      {folder.description && (
                        <div className="text-xs text-gray-500">
                          {folder.description}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {folder.placeIds.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {isLoading ? (
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
            ) : filteredPlaces.length > 0 ? (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                )}
              >
                {filteredPlaces.map((place) => (
                  <Card
                    key={place.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {viewMode === "grid" ? (
                      // 그리드 뷰 (홈페이지 카드 스타일 재사용)
                      <>
                        <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
                          {/* 방문 배지 */}
                          {place.visited && (
                            <div className="absolute top-3 left-3 z-10">
                              <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                방문완료
                              </span>
                            </div>
                          )}

                          {/* 액션 버튼들 */}
                          <div className="absolute top-3 right-3 z-10 flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleVisited(place.id)}
                              className="w-8 h-8 bg-white/90 hover:bg-white"
                              title={
                                place.visited
                                  ? "미방문으로 변경"
                                  : "방문완료로 변경"
                              }
                            >
                              <svg
                                className={cn(
                                  "w-4 h-4",
                                  place.visited
                                    ? "text-green-600"
                                    : "text-gray-600"
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
                              onClick={() => removeBookmark(place.id)}
                              className="w-8 h-8 bg-white/90 hover:bg-white text-red-600"
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
                                <span className="font-medium">
                                  {place.rating_avg}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                              {getLocalizedText(place.address)}
                            </p>
                          </Link>

                          {place.notes && (
                            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                              <span className="text-yellow-800">
                                💡 {place.notes}
                              </span>
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
                              "ko-KR"
                            )}{" "}
                            저장
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
                                onClick={() => toggleVisited(place.id)}
                                className={cn(
                                  "h-8 w-8",
                                  place.visited
                                    ? "text-green-600"
                                    : "text-gray-400"
                                )}
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
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBookmark(place.id)}
                                className="h-8 w-8 text-red-600"
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
                ))}
              </div>
            ) : (
              // 북마크 없음
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
                  {searchQuery
                    ? "검색 결과가 없습니다"
                    : "아직 북마크한 장소가 없어요"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? "다른 키워드로 검색해보세요"
                    : "마음에 드는 장소를 북마크에 저장해보세요"}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      전체 북마크 보기
                    </Button>
                  ) : (
                    <>
                      <Button variant="gradient" asChild>
                        <Link href="/search">장소 찾아보기</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/categories">카테고리별 둘러보기</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 폴더 생성 모달 */}
      <Modal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        title="새 폴더 만들기"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              폴더 이름
            </label>
            <Input
              type="text"
              placeholder="예: 서울 여행, 부산 맛집..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              폴더 색상
            </label>
            <div className="flex gap-2">
              {[
                "#3B82F6",
                "#10B981",
                "#F59E0B",
                "#EF4444",
                "#8B5CF6",
                "#06B6D4",
                "#84CC16",
                "#F97316",
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewFolderColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    newFolderColor === color
                      ? "border-gray-400 scale-110"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateFolderModalOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={createFolder}
              disabled={!newFolderName.trim()}
              className="flex-1"
            >
              만들기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    // </ProtectedRoute>
  );
}
