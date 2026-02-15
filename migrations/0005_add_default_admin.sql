-- Insert default admin user
-- Username: admin
-- Password: a12345678 (bcrypt hash)

INSERT OR IGNORE INTO users (username, password_hash)
VALUES ('admin', '$2a$10$yUjLkmsZjtO.bsbFVNqGue1DJhETUQ5X/WaQEAU8YYGZX0BwUPTI.');


