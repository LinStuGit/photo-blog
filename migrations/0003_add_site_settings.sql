-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT DEFAULT 'PhotoBlog',
    logo TEXT DEFAULT 'LINTHU',
    author_name TEXT DEFAULT 'Lin',
    contact TEXT DEFAULT 'DPICW_WY@163.com',
    about TEXT DEFAULT '这是一个"相册展示系统"',
    icp_number TEXT DEFAULT '',
    show_icp INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO site_settings (title, logo, author_name, contact, about, icp_number, show_icp)
SELECT 'PhotoBlog', 'LINTHU', 'Lin', 'DPICW_WY@163.com', '这是一个"相册展示系统"', '', 0
WHERE NOT EXISTS (SELECT 1 FROM site_settings);
