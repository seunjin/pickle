import { mountOverlay } from "../../content/ui/mount";

/**
 * 개발 환경에서 오버레이 마운트를 테스트하기 위한 런처 버튼입니다.
 */
export function DevLauncher() {
  // 개발 모드가 아니면 렌더링하지 않음
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: "20px",
        bottom: "20px",
        zIndex: 9999999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <button
        type="button"
        onClick={() => {
          // Mock tab ID
          mountOverlay(99999);
        }}
        style={{
          padding: "10px 16px",
          backgroundColor: "#10b981",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          fontSize: "14px",
        }}
      >
        🚀 Dev Mount Overlay
      </button>
      <div style={{ fontSize: "10px", color: "#666", textAlign: "center" }}>
        Development Only
      </div>
    </div>
  );
}
