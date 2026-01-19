import type { Metadata } from "next";
import { TermsServiceContent } from "@/features/legal/ui/TermsServiceContent";

export const metadata: Metadata = {
  title: "이용약관 | Pickle",
  description: "Pickle 서비스 이용약관 안내입니다.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <header className="mb-12 border-gray-100 border-b pb-8">
        <h1 className="mb-2 font-bold text-4xl text-gray-900 tracking-tight">
          이용약관
        </h1>
        <p className="text-gray-500">시행일: 2025년 12월 22일</p>
      </header>

      <TermsServiceContent />

      <footer className="mt-20 border-t pt-8 text-center text-gray-400 text-sm">
        © 2025 Pickle. All rights reserved.
      </footer>
    </div>
  );
}
