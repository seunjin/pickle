-- 20260309224000_add_user_activation_trigger.sql
-- allowed_emails(화이트리스트)에 이메일이 추가될 때, 해당 이메일을 가진 유저를 자동으로 active로 변경합니다.

-- 1. 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_allowed_email_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- 어드민 권한으로 실행
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_full_name text;
  v_workspace_id uuid;
BEGIN
  -- 1. 해당 이메일을 가진 pending 유저 찾기
  SELECT id, full_name INTO v_user_id, v_full_name
  FROM public.users
  WHERE email = NEW.email AND status = 'pending';

  IF v_user_id IS NOT NULL THEN
    -- 2. 유저 상태를 active로 변경
    UPDATE public.users SET status = 'active' WHERE id = v_user_id;

    -- 3. 워크스페이스가 없다면 생성 (Automatic Signup 로직과 동일)
    IF NOT EXISTS (SELECT 1 FROM workspace_members WHERE user_id = v_user_id) THEN
        INSERT INTO workspaces (name)
        VALUES (v_full_name || '''s Workspace')
        RETURNING id INTO v_workspace_id;

        INSERT INTO workspace_members (workspace_id, user_id, role)
        VALUES (v_workspace_id, v_user_id, 'owner');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. 트리거 연결
DROP TRIGGER IF EXISTS on_allowed_email_inserted ON public.allowed_emails;
CREATE TRIGGER on_allowed_email_inserted
  AFTER INSERT ON public.allowed_emails
  FOR EACH ROW EXECUTE PROCEDURE public.handle_allowed_email_insert();

-- 3. 기존에 이미 화이트리스트에 있지만 pending인 유저들 소급 적용 (선택 사항이지만 안전을 위해 실행)
DO $$
DECLARE
    r RECORD;
    v_workspace_id uuid; -- 변수 선언 추가
BEGIN
    FOR r IN 
        SELECT u.id, u.full_name, u.email 
        FROM public.users u
        JOIN public.allowed_emails a ON u.email = a.email
        WHERE u.status = 'pending'
    LOOP
        UPDATE public.users SET status = 'active' WHERE id = r.id;
        
        IF NOT EXISTS (SELECT 1 FROM workspace_members WHERE user_id = r.id) THEN
            INSERT INTO workspaces (name) VALUES (r.full_name || '''s Workspace') RETURNING id INTO v_workspace_id;
            INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (v_workspace_id, r.id, 'owner');
        END IF;
    END LOOP;
END $$;
