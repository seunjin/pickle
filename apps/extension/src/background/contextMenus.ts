export const MENU_ROOT_ID = "pickle-root";

export function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // 1. Root Menu
    chrome.contextMenus.create({
      id: MENU_ROOT_ID,
      title: "Pickle Note",
      contexts: ["all"],
    });

    // 2. Sub Menus
    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "save-text",
      title: "📝 텍스트 저장하기",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "save-image",
      title: "🖼️ 이미지 저장하기",
      contexts: ["image"],
    });

    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "capture",
      title: "📷 캡쳐하기 ⇧⌘E",
      contexts: ["all"],
    });

    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "bookmark",
      title: "🔖 북마크",
      contexts: ["all"],
    });

    chrome.contextMenus.create({
      type: "separator",
      id: "separator-1",
      parentId: MENU_ROOT_ID,
      contexts: ["all"],
    });

    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "open-app",
      title: "🚀 Pickle Note 열기",
      contexts: ["all"],
    });
  });
}
