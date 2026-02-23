import { describe, expect, it } from "vitest";
import { formatDate } from "./date";

describe("formatDate", () => {
  it("유효하지 않은 날짜 값이 들어오면 빈 문자열을 반환한다", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("invalid-date")).toBe("");
  });

  describe('type: "date" (기본 포맷)', () => {
    it("YYYY-MM-DD 형식으로 반환한다", () => {
      // Note: timezone 이슈를 피하기 위해 명시적인 문자열 날짜 포맷 제공 (UTC+0 기준)
      expect(formatDate("2024-01-01T00:00:00.000Z")).toMatch(/^2024-01-01$/);
    });

    it("한 자리 월/일은 앞에 0이 붙어야 한다", () => {
      expect(formatDate("2024-05-09T00:00:00.000Z")).toMatch(/^2024-05-09$/);
    });
  });

  describe('type: "datetime"', () => {
    it("YYYY-MM-DD HH:mm 형식으로 반환한다", () => {
      const targetDate = new Date("2024-05-09T14:05:00.000Z");
      // 로컬 타임존 환경에 따라 시간에 변동이 있을 수 있으므로 동적으로 Assertion 생성
      const Y = targetDate.getFullYear();
      const M = String(targetDate.getMonth() + 1).padStart(2, "0");
      const D = String(targetDate.getDate()).padStart(2, "0");
      const h = String(targetDate.getHours()).padStart(2, "0");
      const m = String(targetDate.getMinutes()).padStart(2, "0");

      const expected = `${Y}-${M}-${D} ${h}:${m}`;

      expect(formatDate(targetDate, "datetime")).toBe(expected);
    });
  });
});
