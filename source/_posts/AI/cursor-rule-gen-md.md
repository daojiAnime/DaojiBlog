---
title: 🧭 Cursor Rules 一页规范
tags:
  - blog
  - 人工智能
categories:
  - AI
toc: true
toc_number: true
date: 2025-10-14 17:29:26
updated: 2025-10-14 18:05:00
keywords: Cursor, 规则, .cursor/rules, .cursorrules, MDC, 约定, 编码规范, 提示词, 规则注入, Hexo
description: 一页指南，介绍 Cursor `.cursor/rules/*.mdc` 的编写与使用，涵盖文件结构、匹配与激活机制、常见模式与最佳实践，并附示例模板。
top_img:
comments:
cover:
toc_style_simple:
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
mathjax:
katex:
aplayer:
highlight_shrink:
aside:
---

# 🧭 Cursor Rules 一页规范

> 适用于 Cursor 编辑器（`.cursor/rules/*.mdc`）
>  目的：让 AI 始终遵循项目约定、编码规范、文档风格。

------

## 🗂️ 规则类型与层级

| 类型                        | 位置             | 作用范围 | 说明                     |
| --------------------------- | ---------------- | -------- | ------------------------ |
| **User Rules**              | 设置 → Rules     | 全局     | 个人偏好、风格、语气     |
| **Project Rules**           | `.cursor/rules/` | 当前项目 | 项目约定、代码规范       |
| **Memories**                | 自动生成         | 临时     | 保存 AI 对项目的学习记忆 |
| **Legacy (`.cursorrules`)** | 项目根目录       | 旧格式   | 推荐迁移到 `.mdc`        |

------

## 📄 `.mdc` 文件结构

```mdc
---
description: 指定规则用途（简洁清晰）
globs: src/**/*.ts, tests/**/*.ts
alwaysApply: false
---

- 指导内容 / 编码规范 / 示例
```

### 字段说明

- **description**：一句话描述规则用途（AI 判断相关性用）
- **globs**：匹配文件路径（仅匹配时生效）
- **alwaysApply**：`true` = 总是启用；`false` = 仅匹配时注入

------

## ⚙️ 规则生效机制

1. **注入 (Injection)**：规则文本进入上下文（prompt）
2. **激活 (Activation)**：AI 判断规则与任务相关后才真正遵守

> 注入 ≠ 一定生效，规则需被模型“激活”后才有效。

------

## 🧩 常见规则模式

| 模式                 | 启用方式            | 用途示例                       |
| -------------------- | ------------------- | ------------------------------ |
| **Always**           | `alwaysApply: true` | 全局安全规范、命名约定         |
| **Auto Attached**    | `globs` 匹配        | 模块/目录级规则                |
| **Agent Requested**  | `description` 触发  | 特定任务触发（如生成 GraphQL） |
| **Manual (`@rule`)** | 手动调用            | 临时规则、非自动启用           |

------

## 🪜 嵌套与作用域

- 子目录可设局部规则：`frontend/.cursor/rules/`
- 多层目录下的规则会按路径匹配自动注入
- 推荐：**项目级通用 + 模块级局部**

------

## ✅ 编写最佳实践

1. **每条规则聚焦一个主题**
2. **description 清晰可匹配任务**
3. **合理使用 globs 限定范围**
4. **慎用 alwaysApply**，避免上下文膨胀
5. **正文包含代码示例 / 模板**
6. **纳入 Git 管理，定期更新**
7. **避免规则冲突，保持一致性**

------

## ⚠️ 注意事项

- 规则注入不透明，AI 可能忽略冲突或模糊规则
- `@docs/...` 文件引用不总可靠
- `.mdc` 内置编辑 UI 有时不稳定，推荐外部编辑器
- 上下文过长可能导致截断，影响规则生效

------

## 🚀 使用流程

1. 创建 `.cursor/rules/` 目录
2. 新建 `.mdc` 文件并填写 `description / globs / alwaysApply`
3. 在正文写清楚规则内容
4. 编辑匹配文件或对话时自动启用
5. 需要时在对话中使用 `@ruleName` 显式调用

------

### ✅ 示例

```mdc
---
description: Apply to all service layer files
globs: src/services/**/*.ts
alwaysApply: false
---

- Service 类以 `*Service` 命名  
- 不直接访问数据库  
- 必须定义输入/输出类型
```
