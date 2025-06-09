import { useState, useEffect, useCallback, useMemo } from "react";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100;

  set<T>(key: string, data: T, ttl: number = 300000): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
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

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) this.cache.delete(key);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const memoryCache = new MemoryCache();

if (typeof window !== "undefined") {
  setInterval(() => memoryCache.cleanup(), 60000);
}

// 재시도하지 않을 HTTP 상태 코드들
const NON_RETRYABLE_STATUS = [400, 401, 403, 404, 405, 410, 422];

export const useCachedFetch = <T>(
  url: string,
  options?: RequestInit,
  ttl: number = 300000
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isFinalError, setIsFinalError] = useState(false); // 최종 에러 상태

  // 안정적인 문자열 키 생성
  const optionsString = useMemo(() => JSON.stringify(options ?? {}), [options]);
  const cacheKey = useMemo(
    () => `${url}:${optionsString}`,
    [url, optionsString]
  );
  const errorKey = `${cacheKey}:error`;
  const finalErrorKey = `${cacheKey}:final_error`;

  const fetchData = useCallback(
    async (forceFetch = false) => {
      // 최종 에러 상태이고 강제 새로고침이 아니면 요청하지 않음
      if (!forceFetch && (isFinalError || memoryCache.has(finalErrorKey))) {
        return;
      }

      // 이미 시도했고 에러가 있다면 재시도하지 않음 (강제 새로고침 제외)
      if (!forceFetch && hasAttempted && error) {
        return;
      }

      // 강제 새로고침이 아닌 경우 캐시 확인
      if (!forceFetch) {
        const cached = memoryCache.get<T>(cacheKey);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          setError(null);
          setIsFinalError(false);
          return;
        }
      }

      // 이미 로딩 중이면 중복 요청 방지
      if (loading) return;

      setLoading(true);
      setError(null);
      setHasAttempted(true);
      setIsFinalError(false);

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const isNonRetryable = NON_RETRYABLE_STATUS.includes(response.status);
          const errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          // 404나 기타 재시도하지 않을 에러는 최종 에러로 처리
          if (isNonRetryable) {
            const finalError = new Error(errorMessage);
            setError(finalError);
            setIsFinalError(true);

            // 최종 에러를 장기간 캐시 (1시간)
            memoryCache.set(finalErrorKey, true, 3600000);
            console.warn(`Non-retryable API error: ${url}`, errorMessage);
            return;
          } else {
            // 5xx 에러 등은 임시 에러로 처리 (재시도 가능)
            throw new Error(errorMessage);
          }
        }

        const result = await response.json();

        // 성공적으로 데이터를 받으면 에러 캐시 정리
        memoryCache.delete(errorKey);
        memoryCache.delete(finalErrorKey);

        memoryCache.set(cacheKey, result, ttl);
        setData(result);
        setError(null);
        setIsFinalError(false);
      } catch (err) {
        const errorInstance =
          err instanceof Error ? err : new Error("Unknown error");
        setError(errorInstance);

        // 네트워크 에러나 5xx 에러는 임시 에러로 처리 (30초 후 재시도 가능)
        memoryCache.set(errorKey, true, 30000);
        console.warn(`API fetch failed: ${url}`, errorInstance.message);
      } finally {
        setLoading(false);
      }
    },
    [url, optionsString, ttl] // 의존성 배열 축소 - 상태값들 제거
  );

  // useEffect를 분리하여 초기 로드만 처리
  useEffect(() => {
    let isMounted = true;

    const initializeFetch = async () => {
      // 최종 에러가 캐시되어 있으면 에러 상태로 설정하고 요청하지 않음
      if (memoryCache.has(finalErrorKey)) {
        if (isMounted) {
          setError(new Error("Resource not found"));
          setIsFinalError(true);
          setLoading(false);
        }
        return;
      }

      // 임시 에러가 캐시되어 있으면 잠시 대기
      if (memoryCache.has(errorKey)) {
        if (isMounted) {
          setError(new Error("API temporarily unavailable"));
          setLoading(false);
        }
        return;
      }

      // 초기에만 자동으로 fetch 실행
      await fetchData();
    };

    initializeFetch();

    return () => {
      isMounted = false;
    };
  }, [url, optionsString]); // url과 optionsString이 변경될 때만 실행

  // 강제 새로고침 함수 (최종 에러 상태도 재시도)
  const forceRefetch = useCallback(() => {
    memoryCache.delete(errorKey);
    memoryCache.delete(finalErrorKey);
    setIsFinalError(false);
    setError(null);
    setHasAttempted(false);
    fetchData(true);
  }, [errorKey, finalErrorKey, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    forceRefetch, // 새로운 함수: 모든 에러 상태 초기화 후 재시도
    hasError: !!error,
    isFinalError, // 404 등의 최종 에러 여부
    isTemporaryError: !!error && !isFinalError, // 임시 에러 여부
  };
};

// 기존 LocalStorageCache와 HybridCache는 동일
class LocalStorageCache {
  private prefix = "app_cache_";

  set<T>(key: string, data: T, ttl: number = 86400000): void {
    try {
      localStorage.setItem(
        this.prefix + key,
        JSON.stringify({ data, expiry: Date.now() + ttl })
      );
    } catch {}
  }

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.prefix + key);
      if (!stored) return null;
      const { data, expiry } = JSON.parse(stored);
      if (Date.now() > expiry) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => localStorage.removeItem(k));
  }

  cleanup(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => {
        try {
          const { expiry } = JSON.parse(localStorage.getItem(k) ?? "{}");
          if (Date.now() > expiry) localStorage.removeItem(k);
        } catch {
          localStorage.removeItem(k);
        }
      });
  }
}

export const localStorageCache = new LocalStorageCache();

if (typeof window !== "undefined") localStorageCache.cleanup();

export class HybridCache {
  set<T>(key: string, data: T, memoryTtl = 300000, storageTtl = 86400000) {
    memoryCache.set(key, data, memoryTtl);
    localStorageCache.set(key, data, storageTtl);
  }

  get<T>(key: string): T | null {
    const mem = memoryCache.get<T>(key);
    if (mem !== null) return mem;
    const stor = localStorageCache.get<T>(key);
    if (stor !== null) {
      memoryCache.set(key, stor, 300000);
      return stor;
    }
    return null;
  }

  delete(key: string) {
    memoryCache.delete(key);
    localStorageCache.delete(key);
  }

  clear() {
    memoryCache.clear();
    localStorageCache.clear();
  }
}

export const hybridCache = new HybridCache();

export const useCacheStatus = () => {
  const [stats, setStats] = useState({ memorySize: 0, localStorageUsed: 0 });

  useEffect(() => {
    const update = () => {
      const m = memoryCache.getStats();
      const lsKeys = Object.keys(localStorage).filter((k) =>
        k.startsWith("app_cache_")
      );
      setStats({ memorySize: m.size, localStorageUsed: lsKeys.length });
    };
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, []);

  return stats;
};
