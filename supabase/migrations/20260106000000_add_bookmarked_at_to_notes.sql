-- Add bookmarked_at column to notes table
ALTER TABLE public.notes ADD COLUMN bookmarked_at TIMESTAMPTZ DEFAULT NULL;

-- Index for ordering by bookmark time
CREATE INDEX idx_notes_bookmarked_at ON public.notes(bookmarked_at DESC) WHERE (bookmarked_at IS NOT NULL);
