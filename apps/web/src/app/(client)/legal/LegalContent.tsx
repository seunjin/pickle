"use client";

import type {
  LegalDocument,
  LegalDocumentType,
} from "@pickle/contracts/src/legal";
import { ScrollArea } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getActiveLegalDocument } from "@/features/legal/api/getActiveLegalDocument";

export function LegalContent() {
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get("tab") || "service") as LegalDocumentType;
  const router = useRouter();

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      setIsLoading(true);
      try {
        const data = await getActiveLegalDocument(tabParam);
        setDocument(data);
      } catch (error) {
        const { logger } = await import("@/shared/lib/logger");
        logger.error("[LegalContent] Fetch failed:", { error });
        setDocument(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoc();
  }, [tabParam]);

  const tabs: { label: string; value: LegalDocumentType }[] = [
    { label: "이용약관", value: "service" },
    { label: "개인정보처리방침", value: "privacy" },
    { label: "마케팅 수신동의", value: "marketing" },
  ];

  return (
    <div className="mx-auto grid h-full w-[min(100%,800px)] grid-rows-[auto_1fr_auto]">
      <div>
        {/* 탭 */}
        <div className="flex items-center gap-6 pb-12.5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => router.push(`/legal?tab=${tab.value}`)}
              className={cn(
                "font-medium text-[20px] text-muted-foreground transition-colors",
                tabParam === tab.value
                  ? "text-base-primary"
                  : "hover:text-neutral-400",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 약관 내용 */}
      <ScrollArea className="h-full overflow-auto">
        <div className="overflow-y-auto pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-neutral-500">
              내용을 불러오는 중...
            </div>
          ) : document ? (
            <div className="prose prose-invert max-w-none text-neutral-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {document.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="py-20 text-center text-neutral-500">
              등록된 약관 내용이 없습니다.
            </div>
          )}
        </div>
      </ScrollArea>

      <footer className="pt-8 text-center text-neutral-500 text-xs">
        {document && (
          <p className="mb-2">
            최종 수정일: {new Date(document.updated_at).toLocaleDateString()}
          </p>
        )}
        © 2026 Pickle. All rights reserved.
      </footer>
    </div>
  );
}
