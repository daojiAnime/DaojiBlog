---
title: Linux通过ps -ef过滤进程获得行数
tags:
  - Linux
  - Shell
  - 脚本
  - ps
  - grep
  - wc
toc: false
abbrlink: 43992
date: 2018-10-09 16:08:00
updated:
categories:
  - Linux
  - Shell编程
description: 介绍一个实用的Linux Shell命令组合，通过`ps -fe | grep "process" | grep -v "grep" | wc -l`来精确统计特定进程的数量，并将其赋值给变量，是脚本编程中常用的技巧。
keywords: Linux, Shell, ps, grep, wc, 进程统计, 命令行
---

# Linux通过ps -ef过滤进程获得行数

------------

```shell
count=`ps -fe |grep "one.php" | grep -v "grep" | wc -l`
```

获取行数并赋值给count。