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

const steps = [
  {
    title: "익스텐션 설치",
    description: "Chrome 또는 Whale 브라우저에 Pickle을 추가합니다.",
  },
  {
    title: "Google 계정 연결",
    description: "익스텐션 팝업에서 로그인하면 대시보드와 자동 동기화됩니다.",
  },
  {
    title: "웹에서 바로 저장",
    description:
      "텍스트, 이미지, 북마크, 화면 캡처를 현재 페이지에서 저장합니다.",
  },
];

const captureTypes = ["텍스트", "이미지", "북마크", "화면 캡처"];

export default function ExtensionGuidePage() {
  return (
    <div className="effect-bg min-h-dvh px-6 py-8 text-white">
      <main className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-[1040px] flex-col">
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

        <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1fr_420px]">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-4">
              <p className="font-semibold text-base-primary text-sm">
                Browser Extension
              </p>
              <h1 className="font-bold text-[40px] leading-[1.12] md:text-[56px]">
                웹에서 발견한 것을
                <br />
                바로 피클에 저장하세요.
              </h1>
              <p className="max-w-[620px] text-[18px] text-gray-300 leading-[1.55]">
                Pickle은 브라우저 익스텐션으로 작동합니다. 웹 페이지를 보다가
                필요한 텍스트, 이미지, 북마크, 화면 캡처를 저장하고 대시보드에서
                다시 정리할 수 있습니다.
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

            <div className="grid gap-3 pt-3 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"
                >
                  <span className="text-base-primary text-sm">
                    0{index + 1}
                  </span>
                  <h2 className="mt-2 font-bold text-[16px]">{step.title}</h2>
                  <p className="mt-2 text-gray-400 text-sm leading-[1.45]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[8px] border border-white/10 bg-neutral-950/70 p-5 shadow-2xl">
            <div className="mb-5 flex items-center gap-3 border-white/10 border-b pb-4">
              <img
                src="/android-chrome-192x192.png"
                alt="Pickle extension"
                className="size-11 rounded-[8px]"
              />
              <div>
                <p className="font-bold">Pickle Extension</p>
                <p className="text-gray-500 text-sm">Chrome · Whale</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {captureTypes.map((type) => (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-[6px] bg-white/[0.04] px-4 py-3"
                >
                  <span className="font-medium text-sm">{type}</span>
                  <span className="text-base-primary text-xs">Save</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-gray-500 text-sm leading-[1.5]">
              저장된 항목은 대시보드 Inbox로 동기화됩니다. 태그와 폴더는
              대시보드에서 정리하세요.
            </p>
          </aside>
        </section>
      </main>
    </div>
  );
}
