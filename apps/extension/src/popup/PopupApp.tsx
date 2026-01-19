import { Button } from "@pickle/ui";
import { extensionRuntime } from "@shared/lib/extension-api";

export function PopupApp() {
  const handleOpenDashboard = () => {
    const appUrl =
      import.meta.env.NEXT_PUBLIC_APP_URL || "https://picklenote.vercel.app";
    extensionRuntime.openTab(appUrl);
  };

  return (
    <div className="flex h-[400px] w-[320px] flex-col items-center justify-center bg-neutral-900 p-6 text-white">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-2xl">
          P
        </div>
        <h1 className="font-bold text-xl">Pickle</h1>
        <p className="text-center text-neutral-400 text-sm">
          웹의 영감을 쉽고 빠르게
          <br />
          기록하고 보관하세요.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Button className="w-full" onClick={handleOpenDashboard}>
          대시보드 열기
        </Button>
        <p className="mt-4 text-center text-[11px] text-neutral-600">
          우클릭 메뉴나 단축키(Ctrl+Shift+E)를 통해
          <br />
          언제든 노트를 캡처할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
