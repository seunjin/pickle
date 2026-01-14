-- 기존 함수의 반환 타입 변경을 위해 먼저 삭제
DROP FUNCTION IF EXISTS get_workspace_storage_info(UUID);

-- 통합 사용량 조회를 더 상세하게 분리 (Bookmark vs Text/Other)
CREATE OR REPLACE FUNCTION get_workspace_storage_info(p_workspace_id UUID)
RETURNS TABLE (
  asset_bytes BIGINT,
  bookmark_bytes BIGINT,
  text_bytes BIGINT,
  total_used_bytes BIGINT,
  limit_bytes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(src.asset_size), 0)::BIGINT as asset_bytes,
    COALESCE(SUM(src.bookmark_size), 0)::BIGINT as bookmark_bytes,
    COALESCE(SUM(src.text_size), 0)::BIGINT as text_bytes,
    (COALESCE(SUM(src.asset_size), 0) + COALESCE(SUM(src.bookmark_size), 0) + COALESCE(SUM(src.text_size), 0))::BIGINT as total_used_bytes,
    COALESCE(w.storage_limit_bytes, 52428800)::BIGINT as limit_bytes
  FROM workspaces w
  LEFT JOIN LATERAL (
    -- 1. 이미지/파일 (Storage 에셋)
    SELECT 
      SUM(full_size_bytes + COALESCE(thumb_size_bytes, 0)) as asset_size,
      0 as bookmark_size,
      0 as text_size
    FROM assets 
    WHERE workspace_id = w.id

    UNION ALL

    -- 2. 북마크 데이터 (DB row size)
    SELECT 
      0 as asset_size,
      SUM(pg_column_size(notes)) as bookmark_size,
      0 as text_size
    FROM notes 
    WHERE workspace_id = w.id AND type = 'bookmark'

    UNION ALL

    -- 3. 텍스트/기타 데이터 (DB row size)
    SELECT 
      0 as asset_size,
      0 as bookmark_size,
      SUM(pg_column_size(notes)) as text_size
    FROM notes 
    WHERE workspace_id = w.id AND type != 'bookmark'
  ) src ON true
  WHERE w.id = p_workspace_id
  GROUP BY w.id, w.storage_limit_bytes;
END;
$$ LANGUAGE plpgsql;
