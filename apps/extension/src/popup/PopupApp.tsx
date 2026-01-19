import {
  IconBookmark20,
  IconCapture16,
  IconDocument16,
  IconPlus20,
  IconSetting20,
} from "@pickle/icons";
import { Button } from "@pickle/ui";
import { useSession } from "@shared/hooks/useSession";
import { extensionRuntime, extensionTabs } from "@shared/lib/extension-api";
import { useEffect, useState } from "react";
import { SettingsPanel } from "./components/SettingsPanel";

type ViewType = "main" | "settings";

export function PopupApp() {
  const { isLoggedIn } = useSession();
  const [view, setView] = useState<ViewType>("main");
  const [selectedText, setSelectedText] = useState<string>("");
  const [showImageGuide, setShowImageGuide] = useState(false);

  // 관련 탭에서 선택된 텍스트 가져오기
  useEffect(() => {
    if (isLoggedIn) {
      extensionTabs.getCurrentActiveTab((tab) => {
        if (!tab?.id) return;
        extensionRuntime.sendMessage(
          { action: "GET_SELECTION", tabId: tab.id },
          // biome-ignore lint/suspicious/noExplicitAny: internal message response
          (response: any) => {
            if (response?.text) {
              setSelectedText(response.text);
            }
          },
        );
      });
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    extensionRuntime.sendMessage({ action: "LOGIN" });
  };

  const handleLogout = () => {
    extensionRuntime.sendMessage({ action: "LOGOUT" });
    setView("main");
  };

  const handleOpenDashboard = () => {
    const appUrl =
      import.meta.env.NEXT_PUBLIC_APP_URL || "https://picklenote.vercel.app";
    extensionRuntime.openTab(appUrl);
  };

  const startAction = (mode: "text" | "bookmark" | "capture" | "image") => {
    if (mode === "image") {
      setShowImageGuide(true);
      return;
    }

    if (mode === "bookmark") {
      extensionRuntime.sendMessage({ action: "RUN_BOOKMARK_FLOW" }, () => {
        extensionRuntime.closePopup();
      });
      return;
    }

    if (mode === "capture") {
      extensionRuntime.sendMessage({ action: "RUN_CAPTURE_FLOW" }, () => {
        extensionRuntime.closePopup();
      });
      return;
    }

    extensionTabs.getCurrentActiveTab(async (tab) => {
      if (!tab?.id) return;

      // 액션에 필요한 초기 데이터 설정
      // biome-ignore lint/suspicious/noExplicitAny: generic note data
      const noteData: any = {
        url: tab.url,
        timestamp: Date.now(),
        mode: mode,
      };

      if (mode === "text") {
        noteData.text = selectedText;
      }

      // 1. 스토리지에 데이터 저장 (Background 행)
      extensionRuntime.sendMessage(
        {
          action: "SAVE_TO_STORAGE",
          tabId: tab.id,
          data: noteData,
        },
        () => {
          // 2. 저장 완료 후 오버레이 열기 메시지 전송 (Background Proxy 활용)
          extensionRuntime.sendMessage(
            {
              action: "OPEN_OVERLAY",
              mode: mode,
              tabId: tab.id,
            },
            () => {
              // 처리가 완료된 후 팝업 닫기
              setTimeout(() => {
                extensionRuntime.closePopup();
              }, 100);
            },
          );
        },
      );
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-[400px] w-[320px] flex-col items-center justify-center bg-neutral-900 p-6 text-center text-white">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-2xl shadow-indigo-600/20 shadow-lg">
            P
          </div>
          <h1 className="font-bold text-xl tracking-tight">Pickle</h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            웹의 영감을 쉽고 빠르게
            <br />
            기본적인 로그인이 필요합니다.
          </p>
        </div>
        <Button
          className="w-full shadow-indigo-600/10 shadow-lg"
          onClick={handleLogin}
        >
          시작하기 (구글 로그인)
        </Button>
      </div>
    );
  }

  if (view === "settings") {
    return (
      <div className="h-[400px] w-[320px]">
        <SettingsPanel onBack={() => setView("main")} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="relative flex h-[400px] w-[320px] flex-col bg-neutral-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 font-bold text-xs uppercase">
            P
          </div>
          <span className="font-bold text-sm tracking-tight opacity-90">
            Pickle
          </span>
        </div>
        <button
          type="button"
          onClick={() => setView("settings")}
          className="rounded-lg p-1.5 transition-all hover:bg-neutral-800"
        >
          <IconSetting20 className="text-neutral-400" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="px-5 py-4">
        <h2 className="mb-1 font-bold text-lg leading-tight">
          무엇을 기록할까요?
        </h2>
        <p className="text-neutral-400 text-xs">
          수집하고 싶은 영감을 선택하세요.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid flex-1 grid-cols-2 gap-3 px-5 pb-5">
        <ToolButton
          icon={<IconDocument16 className="text-blue-400" />}
          label="텍스트 저장"
          onClick={() => startAction("text")}
          active={!!selectedText}
          description={
            selectedText ? "선택된 텍스트 있음" : "드래그한 내용 저장"
          }
        />
        <ToolButton
          icon={<IconPlus20 className="text-orange-400" />}
          label="이미지 저장"
          onClick={() => startAction("image")}
          description="웹 이미지 보관"
        />
        <ToolButton
          icon={<IconBookmark20 className="text-green-400" />}
          label="북마크"
          onClick={() => startAction("bookmark")}
          description="현재 페이지 링크"
        />
        <ToolButton
          icon={<IconCapture16 className="text-purple-400" />}
          label="화면 캡처"
          onClick={() => startAction("capture")}
          description="원하는 영역 캡처"
        />
      </div>

      {/* Footer Info */}
      <div className="border-neutral-900 border-t bg-neutral-950 px-5 py-3">
        <button
          type="button"
          onClick={handleOpenDashboard}
          className="flex w-full items-center justify-between rounded-lg bg-neutral-900 px-3 py-2 text-neutral-400 text-xs transition-colors hover:bg-neutral-800"
        >
          <span>내 라이브러리 가기</span>
          <span className="opacity-50">→</span>
        </button>
      </div>

      {/* Image Saving Guide Overlay */}
      {showImageGuide && (
        <div className="fade-in absolute inset-0 z-50 flex animate-in items-center justify-center bg-black/80 p-6 text-center duration-200">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-400/20 text-orange-400">
              <IconPlus20 />
            </div>
            <div>
              <h3 className="mb-2 font-bold text-lg">이미지 저장 방법</h3>
              <p className="px-2 text-neutral-400 text-sm leading-relaxed">
                웹페이지의 이미지 위에서 <br />
                <span className="font-semibold text-white underline underline-offset-4">
                  마우스 우클릭
                </span>{" "}
                후 <br />
                <span className="text-indigo-400">'Pickle에 이미지 저장'</span>
                을 <br />
                선택해 주세요.
              </p>
            </div>
            <Button
              variant="secondary"
              className="mt-2 w-full"
              onClick={() => setShowImageGuide(false)}
            >
              확인했어요
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  description: string;
}

function ToolButton({
  icon,
  label,
  onClick,
  active,
  description,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${
        active
          ? "border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20"
          : "border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800"
      }`}
    >
      <div
        className={`rounded-lg bg-neutral-950 p-2 shadow-sm transition-transform group-hover:scale-110 ${active ? "bg-indigo-500/10" : ""}`}
      >
        {icon}
      </div>
      <div>
        <div className="mb-1 font-bold text-[13px] leading-none">{label}</div>
        <div className="line-clamp-1 text-[10px] text-neutral-500 leading-tight">
          {description}
        </div>
      </div>
    </button>
  );
}
