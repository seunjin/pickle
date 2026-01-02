import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";

interface AssetImageProps {
  path: string;
  alt: string;
  className?: string;
  blurDataUrl?: string | null;
}

/**
 * 전역 이미지 로드 캐시
 * 이미 로드된 path를 추적하여 재마운트 시 블러 없이 즉시 표시합니다.
 */
const loadedImages = new Set<string>();

/**
 * Supabase Storage Public URL을 생성합니다.
 * Public 버킷이므로 Signed URL이 필요 없어 브라우저 캐싱이 완벽하게 동작합니다.
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
  blurDataUrl,
}: AssetImageProps) => {
  // 이미 로드된 이미지면 즉시 표시 (블러 스킵, 애니메이션 스킵)
  const isCached = loadedImages.has(path);
  const [isLoaded, setIsLoaded] = useState(isCached);
  // 플레이스홀더 표시를 100ms 지연 (빠른 캐시 로드 시 깜빡임 방지)
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  useEffect(() => {
    if (isCached || isLoaded) return;
    const timer = setTimeout(() => setShowPlaceholder(true), 100);
    return () => clearTimeout(timer);
  }, [isCached, isLoaded]);

  // Public URL은 고정이므로 React Query 캐싱 불필요 (브라우저가 캐싱)
  const publicUrl = path ? getPublicImageUrl(path) : null;

  if (!publicUrl) {
    return (
      <div className="flex h-full w-full select-none items-center justify-center bg-base-muted text-center font-semibold text-base text-neutral-600">
        Failed to load image
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className || ""}`}
    >
      {/* 블러 플레이스홀더 (100ms 후에만 표시) */}
      {blurDataUrl && showPlaceholder && !isLoaded && (
        <Image
          src={blurDataUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          unoptimized
        />
      )}

      {/* 스켈레톤 (블러 없고 100ms 후에도 로드 안 됨) */}
      {!blurDataUrl && showPlaceholder && !isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {/* 실제 이미지 */}
      <Image
        src={publicUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover ${!isCached && showPlaceholder ? "transition-opacity duration-500" : ""} ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        unoptimized={
          publicUrl?.includes("127.0.0.1") ||
          publicUrl?.includes("localhost") ||
          publicUrl?.includes("supabase.co")
        }
        onLoad={() => {
          loadedImages.add(path);
          setIsLoaded(true);
        }}
        onError={() => {
          // 에러 시에도 로드 완료 처리 (스켈레톤 제거)
          setIsLoaded(true);
        }}
      />
    </div>
  );
};
