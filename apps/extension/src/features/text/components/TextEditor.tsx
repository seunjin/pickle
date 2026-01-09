import { Header } from "@overlay/components/Header";
import { Button, ScrollArea, TextareaContainLabel } from "@pickle/ui";
import type { NoteData } from "@shared/types";
import { useForm } from "react-hook-form";
import { EditorContainer } from "@/content/ui/components/EditorContainer";
import { SignoutButton } from "@/content/ui/components/SignoutButton";

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
  onSave?: (finalData: Partial<NoteData>) => void;
  isSaving?: boolean;
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
  isSaving = false,
}: TextEditorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TextFormValues>({
    mode: "onTouched",
    values: {
      title: "",
      text: note.text || "",
      memo: "",
    },
  });

  const onSubmit = (data: TextFormValues) => {
    const finalData = {
      ...data,
      title: data.title.trim() || "Untitled",
    };
    onUpdate(finalData);
    onSave?.(finalData);
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
            placeholder={"Untitled"}
            error={errors.title?.message}
            {...register("title")}
          />
          <TextareaContainLabel
            label="TEXT"
            required
            error={errors.text?.message}
            {...register("text", { required: "TEXT을 입력해주세요." })}
          />
          <TextareaContainLabel label="MEMO" autoFocus {...register("memo")} />
        </form>
        <div>
          <SignoutButton />
        </div>
      </ScrollArea>

      <div className="px-5 pb-5">
        <Button
          className="w-full"
          icon="download_16"
          type="submit"
          form="text-editor-form"
          disabled={!isValid || isSaving}
          isPending={isSaving}
        >
          피클에 저장하기
        </Button>
      </div>
    </EditorContainer>
  );
}
