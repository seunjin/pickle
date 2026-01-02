-- Add blur_data_url column to assets table for high-quality image placeholders
ALTER TABLE assets ADD COLUMN IF NOT EXISTS blur_data_url TEXT;

COMMENT ON COLUMN assets.blur_data_url IS 'Low-resolution Base64 image data for blur placeholder effect';
