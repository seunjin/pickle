export const MENU_ROOT_ID = "pickle-root";

/**
 * 컨텍스트 메뉴(우클릭 메뉴)를 설정하는 함수입니다.
 * 브라우저의 '우클릭' 이벤트 시 나타나는 메뉴 항목들을 정의합니다.
 */
export function setupContextMenus() {
  // 기존 메뉴를 모두 제거하고 새로 생성합니다 (중복 방지)
  chrome.contextMenus.removeAll(() => {
    // 1. Root Menu (최상위 메뉴: Pickle Note)
    chrome.contextMenus.create({
      id: MENU_ROOT_ID,
      title: "Pickle",
      contexts: ["all"], // 모든 상황(텍스트, 이미지, 빈 공간 등)에서 표시
    });

    // 2. Sub Menus (하위 메뉴들)

    // 2-1. 텍스트 저장하기 (텍스트 드래그 시 활성화)
    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "save-text",
      title: "📝 텍스트 저장하기",
      contexts: ["selection"], // 텍스트가 선택되었을 때만 표시됨
    });

    // 2-2. 이미지 저장하기 (이미지 우클릭 시 활성화)
    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "save-image",
      title: "🖼️ 이미지 저장하기",
      contexts: ["image"], // 이미지를 클릭했을 때만 표시됨
    });

    // 2-3. 전체 화면 캡쳐하기 (단축키 안내 포함)
    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "capture",
      title: "📷 캡쳐하기 ⇧⌘E",
      contexts: ["all"],
    });

    // 2-4. 현재 페이지 북마크
    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "bookmark",
      title: "🔖 북마크",
      contexts: ["all"],
    });

    // 구분선 (Visual Separator)
    chrome.contextMenus.create({
      type: "separator",
      id: "separator-1",
      parentId: MENU_ROOT_ID,
      contexts: ["all"],
    });

    // 2-5. 앱 열기 버튼 (대시보드 이동)
    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "open-app",
      title: "🚀 Pickle 열기",
      contexts: ["all"],
    });
  });
}
