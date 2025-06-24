---
title: 使用Speedtest进行带宽测速
tags:
  - Linux
  - Speedtest
  - 网络工具
  - 带宽测试
  - Shell
toc: false
abbrlink: 18198
date: 2018-04-15 18:33:48
updated:
categories:
  - Linux
  - 工具
description: 本文提供了在Linux命令行下使用`speedtest-cli`工具进行网络带宽测速的快速指南，包含两种通过`wget`命令下载并设置执行权限的安装方法。
keywords: Linux, Speedtest, speedtest-cli, 带宽测试, 网速测试, Shell脚本
---
# 使用Speedtest进行带宽测速 #
--------------------------------------
```shell
wget -O speedtest-cli https://raw.github.com/sivel/speedtest-cli/master/speedtest.py
chmod +x speedtest-cli
```

---------------------------------------
```shell
wget https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py

chmod a+rx speedtest.py
mv speedtest.py /usr/local/bin/speedtest-cli
chown root:root /usr/local/bin/speedtest-cli

speedtest-cli
```
