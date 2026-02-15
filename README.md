# Cloudflare Photo Blog

一个基于 Cloudflare Workers、D1 和 R2 构建的现代化摄影博客系统。

**当前版本**: v1.0.0-stable

## ✨ 功能特性

- 📸 响应式照片展示，适配所有设备
- 🖼️ 相册管理，灵活组织照片
- 🔐 安全的账号密码登录系统
- ⬆️ 简便的照片上传功能
- 🎯 照片点击查看大图
- 📷 EXIF 信息显示（相机、镜头、ISO、光圈、快门、焦距等）
- 🎨 纸面白简约设计，柔和阴影
- ⚡ 高性能 CDN 缓存
- 🚀 零服务器架构，完全 Serverless
- 📱 移动端优化，左侧边栏+汉堡菜单
- 🖌️ 图形化管理后台，拖拽排版
- 📥 外部拖入自动上传照片
- 💾 可视化布局编辑和保存
- 🖱️ 画布照片选中、拖拽移动、调整大小
- 📐 照片保持原始宽高比
- 📏 Admin画布无限向下延伸
- 🌐 中英文双语切换，支持全站语言切换
- 📝 网站信息管理（标题、LOGO、作者、联系方式、关于、欢迎语）
- 💬 欢迎语功能（未选中相册时显示）
- 📋 相册描述显示（选中相册时显示）
- 🖼️ 客户端缩略图生成，即时预览

## 🏗️ 技术栈

- **Cloudflare Workers** - Serverless 计算平台
- **D1** - SQLite 数据库
- **R2** - 对象存储
- **Assets** - 静态资源托管

## 📁 项目结构

```
workspace/
├── worker.js                 # Workers 入口文件
├── public/                   # 静态资源
│   ├── index.html            # 前端页面
│   ├── admin.html            # 管理后台页面
│   ├── styles.css            # 主样式文件
│   ├── admin.css             # 管理后台样式
│   ├── app.js                # 前端逻辑
│   └── admin.js              # 管理后台逻辑
├── migrations/               # 数据库迁移文件
│   ├── 0001_init.sql         # 数据库初始化
│   ├── 0002_add_exif.sql     # EXIF 字段迁移
│   ├── 0003_add_site_settings.sql  # 网站设置表
│   ├── 0004_add_layout_fields.sql  # 布局字段迁移
│   ├── 0005_add_default_admin.sql  # 默认管理员
│   ├── 0006_add_welcome_message.sql  # 欢迎语字段
│   └── 0007_add_delete_performance_indexes.sql  # 性能索引
├── scripts/
│   ├── package.js            # 打包脚本
│   ├── migrate-all.js        # 数据库迁移脚本
│   ├── migrate-remote.js     # 远程数据库迁移脚本
│   ├── update-version.js     # 版本更新脚本
│   └── validate.js           # 代码验证脚本
├── package.json              # 项目配置
├── wrangler.toml             # Cloudflare Workers 配置
├── .gitignore                # Git 忽略配置
├── CHANGELOG.md              # 更新日志
└── README.md                 # 本文件
```

## 🚀 快速开始

### 前置要求

1. Cloudflare 账号
2. Wrangler CLI
3. Node.js 18+

### 1. 安装依赖

```bash
npm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 创建 Cloudflare 资源

#### 创建 D1 数据库
```bash
npx wrangler d1 create photo-blog-db
```
复制返回的 `database_id`

#### 创建 R2 存储桶
```bash
npx wrangler r2 bucket create photo-bucket
```

### 4. 配置 Workers 绑定

编辑 `wrangler.toml`，替换以下占位符：

- `database_id` - 替换为实际的 D1 数据库 ID

### 5. 初始化数据库

执行数据库迁移文件来创建表结构并添加默认管理员账号：

```bash
# 执行所有迁移文件（推荐使用脚本）
npm run remote:migrate
```

或手动执行：

```bash
npx wrangler d1 execute photo-blog-db --remote -y --file=./migrations/0001_init.sql
npx wrangler d1 execute photo-blog-db --remote -y --file=./migrations/0002_add_exif.sql
npx wrangler d1 execute photo-blog-db --remote -y --file=./migrations/0003_add_site_settings.sql
npx wrangler d1 execute photo-blog-db --remote -y --file=./migrations/0004_add_layout_fields.sql
npx wrangler d1 execute photo-blog-db --remote -y --file=./migrations/0005_add_default_admin.sql
npx wrangler d1 execute photo-blog-db --remote -y --file=./migrations/0006_add_welcome_message.sql
npx wrangler d1 execute photo-blog-db --remote -y --file=./migrations/0007_add_delete_performance_indexes.sql
```

### 6. 部署 Workers

```bash
npm run deploy
```

## 📖 使用指南

### 默认管理员账号

系统预置了默认管理员账号：

- **用户名**: `admin`
- **密码**: `a12345678`

**重要**:
- 首次登录后请立即修改默认密码
- 默认密码仅为初始设置，请勿在生产环境中使用
- 建议使用强密码（至少8位，包含字母、数字和特殊字符）

### 访问网站

部署完成后，访问你的 Worker 域名即可。

### 登录管理面板

1. 点击页面底部"管理登录"或"管理后台"链接
2. 输入管理员账号和密码
3. 登录后可以访问管理后台功能

### 语言切换

点击侧边栏右上角的语言切换按钮（EN/中文），可在中英文之间切换，系统会自动保存您的语言偏好。

### 网站设置

在管理后台可修改以下网站信息：
- 网站标题
- LOGO 文本
- 作者姓名
- 联系方式
- 关于页面内容
- 欢迎语

这些设置会实时反映在前端页面上。

### 修改密码

登录后可以在管理后台修改密码：

1. 点击管理后台页面顶部的"修改密码"按钮
2. 输入当前密码
3. 输入新密码（至少8位）
4. 确认新密码
5. 点击"确认修改"

## 🖌️ 管理后台

管理后台提供完整的照片可视化管理功能：

### 网站信息管理
- **修改网页信息**：点击顶部"修改网页信息"按钮，可编辑以下内容：
  - 网站标题：显示在页面顶部的网站名称
  - LOGO：显示在侧边栏的品牌标识
  - 作者姓名：摄影师署名
  - 联系方式：联系邮箱或其他联系方式
  - 关于信息：关于页面的介绍文字
- **保存设置**：点击"保存设置"按钮保存修改
- **实时预览**：修改后立即在前端生效

### 访问管理后台
登录后，点击页面底部的"管理后台"链接或直接访问 `/admin`。

### 照片库管理
- **左侧照片库**：显示所有已上传的照片
- **拖拽添加**：从照片库拖拽照片到画布区域
- **查看信息**：悬停显示照片标题

### 可视化排版
- **自由拖拽**：在画布上自由移动照片位置
- **调整大小**：拖拽照片边缘或角落的拉手调整尺寸
- **删除照片**：点击照片查看详情后删除

### 外部拖入上传
- **直接拖入**：从电脑文件夹直接拖入图片文件
- **自动弹出设置**：拖入后自动弹出照片设置对话框
- **快速上传**：填写标题、描述后即可上传到画布
- **缩略图生成**：自动生成400x400缩略图，存储在R2的/thumbnails/目录

### 相册管理
- **选择相册**：左侧相册列表选择当前相册
- **加载布局**：选择相册后自动加载保存的布局
- **新建相册**：点击"+ 新建相册"创建新相册
- **编辑相册**：点击相册名称编辑相册信息
- **删除相册**：必须先清空相册中的照片

### 保存与预览
- **保存布局**：点击顶部"保存布局"按钮保存当前位置和尺寸
- **重置布局**：点击"重置布局"恢复默认网格布局
- **预览效果**：点击"预览"跳转到前台查看实际效果

### EXIF 信息显示

点击照片查看大图时，右侧会自动显示 EXIF 信息（如果有）：
- 相机品牌和型号
- 镜头型号
- ISO 感光度
- 光圈值
- 快门速度
- 焦距
- 拍摄时间
- GPS 位置（如有）

系统会自动从 JPEG 文件中提取 EXIF 信息。

## 🎨 本地开发

### 本地 D1 数据库配置

为了在本地使用 D1 数据库，需要创建本地数据库实例：

### 执行本地数据库迁移

```bash
# 在本地数据库执行迁移
npm run local:migrate
```

### 启动开发服务器

```bash
npm run dev
```

服务器会在 `http://localhost:8788` 启动

### 常用调试命令

```bash
# 查看本地数据库内容
npx wrangler d1 execute photo-blog-db --local --command "SELECT * FROM photos"

# 查看日志
npx wrangler tail

# 查看远程数据库内容
npx wrangler d1 execute photo-blog-db --command "SELECT * FROM photos"
```

## 📦 打包发布

使用打包脚本创建发布版本：

```bash
npm run package
```

这将在 `dist/` 目录创建一个压缩包，包含所有必要文件。

## 🔧 API 文档

### 认证

#### 登录
```http
POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}
```

#### 登出
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### 验证会话
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 照片

#### 获取照片列表
```http
GET /api/photos?page=1&limit=20
```

#### 获取单张照片
```http
GET /api/photos/:id
```

#### 上传照片（需要认证）
```http
POST /api/admin/photos
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary>
thumbnail: <binary>
title: "标题"
description: "描述"
collection_id: 1
```

#### 更新照片（需要认证）
```http
PUT /api/admin/photos/:id
Authorization: Bearer <token>
{
  "title": "新标题",
  "description": "新描述",
  "sort_order": 1,
  "layout_x": 100,
  "layout_y": 100,
  "layout_width": 250,
  "layout_height": 250
}
```

#### 删除照片（需要认证）
```http
DELETE /api/admin/photos/:id
Authorization: Bearer <token>
```

### 相册

#### 获取相册列表
```http
GET /api/collections
```

#### 获取相册中的照片
```http
GET /api/collections/:id/photos
```

#### 创建相册（需要认证）
```http
POST /api/admin/collections
Authorization: Bearer <token>
{
  "name": "相册名称",
  "description": "描述"
}
```

#### 更新相册（需要认证）
```http
PUT /api/admin/collections/:id
Authorization: Bearer <token>
{
  "name": "新名称",
  "description": "新描述"
}
```

#### 删除相册（需要认证）
```http
DELETE /api/admin/collections/:id
Authorization: Bearer <token>
```

**注意**：删除相册前必须先清空相册中的所有照片。

### 网站设置

#### 获取网站设置
```http
GET /api/site-settings
```

#### 更新网站设置（需要认证）
```http
PUT /api/admin/site-settings
Authorization: Bearer <token>
{
  "site_title": "PhotoBlog",
  "site_logo": "LINTHU",
  "author_name": "Lin",
  "contact_email": "DPICW_WY@163.com",
  "about_content": "这是一个相册展示系统"
}
```

### 管理

#### 修改密码（需要认证）
```http
PUT /api/admin/change-password
Authorization: Bearer <token>
{
  "currentPassword": "当前密码",
  "newPassword": "新密码"
}
```

#### 健康检查
```http
GET /api/health
```
返回系统状态和初始化状态

#### 数据库初始化
```http
POST /api/admin/init
```
自动创建所有数据库表和索引（仅在表不存在时执行）

## 🔒 安全建议

1. 使用强密码（至少 8 位，建议 12 位以上）
2. 定期更新依赖
3. 启用 Cloudflare Access 限制管理面板
4. 定期备份数据库

## 📊 监控

访问 Cloudflare Dashboard 查看：
- Workers 分析
- R2 使用情况
- D1 查询日志

## 🐛 故障排查

### 部署失败
```bash
# 查看部署日志
npx wrangler tail
```

### 数据库问题
```bash
# 查询数据库
npx wrangler d1 execute photo-blog-db --command "SELECT * FROM photos"

# 手动执行迁移
npm run remote:migrate
```

### 无法登录

- 确认已执行所有迁移文件
- 使用默认账号：`admin` / `a12345678`
- 检查数据库中是否有用户记录：
  ```bash
  npx wrangler d1 execute photo-blog-db --command "SELECT * FROM users"
  ```
- 检查网站设置是否已初始化：
  ```bash
  npx wrangler d1 execute photo-blog-db --command "SELECT * FROM site_settings"
  ```

### 缩略图问题

- 缩略图在上传时自动生成并存储在 R2 的 `/thumbnails/` 目录
- 缩略图尺寸：最大 400x400 像素
- 缩略图质量：JPEG 70%
- 访问路径：`/thumbnails/{filename}`

## 📝 许可

MIT License
