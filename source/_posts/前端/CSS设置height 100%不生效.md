---
title: CSS中height 100%为何不生效？Flexbox布局解决方案
tags:
  - CSS
  - Flexbox
  - 前端开发
  - 布局问题
categories:
  - 前端
  - CSS
toc: true
toc_number: true
abbrlink: 44550
date: 2024-02-22 09:40:38
updated:
keywords: CSS, height, 100%, 不生效, flexbox, grid, 垂直居中, 布局, 前端
description: 本文详细解释了为什么在父元素没有固定高度时，子元素设置 height 100% 会失效，并提供了使用 Flexbox (display flex) 和 Grid 布局作为现代CSS解决方案，以实现元素高度的动态填充。
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

# CSS设置height: 100%不生效

父元素没有固定高度的时候，子元素设置height: 100%不生效。但是可以通过flexbox布局或者grid布局来让元素自动填充剩余宽度或者高度。

html：

```html
<div class="parent">
  <div class="child"></div>
</div>
```

css：

```css
.parent {
  display: flex;
  flex-direction: column; /* 确保子元素在父元素内垂直排列 */
}

.child {
  flex-grow: 1; /* 让子元素填充剩余空间 */
  /* 或者使用 flex: 1; 也可以实现同样的效果 */
}

```

