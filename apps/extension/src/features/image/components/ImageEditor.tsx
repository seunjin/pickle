import { Header } from "@overlay/components/Header";
import { Button, ScrollArea, Spinner, TextareaContainLabel } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import type { NoteData } from "@shared/types";
import { generateDefaultTitle } from "@shared/utils/generateDefaultTitle";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { EditorContainer } from "@/content/ui/components/EditorContainer";
import { SignoutButton } from "@/content/ui/components/SignoutButton";

/**
 * ImageEditor Component
 *
 * 웹페이지 내 이미지 저장 컴포넌트입니다.
 * 사용자가 선택한 이미지를 미리보기로 보여주고, 메모를 추가하여 저장할 수 있습니다.
 */

interface ImageEditorProps {
  note: NoteData;
  onUpdate: (data: Partial<NoteData>) => void;
  onClose: () => void;
  onSave?: (finalData: Partial<NoteData>) => void;
  isSaving?: boolean;
}

type ImageFormValues = {
  title: string;
  memo: string;
};

export function ImageEditor({
  note,
  onUpdate,
  onClose,
  onSave,
  isSaving = false,
}: ImageEditorProps) {
  const srcUrl = note.srcUrl;
  const [imageStatus, setImageStatus] = useState<
    "loading" | "success" | "error"
  >(srcUrl ? "loading" : "error");
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  const isLoading = imageStatus === "loading";
  const isError = imageStatus === "error";

  const { register, handleSubmit } = useForm<ImageFormValues>({
    mode: "onTouched",
    values: {
      title: "",
      memo: "",
    },
  });

  useEffect(() => {
    if (!srcUrl || imageStatus !== "loading") return;

    const checkImage = async () => {
      try {
        if (!srcUrl) return;
        // HEAD 요청으로 메타데이터만 빠르게 확인 (CORS 허용 서버인 경우에만 작동)
        const res = await fetch(srcUrl, { method: "HEAD" });

        if (!res.ok) {
          if (res.status === 404) {
            setDiagnosis("이미지가 원본 서버에서 삭제되었습니다 (404)");
          } else if (res.status === 403 || res.status === 401) {
            setDiagnosis("접근 권한이 없거나 차단된 이미지입니다 (403)");
          } else {
            setDiagnosis(`서버 응답 오류가 발생했습니다 (${res.status})`);
          }
        }
      } catch (_e) {
        setDiagnosis(
          "보안 정책(CORS)으로 인해 상세 정보 확인이 제한되었습니다",
        );
      }
    };

    checkImage();
  }, [srcUrl, imageStatus]);

  const onSubmit = (data: ImageFormValues) => {
    const finalData = {
      ...data,
      title: data.title.trim() || generateDefaultTitle(),
    };
    onUpdate(finalData);
    onSave?.(finalData);
  };

  return (
    <EditorContainer>
      <Header title="이미지 저장" onClose={onClose} />
      <ScrollArea className="mr-2 h-full overflow-auto">
        <form
          id="image-editor-form"
          onSubmit={handleSubmit(onSubmit)}
          className="mr-4 flex flex-1 flex-col gap-2.5 py-0.5 pl-5"
        >
          {/* 이미지 컨테이너 영역 */}
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-base-border-light bg-neutral-900">
            {isLoading && (
              <div className="flex h-full items-center justify-center">
                <Spinner className="size-7 text-base-primary" />
              </div>
            )}

            {srcUrl ? (
              <img
                src={srcUrl}
                alt={note.altText || "Captured content"}
                className={cn(
                  "max-h-full max-w-full object-contain shadow-lg transition-opacity duration-300",
                  imageStatus === "success"
                    ? "opacity-100"
                    : "absolute opacity-0",
                )}
                onLoad={(e) => {
                  setImageStatus("success");
                  // 블러 플레이스홀더를 위한 저해상도(10x10) 이미지 생성
                  const imgElement = e.currentTarget;
                  const canvas = document.createElement("canvas");
                  canvas.width = 10;
                  canvas.height = 10;
                  const ctx = canvas.getContext("2d");
                  ctx?.drawImage(imgElement, 0, 0, 10, 10);
                  const blurUrl = canvas.toDataURL("image/webp", 0.3);
                  onUpdate({ blurDataUrl: blurUrl });
                }}
                onError={() => {
                  setImageStatus("error");
                  if (!diagnosis)
                    setDiagnosis(
                      "이미지를 불러오는 중 알 수 없는 오류가 발생했습니다",
                    );
                }}
              />
            ) : null}

            {isError && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-neutral-500">
                <span className="text-4xl opacity-50 grayscale">🖼️</span>
                <p className="font-medium text-sm">
                  이미지를 불러올 수 없습니다
                </p>
                {diagnosis && (
                  <p className="break-keep text-neutral-600 text-xs leading-relaxed">
                    {diagnosis}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 타이틀 영역 */}
          <TextareaContainLabel
            label="TITLE"
            placeholder={generateDefaultTitle()}
            {...register("title")}
          />
          {/* 메모 영역 */}
          <TextareaContainLabel
            label="MEMO"
            placeholder="나의 생각을 함께 기록하세요."
            autoFocus
            {...register("memo")}
          />
          <div>
            <SignoutButton />
          </div>
        </form>
      </ScrollArea>

      <div className="px-5 pb-5">
        <Button
          className="w-full"
          disabled={!srcUrl || isSaving}
          icon="download_16"
          type="submit"
          form="image-editor-form"
          isPending={isSaving}
        >
          피클에 저장하기
        </Button>
      </div>
    </EditorContainer>
  );
}
