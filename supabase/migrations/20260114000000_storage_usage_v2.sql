-- 1. 워크스페이스 테이블에 가변 한도 컬럼 추가 (기본값 50MB)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS storage_limit_bytes BIGINT DEFAULT 52428800;

-- 2. 통합 사용량 및 한도 조회 RPC 함수 생성
CREATE OR REPLACE FUNCTION get_workspace_storage_info(p_workspace_id UUID)
RETURNS TABLE (
  asset_bytes BIGINT,
  note_bytes BIGINT,
  total_used_bytes BIGINT,
  limit_bytes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(src.asset_size), 0)::BIGINT as asset_bytes,
    COALESCE(SUM(src.note_size), 0)::BIGINT as note_bytes,
    (COALESCE(SUM(src.asset_size), 0) + COALESCE(SUM(src.note_size), 0))::BIGINT as total_used_bytes,
    COALESCE(w.storage_limit_bytes, 52428800)::BIGINT as limit_bytes
  FROM workspaces w
  LEFT JOIN LATERAL (
    SELECT 
      SUM(full_size_bytes + COALESCE(thumb_size_bytes, 0)) as asset_size,
      0 as note_size
    FROM assets 
    WHERE workspace_id = w.id
    UNION ALL
    SELECT 
      0 as asset_size,
      SUM(pg_column_size(notes)) as note_size
    FROM notes 
    WHERE workspace_id = w.id
  ) src ON true
  WHERE w.id = p_workspace_id
  GROUP BY w.id, w.storage_limit_bytes;
END;
$$ LANGUAGE plpgsql;
