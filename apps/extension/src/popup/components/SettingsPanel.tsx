import {
  IconArrowLeft16,
  IconBookmark16,
  IconCapture16,
  IconDocument16,
  IconLayoutCard16,
  IconLogout16,
} from "@pickle/icons";
import { Button, ScrollArea } from "@pickle/ui";
import { getShortcuts, resetShortcuts } from "@shared/storage";
import {
  getOSDefaultShortcuts,
  isMac,
  type ShortcutSettings,
} from "@shared/types";
import { useEffect, useState } from "react";
import { ShortcutRecorder } from "./ShortcutRecorder";

interface SettingsPanelProps {
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsPanel({ onBack, onLogout }: SettingsPanelProps) {
  const [shortcuts, setShortcuts] = useState<ShortcutSettings | null>(null);
  const defaults = getOSDefaultShortcuts();

  useEffect(() => {
    getShortcuts().then(setShortcuts);
  }, []);

  const handleUpdate = () => {
    getShortcuts().then(setShortcuts);
  };

  const handleReset = async () => {
    if (confirm("모든 단축키를 초기 설정으로 복원하시겠습니까?")) {
      const defaults = await resetShortcuts();
      setShortcuts(defaults);
    }
  };

  const openChromeShortcuts = () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  };

  return (
    <div className="grid h-full w-full grid-rows-[auto_1fr_auto] bg-neutral-900 text-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-neutral-800 border-b p-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg p-1 transition-colors hover:bg-neutral-800"
          aria-label="Back"
        >
          <IconArrowLeft16 className="text-neutral-400" />
        </button>
        <h2 className="font-bold text-lg">설정</h2>
      </div>

      {/* Content */}
      <ScrollArea className="overflow-auto">
        <div className="p-4">
          <section className="mb-4">
            <h3 className="mb-3 font-semibold text-neutral-400 text-xs uppercase tracking-wider">
              시스템 환경
            </h3>
            <div className="rounded-xl border border-neutral-800 bg-neutral-800/40 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded bg-neutral-700 px-1.5 py-0.5 font-medium text-[10px] text-neutral-300">
                    OS
                  </div>
                  <span className="text-neutral-200 text-sm">
                    {isMac ? "macOS (Apple)" : "Windows / Linux"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={openChromeShortcuts}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  브라우저 단축키 설정
                </button>
              </div>
            </div>
          </section>

          <section className="mb-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-400 text-xs uppercase tracking-wider">
                커스텀 단축키
              </h3>
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] text-neutral-500 transition-colors hover:text-indigo-400"
              >
                초기화
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {shortcuts ? (
                <>
                  <ShortcutRecorder
                    label="텍스트 저장"
                    action="text"
                    icon={<IconDocument16 />}
                    initialValue={shortcuts.text}
                    defaultShortcut={defaults.text}
                    onUpdate={handleUpdate}
                  />
                  <ShortcutRecorder
                    label="북마크"
                    action="bookmark"
                    icon={<IconBookmark16 />}
                    initialValue={shortcuts.bookmark}
                    defaultShortcut={defaults.bookmark}
                    onUpdate={handleUpdate}
                  />
                  <ShortcutRecorder
                    label="화면 캡처"
                    action="capture"
                    icon={<IconCapture16 />}
                    initialValue={shortcuts.capture}
                    defaultShortcut={defaults.capture}
                    onUpdate={handleUpdate}
                  />
                  <ShortcutRecorder
                    label="이미지 저장"
                    action="image"
                    icon={<IconLayoutCard16 />}
                    initialValue={shortcuts.image}
                    defaultShortcut={defaults.image}
                    onUpdate={handleUpdate}
                  />
                </>
              ) : (
                <div className="py-2 text-center text-neutral-500 text-xs italic">
                  로딩 중...
                </div>
              )}
            </div>
          </section>

          <section className="mb-4">
            <h3 className="mb-3 font-semibold text-neutral-400 text-xs uppercase tracking-wider">
              계정
            </h3>
            <Button
              variant="secondary_line"
              className="w-full justify-start gap-2 text-red-400 hover:bg-red-400/10 hover:text-red-400"
              onClick={onLogout}
            >
              <IconLogout16 />
              로그아웃
            </Button>
          </section>
        </div>
      </ScrollArea>
      {/* Footer */}
      <div className="border-neutral-800 border-t p-4">
        <p className="text-center text-[10px] text-neutral-600">
          Pickle Extension v1.0.0
          <br />© 2026 Pickle Note. All rights reserved.
        </p>
      </div>
    </div>
  );
}
