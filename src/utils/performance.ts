// src/utils/performance.ts - 성능 최적화 유틸리티
import React, {
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useState,
} from "react";

// 디바운스 훅
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// 스로틀 훅
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// 인터섹션 옵저버 훅 (무한 스크롤)
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(target);
    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
};

// 가상 스크롤링 훅 (개선된 버전)
export const useVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number = 600,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const handleScroll = useThrottle((e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, 16); // 60fps

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length
    );

    return {
      start: Math.max(0, visibleStart - overscan),
      end: Math.min(items.length, visibleEnd + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(
    () => items.slice(visibleRange.start, visibleRange.end),
    [items, visibleRange]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    visibleRange,
  };
};

// 이미지 로딩 최적화
export const useImagePreload = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadPromises = imageUrls.map((url) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    });

    Promise.allSettled(preloadPromises).then((results) => {
      const loaded = new Set<string>();
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          loaded.add(imageUrls[index]);
        }
      });
      setLoadedImages(loaded);
    });
  }, [imageUrls]);

  return loadedImages;
};

// 성능 측정 유틸리티
export const performanceMonitor = {
  mark: (name: string) => {
    if (typeof window !== "undefined" && window.performance) {
      window.performance.mark(name);
    }
  },

  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== "undefined" && window.performance) {
      window.performance.measure(name, startMark, endMark);
      const measures = window.performance.getEntriesByName(name, "measure");
      return measures[measures.length - 1]?.duration || 0;
    }
    return 0;
  },

  clearMarks: (name?: string) => {
    if (typeof window !== "undefined" && window.performance) {
      window.performance.clearMarks(name);
    }
  },

  clearMeasures: (name?: string) => {
    if (typeof window !== "undefined" && window.performance) {
      window.performance.clearMeasures(name);
    }
  },
};

// 컴포넌트 렌더링 성능 측정 HOC
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    useEffect(() => {
      performanceMonitor.mark(`${componentName}-start`);

      return () => {
        performanceMonitor.mark(`${componentName}-end`);
        const duration = performanceMonitor.measure(
          `${componentName}-render`,
          `${componentName}-start`,
          `${componentName}-end`
        );

        if (duration > 16) {
          // 60fps 기준
          console.warn(
            `${componentName} 렌더링이 느립니다: ${duration.toFixed(2)}ms`
          );
        }
      };
    });

    return React.createElement(WrappedComponent, props);
  });
};

// 메모리 사용량 모니터링
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ("memory" in performance) {
        setMemoryInfo((performance as any).memory);
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};
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
}

export const memoryCache = new MemoryCache();

// 캐시된 fetch 훅
export const useCachedFetch = <T>(
  url: string,
  options: RequestInit = {},
  ttl: number = 300000
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = `${url}:${JSON.stringify(options)}`;

    // 캐시 확인
    const cached = memoryCache.get<T>(cacheKey);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // 캐시 저장
      memoryCache.set(cacheKey, result, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [url, options, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
