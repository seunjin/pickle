"use client";
import { Select, type SelectOptionValue } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const VersionOptions = [
  {
    value: "2026-01-02",
    label: "2026. 01. 02",
  },
  {
    value: "2025-12-22",
    label: "2025. 12. 22",
  },
];
export function LegalContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const router = useRouter();
  const [version, setVersion] = useState<SelectOptionValue>(
    VersionOptions[0].value,
  );
  return (
    <div className="mx-auto grid h-full w-[min(100%,800px)] grid-rows-[auto_1fr_auto]">
      <div>
        {/* 탭 */}
        <div className="flex items-center gap-4.5 pb-12.5">
          <button
            type="button"
            onClick={() => router.push("/legal?tab=terms")}
            className={cn(
              "font-medium text-[20px] text-muted-foreground leading-none",
              tabParam === "terms" || tabParam === null
                ? "text-base-primary"
                : "",
            )}
          >
            이용약관
          </button>
          <button
            type="button"
            onClick={() => router.push("/legal?tab=privacy")}
            className={cn(
              "font-medium text-[20px] text-muted-foreground leading-none",
              tabParam === "privacy" ? "text-base-primary" : "",
            )}
          >
            개인정보처리방침
          </button>
        </div>
        {/* 버전 필터 */}
        <div className="w-[140px] pb-7.5">
          <Select
            options={VersionOptions}
            value={version}
            onValueChange={(value) => setVersion(value)}
          ></Select>
        </div>
      </div>
      {/* 약관 내용 */}
      <div></div>
      <footer className="pt-8 text-center text-neutral-500 text-xs">
        © 2026 Pickle. All rights reserved.
      </footer>
    </div>
  );
}
