"use client";

import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { BookmarkNoteContent } from "./card/BookmarkNoteContent";
import { MediaNoteContent } from "./card/MediaNoteContent";
import { NoteCardFooter } from "./card/NoteCardFooter";
import { NoteCardHeader } from "./card/NoteCardHeader";
import { TextNoteContent } from "./card/TextNoteContent";

interface NoteCardProps {
  note: NoteWithAsset;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  // 미디어 타입 (상단 전체 너비) 확인
  const isMediaType = note.type === "image" || note.type === "capture";

  const renderContent = () => {
    switch (note.type) {
      case "text":
        return <TextNoteContent text={note.data.text} />;
      case "bookmark":
        return (
          <BookmarkNoteContent
            url={note.url}
            data={note.data}
            meta={note.meta}
          />
        );
      case "image":
      case "capture":
        // 레이아웃상의 이유(전체 너비)로 미디어 콘텐츠는 별도로 처리합니다.
        // 특정 대체 텍스트가 필요한 경우 메인 흐름 내에서 처리될 수도 있습니다.
        // 하지만 원래 디자인에서는 에셋이 존재하는 경우 상단에 위치합니다.
        // 대체 텍스트(예: 업로드 중 또는 오류)인 경우 콘텐츠 영역에 있을 수 있습니다.
        if (!note.assets) {
          return (
            <MediaNoteContent
              type={note.type}
              data={note.data}
              asset={note.assets}
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-[20px] border border-base-border bg-neutral-900 transition-all hover:border-base-primary">
      {/* 1. 전체 너비 미디어 섹션 */}
      {isMediaType && note.assets && (
        <MediaNoteContent
          type={note.type}
          data={note.data}
          asset={note.assets}
        />
      )}

      <div className="flex flex-1 flex-col p-4">
        {/* 2. 헤더 */}
        <NoteCardHeader
          type={note.type}
          createdAt={note.created_at}
          onDelete={() => onDelete(note.id)}
        />

        {/* 3. 메인 콘텐츠 섹션 */}
        <div className="flex-1">{renderContent()}</div>

        {/* 4. 푸터 */}
        <NoteCardFooter url={note.url} meta={note.meta} />
      </div>
    </div>
  );
}
