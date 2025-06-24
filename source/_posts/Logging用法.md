---
title: Logging用法
tags:
  - Python
  - log
  - logging
  - 日志
categories:
  - Python
  - logging
toc: true
toc_number: true
abbrlink: 56655
date: 2023-03-03 11:14:02
updated:
keywords: Python, logging, Logger, 日志模块, Python日志
description: 本文介绍了Python中`logging`模块的一个实用技巧：如何遍历并打印出当前所有已实例化的Logger对象，方便在复杂项目中调试和管理日志记录器。
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

# Logging用法

## 打印所有Logger对象

```python
 for name in logging.Logger.manager.loggerDict.keys():
        logger = logging.getLogger(name)
        print('name = %s, logger = %s' % (name, logger))	
```

