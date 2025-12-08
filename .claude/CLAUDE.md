# DaojiBlog - Hexo 博客项目

## 项目概述

个人技术博客，专注于 AI、编程技术分享。

- **框架**: Hexo 7.3.0
- **主题**: Butterfly
- **包管理**: pnpm
- **部署**: GitHub Pages (daojiAnime.github.io)
- **域名**: https://www.daoji-anime.com

---

## 目录结构

```
├── source/
│   ├── _posts/       # 博客文章 (Markdown)
│   ├── _drafts/      # 草稿
│   ├── _data/        # 数据文件 (link.yml 等)
│   ├── assets/       # 静态资源
│   └── categories/tags/  # 分类/标签页
├── themes/butterfly/ # 主题配置
├── _config.yml       # Hexo 主配置
└── public/           # 生成的静态文件
```

---

## 常用命令

```bash
# 开发
pnpm run dev          # 清理 + 生成 + 启动本地服务器（含草稿）
pnpm run start        # 启动本地服务器

# 构建与部署
pnpm run generate     # 生成静态文件
pnpm run d            # 清理 + 部署到 GitHub Pages
pnpm run clean        # 清理缓存

# 新建文章
pnpm run new "文章标题"
```

---

## 文章规范

### Front Matter 模板

```yaml
---
title: 文章标题
date: YYYY-MM-DD HH:mm:ss
updated: YYYY-MM-DD HH:mm:ss
tags:
  - 标签1
  - 标签2
categories:
  - 分类名
description: 文章摘要描述
keywords: 关键词1, 关键词2
cover: /assets/cover.jpg  # 可选封面图
---
```

### 内容关键词参考

AI, Agent, RAG, LLM, MCP, Python, Golang, FastAPI, Django

---

## 配置文件

| 文件 | 用途 |
|------|------|
| `_config.yml` | Hexo 主配置（站点信息、URL、插件） |
| `themes/butterfly/_config.yml` | 主题配置（导航、样式、功能） |
| `source/_data/link.yml` | 友链数据 |

---

## 已安装插件

- `hexo-abbrlink` - 永久链接
- `hexo-blog-encrypt` - 文章加密
- `hexo-generator-feed` - RSS 订阅
- `hexo-generator-sitemap` - 站点地图
- `hexo-generator-searchdb` - 本地搜索
- `hexo-tag-aplayer` - 音乐播放器
- `hexo-wordcount` - 字数统计

---

## 注意事项

1. 文章放置于 `source/_posts/` 目录
2. 草稿放置于 `source/_drafts/` 目录
3. 永久链接格式: `posts/:abbrlink.html`
4. 部署前确保 `hexo clean` 清理缓存

---

## 文章撰写流程

### ⚠️ 重要：必须使用 Hexo 命令创建文章

**禁止直接使用 Write 工具创建文章文件**，必须使用 Hexo 命令，否则会缺少必要的元数据（如 `abbrlink`、主题配置字段等）。

### 创建草稿（推荐流程）

```bash
# 1. 使用 hexo 命令创建草稿（会自动生成完整的 Front Matter）
hexo new draft "文章标题"

# 2. 编辑草稿内容
# 文件位置: source/_drafts/文章标题.md

# 3. 预览草稿
pnpm run dev

# 4. 发布草稿（移动到 _posts 并生成 abbrlink）
hexo publish "文章标题"
```

### 直接创建文章

```bash
# 直接创建到 _posts 目录
hexo new post "文章标题"
# 或
pnpm run new "文章标题"
```

### Front Matter 字段说明

使用 Hexo 命令创建的文章会自动包含以下字段：

```yaml
---
title: 文章标题
tags:
  - blog
categories:
  - 未分类
toc: true
toc_number: true
date: 2025-12-08 17:59:42
updated:
keywords:
description:
top_img:
comments:
cover:
# ... 其他 Butterfly 主题字段
---
```

**需要手动补充的字段**：
- `tags` - 修改为实际标签
- `categories` - 修改为实际分类
- `description` - 文章摘要
- `keywords` - SEO 关键词
- `updated` - 更新时间

### 内容撰写辅助

- Web Search - 搜索最新资料
- Context7 - 查阅技术文档
- 探索项目代码 - 分析技术实现
