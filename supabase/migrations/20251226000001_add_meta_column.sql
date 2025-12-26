-- Add meta column to notes table
ALTER TABLE "public"."notes" ADD COLUMN "meta" jsonb DEFAULT NULL;
