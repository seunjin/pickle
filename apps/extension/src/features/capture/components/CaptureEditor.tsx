import { Header } from "@overlay/components/Header";
import { Icon } from "@pickle/icons";
import { Button, ScrollArea, Spinner, TextareaContainLabel } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import type { CaptureData, NoteData } from "@shared/types";
import { generateDefaultTitle } from "@shared/utils/generateDefaultTitle";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { EditorContainer } from "@/content/ui/components/EditorContainer";
import { SignoutButton } from "@/content/ui/components/SignoutButton";

/**
 * CaptureEditor Component
 *
 * 화면 캡쳐 저장 및 미리보기 컴포넌트입니다.
 * 드래그하여 선택한 영역의 스크린샷을 보여주고, 메모와 함께 저장할 수 있는 기능을 제공합니다.
 */

interface CaptureEditorProps {
  note: NoteData;
  onUpdate: (data: Partial<NoteData>) => void;
  onClose: () => void;
  onRetake: () => void;
  onSave?: (finalData: Partial<NoteData>) => void;
  isSaving?: boolean;
}

type CaptureFormValues = {
  title: string;
  memo: string;
};

/**
 * CaptureProcessor: UI를 렌더링하지 않고 캔버스를 이용해 이미지 가공 로직만 수행하는 컴포넌트
 */
function CaptureProcessor({
  captureData,
  onReady,
}: {
  captureData: CaptureData;
  onReady: (url: string, blurUrl: string) => void;
}) {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const { x, y, width, height } = captureData.area;
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, x, y, width, height, 0, 0, width, height);
      const fullResUrl = canvas.toDataURL("image/png");

      // 블러 플레이스홀더를 위한 저해상도(10x10) 이미지 생성
      const blurCanvas = document.createElement("canvas");
      blurCanvas.width = 10;
      blurCanvas.height = 10;
      const blurCtx = blurCanvas.getContext("2d");
      blurCtx?.drawImage(canvas, 0, 0, 10, 10);
      const blurDataUrl = blurCanvas.toDataURL("image/webp", 0.3);

      onReady(fullResUrl, blurDataUrl);
    };

    img.src = captureData.image;
  }, [captureData, onReady]);

  return null;
}

export function CaptureEditor({
  note,
  onUpdate,
  onClose,
  onRetake,
  onSave,
  isSaving = false,
}: CaptureEditorProps) {
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<CaptureFormValues>({
    mode: "onTouched",
    values: {
      title: "",
      memo: "",
    },
  });

  // 새로운 캡쳐 데이터가 들어오면 이전 가공 이미지 초기화
  useEffect(() => {
    if (!note.captureData) {
      setProcessedImage(null);
    }
  }, [note.captureData]);

  // 데이터 수신 중이거나, 수신은 했지만 아직 캔버스 가공이 완료되지 않은 상태
  const isWaiting = note.isLoading || (!!note.captureData && !processedImage);

  const onSubmit = (data: CaptureFormValues) => {
    const finalData = {
      ...data,
      title: data.title.trim() || generateDefaultTitle(),
      // 크롭된 이미지를 명시적으로 포함 (타이밍 문제 방지)
      captureData: note.captureData
        ? {
            ...note.captureData,
            image: processedImage || note.captureData.image,
          }
        : undefined,
    };
    onUpdate(finalData);
    onSave?.(finalData);
  };

  return (
    <EditorContainer>
      {/* 헤더 영역 */}
      <Header title="캡쳐 저장" onClose={onClose} />
      {/* 스크롤 영역 */}
      <ScrollArea className="mr-2 h-full overflow-auto">
        <form
          id="capture-editor-form"
          onSubmit={handleSubmit(onSubmit)}
          className="mr-4 flex flex-1 flex-col gap-2.5 py-0.5 pl-5"
        >
          <div className="group relative aspect-square overflow-hidden rounded-xl border border-base-border-light bg-neutral-900">
            {isWaiting ? (
              <div className="flex h-full items-center justify-center">
                <Spinner className="size-7 text-base-primary" />
              </div>
            ) : (
              processedImage && (
                <div className="relative flex h-full w-full items-center justify-center">
                  <img
                    src={processedImage}
                    alt="Cropped capture"
                    className="max-h-full max-w-full object-contain"
                  />
                  {/* 재캡쳐 버튼 */}
                  <div className="absolute right-3 bottom-3">
                    <button
                      type="button"
                      className={cn(
                        "group/retake inline-flex h-7 items-center gap-0.5 rounded-md border border-base-border-light bg-base-foreground-background px-1.5 text-base-muted-foreground text-sm transition-colors active:scale-95",
                        // hover
                        "hover:border-base-primary hover:text-base-primary",
                      )}
                      onClick={onRetake}
                    >
                      <Icon
                        name="capture_16"
                        className="transition-colors group-hover/retake:text-base-primary"
                      />{" "}
                      다시 캡쳐
                    </button>
                  </div>
                </div>
              )
            )}

            {/* 실제 이미지 가공 프로세서 (UI 없이 백그라운드 로직만 실행) */}
            {note.captureData && !processedImage && (
              <CaptureProcessor
                captureData={note.captureData}
                onReady={(processedUrl, blurUrl) => {
                  setProcessedImage(processedUrl);
                  // 크롭된 이미지를 captureData.image에 저장하여 서버 전송 시 사용
                  if (note.captureData) {
                    onUpdate({
                      blurDataUrl: blurUrl,
                      captureData: {
                        ...note.captureData,
                        image: processedUrl, // 전체 화면 → 크롭된 이미지로 교체
                      },
                    });
                  }
                }}
              />
            )}
          </div>
          {/* title */}
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
      {/* 버튼 영역 */}
      <div className="px-5 pb-5">
        <Button
          className="w-full"
          disabled={!note.captureData || isWaiting || isSaving}
          icon="download_16"
          type="submit"
          form="capture-editor-form"
          isPending={isSaving}
        >
          피클에 저장하기
        </Button>
      </div>
    </EditorContainer>
  );
}
