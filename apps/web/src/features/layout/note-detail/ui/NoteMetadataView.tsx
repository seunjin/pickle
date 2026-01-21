"use client";

import type { NoteWithAsset } from "@pickle/contracts";
import { formatDate } from "@/shared/lib/date";
import { formatBytes } from "@/shared/lib/file";

interface NoteMetadataViewProps {
  note: NoteWithAsset;
}

export function NoteMetadataView({ note }: NoteMetadataViewProps) {
  const extension =
    note.assets?.full_path.split(".").pop()?.toUpperCase() || "IMG";

  return (
    <div className="px-5 pb-20">
      <div className="mb-[8.5px] flex h-9 items-center justify-between">
        <span className="font-semibold text-[13px] text-neutral-600 leading-none tracking-wider">
          DETAILS
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {(note.type === "image" || note.type === "capture") && (
          <>
            <dl className="flex items-center">
              <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
                파일 종류
              </dt>
              <dd className="text-[13px] text-neutral-500 leading-none">
                {extension} 이미지
              </dd>
            </dl>
            <dl className="flex items-center">
              <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
                파일 크기
              </dt>
              <dd className="text-[13px] text-neutral-500 leading-none">
                {note.assets?.full_size_bytes
                  ? formatBytes(note.assets.full_size_bytes)
                  : "-"}
              </dd>
            </dl>
          </>
        )}
        <dl className="flex items-center">
          <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
            등록일
          </dt>
          <dd className="text-[13px] text-neutral-500 leading-none">
            {formatDate(note.created_at, "datetime")}
          </dd>
        </dl>
        <dl className="flex items-center">
          <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
            수정일
          </dt>
          <dd className="text-[13px] text-neutral-500 leading-none">
            {formatDate(note.updated_at, "datetime")}
          </dd>
        </dl>
      </div>
    </div>
  );
}
