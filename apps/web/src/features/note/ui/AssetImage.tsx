import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
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
 * Supabase Storage에서 Signed URL을 가져오는 함수
 * React Query로 캐싱되어 동일 path에 대해 재요청을 방지합니다.
 */
async function fetchSignedUrl(path: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("bitmaps")
    .createSignedUrl(path, 60 * 60); // 1 hour validity

  if (error) {
    throw new Error(`Failed to sign URL: ${error.message}`);
  }

  return data.signedUrl;
}

export const AssetImage = ({
  path,
  alt,
  className,
  blurDataUrl,
}: AssetImageProps) => {
  // 이미 로드된 이미지면 즉시 표시 (블러 스킵)
  const [isLoaded, setIsLoaded] = useState(() => loadedImages.has(path));

  // React Query로 Signed URL 캐싱 (같은 path면 재요청 X)
  const { data: signedUrl, isError } = useQuery({
    queryKey: ["signedUrl", path],
    queryFn: () => fetchSignedUrl(path),
    staleTime: 1000 * 60 * 50, // 50분간 fresh (Signed URL은 1시간 유효)
    gcTime: 1000 * 60 * 60, // 1시간 캐시 유지
    enabled: !!path,
  });

  if (isError) {
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
      {/* 블러 플레이스홀더 (실제 이미지 로드 시 fade out) */}
      {blurDataUrl && (
        <Image
          src={blurDataUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-1000 ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
          unoptimized
        />
      )}

      {/* 스켈레톤 (블러 데이터 없을 때만) */}
      {!blurDataUrl && !isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {/* 실제 이미지 */}
      {signedUrl && (
        <Image
          src={signedUrl}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-1000 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          unoptimized={
            signedUrl?.includes("127.0.0.1") ||
            signedUrl?.includes("localhost") ||
            signedUrl?.includes("supabase.co")
          }
          onLoad={() => {
            loadedImages.add(path);
            setIsLoaded(true);
          }}
        />
      )}
    </div>
  );
};
