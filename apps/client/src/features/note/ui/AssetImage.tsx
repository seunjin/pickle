import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase";

interface AssetImageProps {
  path: string;
  alt: string;
  className?: string;
  objectFit?: "cover" | "contain" | "none" | "scale-down";
  blurDataUrl?: string | null;
}

/**
 * 전역 이미지 로드 캐시
 * 이미 로드된 path를 추적하여 재마운트 시 블러 없이 즉시 표시합니다.
 */
const loadedImages = new Set<string>();

/**
 * Supabase Storage Public URL을 생성합니다.
 */
function getPublicImageUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from("bitmaps").getPublicUrl(path);
  return data.publicUrl;
}

export const AssetImage = ({
  path,
  alt,
  className,
  objectFit = "cover",
  blurDataUrl,
}: AssetImageProps) => {
  // 이미 로드된 이미지면 즉시 표시
  const isCached = loadedImages.has(path);
  const [isLoaded, setIsLoaded] = useState(isCached);
  // 플레이스홀더 표시를 100ms 지연
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  useEffect(() => {
    if (isCached || isLoaded) return;
    const timer = setTimeout(() => setShowPlaceholder(true), 100);
    return () => clearTimeout(timer);
  }, [isCached, isLoaded]);

  const publicUrl = path ? getPublicImageUrl(path) : null;

  const objectFitClass = {
    contain: "object-contain",
    cover: "object-cover",
    none: "object-none",
    "scale-down": "object-scale-down",
  };

  if (!publicUrl) {
    return (
      <div className="flex h-full w-full select-none items-center justify-center bg-base-muted text-center font-semibold text-base text-neutral-600">
        Failed to load image
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className || ""} transition-transform duration-300 ease-in-out group-hover/note-card:scale-105`}
    >
      {/* 블러 플레이스홀더 (표준 img 사용) */}
      {blurDataUrl && showPlaceholder && !isLoaded && (
        <img
          src={blurDataUrl}
          alt=""
          className={`absolute inset-0 h-full w-full ${objectFitClass[objectFit]}`}
        />
      )}

      {/* 스켈레톤 */}
      {!blurDataUrl && showPlaceholder && !isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {/* 실제 이미지 */}
      <img
        src={publicUrl}
        alt={alt}
        loading="lazy"
        className={`absolute inset-0 h-full w-full ${objectFitClass[objectFit]} ${!isCached && showPlaceholder ? "transition-opacity duration-500" : ""} ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          loadedImages.add(path);
          setIsLoaded(true);
        }}
        onError={() => {
          setIsLoaded(true);
        }}
      />
    </div>
  );
};
