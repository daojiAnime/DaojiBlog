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
