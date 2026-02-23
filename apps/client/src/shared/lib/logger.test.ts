import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  // console 스파이(spy)를 위한 변수
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // 실제 콘솔 출력을 막고 호출 여부와 전달 인자만 추적합니다.
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // 각 테스트 종료 후 spy 복원
    vi.restoreAllMocks();
  });

  describe("maskPII (Personal Identifiable Information 마스킹)", () => {
    it("민감한 키(password, token, key, secret, email)가 포함된 평문 객체를 마스킹한다", () => {
      const sensitiveData = {
        userId: 1,
        email: "user@example.com",
        userPassword: "supersecretpassword",
        accessToken: "jwt-token-1234",
        apiKey: "some-api-key",
        clientSecret: "hidden-secret",
        safeData: "hello",
      };

      logger.info("Test sensitive logging", sensitiveData);

      // console.info 가 호출되었는지 검증하고, 두번째 인자(data)를 확인합니다.
      expect(infoSpy).toHaveBeenCalledTimes(1);

      const loggedData = infoSpy.mock.calls[0][1];

      expect(loggedData).toEqual({
        userId: 1,
        email: "********",
        userPassword: "********",
        accessToken: "********",
        apiKey: "********",
        clientSecret: "********",
        safeData: "hello",
      });
    });

    it("중첩된 객체 배열 내부의 민감 정보도 재귀적으로 마스킹한다", () => {
      const nestedData = {
        request: {
          headers: {
            Authorization: "Bearer token-123",
            "X-Api-Key": "my-key",
          },
          body: {
            userEmail: "test@test.com",
          },
        },
      };

      logger.error("Failed request", nestedData);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const loggedData = errorSpy.mock.calls[0][1];

      // headers, body 내부 값들이 마스킹 되었는지 확인
      expect(loggedData).toEqual({
        request: {
          headers: {
            Authorization: "Bearer token-123", // 'Authorization' 이라는 키 자체는 마스킹 대상 문자열(token, secret 등)을 포함하지 않음.
            "X-Api-Key": "********",
          },
          body: {
            userEmail: "********",
          },
        },
      });
    });

    it("null, undefined, 문자열 등 원시 타입이 들어오면 그대로 반환(통과)해야 한다", () => {
      logger.warn("Simple message", null);
      expect(warnSpy).toHaveBeenCalledWith("[WARN] Simple message", null);

      logger.warn("Simple message", 123);
      expect(warnSpy).toHaveBeenCalledWith("[WARN] Simple message", 123);

      logger.warn("Simple message", "string-data");
      expect(warnSpy).toHaveBeenCalledWith(
        "[WARN] Simple message",
        "string-data",
      );
    });
  });
});
