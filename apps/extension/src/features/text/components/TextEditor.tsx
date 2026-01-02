import { Header } from "@overlay/components/Header";
import { Button, ScrollArea, TextareaContainLabel } from "@pickle/ui";
import type { NoteData } from "@shared/types";
import { EditorContainer } from "@/content/ui/components/EditorContainer";

/**
 * TextEditor Component
 *
 * 텍스트 저장 화면 컴포넌트입니다.
 * 웹페이지에서 드래그하여 선택한 텍스트와 원본 URL을 함께 저장할 수 있는 에디터를 제공합니다.
 */

interface TextEditorProps {
  note: NoteData;
  onUpdate: (data: Partial<NoteData>) => void;
  onClose: () => void;
  onSave?: () => void;
}

export function TextEditor({
  note,
  onUpdate,
  onClose,
  onSave,
}: TextEditorProps) {
  return (
    <EditorContainer>
      <Header title="텍스트 저장" onClose={onClose} />

      <ScrollArea className="mr-2 h-full overflow-auto">
        <div className="mr-4 flex flex-1 flex-col gap-2.5 py-0.5 pl-5">
          <TextareaContainLabel
            label="TITLE"
            placeholder="타이틀"
            value={note.title || ""}
            onChange={(e) => onUpdate({ title: e.target.value })}
          ></TextareaContainLabel>
          <TextareaContainLabel
            label="TEXT"
            placeholder="텍스트"
            value={note.text || ""}
            onChange={(e) => onUpdate({ text: e.target.value })}
          ></TextareaContainLabel>
          <TextareaContainLabel
            label="MEMO"
            placeholder="메모"
            value={note.memo}
            onChange={(e) => onUpdate({ memo: e.target.value })}
            autoFocus
          />
        </div>
      </ScrollArea>

      <div className="px-5 pb-5">
        <Button className="w-full" icon="download_16" onClick={onSave}>
          피클에 저장하기
        </Button>
      </div>
    </EditorContainer>
  );
}
