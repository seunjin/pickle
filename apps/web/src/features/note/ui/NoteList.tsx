"use client";
import { toast } from "@pickle/lib";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { deleteNote as deleteNoteApi } from "../api/deleteNote";
import { noteKeys, noteQueries } from "../model/noteQueries";
import { NoteCard } from "./NoteCard";

export function NoteList() {
  const queryClient = useQueryClient();

  // 1. Fetch Data (Suspense)
  const { data: notes } = useSuspenseQuery(noteQueries.all());

  // 2. Mutation (Delete)
  const { mutate: deleteNote } = useMutation({
    mutationFn: (id: string) => deleteNoteApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });

  if (notes.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No notes yet.</p>
        <p className="text-sm">Create a note from the extension!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={deleteNote} />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2 rounded-xl border border-gray-200 border-dashed p-6">
        <h3 className="mb-2 w-full font-semibold text-gray-700 text-sm">
          Toast 시스템 데모
        </h3>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-700 text-sm transition-colors hover:bg-emerald-100"
          onClick={() => toast.success("성공적으로 저장되었습니다!")}
        >
          Success
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-700 text-sm transition-colors hover:bg-red-100"
          onClick={() =>
            toast.error("오류가 발생했습니다.", {
              description: "잠시 후 다시 시도해주세요.",
            })
          }
        >
          Error
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 font-medium text-blue-700 text-sm transition-colors hover:bg-blue-100"
          onClick={() => toast.info("새로운 알림이 있습니다.")}
        >
          Info
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 font-medium text-indigo-700 text-sm transition-colors hover:bg-indigo-100"
          onClick={() => {
            const id = toast.loading("동기화 중...");
            setTimeout(() => toast.dismiss(id), 2000);
          }}
        >
          Loading (2s)
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 font-medium text-sm text-white transition-opacity hover:opacity-90"
          onClick={() => {
            toast.undo({
              title: "노트가 삭제되었습니다",
              description: "실수로 삭제하셨나요? 지금 바로 복구하세요.",
              actionLabel: "실행 취소",
              onUndo: async () => {
                // 비동기 복구 시뮬레이션
                await new Promise((resolve) => setTimeout(resolve, 1500));
              },
              onUndoSuccessTitle: "노트가 성공적으로 복구되었습니다!",
            });
          }}
        >
          Undo 실습 (자동 전환)
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-600 text-sm transition-colors hover:bg-gray-50"
          onClick={() => toast.clearAll()}
        >
          Clear All
        </button>
      </div>
    </>
  );
}
