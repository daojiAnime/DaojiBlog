---
title: 线程同步锁Synchronized
tags:
  - Java
  - 多线程
  - 并发编程
  - Synchronized
toc: false
abbrlink: 9083
date: 2018-08-22 16:54:59
updated:
categories:
  - Java
  - 并发
description: 本文通过一个简单的Java代码示例，演示了`synchronized`关键字在多线程编程中的基本用法，用于解决并发场景下的线程安全问题，确保共享变量的原子性操作。
keywords: Java, 多线程, 线程同步, Synchronized, 并发编程, 线程安全, 同步锁
---
![](https://ws1.sinaimg.cn/large/e3bf8736gy1fyqgc51a2lj22401eo156.jpg)
<!--more-->

# 线程同步锁Synchronized

```java

class AccountingSync implements Runnable {
    static AccountingSync instance = new AccountingSync();
    static int i = 0;

    @Override
    public void run() {
        //省略其他耗时操作....
        while (true) {
            synchronized (AccountingSync.class) {
                if (i < 100) {
                    i++;
                    System.out.println(Thread.currentThread().getName() + "    "+ i);
                }
            }
        }
    }

}

class test {
    public static void main(String[] args) {
        AccountingSync accountingSync = new AccountingSync();
        Thread t1 = new Thread(accountingSync);
        Thread t2 = new Thread(accountingSync);
        t1.start();
        t2.start();
    }
}
```