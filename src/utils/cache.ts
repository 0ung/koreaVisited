// src/utils/cache.ts - 클라이언트 사이드 캐싱 시스템
import { useState, useEffect, useCallback } from "react";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100;

  set<T>(key: string, data: T, ttl: number = 300000): void {
    // 5분 기본 TTL
    // 캐시 크기 관리
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 만료된 아이템 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // 캐시 통계
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const memoryCache = new MemoryCache();

// 주기적으로 캐시 정리
if (typeof window !== "undefined") {
  setInterval(() => {
    memoryCache.cleanup();
  }, 60000); // 1분마다 정리
}
// 캐시된 fetch 훅 (개선된 버전)
export const useCachedFetch = <T>(
  url: string,
  options: RequestInit = {},
  ttl: number = 300000
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false); // 재시도 방지

  const fetchData = useCallback(
    async (forceFetch = false) => {
      const cacheKey = `${url}:${JSON.stringify(options)}`;

      // 이미 시도했고 오류가 있다면 재시도하지 않음
      if (!forceFetch && hasAttempted && error) {
        return;
      }

      // 강제 새로고침이 아닌 경우 캐시 확인
      if (!forceFetch) {
        const cached = memoryCache.get<T>(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }
      }

      // 이미 로딩 중이면 중복 요청 방지
      if (loading) return;

      setLoading(true);
      setError(null);
      setHasAttempted(true);

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          // 404나 다른 HTTP 오류 시 더 이상 재시도하지 않음
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // 캐시 저장
        memoryCache.set(cacheKey, result, ttl);
        setData(result);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err : new Error("Unknown error");
        setError(errorMessage);

        // 오류를 캐시에도 저장하여 재시도 방지 (짧은 TTL)
        memoryCache.set(cacheKey + ":error", true, 30000); // 30초

        console.warn(`API fetch failed: ${url}`, errorMessage.message);
      } finally {
        setLoading(false);
      }
    },
    [url, options, ttl, hasAttempted, error, loading]
  );

  // 오류 캐시 확인
  const checkErrorCache = useCallback(() => {
    const cacheKey = `${url}:${JSON.stringify(options)}:error`;
    return memoryCache.has(cacheKey);
  }, [url, options]);

  useEffect(() => {
    // 오류가 캐시되어 있으면 fetch하지 않음
    if (checkErrorCache()) {
      setError(new Error("API temporarily unavailable"));
      setLoading(false);
      return;
    }

    fetchData();
  }, [fetchData, checkErrorCache]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    hasError: !!error,
  };
};
// 로컬 스토리지 캐시 (브라우저 저장소 활용)
class LocalStorageCache {
  private prefix = "app_cache_";

  set<T>(key: string, data: T, ttl: number = 86400000): void {
    // 1일 기본 TTL
    try {
      const item = {
        data,
        expiry: Date.now() + ttl,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn("LocalStorage cache set failed:", error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.prefix + key);
      if (!stored) return null;

      const item = JSON.parse(stored);

      if (Date.now() > item.expiry) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn("LocalStorage cache get failed:", error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn("LocalStorage cache delete failed:", error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.prefix)
      );
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("LocalStorage cache clear failed:", error);
    }
  }

  cleanup(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.prefix)
      );

      keys.forEach((key) => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const item = JSON.parse(stored);
            if (Date.now() > item.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // 잘못된 데이터는 삭제
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("LocalStorage cache cleanup failed:", error);
    }
  }
}

export const localStorageCache = new LocalStorageCache();

// 페이지 로드 시 로컬 스토리지 캐시 정리
if (typeof window !== "undefined") {
  localStorageCache.cleanup();
}

// 하이브리드 캐시 (메모리 + 로컬스토리지)
export class HybridCache {
  set<T>(
    key: string,
    data: T,
    memoryTtl: number = 300000,
    storageTtl: number = 86400000
  ): void {
    memoryCache.set(key, data, memoryTtl);
    localStorageCache.set(key, data, storageTtl);
  }

  get<T>(key: string): T | null {
    // 먼저 메모리 캐시 확인 (빠름)
    const memoryData = memoryCache.get<T>(key);
    if (memoryData) return memoryData;

    // 메모리에 없으면 로컬 스토리지 확인
    const storageData = localStorageCache.get<T>(key);
    if (storageData) {
      // 로컬 스토리지에서 찾은 데이터를 메모리에도 저장
      memoryCache.set(key, storageData, 300000); // 5분
      return storageData;
    }

    return null;
  }

  delete(key: string): void {
    memoryCache.delete(key);
    localStorageCache.delete(key);
  }

  clear(): void {
    memoryCache.clear();
    localStorageCache.clear();
  }
}

export const hybridCache = new HybridCache();

// 캐시 상태를 관리하는 훅
export const useCacheStatus = () => {
  const [cacheStats, setCacheStats] = useState({
    memorySize: 0,
    localStorageUsed: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const memoryStats = memoryCache.getStats();

      let localStorageUsed = 0;
      try {
        const keys = Object.keys(localStorage).filter((key) =>
          key.startsWith("app_cache_")
        );
        localStorageUsed = keys.length;
      } catch {
        // 로컬스토리지 접근 실패
      }

      setCacheStats({
        memorySize: memoryStats.size,
        localStorageUsed,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  return cacheStats;
};
