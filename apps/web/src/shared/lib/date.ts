/**
 * 날짜 데이터를 지정된 포맷의 문자열로 변환합니다.
 * @param date 날짜 객체 또는 ISO 문자열
 * @param type 포맷 타입 ('date' | 'datetime')
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDate = (
  date: string | Date | null | undefined,
  type: "date" | "datetime" = "date",
) => {
  if (!date) return "";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");

  if (type === "date") {
    return `${Y}-${M}-${D}`;
  }

  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");

  return `${Y}-${M}-${D} ${h}:${m}`;
};
