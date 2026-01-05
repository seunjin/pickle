import { Header } from "@overlay/components/Header";
import { Button, ScrollArea, TextareaContainLabel } from "@pickle/ui";
import type { NoteData } from "@shared/types";
import { useForm } from "react-hook-form";
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

type TextFormValues = {
  title: string;
  text: string;
  memo: string;
};

export function TextEditor({
  note,
  onUpdate,
  onClose,
  onSave,
}: TextEditorProps) {
  const { register, handleSubmit } = useForm<TextFormValues>({
    defaultValues: {
      title: note.title || "",
      text: note.text || "",
      memo: note.memo || "",
    },
  });

  const onSubmit = (data: TextFormValues) => {
    onUpdate(data);
    onSave?.();
  };

  return (
    <EditorContainer>
      <Header title="텍스트 저장" onClose={onClose} />

      <ScrollArea className="mr-2 h-full overflow-auto">
        <form
          id="text-editor-form"
          onSubmit={handleSubmit(onSubmit)}
          className="mr-4 flex flex-1 flex-col gap-2.5 py-0.5 pl-5"
        >
          <TextareaContainLabel
            label="TITLE"
            placeholder="타이틀"
            {...register("title")}
          />
          <TextareaContainLabel
            label="TEXT"
            placeholder="텍스트"
            {...register("text")}
          />
          <TextareaContainLabel
            label="MEMO"
            placeholder="메모"
            autoFocus
            {...register("memo")}
          />
        </form>
      </ScrollArea>

      <div className="px-5 pb-5">
        <Button
          className="w-full"
          icon="download_16"
          type="submit"
          form="text-editor-form"
        >
          피클에 저장하기
        </Button>
      </div>
    </EditorContainer>
  );
}
