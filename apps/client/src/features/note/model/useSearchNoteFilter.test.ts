import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSearchNoteFilter } from "./useSearchNoteFilter";

// --- Mocking ---

// 1. Session Provider Mock (Zustand 등 컨텍스트 의존성 해제)
vi.mock("@/features/auth/model/SessionContext", () => ({
  useSessionContext: () => ({
    workspace: { id: "workspace-123" },
  }),
}));

// 2. React Query Mock (useQuery 훅 가로채기)
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    queryOptions: vi.fn((options) => options), // queryOptions는 주어진 인자를 그대로 반환하도록 목킹
    useQuery: vi.fn((options) => {
      // options.queryKey 에 따라 폴더인지 태그인지 구분하여 모의 응답 데이터 반환
      const queryKeyStr = JSON.stringify(options.queryKey || []);

      if (queryKeyStr.includes("folder")) {
        return {
          data: [
            { id: "f-1", name: "Work" },
            { id: "f-2", name: "Personal" },
          ],
        };
      }

      if (queryKeyStr.includes("tag")) {
        return {
          data: [
            { id: "t-1", name: "React", style: "blue" },
            { id: "t-2", name: "Vue", style: "green" },
            { id: "t-3", name: "TypeScript", style: "blue" },
          ],
        };
      }
      return { data: [] };
    }),
  };
});

// 3. Supabase Client Mock (실제 DB 연결 방지)
vi.mock("@/shared/lib/supabase", () => ({
  createClient: vi.fn(),
}));

describe("useSearchNoteFilter 훅 단위 테스트", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("초기 렌더링 시 폴더 옵션(All Folders, Inbox 기본 + 쿼리 응답)이 올바르게 조합되어야 한다", () => {
    // onTagsChange 콜백 등 필수 prop 전달
    const props = { selectedTagIds: [], onTagsChange: vi.fn() };
    const { result } = renderHook(() => useSearchNoteFilter(props));

    // useSearchNoteFilter 훅 내부의 useMemo 로직 검증: All Folders, Inbox, Work, Personal 총 4개여야 함
    expect(result.current.folderOptions).toEqual([
      { value: "all", label: "All Folders" },
      { value: "inbox", label: "Inbox" },
      { value: "f-1", label: "Work" },
      { value: "f-2", label: "Personal" },
    ]);
  });

  it("검색어(search)를 입력하면 filteredTags에 검색어와 일치하는 태그만 남아야 한다", () => {
    const props = { selectedTagIds: [], onTagsChange: vi.fn() };
    const { result } = renderHook(() => useSearchNoteFilter(props));

    // 검색 전 초기 상태: 3개 모두 존재
    expect(result.current.filteredTags).toHaveLength(3);

    // 검색어 변경 동작 모의 (act 사용 필수)
    act(() => {
      result.current.setSearch("react");
    });

    // 검색어 "react" 에 일치하는 "React" 태그 1개만 남아있어야 함
    expect(result.current.filteredTags).toEqual([
      { id: "t-1", name: "React", style: "blue" },
    ]);
  });

  it("선택되지 않은 태그를 클릭하면 onTagsChange에 기존 배열 + 클릭한 태그 ID 가 포함되어 호출되어야 한다", () => {
    const onTagsChangeMock = vi.fn();
    // 현재 "t-1" 만 선택된 상태라고 가정
    const props = { selectedTagIds: ["t-1"], onTagsChange: onTagsChangeMock };
    const { result } = renderHook(() => useSearchNoteFilter(props));

    act(() => {
      result.current.handleTagToggle("t-2");
    });

    // onTagsChange가 불리면서 t-2 가 추가된 배열이 넘어가야 함
    expect(onTagsChangeMock).toHaveBeenCalledWith(["t-1", "t-2"]);
  });

  it("이미 선택된 태그를 다시 클릭하면 배열에서 해당 ID가 제외된 채 onTagsChange가 호출되어야 한다", () => {
    const onTagsChangeMock = vi.fn();
    // 현재 "t-1", "t-3" 가 선택된 상태라고 가정
    const props = {
      selectedTagIds: ["t-1", "t-3"],
      onTagsChange: onTagsChangeMock,
    };
    const { result } = renderHook(() => useSearchNoteFilter(props));

    act(() => {
      // t-1 다시 클릭하여 토글 해제 기능 실행
      result.current.handleTagToggle("t-1");
    });

    // t-1이 빠지고 t-3 만 남은 상태로 호출되어야 함
    expect(onTagsChangeMock).toHaveBeenCalledWith(["t-3"]);
  });
});
