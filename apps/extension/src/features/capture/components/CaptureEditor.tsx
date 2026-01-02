import { Header } from "@overlay/components/Header";
import { Button, ScrollArea, Spinner, TextareaContainLabel } from "@pickle/ui";
import type { CaptureData, NoteData } from "@shared/types";
import { useEffect, useState } from "react";
import { EditorContainer } from "@/content/ui/components/EditorContainer";

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
  onSave?: () => void;
}

/**
 * CaptureProcessor: UI를 렌더링하지 않고 캔버스를 이용해 이미지 가공 로직만 수행하는 컴포넌트
 */
function CaptureProcessor({
  captureData,
  onReady,
}: {
  captureData: CaptureData;
  onReady: (url: string) => void;
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
      onReady(canvas.toDataURL());
    };

    img.src = captureData.image;
  }, [captureData, onReady]);

  return null; // 가공 로직만 수행하므로 아무것도 렌더링하지 않음
}

export function CaptureEditor({
  note,
  onUpdate,
  onClose,
  onRetake,
  onSave,
}: CaptureEditorProps) {
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  // 새로운 캡쳐 데이터가 들어오면 이전 가공 이미지 초기화
  useEffect(() => {
    if (!note.captureData) {
      setProcessedImage(null);
    }
  }, [note.captureData]);

  // 데이터 수신 중이거나, 수신은 했지만 아직 캔버스 가공이 완료되지 않은 상태
  const isWaiting = note.isLoading || (!!note.captureData && !processedImage);

  return (
    <EditorContainer>
      {/* 헤더 영역 */}
      <Header title="캡쳐 저장" onClose={onClose} />
      {/* 스크롤 영역 */}
      <ScrollArea className="mr-2 h-full overflow-auto">
        <div className="mr-4 flex flex-1 flex-col gap-2.5 py-0.5 pl-5">
          <div className="group aspect-square overflow-hidden rounded-xl border border-base-border-light bg-neutral-900">
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
                  <div className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="small"
                      variant="default"
                      className="h-7 gap-1 border border-neutral-700 bg-neutral-900/80 px-2 text-xs backdrop-blur-sm hover:bg-neutral-800"
                      onClick={onRetake}
                    >
                      <span className="text-[14px]">🔄</span>
                      retake
                    </Button>
                  </div>
                </div>
              )
            )}

            {/* 실제 이미지 가공 프로세서 (UI 없이 백그라운드 로직만 실행) */}
            {note.captureData && !processedImage && (
              <CaptureProcessor
                captureData={note.captureData}
                onReady={setProcessedImage}
              />
            )}
          </div>
          {/* title */}
          <TextareaContainLabel
            label="TITLE"
            placeholder="타이틀"
            value={note.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
          {/* 메모 영역 */}
          <TextareaContainLabel
            label="MEMO"
            placeholder="메모"
            value={note.memo}
            onChange={(e) => onUpdate({ memo: e.target.value })}
            autoFocus
          />
        </div>
      </ScrollArea>
      {/* 버튼 영역 */}
      <div className="px-5 pb-5">
        <Button
          className="w-full"
          disabled={!note.captureData || isWaiting}
          icon="download_16"
          onClick={onSave}
        >
          피클에 저장하기
        </Button>
      </div>
    </EditorContainer>
  );
}
