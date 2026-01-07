import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trash | Pickle",
};

export default function TrashPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-base-muted">
      <div className="mb-4 rounded-full bg-neutral-800 p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-500"
          role="img"
          aria-label="Trash icon"
        >
          <title>Trash icon</title>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </div>
      <h2 className="mb-2 font-bold text-2xl text-base-foreground">
        휴지통 서비스 준비 중
      </h2>
      <p className="text-center">
        삭제된 노트를 관리하는 기능이 곧 추가될 예정입니다.
        <br />
        잠시만 기다려 주세요!
      </p>
    </div>
  );
}
