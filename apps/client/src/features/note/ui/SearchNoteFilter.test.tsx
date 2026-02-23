import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// 하위 폴더/태그 데이터를 조회하는 훅들을 미리 모킹합니다 (UI 테스트이므로 데이터만 집중)
vi.mock("../model/useSearchNoteFilter", () => ({
  useSearchNoteFilter: vi.fn(() => ({
    tags: [{ id: "t-1", name: "React", style: "blue" }],
    folderOptions: [
      { value: "all", label: "All Folders" },
      { value: "f-1", label: "My Note" },
    ],
    filteredTags: [{ id: "t-1", name: "React", style: "blue" }],
    tagFilterOpen: false,
    setTagFilterOpen: vi.fn(),
    search: "",
    setSearch: vi.fn(),
    handleTagToggle: vi.fn(),
  })),
}));

// =========================================================================
// @pickle/ui가 내부적으로 react-dom hook(ex: useMemo)을 호출할 때 발생하는
// 모노레포 환경 React 중복 로드 / 버전 충돌(Invalid hook call) 이슈를 회피하기 위해
// 해당 테스트 컨텍스트에서만 @pickle/ui를 "가장 단순한 껍데기"로 Mock 처리합니다.
// =========================================================================
vi.mock("@pickle/ui", async (_importOriginal) => {
  return {
    // 실제 컴포넌트는 가져오지 않음
    Select: ({ value, placeholder }: any) => (
      <div data-testid="mock-select">{value || placeholder}</div>
    ),
    // Dropdown 오픈 상태(tagFilterOpen)와 상관없이 외부(테스트)에서 onClick 호출이 가능하도록 강제 바인딩
    // 실제 컴포넌트는 DropdownMenu(open, onOpenChange) -> DropdownMenuTrigger(asChild) 구조임.
    // 테스트 코드에서 user.click(화면의 태그버튼) 할 때 트리거가 동작하도록 아래처럼 묶어줌.
    DropdownMenu: ({ children, open, onOpenChange }: any) => {
      // 트리거 요소(DropdownMenuTrigger) 렌더링 시 자식에게 onClick 주입을 피할 수 없는 구조이므로,
      // 이 최상단 Wrapper에서 하위로 onOpenChange 전파용 캡처를 둡니다.
      return (
        <div
          data-testid="mock-dropdown"
          onClickCapture={() => onOpenChange?.(!open)}
        >
          {children}
        </div>
      );
    },
    DropdownMenuTrigger: ({ children }: any) => {
      return <div data-testid="mock-dropdown-trigger">{children}</div>;
    },
    DropdownMenuContent: ({ children }: any) => (
      <div data-testid="mock-dropdown-content">{children}</div>
    ),
    DropdownMenuLabel: ({ children }: any) => (
      <div data-testid="mock-dropdown-label">{children}</div>
    ),
    ScrollArea: ({ children }: any) => (
      <div data-testid="mock-scroll-area">{children}</div>
    ),
    Input: (props: any) => <input data-testid="mock-input" {...props} />,
    UtilButton: ({ children, onClick }: any) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    TAG_VARIANTS: {
      blue: { tagColor: "bg-blue-100", buttonColor: "text-blue-500" },
    }, // mock constants
  };
});

vi.mock("@pickle/icons", () => ({
  Icon: () => <svg data-testid="mock-icon" />,
}));

// Radix UI Select, DropdownMenu (JSDOM 환경에서 PointerEvent/hasPointerCapture 오류 해결)
if (!globalThis.PointerEvent) {
  // @ts-expect-error
  globalThis.PointerEvent = class PointerEvent extends MouseEvent {};
}
globalThis.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
globalThis.HTMLElement.prototype.setPointerCapture = vi.fn();
globalThis.HTMLElement.prototype.releasePointerCapture = vi.fn();

import { useSearchNoteFilter } from "../model/useSearchNoteFilter";
import { SearchNoteFilter } from "./SearchNoteFilter";

describe("SearchNoteFilter", () => {
  const defaultProps = {
    selectedType: "all",
    onTypeChange: vi.fn(),
    selectedFolderId: "all",
    onFolderChange: vi.fn(),
    selectedTagIds: [],
    onTagsChange: vi.fn(),
    sort: "latest" as const,
    onSortChange: vi.fn(),
    totalCount: 5,
    query: "테스트",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("초기 렌더링 시 넘겨받은 query와 totalCount가 화면에 올바르게 표시되어야 한다", () => {
    render(<SearchNoteFilter {...defaultProps} />);

    // "테스트" 검색 결과 (5) 텍스트가 화면에 노출되어야 한다.
    expect(screen.getByText(/"테스트" 검색 결과 \(5\)/)).toBeInTheDocument();

    // 우측 총 카운트 텍스트도 노출되어야 한다.
    expect(screen.getByText("총 5개")).toBeInTheDocument();
  });

  it("정렬 버튼 클릭 시 onSortChange가 반대 인스턴스('oldest') 로 호출되어야 한다", async () => {
    const user = userEvent.setup();
    render(<SearchNoteFilter {...defaultProps} sort="latest" />);

    // 최신순 버튼(정렬 버튼)을 찾아서 클릭
    const sortBtn = screen.getByRole("button", { name: /최신순/ });
    await user.click(sortBtn);

    // 반대 정렬 키인 'oldest'로 호출되었는지 확인
    expect(defaultProps.onSortChange).toHaveBeenCalledWith("oldest");
  });

  it("태그 선택 드롭다운 버튼을 클릭하면 setTagFilterOpen 이 올바르게 호출되어야 한다", async () => {
    const setTagFilterOpenMock = vi.fn();

    // mock 구현체를 임시로 덮어씌움
    vi.mocked(useSearchNoteFilter).mockReturnValueOnce({
      tags: [],
      folderOptions: [],
      filteredTags: [],
      tagFilterOpen: false,
      setTagFilterOpen: setTagFilterOpenMock,
      search: "",
      setSearch: vi.fn(),
      handleTagToggle: vi.fn(),
    });

    const user = userEvent.setup();
    render(<SearchNoteFilter {...defaultProps} />);

    const tagFilterBtn = screen.getByRole("button", { name: /태그선택/ });
    await user.click(tagFilterBtn);

    // Dropdown 오픈 상태가 토글되도록 콜백 로직이 실행되었는지(zustand/state hook trigger) 검증
    expect(setTagFilterOpenMock).toHaveBeenCalled();
  });
});
