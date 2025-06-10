// src/hooks/useBookmarksData.ts
import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

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

interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  placeIds: string[];
  created_at: string;
}

export function useBookmarksData(
  locale: string,
  selectedFolder: string,
  searchQuery: string,
  sortBy: "recent" | "name" | "rating"
) {
  const bookmarksT = useTranslations("Bookmarks");
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<BookmarkedPlace[]>(
    []
  );
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            name: bookmarksT("allCategories") || "전체",
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
      } catch (error) {
        console.error("북마크 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [locale, bookmarksT]);

  // 필터링 및 정렬된 장소들
  const filteredPlaces = useMemo(() => {
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
  }, [
    bookmarkedPlaces,
    folders,
    selectedFolder,
    searchQuery,
    sortBy,
    getLocalizedText,
  ]);

  // 북마크 삭제
  const removeBookmark = (placeId: string) => {
    setBookmarkedPlaces((prev) => prev.filter((place) => place.id !== placeId));
    // 실제로는 API 호출
  };

  // 방문 상태 토글
  const toggleVisited = (placeId: string) => {
    setBookmarkedPlaces((prev) =>
      prev.map((place) =>
        place.id === placeId ? { ...place, visited: !place.visited } : place
      )
    );
  };

  // 폴더 생성
  const createFolder = (name: string, color: string) => {
    const newFolder: BookmarkFolder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      placeIds: [],
      created_at: new Date().toISOString(),
    };

    setFolders((prev) => [...prev, newFolder]);
  };

  return {
    bookmarkedPlaces,
    folders,
    isLoading,
    filteredPlaces,
    removeBookmark,
    toggleVisited,
    createFolder,
  };
}
