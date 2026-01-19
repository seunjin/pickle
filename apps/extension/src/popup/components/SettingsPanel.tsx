import { IconArrowLeft16, IconLogout16 } from "@pickle/icons";
import { Button } from "@pickle/ui";

interface SettingsPanelProps {
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsPanel({ onBack, onLogout }: SettingsPanelProps) {
  return (
    <div className="flex h-full w-full flex-col bg-neutral-900 text-white">
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
      <div className="flex-1 overflow-y-auto p-4">
        <section className="mb-6">
          <h3 className="mb-3 font-semibold text-neutral-400 text-xs uppercase tracking-wider">
            단축키 안내
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-300">캡처 모드 실행</span>
              <kbd className="rounded bg-neutral-800 px-2 py-1 font-sans text-neutral-400 text-xs">
                Ctrl + Shift + E
              </kbd>
            </div>
            {/* 추가적인 단축키가 있다면 여기에 작성 */}
          </div>
        </section>

        <section className="mb-6">
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

      {/* Footer */}
      <div className="border-neutral-800 border-t p-4">
        <p className="text-center text-[10px] text-neutral-600">
          Pickle Extension v0.1.0
          <br />© 2026 Pickle Note. All rights reserved.
        </p>
      </div>
    </div>
  );
}
