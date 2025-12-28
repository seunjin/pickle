import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";

interface AssetImageProps {
  path: string;
  alt: string;
  className?: string;
}

export const AssetImage = ({ path, alt, className }: AssetImageProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSignedUrl = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("bitmaps")
        .createSignedUrl(path, 60 * 60); // 1 hour validity

      if (error) {
        console.error("Failed to sign URL:", error);
        if (isMounted) setError(true);
        return;
      }

      if (isMounted) setSignedUrl(data.signedUrl);
    };

    if (path) {
      fetchSignedUrl();
    }

    return () => {
      isMounted = false;
    };
  }, [path]);

  if (error) {
    return (
      <div className="flex h-[140px] w-full select-none items-center justify-center bg-base-muted text-center font-semibold text-base text-neutral-600">
        Failed to load image
      </div>
    );
  }

  if (!signedUrl) {
    return (
      <div className="h-[140px] w-full animate-pulse rounded bg-gray-200" />
    );
  }

  return (
    <div className={`relative h-[140px] w-full overflow-hidden ${className}`}>
      {/* Next/Image usage with external URL requires domain config. 
            For Supabase standard setup, the domain is often known.
            If not configured in next.config.mjs, it will crash.
            Safe fallback: normal img tag. */}
      <Image
        src={signedUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        // 127.0.0.1 is blocked by Next.js Image Optimization for security (SSRF prevention).
        // We disable optimization for local development URLs.
        unoptimized={
          signedUrl?.includes("127.0.0.1") || signedUrl?.includes("localhost")
        }
      />
    </div>
  );
};
