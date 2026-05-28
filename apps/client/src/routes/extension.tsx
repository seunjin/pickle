import { Icon } from "@pickle/icons";
import { createFileRoute } from "@tanstack/react-router";

const extensionInstallUrl =
  import.meta.env.VITE_EXTENSION_INSTALL_URL ||
  "https://chromewebstore.google.com/detail/pickle/fpcppclijlpdiffpaibjejninonhbpno";

export const Route = createFileRoute("/extension")({
  component: ExtensionGuidePage,
});

const installSteps = [
  {
    title: "브라우저에 설치",
    description: "Chrome 또는 Whale에서 Pickle 익스텐션을 추가합니다.",
  },
  {
    title: "익스텐션 로그인",
    description: "팝업에서 Google 계정을 연결하면 대시보드와 동기화됩니다.",
  },
  {
    title: "웹 콘텐츠 저장",
    description: "선택 텍스트, 이미지, 북마크, 화면 캡처를 저장합니다.",
  },
];

const shortcuts = [
  { label: "익스텐션 열기", value: "Ctrl + Shift + Y" },
  { label: "화면 캡처", value: "Ctrl + Shift + E" },
  { label: "북마크 저장", value: "Ctrl + Shift + B" },
];

function ExtensionGuidePage() {
  return (
    <div className="h-full overflow-auto bg-base-background">
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-8 px-8 py-10">
        <header className="flex flex-col gap-4">
          <div className="flex size-12 items-center justify-center rounded-[8px] bg-base-primary text-black">
            <Icon name="download_16" />
          </div>
          <div>
            <h1 className="font-bold text-3xl text-base-foreground">
              Pickle 익스텐션 설치
            </h1>
            <p className="mt-2 max-w-[640px] text-base-muted text-sm leading-[1.6]">
              피클은 브라우저 익스텐션으로 웹 페이지의 텍스트, 이미지, 북마크,
              화면 캡처를 저장합니다. 저장된 항목은 이 대시보드의 Inbox에
              자동으로 모입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={extensionInstallUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-base-primary px-4 font-bold text-black text-sm transition-opacity hover:opacity-90"
            >
              <Icon name="download_16" className="size-4" />
              Chrome 웹스토어에서 설치
            </a>
            <a
              href="chrome://extensions/shortcuts"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-[8px] border border-base-border px-4 font-bold text-base-foreground text-sm transition-colors hover:border-base-primary hover:text-base-primary"
            >
              단축키 설정
            </a>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {installSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-[8px] border border-base-border bg-base-foreground-background p-5"
            >
              <span className="font-semibold text-base-primary text-sm">
                0{index + 1}
              </span>
              <h2 className="mt-3 font-bold text-base-foreground text-lg">
                {step.title}
              </h2>
              <p className="mt-2 text-base-muted text-sm leading-[1.55]">
                {step.description}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[8px] border border-base-border bg-base-foreground-background p-6">
            <h2 className="font-bold text-base-foreground text-xl">
              저장할 수 있는 것
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["text", "선택한 텍스트와 메모"],
                ["image", "웹 페이지 이미지"],
                ["bookmark", "현재 페이지 북마크"],
                ["capture", "드래그 영역 화면 캡처"],
              ].map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-[6px] bg-base-background px-4 py-3"
                >
                  <span className="font-medium text-base-foreground text-sm">
                    {value}
                  </span>
                  <span className="rounded-[4px] bg-base-primary/15 px-2 py-1 font-semibold text-base-primary text-xs uppercase">
                    {key}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[8px] border border-base-border bg-base-foreground-background p-6">
            <h2 className="font-bold text-base-foreground text-xl">단축키</h2>
            <div className="mt-5 flex flex-col gap-3">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-base-muted text-sm">
                    {shortcut.label}
                  </span>
                  <kbd className="rounded-[4px] border border-base-border bg-base-background px-2 py-1 font-semibold text-base-foreground text-xs">
                    {shortcut.value}
                  </kbd>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
