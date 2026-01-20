-- 1. Full-Text Search를 위한 tsvector 컬럼 추가 (Generated Column)
-- 제목(A 가중치)과 URL(B 가중치)을 결합하여 가중치가 반영된 검색 인덱스를 자동 생성합니다.
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS fts_tokens tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(url, '')), 'B')
) STORED;

-- 2. 검색 성능 최적화를 위한 GIN 인덱스 생성
CREATE INDEX IF NOT EXISTS notes_fts_idx ON notes USING GIN (fts_tokens);

-- 3. (Optional) 제목과 URL 외에 본문(content)이 추가될 경우 아래와 같이 확장 가능합니다.
-- setweight(to_tsvector('simple', coalesce(content, '')), 'C')
