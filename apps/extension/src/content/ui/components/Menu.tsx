import type { ViewType } from "@shared/types";
import { MenuButton } from "./MenuButton";

/**
 * Menu Component
 *
 * 오버레이의 메인 메뉴 화면입니다.
 * 텍스트 저장, 이미지 저장, 캡쳐, 북마크 등 각 기능으로 이동할 수 있는 버튼들을 제공합니다.
 */

interface MenuProps {
  onNavigate: (view: ViewType) => void;
  onClose: () => void;
  openWebApp: () => void;
}

export function Menu({ onNavigate, onClose, openWebApp }: MenuProps) {
  return (
    <div className="relative flex h-full flex-col gap-4 p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
      <h1 className="mb-2 text-center font-bold text-xl">Pickle Note</h1>
      <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto">
        <MenuButton
          label="이미지 저장"
          icon="🖼️"
          color="bg-purple-100 hover:bg-purple-200 text-purple-900"
          onClick={() => onNavigate("image")}
        />
        <MenuButton
          label="캡쳐하기"
          icon="📷"
          color="bg-blue-100 hover:bg-blue-200 text-blue-900"
          onClick={() => onNavigate("capture")}
        />
        <MenuButton
          label="텍스트 저장"
          icon="📝"
          color="bg-green-100 hover:bg-green-200 text-green-900"
          onClick={() => onNavigate("text")}
        />
        <MenuButton
          label="북마크"
          icon="🔖"
          color="bg-yellow-100 hover:bg-yellow-200 text-yellow-900"
          onClick={() => onNavigate("bookmark")}
        />
        <button
          type="button"
          onClick={openWebApp}
          className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gray-100 p-4 font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-200"
        >
          🚀 Pickle Note 가기
        </button>
      </div>
    </div>
  );
}
