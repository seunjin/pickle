-- Add deleted_at columns for soft delete
ALTER TABLE public.notes ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.folders ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index for performance on filtering deleted items
CREATE INDEX idx_notes_deleted_at ON public.notes (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_folders_deleted_at ON public.folders (deleted_at) WHERE deleted_at IS NULL;

-- Comments for documentation
COMMENT ON COLUMN public.notes.deleted_at IS 'Timestamp when the note was moved to trash. NULL means not deleted.';
COMMENT ON COLUMN public.folders.deleted_at IS 'Timestamp when the folder was moved to trash. NULL means not deleted.';
