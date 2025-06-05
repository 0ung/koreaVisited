// utils/storage.ts (수정된 버전)
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  // 오버로드: defaultValue가 없는 경우 null을 반환할 수 있음
  getNullable: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },

  // 키 존재 여부 확인
  has: (key: string): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(key) !== null;
  },

  // 모든 키 목록 반환
  getAllKeys: (): string[] => {
    if (typeof window === "undefined") return [];
    return Object.keys(localStorage);
  },

  // 특정 접두사를 가진 모든 키-값 쌍 반환
  getByPrefix: (prefix: string): Record<string, any> => {
    if (typeof window === "undefined") return {};

    const result: Record<string, any> = {};
    const keys = storage.getAllKeys();

    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            result[key] = JSON.parse(item);
          }
        } catch {
          // 파싱 실패한 항목은 무시
        }
      }
    });

    return result;
  },

  // 특정 접두사를 가진 모든 키 삭제
  clearByPrefix: (prefix: string): void => {
    if (typeof window === "undefined") return;

    const keys = storage.getAllKeys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  },
};

export const sessionStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  getNullable: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to save to sessionStorage:", error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(key);
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    window.sessionStorage.clear();
  },

  has: (key: string): boolean => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(key) !== null;
  },
};
