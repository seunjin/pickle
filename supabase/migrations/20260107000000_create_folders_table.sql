-- 20260107000000_create_folders_table.sql

-- 1. Create 'folders' table
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'gray', -- 폴더 색상 (선택 사항, UI에서 활용)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- 동일한 워크스페이스 내에서 폴더 이름 중복 방지
  CONSTRAINT folders_workspace_id_name_key UNIQUE (workspace_id, name)
);

-- 2. Add folder_id to notes table
ALTER TABLE public.notes 
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON public.notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_workspace_id ON public.folders(workspace_id);

-- 4. Enable RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for 'folders'
CREATE POLICY "Workspace members can view folders"
ON public.folders FOR SELECT
USING (
  workspace_id IN (
    SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can insert folders"
ON public.folders FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can update folders"
ON public.folders FOR UPDATE
USING (
  workspace_id IN (
    SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can delete folders"
ON public.folders FOR DELETE
USING (
  workspace_id IN (
    SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
  )
);

-- 6. updated_at 트리거
CREATE TRIGGER on_folder_updated
  BEFORE UPDATE ON public.folders
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
