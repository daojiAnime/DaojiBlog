---
title: Python获取系统类型
tags:
  - Python
  - platform
  - 操作系统
  - 系统信息
categories:
  - Python
toc: true
toc_number: true
abbrlink: 32717
date: 2022-11-06 09:30:27
updated:
keywords: Python, platform, 操作系统, system, OS检测, Windows, Linux, Darwin
description: 一篇快速入门教程，介绍如何使用Python内置的`platform`模块来获取当前操作系统的类型（如Windows, Linux, Darwin），并根据不同系统执行相应代码。
top_img: https://cdn.jsdelivr.net/gh/daojiAnime/cdn@master/img/photo-1669041124233-295fb1ab1f4f.webp
comments:
cover: https://cdn.jsdelivr.net/gh/daojiAnime/cdn@master/img/photo-1669041124233-295fb1ab1f4f.webp
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

###  通过platform模块可以获取系统信息

```python
# 判定系统
is_sys = platform.system()
if is_sys == "Darwin":
	pass
elif is_sys == "Linux":
	pass
else:
	None
```
