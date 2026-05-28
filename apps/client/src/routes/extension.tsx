import { Icon } from "@pickle/icons";
import { createFileRoute } from "@tanstack/react-router";

const extensionInstallUrl =
  import.meta.env.VITE_EXTENSION_INSTALL_URL ||
  "https://chromewebstore.google.com/detail/pickle/fpcppclijlpdiffpaibjejninonhbpno";

export const Route = createFileRoute("/extension")({
  component: ExtensionGuidePage,
});

const guideSteps = [
  {
    title: "Chrome 웹스토어에서 설치",
    description:
      "설치 버튼을 눌러 Chrome 웹스토어의 Pickle 상세 페이지로 이동한 뒤 브라우저에 추가합니다.",
    actionLabel: "Chrome 웹스토어에서 설치",
    actionHref: extensionInstallUrl,
  },
  {
    title: "브라우저 툴바에 고정",
    description:
      "Chrome 우측 상단의 확장 프로그램 아이콘을 열고 Pickle 옆 핀을 눌러 항상 보이게 둡니다.",
  },
  {
    title: "Pickle 팝업에서 로그인",
    description:
      "툴바의 Pickle 아이콘을 눌러 Google 계정을 연결하면 저장한 항목이 대시보드와 동기화됩니다.",
  },
  {
    title: "웹에서 바로 저장",
    description:
      "웹 페이지를 보다가 텍스트, 이미지, 북마크, 화면 캡처를 저장하면 대시보드 Inbox에 모입니다.",
  },
];

const saveTypes = [
  ["텍스트", "선택한 문장과 메모를 저장합니다."],
  ["이미지", "웹 페이지 이미지를 원본 출처와 함께 저장합니다."],
  ["북마크", "현재 페이지 링크와 제목 정보를 저장합니다."],
  ["화면 캡처", "필요한 화면 영역을 이미지로 저장합니다."],
];

const shortcuts = [
  { label: "북마크", mac: "Cmd+Option+F", windows: "Ctrl+Shift+F" },
  { label: "화면 캡처", mac: "Cmd+Option+E", windows: "Ctrl+Shift+E" },
  { label: "텍스트", mac: "Cmd+Option+S", windows: "Ctrl+Shift+S" },
];

function ExtensionGuidePage() {
  return (
    <div className="h-full overflow-auto bg-base-background">
      <div className="mx-auto flex w-full max-w-[880px] flex-col px-8 py-10">
        <header className="flex flex-col gap-5 border-base-border border-b pb-8">
          <div className="flex size-12 items-center justify-center rounded-[8px] bg-base-primary text-black">
            <Icon name="download_16" />
          </div>
          <div>
            <h1 className="font-bold text-3xl text-base-foreground">
              Pickle Chrome 익스텐션 설치 가이드
            </h1>
            <p className="mt-2 max-w-[640px] text-base-muted text-sm leading-[1.6]">
              설치부터 첫 저장까지 위에서 아래로 따라가면 됩니다. Pickle은
              브라우저에서 발견한 텍스트, 이미지, 북마크, 화면 캡처를 저장하고
              이 대시보드의 Inbox로 동기화합니다.
            </p>
          </div>
        </header>

        <section className="flex flex-col gap-4 py-8">
          {guideSteps.map((step, index) => (
            <article
              key={step.title}
              className="grid gap-4 rounded-[8px] border border-base-border bg-base-foreground-background p-5 sm:grid-cols-[56px_1fr]"
            >
              <span className="flex size-10 items-center justify-center rounded-[8px] bg-base-primary/15 font-bold text-base-primary text-sm">
                0{index + 1}
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-base-foreground text-lg">
                  {step.title}
                </h2>
                <p className="mt-2 text-base-muted text-sm leading-[1.55]">
                  {step.description}
                </p>
                {step.actionHref ? (
                  <a
                    href={step.actionHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-base-primary px-4 font-bold text-black text-sm transition-opacity hover:opacity-90"
                  >
                    <Icon name="download_16" className="size-4" />
                    {step.actionLabel}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <section className="border-base-border border-t py-8">
          <h2 className="font-bold text-base-foreground text-xl">
            저장할 수 있는 것
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {saveTypes.map(([title, description]) => (
              <div
                key={title}
                className="rounded-[8px] border border-base-border bg-base-foreground-background px-5 py-4"
              >
                <h3 className="font-bold text-base-foreground text-sm">
                  {title}
                </h3>
                <p className="mt-1 text-base-muted text-sm leading-[1.5]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-base-border border-t py-8">
          <h2 className="font-bold text-base-foreground text-xl">
            기본 단축키
          </h2>
          <p className="mt-2 text-base-muted text-sm leading-[1.55]">
            웹 대시보드는 안내만 제공합니다. 단축키 변경은 Pickle 익스텐션
            팝업의 설정에서 가능합니다.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.label}
                className="rounded-[8px] border border-base-border bg-base-foreground-background px-5 py-4"
              >
                <span className="font-medium text-base-foreground text-sm">
                  {shortcut.label}
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <kbd className="rounded-[4px] border border-base-border px-2 py-1 font-semibold text-base-foreground text-xs">
                    macOS: {shortcut.mac}
                  </kbd>
                  <kbd className="rounded-[4px] border border-base-border px-2 py-1 font-semibold text-base-foreground text-xs">
                    Windows/Linux: {shortcut.windows}
                  </kbd>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
