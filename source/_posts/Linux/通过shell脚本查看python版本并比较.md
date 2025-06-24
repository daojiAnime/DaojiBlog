---
title: 通过shell脚本查看python版本并比较
toc: false
tags:
  - Python
  - Linux
  - Shell
  - 脚本
  - 版本比较
abbrlink: 14490
date: 2020-05-13 21:35:23
updated:
categories:
  - Linux
  - Shell编程
description: 提供一个实用的Shell脚本，用于自动检测并比较本机的Python版本是否满足指定要求。脚本通过解析`python -V`的输出，逐段比较主版本号、次版本号和修订号，是环境检查和自动化部署中的常用技巧。
keywords: Shell, 脚本, Python, 版本检测, 版本比较, Linux, 自动化脚本
top_img:
---

```shell
#!/bin/sh
checkPython()
{
    #推荐版本V2.6.5
    V1=2
    V2=6
    V3=5

    echo need python version is : $V1.$V2.$V3

    #获取本机python版本号。这里2>&1是必须的，python -V这个是标准错误输出的，需要转换
    U_V1=`python -V 2>&1|awk '{print $2}'|awk -F '.' '{print $1}'`
    U_V2=`python -V 2>&1|awk '{print $2}'|awk -F '.' '{print $2}'`
    U_V3=`python -V 2>&1|awk '{print $2}'|awk -F '.' '{print $3}'`

    echo your python version is : $U_V1.$U_V2.$U_V3

    if [ $U_V1 -lt $V1 ];then
        echo 'Your python version is not OK!(1)'
        exit 1
    elif [ $U_V1 -eq $V1 ];then
        if [ $U_V2 -lt $V2 ];then
            echo 'Your python version is not OK!(2)'
            exit 1
        elif [ $U_V2 -eq $V2 ];then
            if [ $U_V3 -lt $V3 ];then
                echo 'Your python version is not OK!(3)'
                exit 1
            fi
        fi
    fi

    echo Your python version is OK!
}
checkPython
```
