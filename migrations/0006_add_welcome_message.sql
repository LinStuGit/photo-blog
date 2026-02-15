-- Add welcome message to site settings
ALTER TABLE site_settings ADD COLUMN welcome_message TEXT DEFAULT 'HELLO!';

-- Update default welcome message
UPDATE site_settings SET welcome_message = 'HELLO!' WHERE welcome_message IS NULL;
