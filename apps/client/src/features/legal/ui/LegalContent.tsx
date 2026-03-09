import { ScrollArea } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { getLatestLegalDocument } from "../api/getLatestLegalDocument";

const TABS = [
  { id: "service", label: "이용약관" },
  { id: "privacy", label: "개인정보 처리방침" },
  { id: "marketing", label: "마케팅 정보 수신 동의" },
] as const;

export function LegalContent() {
  const navigate = useNavigate();
  const { tab } = useSearch({ from: "/legal" });

  const activeTab =
    (TABS.find((t) => t.id === tab)?.id as
      | "service"
      | "privacy"
      | "marketing") || "service";

  return (
    <div className="mx-auto grid h-full w-[min(100%,800px)] grid-rows-[auto_1fr_auto]">
      <div>
        {/* 탭 헤더 */}
        <div className="flex items-center gap-8 pb-10">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                navigate({
                  to: "/legal",
                  search: (prev) => ({ ...prev, tab: t.id }),
                  replace: true,
                })
              }
              className={cn(
                "font-medium text-[20px] transition-colors",
                activeTab === t.id
                  ? "font-bold text-base-primary"
                  : "text-base-muted hover:text-base-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 약관 본문 영역 */}
      <div className="flex-1 overflow-hidden">
        <LegalItemView type={activeTab} />
      </div>

      <footer className="pt-8 text-center text-base-muted text-xs">
        <p className="">© 2026 Pickle. All rights reserved.</p>
      </footer>
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
    <ScrollArea className="h-full pr-4">
      <div className="max-w-none">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-base-muted text-sm">
            내용을 불러오는 중...
          </div>
        ) : document ? (
          <article className="prose prose-invert prose-sm sm:prose-base max-w-none">
            <div
              className="prose-legal text-base-foreground [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-bold [&_h2]:text-xl [&_p]:mb-4 [&_p]:leading-relaxed"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: 관리자가 작성한 검증된 HTML 약관 렌더링
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
            <div className="mt-12 border-base-border border-t pt-8 text-center text-base-muted text-xs">
              <p>
                최종 수정일:{" "}
                {new Date(document.updated_at).toLocaleDateString()}
              </p>
            </div>
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-base-muted">
            <p className="text-sm">등록된 약관 내용이 없습니다.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
