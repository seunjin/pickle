-- 20241227_add_title_to_notes.sql
-- 노트 테이블에 공통 'title' 컬럼 추가

ALTER TABLE "public"."notes" ADD COLUMN "title" text;

COMMENT ON COLUMN "public"."notes"."title" IS '노트의 제목 (사용자가 지정한 제목 등)';

-- 기존 bookmarks 데이터 마이그레이션 (옵션)
-- 기존에 data->>'title' 또는 meta->>'title'에 제목이 있었다면 title 컬럼으로 이동하는 로직이 필요할 수 있습니다.
-- 예시:
-- UPDATE notes SET title = meta->>'title' WHERE type = 'bookmark' AND meta->>'title' IS NOT NULL;
