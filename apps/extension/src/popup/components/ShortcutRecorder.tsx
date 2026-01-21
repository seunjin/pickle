import { logger } from "@shared/lib/logger";
import { formatShortcut, isValidShortcut } from "@shared/lib/shortcuts";
import { updateShortcut } from "@shared/storage";
import { useEffect, useRef, useState } from "react";

interface ShortcutRecorderProps {
  action: string;
  initialValue: string;
  label: string;
  onUpdate: () => void;
  icon: React.ReactNode;
  defaultShortcut: string;
}

export function ShortcutRecorder({
  action,
  initialValue,
  label,
  onUpdate,
  icon,
  defaultShortcut,
}: ShortcutRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [combo, setCombo] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
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
    <kbd
      key={key}
      className="mx-0.5 inline-flex min-w-[20px] items-center justify-center rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 font-medium font-mono text-[10px] text-neutral-200 shadow-[0_1px_0_rgba(255,255,255,0.1)]"
    >
      {key}
    </kbd>
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="group flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-neutral-800 p-2 text-neutral-400 transition-colors group-hover:text-white">
            {icon}
          </div>
          <span className="font-medium text-neutral-300 text-sm">{label}</span>
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
              className="flex animate-pulse items-center rounded-md border border-indigo-500/50 bg-indigo-500/20 px-3 py-1.5 font-medium text-[10px] text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              키를 입력하세요...
            </div>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-1 transition-opacity hover:opacity-80"
            >
              {combo.split("+").map(renderKey)}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="text-[10px] text-neutral-600">
          {combo !== defaultShortcut && <span>기본값: {defaultShortcut}</span>}
        </div>
        {error && <span className="text-[10px] text-red-500">{error}</span>}
      </div>
    </div>
  );
}
