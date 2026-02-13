import { ScrollArea } from "@pickle/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getLatestLegalDocument } from "../api/getLatestLegalDocument";

const LEGAL_TYPES = [
  { id: "service", label: "서비스 이용약관" },
  { id: "privacy", label: "개인정보 처리방침" },
  { id: "marketing", label: "마케팅 정보 수신 동의" },
] as const;

export function LegalContent() {
  const [activeTab, setActiveTab] =
    useState<(typeof LEGAL_TYPES)[number]["id"]>("service");

  return (
    <div className="mx-auto flex h-full max-w-[800px] flex-col px-6 py-10">
      <header className="mb-10 text-center">
        <h1 className="font-bold text-3xl text-base-foreground">
          피클 약관 및 정책
        </h1>
        <p className="mt-2 text-base-muted text-sm">
          Pickle 서비스의 약관 및 정책을 확인하실 수 있습니다.
        </p>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 커스텀 탭 리스트 */}
        <div className="mb-6 flex gap-1 rounded-xl border border-base-border bg-base-foreground-background p-1.5">
          {LEGAL_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setActiveTab(type.id)}
              className={`flex-1 rounded-lg py-2.5 font-semibold text-[14px] transition-all ${
                activeTab === type.id
                  ? "bg-base-primary/10 text-base-primary"
                  : "text-base-muted hover:bg-base-background-muted hover:text-base-foreground"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          <LegalItemView type={activeTab as any} />
        </div>
      </div>
    </div>
  );
}

function LegalItemView({
  type,
}: {
  type: "service" | "privacy" | "marketing";
}) {
  const { data: document, isLoading } = useQuery({
    queryKey: ["legal", "latest", type],
    queryFn: () => getLatestLegalDocument(type),
  });

  return (
    <ScrollArea className="h-full rounded-xl border border-base-border bg-base-foreground-background p-8">
      <div className="max-w-none">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-base-muted">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-base-primary border-t-transparent" />
              <span>내용을 불러오는 중...</span>
            </div>
          </div>
        ) : document ? (
          <>
            <div
              className="prose prose-invert max-w-none text-base-foreground"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: 관리자가 작성한 검증된 HTML 약관 렌더링
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
            <div className="mt-12 border-base-border border-t pt-8 text-center text-base-muted text-xs">
              <p>
                최종 수정일:{" "}
                {new Date(document.updated_at).toLocaleDateString()}
              </p>
              <p className="mt-1.5">© 2026 Pickle. All rights reserved.</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-base-muted">
            <p className="text-sm">등록된 약관 내용이 없습니다.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
