-- Add index for photo_id in collection_photos table
-- This improves DELETE operations on photos table
CREATE INDEX IF NOT EXISTS idx_collection_photos_photo ON collection_photos(photo_id);

-- Add index for user_id in photos table if not exists
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
