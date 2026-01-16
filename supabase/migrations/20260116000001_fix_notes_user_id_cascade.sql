-- 20260116000001_fix_notes_user_id_cascade.sql
-- notes 테이블의 user_id 외래 키 제약 조건에 ON DELETE CASCADE를 추가합니다.

DO $$
BEGIN
    -- 기존 제약 조건 삭제
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'notes' 
        AND constraint_name = 'notes_user_id_fkey'
    ) THEN
        ALTER TABLE public.notes DROP CONSTRAINT notes_user_id_fkey;
    END IF;
END $$;

-- 제약 조건을 다시 추가하되, ON DELETE CASCADE를 설정합니다.
-- public.users를 참조하도록 하여 일관성을 유지합니다.
ALTER TABLE public.notes
ADD CONSTRAINT notes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;
