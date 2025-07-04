---
title: 如何在HTML网页中嵌入网易云音乐播放器
toc: false
tags:
  - HTML
  - iframe
  - 网易云音乐
  - 网页嵌入
  - 前端
abbrlink: 2893
date: 2020-05-02 10:22:06
updated:
categories:
  - 前端
  - HTML
keywords: HTML, iframe, 网易云音乐, 音乐播放器, 嵌入代码, 单曲播放, 歌单播放, 网页开发
description: 本文提供了在HTML网页中通过iframe嵌入网易云音乐播放器的详细代码示例和参数说明，包括如何实现单曲播放和歌单列表播放，并解释了如何自定义播放器宽度、高度及是否自动播放。
---

### 表现形式一：单曲播放



**调用代码：**

```html
<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=100% height=86 src="http://music.163.com/outchain/player?type=2&id=299757&auto=1&height=66"></iframe>
```

**参数说明：**

> **播放器可修改参数：**
> 
> **width=100% #自适应宽度**
> 
> **height=86 #根据自己喜好修改**
> 
> **id=299757 #为歌曲的ID http://music.163.com/#/song?id=299757**
> 
> **auto=0 #0为不自动播放，1为自动播放**

**效果图：**

![img](https://gitee.com/djgzs_admin/ArticleImg/raw/master/2020/05/02/2020/05/02/20200502102248.png)



### 表现形式二：列表播放

**调用代码：*

```html
<iframe src="http://music.163.com/outchain/player?type=0&amp;id=34238509&amp;auto=0&amp;height=430" width="100%" height="450" frameborder="no" marginwidth="0" marginheight="0"></iframe>
```

**参数说明：**

> **播放器可修改参数：**
> 
> **width=100% #自适应宽度**
> 
> **height=450#根据自己喜好修改**
> 
> **id=34238509#为歌曲列表页的ID ,例如：http://music.163.com/#/playlist?id=34238509**
> 
> **auto=0 #0为不自动播放，1为自动播放**

**效果图：**



![img](https://gitee.com/djgzs_admin/ArticleImg/raw/master/2020/05/02/2020/05/02/20200502102327.png)

***fds***

