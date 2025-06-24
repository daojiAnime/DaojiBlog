---
title: 自家Linux
tags:
  - Linux
  - CentOS
  - 系统配置
  - Gnome
toc: false
abbrlink: 57501
date: 2018-07-17 08:49:00
updated:
categories:
  - Linux
  - 系统管理
description: 本文记录了在CentOS 7上的一些实用配置技巧，包括如何在Gnome图形界面下解除锁屏，以及如何通过修改`logind.conf`配置文件来管理合上笔记本盖后的系统行为，如防止休眠。
keywords: Linux, CentOS 7, 系统配置, Gnome, 锁屏, 休眠管理, logind.conf
---
![](https://ws1.sinaimg.cn/large/e3bf8736gy1fyqgf924gsj21z81bhx6u.jpg)
<!--more-->
### #centos7配置第一篇
##GUI界面锁屏解除

    #设置->隐私->锁屏和通知  都关闭

##CLI界面合盖休眠解除

```shell
vi /etc/systemd/logind.conf
```
#HandlePowerKey       //按下电源键后的行为，默认 `=poweroff`

#HandleSuspendKey     //按下挂起键后的行为，默认 `=suspend`

#HandleHibernateKey   //按下休眠键的行为，默认 `=hibernate`

#HandleLidSwitch      //合上笔记本盖后的行为，默认 `=suspend`，应该改为 `=lock`，并且在文件中去除前面的`#`

运行配置文件使其生效 ###


```shell
systemctl restart systemd-logind
```

