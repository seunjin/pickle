import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedCallback } from "./useDebouncedCallback";

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    // Vitest의 가짜 타이머(Fake Timers)를 사용하여 setTimeout 호출을 제어합니다.
    vi.useFakeTimers();
  });

  afterEach(() => {
    // 테스트 간 독립성을 위해 타이머 복구
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("지정한 딜레이(delay) 시간이 지나기 전에는 콜백이 호출되지 않는다", () => {
    const callbackFn = vi.fn(); // 호출 여부를 추적할 가짜(Mock) 함수 생성
    const delay = 500;

    // React Hook은 반드시 컴포넌트 내부에서 호출되어야 하므로 `renderHook`을 사용합니다.
    const { result } = renderHook(() =>
      useDebouncedCallback(callbackFn, delay),
    );
    const debouncedFn = result.current;

    debouncedFn("test-arg"); // 함수 실행 트리거

    // 시간이 흐르기 전에는 호출되지 않았는지 검증
    expect(callbackFn).not.toHaveBeenCalled();

    // 499ms 경과 시뮬레이션
    vi.advanceTimersByTime(499);
    expect(callbackFn).not.toHaveBeenCalled();

    // 정확히 500ms가 경과하여 콜백이 실행되었는지 확인
    vi.advanceTimersByTime(1);
    expect(callbackFn).toHaveBeenCalledTimes(1);
    expect(callbackFn).toHaveBeenCalledWith("test-arg");
  });

  it("딜레이 시간 내에 여러 번 호출되면 마지막 호출 기준으로 딜레이가 갱신되어 한 번만 실행된다", () => {
    const callbackFn = vi.fn();
    const delay = 500;

    const { result } = renderHook(() =>
      useDebouncedCallback(callbackFn, delay),
    );
    const debouncedFn = result.current;

    // 0ms, 100ms, 200ms에 각각 호출
    debouncedFn("apple");
    vi.advanceTimersByTime(100);

    debouncedFn("banana");
    vi.advanceTimersByTime(100);

    debouncedFn("cherry"); // 마지막 호출!

    // 지금까지 총 200ms 경과. 아직 콜백은 한 번도 안 불림.
    expect(callbackFn).not.toHaveBeenCalled();

    // 마지막 호출 시점(200ms)부터 500ms 경과(전체 700ms 경과)
    vi.advanceTimersByTime(500);

    // 단 한 번 불렸으며, 가장 마지막 인자였던 'cherry'로 호출되었는지 검증!
    expect(callbackFn).toHaveBeenCalledTimes(1);
    expect(callbackFn).toHaveBeenCalledWith("cherry");
  });
});
