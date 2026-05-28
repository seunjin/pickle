import type { Metadata } from "next";
import Link from "next/link";

const extensionInstallUrl =
  process.env.NEXT_PUBLIC_EXTENSION_INSTALL_URL ||
  "https://chromewebstore.google.com/detail/pickle/fpcppclijlpdiffpaibjejninonhbpno";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.pic-kle.io";

export const metadata: Metadata = {
  title: "익스텐션 설치 | Pickle",
  description: "Pickle 브라우저 익스텐션을 설치하고 웹 콘텐츠를 저장하세요.",
};

const guideSteps = [
  {
    title: "Chrome 웹스토어에서 설치",
    description:
      "설치 버튼을 눌러 Pickle 상세 페이지로 이동한 뒤 Chrome 브라우저에 추가합니다.",
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

const captureTypes = [
  ["텍스트", "선택한 문장과 메모"],
  ["이미지", "웹 페이지 이미지"],
  ["북마크", "현재 페이지 링크"],
  ["화면 캡처", "필요한 화면 영역"],
];

export default function ExtensionGuidePage() {
  return (
    <div className="effect-bg min-h-dvh px-6 py-8 text-white">
      <main className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-[920px] flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-[8px] bg-base-primary">
              <img src="/symbol-black.svg" alt="Pickle" className="w-4.5" />
            </span>
            <span className="font-bold text-lg">Pickle</span>
          </Link>
          <Link
            href={appUrl}
            className="font-medium text-[14px] text-base-muted-foreground transition-colors hover:text-base-primary"
          >
            대시보드
          </Link>
        </header>

        <section className="flex flex-col gap-7 border-white/10 border-b py-14 md:py-18">
          <div className="flex size-16 items-center justify-center rounded-[14px] bg-base-primary">
            <img
              src="/android-chrome-192x192.png"
              alt="Pickle extension"
              className="size-11 rounded-[8px]"
            />
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-semibold text-base-primary text-sm">
              Chrome Extension Guide
            </p>
            <h1 className="font-bold text-[40px] leading-[1.12] md:text-[56px]">
              Pickle 익스텐션
              <br />
              설치부터 첫 저장까지
            </h1>
            <p className="max-w-[680px] text-[18px] text-gray-300 leading-[1.55]">
              처음 들어온 사용자도 위에서 아래로 따라가면 됩니다. Pickle은 웹
              페이지를 보다가 필요한 텍스트, 이미지, 북마크, 화면 캡처를
              저장하고 대시보드에서 다시 정리하는 Chrome 익스텐션입니다.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={extensionInstallUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 items-center justify-center rounded-[8px] bg-base-primary px-6 font-bold text-black transition-opacity hover:opacity-90"
            >
              Chrome 웹스토어에서 설치
            </a>
            <Link
              href={`${appUrl}/signup`}
              className="flex h-12 items-center justify-center rounded-[8px] border border-white/15 px-6 font-bold text-white transition-colors hover:border-base-primary hover:text-base-primary"
            >
              계정 만들기
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-white/10 border-b py-10">
          {guideSteps.map((step, index) => (
            <article
              key={step.title}
              className="grid gap-4 rounded-[8px] border border-white/10 bg-white/[0.04] p-5 sm:grid-cols-[56px_1fr]"
            >
              <span className="flex size-10 items-center justify-center rounded-[8px] bg-base-primary/15 font-bold text-base-primary text-sm">
                0{index + 1}
              </span>
              <div>
                <h2 className="font-bold text-[18px]">{step.title}</h2>
                <p className="mt-2 text-gray-400 text-sm leading-[1.55]">
                  {step.description}
                </p>
                {step.actionHref ? (
                  <a
                    href={step.actionHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-[8px] bg-base-primary px-4 font-bold text-black text-sm transition-opacity hover:opacity-90"
                  >
                    {step.actionLabel}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <section className="py-10">
          <h2 className="font-bold text-[24px]">저장할 수 있는 것</h2>
          <div className="mt-5 flex flex-col gap-3">
            {captureTypes.map(([type, description]) => (
              <div
                key={type}
                className="rounded-[8px] border border-white/10 bg-white/[0.04] px-5 py-4"
              >
                <p className="font-bold text-[15px]">{type}</p>
                <p className="mt-1 text-gray-400 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
