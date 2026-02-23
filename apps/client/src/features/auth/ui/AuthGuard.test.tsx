import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// 1. 컴포넌트 렌더링 시 의존하는 외부 훅들을 모킹(Mocking)합니다.
// AuthGuard는 내부적으로 `useUser` (Zustand 데이터)와 `useNavigate` (Tanstack Router)를 사용합니다.

// @tanstack/react-router 모킹
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// useUser 모킹
// vi.hoisted를 사용하면 vi.mock 내부에서도 스코프 바깥의 변수를 사용할 수 있습니다.
const mockUseUser = vi.hoisted(() => vi.fn());
vi.mock("../model/useUser", () => ({
  useUser: mockUseUser,
}));

// // @pickle/ui 내부의 UI 컴포넌트(Spinner) 모킹 (선택 사항: 아이콘/스피너 등 렌더링 최적화)
// vi.mock("@pickle/ui", () => ({
//   Spinner: () => <div data-testid="spinner">Loading...</div>,
// }));

// 실제 테스트할 컴포넌트를 가져옵니다. (Mocking 선언 이후에 import 해야 안정적입니다)
import { AuthGuard } from "./AuthGuard";

describe("AuthGuard", () => {
  beforeEach(() => {
    // 매 테스트 시작 전, 모의 함수 호출 기록 초기화 (격리)
    vi.clearAllMocks();
  });

  const DummyChild = () => (
    <div data-testid="protected-content">Secret Content</div>
  );

  it("1. 로딩 상태일 때(isLoading: true) 자식 요소 대신 스피너만 노출해야 한다.", () => {
    mockUseUser.mockReturnValue({
      isLoading: true,
      user: null,
      appUser: null,
    });

    // act가 포함되어 동작하는 render
    render(
      <AuthGuard>
        <DummyChild />
      </AuthGuard>,
    );

    // 자식 컴포넌트가 존재하지 않아야 함
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("2. 로그인이 안 되어 있을 때(user: false) '/signin' 으로 replace 리다이렉트되어야 한다.", () => {
    mockUseUser.mockReturnValue({
      isLoading: false,
      user: null,
      appUser: null,
    });

    render(
      <AuthGuard>
        <DummyChild />
      </AuthGuard>,
    );

    // navigate가 호출되었는지, 올바른 인자(replace: true, to: /signin) 로 호출되었는지 검사
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/signin", replace: true });

    // 자식 요소는 렌더링되지 않아야 함
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("3. 로그인은 했지만 프로필 상태가 'active'가 아닐 때 '/signup' 로 리다이렉트되어야 한다.", () => {
    mockUseUser.mockReturnValue({
      isLoading: false,
      user: { id: "user-1" }, // supabase user 유효
      appUser: { status: "inactive" }, // appUser 활성화 안 됨
    });

    render(
      <AuthGuard>
        <DummyChild />
      </AuthGuard>,
    );

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/signup",
      search: { reason: "no_profile" },
      replace: true,
    });

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("4. 정상적인 활성 유저일 때만 children 내부 컨텐츠를 렌더링해야 한다.", () => {
    mockUseUser.mockReturnValue({
      isLoading: false,
      user: { id: "user-1" },
      appUser: { status: "active" }, // 정상 유저!
    });

    render(
      <AuthGuard>
        <DummyChild />
      </AuthGuard>,
    );

    // 라우터 이동이 없어야 하고
    expect(mockNavigate).not.toHaveBeenCalled();

    // 보호된 컨텐츠가 화면상에 나타나야 한다
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Secret Content")).toBeVisible();
  });
});
