import { isMac } from "../types";

/**
 * 키 이벤트를 단축키 문자열로 변환 (e.g., "Ctrl+Shift+E")
 */
export function formatShortcut(e: KeyboardEvent | React.KeyboardEvent): string {
  const modifiers = [];
  if (e.ctrlKey || e.metaKey) modifiers.push(isMac ? "Cmd" : "Ctrl"); // Mac은 Cmd, 윈도우는 Ctrl 표시
  if (e.altKey) modifiers.push(isMac ? "Option" : "Alt");
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
  const modifiers = ["Ctrl", "Alt", "Shift", "Cmd", "Option"];

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

  // 특정 차단된 조합 (브라우저 기본 단축키 및 시스템 단축키와 겹칠 위험이 높은 것들)
  const osPrefix = isMac ? "Cmd" : "Ctrl";
  const blocked = [
    `${osPrefix}+C`, // Copy
    `${osPrefix}+V`, // Paste
    `${osPrefix}+X`, // Cut
    `${osPrefix}+A`, // Select All
    `${osPrefix}+T`, // New Tab
    `${osPrefix}+W`, // Close Tab
    `${osPrefix}+N`, // New Window
    `${osPrefix}+R`, // Refresh
    `${osPrefix}+L`, // Address Bar
    `${osPrefix}+F`, // Find (단독 Cmd+F만 차단, Cmd+Alt+F 등은 허용되도록 함)
  ];

  // 단독 조합(Modifier + Key)인 경우만 체크하여 복합 조합(Cmd+Alt+F 등)은 허용
  if (parts.length === 2 && blocked.includes(shortcut)) {
    return {
      isValid: false,
      error: "브라우저 기본 단축키와 충돌할 수 있는 조합입니다.",
    };
  }

  // Windows에서 Alt+Shift 조합은 IME 언어 전환과 충돌하므로 경고/차단 검토
  if (!isMac && shortcut.includes("Alt+Shift")) {
    return {
      isValid: false,
      error:
        "Windows에서 Alt+Shift 조합은 언어 전환 단축키와 충돌할 수 있습니다.",
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
