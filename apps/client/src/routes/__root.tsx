import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { Icon } from "@pickle/icons";
import { ScrollArea, Spinner } from "@pickle/ui";
import {
  createRootRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect, useState } from "react";
import { useUser } from "@/features/auth/model/useUser";
import { SidebarWrapper } from "@/features/layout/sidebar/SidebarWrapper";
import { AppHeader } from "@/features/layout/ui/AppHeader";
import { useDeleteNoteMutation } from "@/features/note/model/useDeleteNoteMutation";
import { useUpdateNoteMutation } from "@/features/note/model/useUpdateNoteMutation";
import { logger } from "@/shared/lib/logger";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, appUser, isLoading } = useUser();
  const updateNoteMutation = useUpdateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();
  // 단순 string ID가 아니라 드래그된 노트의 상세 정보(주로 title)를 가지도록 변경
  const [activeNote, setActiveNote] = useState<NoteWithAsset | null>(null);

  // 드래그 앤 드롭 센서 설정 (포인터: 마우스/터치)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px 이상 이동 시 드래그 시작 (클릭과 구분)
      },
    }),
  );

  const handleDragStart = (event: any) => {
    // event.active.data.current에 원본 note 객체를 담아 보내도록 (NoteCard에서 세팅 필요)
    if (event.active.data.current?.note) {
      setActiveNote(event.active.data.current.note);
    }
  };

  const handleDragEnd = (event: any) => {
    setActiveNote(null);
    const { active, over } = event;

    // 타겟(폴더)가 없거나 자신에게 드롭한 경우 무시
    if (!over || active.id === over.id) return;

    // active.id = 드래그된 노트 id
    // over.id = 드롭된 폴더 id
    const noteId = String(active.id);
    const destinationId = String(over.id);

    // 1. 휴지통으로 이동 (삭제)
    if (destinationId === "trash") {
      deleteNoteMutation.mutate(noteId);
      return;
    }

    // 2. 인박스 또는 폴더로 이동 (복구 로직 포함)
    const isRestoring = !!activeNote?.deleted_at;
    const targetFolderId = destinationId === "inbox" ? null : destinationId;

    updateNoteMutation.mutate(
      {
        noteId,
        payload: {
          folder_id: targetFolderId,
          // 휴지통에 있던 노트를 꺼낼 때는 deleted_at을 null로 처리하여 복구합니다.
          ...(isRestoring ? { deleted_at: null } : {}),
        },
      },
      {
        onError: (error) => {
          logger.error("Failed to move note", {
            error,
            noteId,
            destinationId,
          });
        },
      },
    );
  };

  // 로그인/회원가입/동기화/관리자 페이지는 메인 레이아웃 제외
  const isAuthPage =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth/");

  // Admin은 자체 레이아웃(사이드바)을 가지므로 메인 레이아웃 제외
  const isAdminPage = pathname.startsWith("/admin");

  // 1. AuthGuard 전역 통합 로직
  useEffect(() => {
    if (!isLoading && !isAuthPage && !isAdminPage) {
      if (!user) {
        navigate({ to: "/signin", replace: true });
        return;
      }

      if (!appUser || appUser.status !== "active") {
        navigate({
          to: "/signup",
          search: { reason: "no_profile" },
          replace: true,
        });
        return;
      }
    }
  }, [user, appUser, isLoading, navigate, isAuthPage, isAdminPage]);

  if (isAuthPage || isAdminPage) {
    return (
      <>
        <Outlet />
        {import.meta.env.DEV && (
          <TanStackRouterDevtools initialIsOpen={false} />
        )}
      </>
    );
  }

  // 로딩 중이거나 미인증/미승인 상태일 때 레이아웃 완전 차단
  if (isLoading || !user || appUser?.status !== "active") {
    return (
      <div className="effect-bg flex h-dvh flex-col items-center justify-center bg-base-background">
        <Spinner className="size-8 text-base-primary" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart: () => "",
          onDragMove: () => "",
          onDragOver: () => "",
          onDragEnd: () => "",
          onDragCancel: () => "",
        },
        screenReaderInstructions: {
          draggable: "",
        },
      }}
    >
      <div className="flex h-dvh bg-base-background text-base-foreground">
        <aside className="h-full w-75 shrink-0 border-base-border border-r">
          <SidebarWrapper />
        </aside>
        <div className="grid flex-1 grid-rows-[auto_1fr]">
          <AppHeader />
          <main className="overflow-auto">
            <ScrollArea className="h-full">
              <div className="h-[calc(100dvh-var(--web-header-height))] p-10">
                <Outlet />
              </div>
            </ScrollArea>
          </main>
        </div>
        {import.meta.env.DEV && (
          <TanStackRouterDevtools initialIsOpen={false} />
        )}
      </div>
      <DragOverlay zIndex={9999} modifiers={[snapCenterToCursor]}>
        {activeNote ? (
          <div className="flex h-[28px] max-w-[200px] items-center gap-1.5 rounded-md border border-base-border-light bg-neutral-800 px-2.5 font-medium text-white text-xs opacity-90 shadow-xl">
            <Icon name="document_16" className="size-3.5 shrink-0 opacity-80" />
            <span className="truncate">{activeNote.title || "새 노트"}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
