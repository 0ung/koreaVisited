// utils/image.ts
export const getOptimizedImageUrl = (
  originalUrl: string,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  if (!originalUrl) return "";

  // Next.js Image Optimization API 사용
  if (originalUrl.startsWith("/")) {
    const params = new URLSearchParams();

    if (width) params.set("w", width.toString());
    if (height) params.set("h", height.toString());
    params.set("q", quality.toString());

    return `/_next/image?url=${encodeURIComponent(
      originalUrl
    )}&${params.toString()}`;
  }

  return originalUrl;
};

export const generateImageSrcSet = (
  originalUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280]
): string => {
  return sizes
    .map((size) => `${getOptimizedImageUrl(originalUrl, size)} ${size}w`)
    .join(", ");
};
