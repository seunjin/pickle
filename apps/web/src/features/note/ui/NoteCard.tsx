"use client";

import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { BookmarkCard } from "./card/BookmarkCard";
import { MediaCard } from "./card/MediaCard";
import { TextNoteContent } from "./card/TextNoteContent";

interface NoteCardProps {
  note: NoteWithAsset;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  // 미디어 타입 (상단 전체 너비) 확인
  // const isMediaType = note.type === "image" || note.type === "capture";

  const renderContent = () => {
    switch (note.type) {
      case "text":
        return <TextNoteContent text={note.data.text} />;
      case "bookmark":
        return (
          // <BookmarkNoteContent
          //   url={note.url}
          //   data={note.data}
          //   meta={note.meta}
          // />
          <BookmarkCard note={note} onDelete={onDelete} />
        );
      case "image":
        return <MediaCard note={note} onDelete={onDelete} />;
      case "capture":
        return <MediaCard note={note} onDelete={onDelete} />;

      default:
        return null;
    }
  };

  return renderContent();
  // <div className="group flex flex-col overflow-hidden rounded-[20px] border border-base-border bg-neutral-900 ">
  //   {/* 1. 전체 너비 미디어 섹션 */}
  //   {isMediaType && note.assets && (
  //     <MediaNoteContent
  //       type={note.type}
  //       data={note.data}
  //       asset={note.assets}
  //     />
  //   )}

  //   {/* 2. 헤더 */}
  //   {/* <NoteCardHeader
  //       type={note.type}
  //       createdAt={note.created_at}
  //       /> */}

  //   {/* 3. 메인 콘텐츠 섹션 */}
  //   <div className="flex-1">{renderContent()}</div>
  //   <div className="flex flex-1 flex-col">

  //     {/* 4. 푸터 */}
  //     <NoteCardFooter url={note.url} meta={note.meta} onDelete={() => onDelete(note.id)} />
  //   </div>
  // </div>
}
