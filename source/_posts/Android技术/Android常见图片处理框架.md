---
title: Android三大图片加载框架对比：Glide vs Picasso vs Fresco
tags:
  - Android
  - Glide
  - Picasso
  - Fresco
  - 图片加载
  - 性能优化
toc: false
abbrlink: 5489
date: 2018-08-13 19:42:00
updated:
categories:
  - Android技术
description: 本文对比分析了Android开发中三种主流的图片加载框架：Glide、Picasso和Fresco。从加载机制、内存管理（LruCache）、性能（OOM避免）以及颜色模式等方面进行了详细比较，帮助开发者选择最适合的图片处理方案。
keywords: Android图片加载, Glide, Picasso, Fresco, 图片框架对比, OOM, LruCache, 性能优化, Android开发
---
> #### 注意：第三方图片处理框架内部都已经封装了LruCatch，用来处理大图的加载，避免了OOM异常，使用了线程池来管理线程，避免了开启多个线程造成的资源的浪费，对于更新UI，内部也已经封装了Handler来进行线程间通信，将数据发送到UI线程来进行更新UI线程

### Glide：

&emsp;&emsp;默认使用Hurlconnection加载图片，一个比较轻量级的图片加载框架，通过配合图片加载库的使用，可以做出多种图片加载特效：如可以自定义各种形状的图片，和图片加载的样式，另外还可以设置默认图片等等

### Picasso：

&emsp;&emsp;使用okHttp加载图片，使用方式与Glide类似，而且使用的类库和Glide是相同的，实现效果是基本上一样的，也可以设置默认图片，但是Picasso这个框架默认的颜色模式是ARGB8888，Glide的颜色模式是RGB565，Glide会根据图片的宽高压缩图片，Picasso不会

### Fresco：

&emsp;&emsp;把图片加载后放在了供JVM使用的内存区域，提高了应用可以使用的内存大小，不会出现OOM异常，支持渐进的图片加载，内部封装了图片加载控件，相比较其他两个加载图片的框架，他的内存占用就比较小，同时他可以配合SVG图片，呈现出多种多样的样式，加载原型图片更是小意思