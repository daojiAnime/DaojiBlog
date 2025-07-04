---
title: 解决Git/GitHub下载慢的三个有效方法：淘宝镜像、Gitee与修改hosts
toc: true
toc_number: true
tags:
  - Git
  - GitHub
  - Gitee
  - 网络优化
  - hosts
  - 杂项
abbrlink: 30418
date: 2020-06-26 07:23:26
updated:
categories:
  - 工具
  - 杂项
description: 本文汇总了三种解决Git和GitHub下载速度缓慢问题的有效方法：通过淘宝镜像下载Git for Windows，利用Gitee（码云）作为代理克隆GitHub项目，以及修改本地hosts文件直接解析IP。
keywords: GitHub下载慢, Git下载慢, Gitee克隆, GitHub镜像, hosts修改, 加速GitHub, Git for Windows, 网络问题
---

官网下载 Git 时，速度几乎是超不过 20KB，解决方法有很多，这里介绍几个简单粗暴的方法。这里使用 windows 系统作为演示，其他系统对号入座即可。

## 方法一：淘宝镜像

淘宝有一个镜像的网站 可以提供下载：https://npm.taobao.org/mirrors/git-for-windows/ 点击上方链接，往下拉就会看到相应的版本，第一个最新版本，后面的是历史版本。

## 方法二：利用码云来克隆 GitHub 项目，操作简单而且有效

1、首先需要一个码云账户，如果你没有，这个是官网地址——https://gitee.com/ 。 2、如果没有账户,需要注册一个账户。注册使用手机号就可以，一分钟的事。 3、新建一个仓库,选择导入已有仓库。 4、找到你的 GitHub 网站，选择 clone 下的网址，复制。 5、在上面链接中输入我们刚刚复制的要导入的 github 项目地址，然后点击创建。 6、等待码云克隆项目，大概 1-3 分钟（由你的网络和要克隆项目大小决定）。 7、克隆完成，下载我们码云上的项目（这个就是你正常下载速度了）。 8、正常下载项目（原谅我的超级慢校园网速）。 9、最后下载完成后，如果不需要这个项目了可以在码云上删除，我们只是想解决下载慢和下载不下来的问题而已，不要过多的创建无用项目。 10、选择删除仓库，复制黑色验证信息到相应位置，点击确认删除，然后验证你的密码，就可以删除了。

## 方法三：修改 hosts

第一步：去这个网站查询 3 个域名对应的 IP 地址，不能用 ping 来获取 IP 地址哦

```
https://www.ipaddress.com/
```

第二步：在/etc/hosts 文件中添加类似下面的 3 行

```
192.30.253.113  github.com
151.101.185.194 github.global.ssl.fastly.net
192.30.253.120  codeload.github.com
```

第三步：重启网络

```
sudo /etc/init.d/networking restart
```

现在可以飞快的下载 Github 上的代码了。
