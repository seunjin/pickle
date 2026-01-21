import { Icon } from "@pickle/icons";
import { Button } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useSession } from "@shared/hooks/useSession";
import { extensionRuntime, extensionTabs } from "@shared/lib/extension-api";
import { useEffect, useState } from "react";
import { NoteIcon, type NoteIconType } from "./components/NoteIcon";
import { SettingsPanel } from "./components/SettingsPanel";

type ViewType = "main" | "settings";

export function PopupApp() {
  const { isLoggedIn } = useSession();
  const [view, setView] = useState<ViewType>("main");
  const [selectedText, setSelectedText] = useState<string>("");
  const [showImageGuide, setShowImageGuide] = useState(false);
  const [showTextGuide, setShowTextGuide] = useState(false);

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

    if (mode === "text" && !selectedText) {
      setShowTextGuide(true);
      return;
    }

    extensionTabs.getCurrentActiveTab(async (tab) => {
      if (!tab?.id) return;

      if (mode === "bookmark") {
        extensionRuntime.sendMessage(
          { action: "RUN_BOOKMARK_FLOW", tabId: tab.id },
          () => {
            extensionRuntime.closePopup();
          },
        );
        return;
      }

      if (mode === "capture") {
        extensionRuntime.sendMessage(
          { action: "RUN_CAPTURE_FLOW", tabId: tab.id },
          () => {
            extensionRuntime.closePopup();
          },
        );
        return;
      }

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

  // 인증되지 않은 상태면 로그인 화면 표시
  if (!isLoggedIn) {
    return (
      <PopupContainer>
        <div className="grid h-full grid-rows-[1fr_auto] px-5 py-[70px_24px]">
          <section className="flex flex-col items-center">
            <div className="mb-6 flex size-12 items-center justify-center rounded-[10px] bg-green-400">
              <img src="/symbol-black.svg" alt="pickle" className="size-7" />
            </div>
            <img src="/pickle-text-logo.svg" alt="pickle" className="pb-6" />
            <p className="pb-10 text-center text-[14px] text-neutral-300 leading-[1.4]">
              한 번 보고 지나쳤던 아이디어를 <br />한 곳에 모아두고 언제든 쉽게
              찾아보세요💡
            </p>
            <button
              type="button"
              onClick={handleLogin}
              className="group flex h-12 w-[260px] items-center justify-center gap-1 rounded-full border border-neutral-300 bg-white font-semibold text-[15px] text-neutral-950 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600 disabled:opacity-60"
            >
              <svg className="size-5" viewBox="0 0 24 24" role="img">
                <title>Google Logo</title>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google로 로그인</span>
            </button>
          </section>
          <footer className="text-center font-medium text-[11px] text-white/30">
            ⓒ2026 Pickle. All rights reserved.
          </footer>
        </div>
      </PopupContainer>
    );
  }

  if (view === "settings") {
    return (
      <PopupContainer>
        <SettingsPanel onBack={() => setView("main")} onLogout={handleLogout} />
      </PopupContainer>
    );
  }

  return (
    <PopupContainer className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-6.5">
        <img
          src="/pickle-with-logo.svg"
          alt="pickle"
          className="h-[23px] w-[80px]"
        />
        <button
          type="button"
          onClick={() => setView("settings")}
          className="inline-flex size-6.5 items-center justify-center rounded-sm text-base-muted transition-colors hover:bg-neutral-800 hover:text-neutral-300"
        >
          <Icon name="setting_16" className="text-inherit" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="pb-5">
        <h2 className="pb-1 font-bold text-[18px] text-base-foreground leading-[1.3]">
          어떤 아이디어를 남길까요?
        </h2>
        <p className="text-[13px] text-base-muted-foreground leading-[1.3]">
          지금 저장해두면, 나중에 바로 찾을 수 있어요.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid flex-1 grid-cols-2 gap-1.5 pb-6.5">
        <ToolButton
          icon={"bookmark"}
          label="북마크"
          onClick={() => startAction("bookmark")}
          active={!!selectedText}
          description="현재 페이지 저장"
        />
        <ToolButton
          icon={"image"}
          label="이미지"
          onClick={() => startAction("image")}
          description="웹 이미지 저장"
        />
        <ToolButton
          icon={"capture"}
          label="화면 캡쳐"
          onClick={() => startAction("capture")}
          description="원하는 영역 저장"
        />
        <ToolButton
          icon={"text"}
          label="텍스트 저장"
          onClick={() => startAction("text")}
          description={
            selectedText ? "선택된 텍스트 저장" : "드래그한 내용 저장"
          }
        />
      </div>

      {/* Footer Info */}
      <div className="">
        <Button
          icon="arrow_right_16"
          iconSide="right"
          className="w-full"
          onClick={handleOpenDashboard}
        >
          저장한 아이디어 보러가기
        </Button>
      </div>

      {/* Image Saving Guide Overlay */}
      {showImageGuide && (
        <div className="fade-in absolute inset-0 z-50 flex animate-in items-center justify-center bg-neutral-950/60 p-6 text-center backdrop-blur-sm duration-200">
          <div className="flex flex-col items-center">
            <NoteIcon type="image" className="mb-2.5" />
            <div className="pb-7.5">
              <h3 className="mb-2.5 font-bold text-[18px] leading-[1.3]">
                이미지 저장 방법
              </h3>
              <p className="text-neutral-400 text-sm leading-[1.4]">
                저장하고 싶은{" "}
                <span className="font-semibold text-white">
                  이미지 위에서 마우스 우클릭
                </span>
                후,
                <br />
                <strong className="font-semibold text-base-primary">
                  'PICKLE-이미지 저장하기'
                </strong>
                를 눌러주세요.
              </p>
            </div>

            <div className="flex w-full gap-2">
              <Button
                variant="secondary"
                size={"h32"}
                className="flex-1"
                onClick={() => setShowImageGuide(false)}
              >
                확인
              </Button>
              <Button
                variant="secondary"
                size={"h32"}
                className="flex-1"
                onClick={() => {
                  setShowImageGuide(false);
                  setView("settings");
                }}
              >
                단축키 설정
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Text Selection Guide Overlay */}
      {/* showTextGuide */}
      {showTextGuide && (
        <div className="fade-in absolute inset-0 z-50 flex animate-in items-center justify-center bg-neutral-950/60 p-6 text-center backdrop-blur-sm duration-200">
          <div className="flex flex-col items-center">
            <NoteIcon type="text" className="mb-2.5" />
            <div className="pb-7.5">
              <h3 className="mb-2.5 font-bold text-[18px] leading-[1.3]">
                텍스트 저장 방법
              </h3>
              <p className="text-neutral-400 text-sm leading-[1.4]">
                저장하고 싶은{" "}
                <strong className="font-semibold text-base-primary">
                  텍스트를 드래그(선택)
                </strong>
                하고 <br />
                다시 팝업을 열거나 단축키를 눌러주세요.
              </p>
            </div>
            <div className="flex w-full gap-2">
              <Button
                variant="secondary"
                size={"h32"}
                className="flex-1"
                onClick={() => setShowTextGuide(false)}
              >
                확인
              </Button>
              <Button
                variant="secondary"
                size={"h32"}
                className="flex-1"
                onClick={() => {
                  setShowTextGuide(false);
                  setView("settings");
                }}
              >
                단축키 설정
              </Button>
            </div>
          </div>
        </div>
      )}
    </PopupContainer>
  );
}

interface ToolButtonProps {
  icon: NoteIconType;
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
      className={`group flex flex-col items-start rounded-[10px] border border-base-border bg-neutral-850 p-3 text-left transition-all ${
        active
          ? "border-base-primary/50 bg-base-primary/5"
          : "hover:border-base-border-light hover:bg-neutral-800"
      }`}
    >
      <NoteIcon type={icon} className="mb-4" />
      <div>
        <div className="font-bold text-[13px] text-base-foreground leading-[1.3]">
          {label}
        </div>
        <div
          className={cn(
            "line-clamp-1 text-[12px] text-neutral-500 leading-[1.3]",
            active && "text-base-primary",
          )}
        >
          {description}
        </div>
      </div>
    </button>
  );
}

function PopupContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: HTMLDivElement["className"];
}) {
  return (
    <div
      className={cn(
        "relative h-[420px] w-[360px] bg-base-background shadow-standard",
        className,
      )}
    >
      {children}
    </div>
  );
}
