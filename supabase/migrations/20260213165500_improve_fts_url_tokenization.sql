-- fts_tokens 컬럼의 생성 로직을 개선하여 URL의 중간 단어로도 검색이 가능하도록 합니다.
-- 기존 컬럼을 드랍하고 개선된 로직으로 재생성합니다.

-- 1. 기존 컬럼 및 인덱스 드랍
ALTER TABLE public.notes DROP COLUMN IF EXISTS fts_tokens;

-- 2. 개선된 로직으로 컬럼 재생성
-- regexp_replace를 사용하여 URL 내의 특수문자(:, /, ., ?, &, = 등)를 공백으로 치환함으로써
-- PostgreSQL FTS 파서가 URL을 단어 단위로 토큰화할 수 있게 합니다.
ALTER TABLE public.notes 
ADD COLUMN fts_tokens tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(regexp_replace(url, '[^[:alnum:]]+', ' ', 'g'), '')), 'B')
) STORED;

-- 3. 검색 성능 최적화를 위한 GIN 인덱스 재생성
CREATE INDEX IF NOT EXISTS notes_fts_idx ON public.notes USING GIN (fts_tokens);
