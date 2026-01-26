import { logger } from "@shared/lib/logger";
import { formatShortcut, isValidShortcut } from "@shared/lib/shortcuts";
import { updateShortcut } from "@shared/storage";
import { useEffect, useRef, useState } from "react";
import { NoteIcon, type NoteIconType } from "./NoteIcon";

interface ShortcutRecorderProps {
  action: NoteIconType;
  initialValue: string;
  label: string;
  onUpdate: () => void;
  // 디자이너 요청으로 일단 임시 optional 처리
  defaultShortcut?: string;
}

export function ShortcutRecorder({
  action,
  initialValue,
  label,
  onUpdate,
}: ShortcutRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [combo, setCombo] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  // 부모 상태가 바뀌면(로그인/초기화 등) 내부 상태도 동기화
  useEffect(() => {
    setCombo(initialValue);
  }, [initialValue]);

  const inputRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;

    e.preventDefault();
    e.stopPropagation();

    const newCombo = formatShortcut(e);
    setCombo(newCombo);

    // Modifier 키 단독 입력 중에는 에러 초기화만 수행
    if (["CONTROL", "ALT", "SHIFT", "META"].includes(e.key.toUpperCase())) {
      setError(null);
      return;
    }

    const { isValid, error: validationError } = isValidShortcut(newCombo);
    if (isValid) {
      setError(null);
      updateShortcut(action, newCombo).then(() => {
        logger.debug("Shortcut updated", { action, newCombo });
        setIsRecording(false);
        onUpdate();
      });
    } else {
      setError(validationError || "유효하지 않은 조합입니다.");
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setError(null);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setCombo(initialValue);
    setError(null);
  };

  useEffect(() => {
    if (isRecording && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRecording]);

  const renderKey = (key: string) => (
    <kbd key={key} className="text-[13px] text-base-foreground">
      {key}
    </kbd>
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="group flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NoteIcon type={action} />{" "}
          <span className="text-[13px] text-base-muted-foreground">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isRecording ? (
            <div
              ref={inputRef as unknown as React.RefObject<HTMLDivElement>}
              role="button"
              aria-label="단축키 녹음 중"
              tabIndex={0} // Make div focusable
              onKeyDown={handleKeyDown}
              onBlur={cancelRecording} // Cancel recording if focus is lost
              className="flex h-7.5 w-40 items-center rounded-md border border-base-border bg-neutral-900 px-3 text-[13px] text-form-input-placeholder"
            >
              키를 입력해주세요.
            </div>
          ) : (
            <div className="flex h-7.5 w-40 items-center rounded-md border border-base-border bg-neutral-900 px-3">
              <button
                type="button"
                onClick={startRecording}
                className="flex gap-1"
              >
                {renderKey(combo)}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end px-1">
        {/* 초기값을 표시 ui. 디자이너 요청으로 주석 처리 */}
        {/* <div className="text-[10px] text-neutral-600">
          {combo !== defaultShortcut && <span>기본값: {defaultShortcut}</span>}
        </div> */}
        {error && <span className="text-[10px] text-red-500">{error}</span>}
      </div>
    </div>
  );
}
