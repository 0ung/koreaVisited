// components/ImageGallery.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  showThumbnails?: boolean;
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export default function ImageGallery({
  images,
  alt,
  className,
  showThumbnails = true,
  autoSlide = false,
  autoSlideInterval = 5000,
}: ImageGalleryProps) {
  const t = useTranslations("ImageGallery");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoSlide);

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length, autoSlideInterval]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          setIsModalOpen(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "bg-gray-200 rounded-lg flex items-center justify-center",
          className
        )}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">{t("noImages")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 메인 갤러리 */}
      <div className={cn("relative group", className)}>
        {/* 메인 이미지 */}
        <div
          className="relative overflow-hidden rounded-lg cursor-pointer bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"
          onClick={() => setIsModalOpen(true)}
        >
          {/* 이미지 placeholder */}
          <div className="w-full h-full flex items-center justify-center text-white text-6xl">
            📸
          </div>

          {/* 오버레이 */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20"
            >
              <svg
                className="w-6 h-6 mr-2"
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
              {t("viewLarge")}
            </Button>
          </div>

          {/* 이미지 카운터 */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* 자동재생 컨트롤 */}
          {autoSlide && images.length > 1 && (
            <div className="absolute top-4 left-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAutoPlaying(!isAutoPlaying);
                }}
                className="bg-black/60 text-white hover:bg-black/80"
                aria-label={
                  isAutoPlaying ? t("pauseSlideshow") : t("playSlideshow")
                }
              >
                {isAutoPlaying ? (
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
                      d="M10 9v6m4-6v6"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* 네비게이션 버튼 */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={t("previousImage")}
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={t("nextImage")}
            >
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </>
        )}

        {/* 도트 인디케이터 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/60 hover:bg-white/80"
                )}
                aria-label={t("goToImage", { number: index + 1 })}
              />
            ))}
          </div>
        )}
      </div>

      {/* 썸네일 그리드 */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 transition-all duration-200",
                index === currentIndex
                  ? "ring-2 ring-blue-500 scale-105"
                  : "hover:scale-105 opacity-80 hover:opacity-100"
              )}
              aria-label={t("goToImage", { number: index + 1 })}
            >
              {/* 썸네일 placeholder */}
              <div className="w-full h-full flex items-center justify-center text-white text-xl">
                📷
              </div>

              {/* 더보기 오버레이 (4번째 이미지에 남은 개수 표시) */}
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-medium">
                    +{images.length - 4}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 풀스크린 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="full"
        showCloseButton={false}
        className="bg-black/95"
      >
        <div className="relative h-full flex items-center justify-center">
          {/* 메인 이미지 */}
          <div className="relative max-w-5xl max-h-full">
            <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center min-h-[60vh]">
              <span className="text-white text-8xl">🖼️</span>
            </div>
          </div>

          {/* 모달 컨트롤 */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalOpen(false)}
              className="bg-black/60 text-white hover:bg-black/80"
              aria-label={t("closeModal")}
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          {/* 이미지 정보 */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/60 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{alt}</h3>
                <span className="text-sm opacity-80">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>

              {/* 썸네일 네비게이션 */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white transition-all",
                        index === currentIndex
                          ? "ring-2 ring-white"
                          : "opacity-60 hover:opacity-80"
                      )}
                      aria-label={t("goToImage", { number: index + 1 })}
                    >
                      📷
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 네비게이션 버튼 */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80 w-12 h-12"
                aria-label={t("previousImage")}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80 w-12 h-12"
                aria-label={t("nextImage")}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
