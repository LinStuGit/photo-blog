-- Add layout fields to photos table for visual editor
ALTER TABLE photos ADD COLUMN layout_x INTEGER DEFAULT 0;
ALTER TABLE photos ADD COLUMN layout_y INTEGER DEFAULT 0;
ALTER TABLE photos ADD COLUMN layout_width INTEGER DEFAULT 250;
ALTER TABLE photos ADD COLUMN layout_height INTEGER DEFAULT 250;
