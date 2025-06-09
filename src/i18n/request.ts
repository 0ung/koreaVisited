// i18n/request.ts - 중첩 구조 변환 추가
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { set } from "lodash";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = await fetchTranslations(locale);
  return {
    locale: locale,
    messages: messages,
  };
});

async function fetchTranslations(locale: string) {
  try {
    const isServer = typeof window === "undefined";
    const baseUrl = isServer
      ? process.env.SPRING_API_INTERNAL_URL || "http://localhost:8080/api"
      : process.env.NEXT_PUBLIC_SPRING_API_URL;

    const response = await fetch(`${baseUrl}/locale/${locale}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    console.log("✅ 번역 데이터 로드:", Object.keys(data));

    // 플랫 구조를 중첩 구조로 변환
    const nestedData = convertFlatToNested(data);
    console.log("🔄 중첩 구조 변환 완료");

    return nestedData;
  } catch (error) {
    console.error("❌ 번역 로드 실패:", error);
    return await loadFallback(locale);
  }
}

// 플랫 구조를 중첩 구조로 변환하는 함수
function convertFlatToNested(data: any): any {
  const result: any = {};

  Object.entries(data).forEach(([namespace, translations]: [string, any]) => {
    if (typeof translations === "object" && translations !== null) {
      // 각 네임스페이스 내의 키들을 중첩 구조로 변환
      const nestedTranslations = Object.entries(translations).reduce(
        (acc, [key, value]) => set(acc, key, value),
        {}
      );
      result[namespace] = nestedTranslations;
    } else {
      result[namespace] = translations;
    }
  });

  return result;
}

async function loadFallback(locale: string) {
  try {
    const fallback = (await import(`../../messages/${locale}.json`)).default;
    console.log("📁 로컬 JSON 폴백 사용");
    return fallback;
  } catch {
    console.log("🆘 최소 메시지 사용");
    return {
      Common: {
        loading: "로딩 중...",
        error: "오류가 발생했습니다",
        search: "검색",
        searchPlaceholder: "검색어를 입력하세요",
      },
      Header: {
        home: "홈",
        search: "검색",
        bookmarks: "북마크",
        login: "로그인",
      },
      Home: {
        heroTitle: "한국의 숨은 보석을 발견하세요",
        heroSubtitle: "진짜 현지인들이 추천하는 특별한 장소들",
        searchButton: "장소 찾기",
        popularCategories: "인기 카테고리",
        featuredPlaces: "추천 장소",
        // 중첩 구조로 변경
        categories: {
          restaurants: "맛집",
          cafes: "카페",
          attractions: "관광지",
          culture: "문화",
          shopping: "쇼핑",
          nature: "자연",
          nightlife: "나이트라이프",
          accommodation: "숙박",
        },
      },
      Bookmarks: {
        myBookmarks: "내 북마크",
        noBookmarks: "저장된 장소가 없습니다",
        exploreButton: "장소 찾아보기",
      },
      Footer: {
        about: "소개",
        contact: "연락처",
        terms: "이용약관",
      },
    };
  }
}
