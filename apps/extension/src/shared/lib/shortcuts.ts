import { isMac } from "../types";

/**
 * 키 이벤트를 단축키 문자열로 변환 (e.g., "Ctrl+Shift+E")
 */
export function formatShortcut(e: KeyboardEvent | React.KeyboardEvent): string {
  const modifiers = [];
  if (e.ctrlKey || e.metaKey) modifiers.push(isMac ? "Cmd" : "Ctrl"); // Mac은 Cmd, 윈도우는 Ctrl 표시
  if (e.altKey) modifiers.push("Alt");
  if (e.shiftKey) modifiers.push("Shift");

  const key = e.key.toUpperCase();

  // Modifier 키 단독 입력은 무시 (단독 입력 상태는 단축키가 아님)
  if (["CONTROL", "ALT", "SHIFT", "META"].includes(key)) {
    return modifiers.join("+");
  }

  // 특수 키 이름 정규화
  const displayKey = key === " " ? "SPACE" : key;

  return [...modifiers, displayKey].join("+");
}

/**
 * 단축키 조합의 유효성 검사 (최소 1개 Modifier 포함, 총 2~3개 키 조합)
 */
export function isValidShortcut(shortcut: string): {
  isValid: boolean;
  error?: string;
} {
  const parts = shortcut.split("+");
  const modifiers = ["Ctrl", "Alt", "Shift", "Cmd"];

  const hasModifier = parts.some((p) => modifiers.includes(p));
  const totalKeys = parts.filter((p) => p !== "").length;

  if (!hasModifier) {
    return {
      isValid: false,
      error: "최소 1개의 Modifier 키(Ctrl, Alt, Shift)가 포함되어야 합니다.",
    };
  }

  if (totalKeys < 2) {
    return { isValid: false, error: "최소 2개 이상의 키 조합이 필요합니다." };
  }

  if (totalKeys > 3) {
    return { isValid: false, error: "최대 3개까지의 키 조합만 허용됩니다." };
  }

  // 특정 차단된 조합 (브라우저 기본 단축키와 겹칠 위험이 높은 것들)
  const prefix = isMac ? "Cmd" : "Ctrl";
  const blocked = [
    `${prefix}+C`,
    `${prefix}+V`,
    `${prefix}+X`,
    `${prefix}+A`,
    `${prefix}+T`,
    `${prefix}+W`,
  ].concat(
    ["Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+A", "Ctrl+T", "Ctrl+W"], // 크로스 플랫폼 호환성을 위해 둘 다 차단 검토 가능하나 우선 OS에 맞게 처리
  );
  if (blocked.includes(shortcut)) {
    return {
      isValid: false,
      error: "브라우저 기본 단축키와 충돌할 수 있는 조합입니다.",
    };
  }

  return { isValid: true };
}

/**
 * 현재 입력된 키보드 이벤트가 설정된 단축키와 일치하는지 확인
 */
export function isShortcutMatched(
  e: KeyboardEvent,
  targetShortcut: string,
): boolean {
  const current = formatShortcut(e);
  return current === targetShortcut;
}
