/**
 * React Query 캐시 내의 특정 아이템을 업데이트하는 제네릭 유틸리티
 */
export function updateCacheItem<T extends { id: string }>(
  oldData: unknown,
  itemId: string,
  payload: Partial<T>,
): unknown {
  if (!oldData) return oldData;

  // 1. 데이터가 배열인 경우 (리스트 캐시)
  if (Array.isArray(oldData)) {
    return oldData.map((item) =>
      (item as T).id === itemId ? { ...item, ...payload } : item,
    );
  }

  // 2. 데이터가 단일 객체인 경우 (상세 캐시)
  // unknown 타입을 안전하게 체크하기 위해 id 속성 확인
  const isObject = typeof oldData === "object" && oldData !== null;
  if (isObject && (oldData as T).id === itemId) {
    return { ...(oldData as T), ...payload };
  }

  return oldData;
}
