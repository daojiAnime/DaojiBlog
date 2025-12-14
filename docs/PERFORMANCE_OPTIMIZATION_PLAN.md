# DaojiBlog 性能优化方案

> 生成时间: 2025-12-08
> 基于 PageSpeed Insights 报告分析

---

## 当前性能概况

| 指标 | 当前值 | 目标值 | 状态 |
|------|--------|--------|------|
| **Performance** | 64 | 90+ | 🔴 需优化 |
| **FCP** | 3.6s | <1.8s | 🔴 |
| **LCP** | 7.8s | <2.5s | 🔴 严重 |
| **TBT** | 110ms | <200ms | 🟢 良好 |
| **CLS** | 0.004 | <0.1 | 🟢 良好 |
| **Speed Index** | 5.2s | <3.4s | 🟡 |
| **无障碍** | 88 | 90+ | 🟡 |
| **最佳做法** | 96 | 100 | 🟢 |
| **SEO** | 100 | 100 | 🟢 |

---

## 核心问题诊断

### 问题 1：渲染阻塞资源（预计节省 1,630ms）
- 外部 CSS 文件阻塞首屏渲染
- `inject.head` 中加载的外部背景 CSS

### 问题 2：LCP 过高（7.8秒）
- 首页大图使用外部 imgur 链接
- 大量 SVG 封面图片来自 rackcdn.com（700+ 张）

### 问题 3：第三方资源过多
- hitokoto API 请求（一言）
- Google Analytics
- 不蒜子统计
- Twikoo 评论系统

### 问题 4：未使用的 JS/CSS（96 KiB）
- 减少未使用的 JavaScript — 预计节省 59 KiB
- 减少未使用的 CSS — 预计节省 37 KiB
- 缩减 CSS — 预计节省 4 KiB
- 缩减 JavaScript — 预计节省 2 KiB

### 问题 5：其他
- 使用高效的缓存生命周期 — 预计节省 116 KiB
- 字体显示 — 预计缩短 20 毫秒
- 改进图片传送 — 预计节省 28 KiB

---

## 优化进度跟踪

### 待执行 ⏳

- [ ] **P0: 关闭一言 API 和打字机效果**
  - 文件: `themes/butterfly/_config.yml`
  - 修改: `subtitle.effect: false`, `subtitle.source: false`
  - 预期收益: FCP -500ms

- [ ] **P0: 启用评论懒加载**
  - 文件: `themes/butterfly/_config.yml`
  - 修改: `comments.lazyload: true`
  - 预期收益: LCP -300ms
- [ ] **P0: 关闭不蒜子统计**
- [ ] **P1: 下载首页大图并转换为 WebP**
- [ ] **P1: CSS 延迟加载优化**
- [ ] **P1: 添加资源预连接**
- [ ] **P2: 精简默认封面图配置**
- [ ] **P2: 安装 hexo-all-minifier 压缩插件**
- [ ] **P3: 优化字体加载策略**

---

## 详细优化步骤

### P0: 关闭不蒜子统计

**文件**: `themes/butterfly/_config.yml`

**修改内容**:
```yaml
# 修改前
busuanzi:
  site_uv: true
  site_pv: true
  page_pv: true

# 修改后
busuanzi:
  site_uv: false
  site_pv: false
  page_pv: false
```

**预期收益**: FCP -200ms

---

### P1: 下载首页大图并转换为 WebP

**步骤**:

1. 下载当前使用的外部图片:
```bash
# 首页大图
curl -o source/assets/img/index-banner.png "https://i.imgur.com/VeZhnNU.png"

# 默认顶部图
curl -o source/assets/img/default-top.png "https://i.imgur.com/jRNf3kb.png"

# 头像图片
curl -o source/assets/img/avatar.jpg "https://i.imgur.com/6DEulXU.jpg"
```

1. 转换为 WebP 格式:
```bash
# 转换图片
cwebp -q 80 source/assets/img/index-banner.png -o source/assets/img/index-banner.webp
cwebp -q 80 source/assets/img/default-top.png -o source/assets/img/default-top.webp
cwebp -q 80 source/assets/img/avatar.jpg -o source/assets/img/avatar.webp
```

1. 修改配置文件 `themes/butterfly/_config.yml`:
```yaml
# 修改前
avatar:
  img: https://i.imgur.com/6DEulXU.jpg

default_top_img: https://i.imgur.com/jRNf3kb.png
index_img: https://i.imgur.com/VeZhnNU.png
archive_img: https://i.imgur.com/jRNf3kb.png
tag_img: https://i.imgur.com/jRNf3kb.png
tag_per_img: https://i.imgur.com/jRNf3kb.png
category_img: https://i.imgur.com/jRNf3kb.png
category_per_img: https://i.imgur.com/jRNf3kb.png

# 修改后
avatar:
  img: /assets/img/avatar.webp

default_top_img: /assets/img/default-top.webp
index_img: /assets/img/index-banner.webp
archive_img: /assets/img/default-top.webp
tag_img: /assets/img/default-top.webp
tag_per_img: /assets/img/default-top.webp
category_img: /assets/img/default-top.webp
category_per_img: /assets/img/default-top.webp
```

**预期收益**: LCP -2000ms（消除外部图片请求延迟）

---

### P1: CSS 延迟加载优化

**文件**: `themes/butterfly/_config.yml`

**修改内容**:
```yaml
# 修改前
inject:
  head:
    - <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/daojiAnime/cdn/css/blog/background.css">
  bottom:

# 修改后
inject:
  head:
    # 预连接 CDN
    - <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    - <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  bottom:
    # 非关键 CSS 延迟加载
    - <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/daojiAnime/cdn/css/blog/background.css" media="print" onload="this.media='all'">
```

**预期收益**: FCP -400ms

---

### P1: 添加资源预连接

**文件**: `themes/butterfly/_config.yml`

在 `inject.head` 中添加:
```yaml
inject:
  head:
    - <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    - <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
```

**预期收益**: 减少 DNS 查询和 TCP 连接时间

---

### P2: 精简默认封面图配置

**文件**: `themes/butterfly/_config.yml`

当前配置了 **700+ 张外部 SVG 封面图**，这会：
1. 增加配置文件体积
2. 每次随机选择仍需要外部请求

**建议方案**:

1. 下载 10-20 张精选封面图到本地
2. 修改配置:

```yaml
# 修改前 (700+ 张外部链接)
cover:
  default_cover:
    - https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/...
    # ... 700+ 行

# 修改后 (精简为本地图片)
cover:
  index_enable: true
  aside_enable: true
  archives_enable: true
  default_cover:
    - /assets/covers/cover-01.webp
    - /assets/covers/cover-02.webp
    - /assets/covers/cover-03.webp
    - /assets/covers/cover-04.webp
    - /assets/covers/cover-05.webp
    - /assets/covers/cover-06.webp
    - /assets/covers/cover-07.webp
    - /assets/covers/cover-08.webp
    - /assets/covers/cover-09.webp
    - /assets/covers/cover-10.webp
```

**预期收益**: 配置文件体积减少 90%，图片加载更快

---

### P2: 安装 hexo-all-minifier 压缩插件

**步骤**:

1. 安装插件:
```bash
pnpm add hexo-all-minifier
```

2. 在 `_config.yml` (根目录) 添加配置:
```yaml
# 资源压缩配置
all_minifier: true

html_minifier:
  enable: true
  exclude: []

css_minifier:
  enable: true
  exclude:
    - '*.min.css'

js_minifier:
  enable: true
  mangle: true
  exclude:
    - '*.min.js'

image_minifier:
  enable: true
  interlaced: false
  multipass: false
  optimizationLevel: 2
  pngquant: false
  progressive: false
```

**预期收益**: HTML/CSS/JS 体积减少 20-40%

---

### P3: 优化字体加载策略

**文件**: `themes/butterfly/_config.yml`

```yaml
# 使用系统字体栈，避免加载自定义字体
font:
  global_font_size:
  code_font_size:
  font_family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"
  code_font_family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
```

**预期收益**: 字体加载时间 -20ms

---

## 其他可选优化

### 关闭分享功能（如不需要）

```yaml
# themes/butterfly/_config.yml
share:
  use:  # 留空关闭
```

### 关闭 Mermaid（如不需要）

```yaml
# themes/butterfly/_config.yml
mermaid:
  enable: false
```

### 优化 preloader

```yaml
# themes/butterfly/_config.yml
preloader:
  enable: false  # 或使用更轻量的加载动画
```

---

## 验证优化效果

### 本地测试

```bash
# 清理并重新生成
pnpm run clean && pnpm run generate

# 启动本地服务器
pnpm run start
```

### 性能测试

1. 访问 [PageSpeed Insights](https://pagespeed.web.dev/)
2. 输入网站地址进行测试
3. 对比优化前后的分数

### 预期效果

| 指标 | 优化前 | 预期优化后 |
|------|--------|------------|
| **Performance** | 64 | 85-95 |
| **FCP** | 3.6s | 1.5-2.0s |
| **LCP** | 7.8s | 2.0-3.0s |
| **Speed Index** | 5.2s | 2.5-3.5s |

---

## 注意事项

1. **备份配置**: 修改前请备份 `themes/butterfly/_config.yml`
2. **逐步验证**: 建议每完成一个优化项就验证效果
3. **图片准备**: P1 优化需要手动下载和转换图片
4. **CDN 缓存**: 部署后可能需要等待 CDN 缓存刷新才能看到效果

---

## 快速执行命令汇总

```bash
# 1. 安装 webp 工具 (macOS)
brew install webp

# 2. 创建目录
mkdir -p source/assets/img
mkdir -p source/assets/covers

# 3. 下载主要图片
curl -o source/assets/img/index-banner.png "https://i.imgur.com/VeZhnNU.png"
curl -o source/assets/img/default-top.png "https://i.imgur.com/jRNf3kb.png"
curl -o source/assets/img/avatar.jpg "https://i.imgur.com/6DEulXU.jpg"

# 4. 转换为 WebP
cwebp -q 80 source/assets/img/index-banner.png -o source/assets/img/index-banner.webp
cwebp -q 80 source/assets/img/default-top.png -o source/assets/img/default-top.webp
cwebp -q 80 source/assets/img/avatar.jpg -o source/assets/img/avatar.webp

# 5. 安装压缩插件
pnpm add hexo-all-minifier

# 6. 重新生成并测试
pnpm run clean && pnpm run generate && pnpm run start
```

---

## 参考资源

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Web.dev 性能优化指南](https://web.dev/performance/)
- [Butterfly 主题文档](https://butterfly.js.org/)
- [Hexo 优化指南](https://hexo.io/docs/optimization.html)
