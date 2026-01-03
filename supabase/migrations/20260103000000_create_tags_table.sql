-- 20260103000000_create_tags_table.sql

-- 1. Create 'tags' table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  style TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- 동일한 워크스페이스 내에서 태그 이름 중복 방지
  CONSTRAINT tags_workspace_id_name_key UNIQUE (workspace_id, name)
);

-- 2. Create 'note_tags' relationship table (Join Table)
CREATE TABLE IF NOT EXISTS public.note_tags (
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (note_id, tag_id)
);

-- 3. Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for 'tags'
CREATE POLICY "Workspace members can view tags"
ON public.tags FOR SELECT
USING (
  workspace_id IN (
    SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can insert tags"
ON public.tags FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can update tags"
ON public.tags FOR UPDATE
USING (
  workspace_id IN (
    SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can delete tags"
ON public.tags FOR DELETE
USING (
  workspace_id IN (
    SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
  )
);

-- 5. RLS Policies for 'note_tags'
CREATE POLICY "Workspace members can view note_tags"
ON public.note_tags FOR SELECT
USING (
  note_id IN (
    SELECT n.id FROM public.notes n WHERE n.workspace_id IN (
      SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Workspace members can insert note_tags"
ON public.note_tags FOR INSERT
WITH CHECK (
  note_id IN (
    SELECT n.id FROM public.notes n WHERE n.workspace_id IN (
      SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Workspace members can delete note_tags"
ON public.note_tags FOR DELETE
USING (
  note_id IN (
    SELECT n.id FROM public.notes n WHERE n.workspace_id IN (
      SELECT mw.workspace_id FROM public.workspace_members mw WHERE mw.user_id = auth.uid()
    )
  )
);

-- 6. updated_at 트리거 (선택 사항이지만 일관성을 위해 추가)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_tag_updated ON public.tags;
CREATE TRIGGER on_tag_updated
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
