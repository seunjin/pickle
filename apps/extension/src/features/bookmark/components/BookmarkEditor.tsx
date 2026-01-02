import { Header } from "@overlay/components/Header";
import { Button, ScrollArea, TextareaContainLabel } from "@pickle/ui";
import type { NoteData } from "@shared/types";
import { EditorContainer } from "@/content/ui/components/EditorContainer";

/**
 * BookmarkEditor Component
 *
 * 북마크 저장 화면 컴포넌트입니다.
 * 현재 페이지의 메타데이터(OG 태그 등)를 추출하여 보여주고, 사용자가 메모를 추가하여 저장할 수 있습니다.
 */

interface BookmarkEditorProps {
  note: NoteData;
  onUpdate: (data: Partial<NoteData>) => void;
  onClose: () => void;
  onSave?: () => void;
}

export function BookmarkEditor({
  note,
  onUpdate,
  onClose,
  onSave,
}: BookmarkEditorProps) {
  return (
    <EditorContainer>
      <Header title="북마크 저장" onClose={onClose} />
      <ScrollArea className="mr-2 h-full overflow-auto">
        <div className="mr-4 flex min-w-0 flex-col gap-2.5 py-0.5 pl-5">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-base-border-light bg-neutral-900">
            {note.pageMeta?.image && (
              <img
                src={note.pageMeta?.image}
                alt="OG Preview"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
          {(note.pageMeta?.favicon ||
            note.pageMeta?.title ||
            note.pageMeta?.image ||
            note.pageMeta?.url) && (
            <div className="flex max-w-xs flex-col">
              <div className="flex items-center gap-1.5">
                <span className="line-clamp-2 items-center text-ellipsis break-all font-semibold text-[15px] text-base-foreground">
                  {/* favicon */}
                  {note.pageMeta?.favicon && (
                    <span className="mr-1.5 inline-block size-5 shrink-0 translate-y-[5px] overflow-hidden rounded-sm border border-base-border-light bg-white px-0.25">
                      <img
                        src={note.pageMeta?.favicon}
                        alt={`${note.pageMeta?.site_name} favicon`}
                        className="h-full w-full object-contain"
                      />
                    </span>
                  )}

                  {/* site name */}
                  <span>
                    {note.pageMeta?.site_name || note.pageMeta?.title}
                  </span>
                </span>
              </div>
              {/* url */}
              {note.pageMeta?.url && (
                <span className="truncate text-[13px] text-neutral-500">
                  {note.pageMeta?.url}
                </span>
              )}
            </div>
          )}
          {/* 타이틀 영역 */}
          <TextareaContainLabel
            label="TITLE"
            placeholder="타이틀"
            value={note.title || ""}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
          {/* 메모 영역 */}
          <TextareaContainLabel
            label="MEMO"
            placeholder="메모"
            value={note.memo || ""}
            onChange={(e) => onUpdate({ memo: e.target.value })}
            autoFocus
          />
        </div>
      </ScrollArea>

      <div className="mt-auto px-5 pb-5">
        <Button
          className="w-full"
          disabled={!note.pageMeta}
          onClick={onSave}
          icon="download_16"
        >
          피클에 저장하기
        </Button>
      </div>
    </EditorContainer>
  );
}
