import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Pickle",
  description: "Pickle 서비스의 개인정보처리방침 안내입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <header className="mb-12 border-b pb-8">
        <h1 className="mb-2 font-bold text-4xl text-gray-900 tracking-tight">
          개인정보처리방침
        </h1>
        <p className="text-gray-500">시행일: 2025년 12월 22일</p>
      </header>

      <section className="prose prose-slate dark:prose-invert max-w-none">
        <div className="rounded-xl border border-gray-300 border-dashed bg-gray-50 p-12 text-center text-gray-500">
          <p>개인정보처리방침 내용을 입력해주세요.</p>
        </div>
      </section>

      <footer className="mt-20 border-t pt-8 text-center text-gray-400 text-sm">
        © 2025 Pickle. All rights reserved.
      </footer>
    </div>
  );
}
