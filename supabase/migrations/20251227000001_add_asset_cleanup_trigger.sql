-- 20251227000001_add_asset_cleanup_trigger.sql
-- 노트 삭제 시 연결된 Asset도 함께 삭제하는 트리거

-- 1. 트리거 함수 정의
CREATE OR REPLACE FUNCTION public.handle_note_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- 노트가 asset_id를 가지고 있다면, 해당 Asset을 삭제
  -- (참고: assets 테이블의 RLS 정책은 트리거 내부에서 실행될 때 bypass될 수도 있고 아닐 수도 있는데, 
  --  보통 트리거는 owner 권한으로 실행되거나 security definer로 정의하여 권한 문제를 해결할 수 있음. 
  --  여기서는 단순 삭제 쿼리를 수행하며, Supabase의 Storage는 DB Row 삭제 시 실제 파일 삭제 트리거가 별도로 있을 수 있음. 
  --  Supabase Storage의 경우 Objects 테이블과 연동되지만, 여기서는 우리가 직접 만든 'assets' 메타데이터 테이블을 삭제하는 것임.)
  
  IF OLD.asset_id IS NOT NULL THEN
    DELETE FROM public.assets WHERE id = OLD.asset_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- SECURITY DEFINER: 함수를 생성한 소유자의 권한으로 실행 (권한 문제 방지)

-- 2. 트리거 생성
DROP TRIGGER IF EXISTS on_note_deleted ON public.notes;
CREATE TRIGGER on_note_deleted
  AFTER DELETE ON public.notes
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_note_deletion();
