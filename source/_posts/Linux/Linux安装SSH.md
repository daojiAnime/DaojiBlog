---
title: CentOS 7安装SSH
tags:
  - Linux
  - CentOS
  - SSH
  - OpenSSH
  - 免密登录
toc: false
abbrlink: 43991
date: 2018-06-28 19:29:00
updated:
categories:
  - Linux
  - 服务器
description: 本文介绍了在CentOS 7上安装和配置SSH服务的详细步骤，包括启动sshd服务、使用密码登录，并重点讲解了如何通过生成和配置公私密钥对来实现安全的SSH免密码登录，提高服务器管理效率。
keywords: Linux, CentOS, SSH, sshd, 免密登录, 公钥认证, ssh-keygen, ssh-copy-id
---
![](https://ws1.sinaimg.cn/large/e3bf8736ly1fypzqdtamej21l8123qv7.jpg)
<!--more-->

### VPS上可能没有安装桌面，但一般来说都会安装ssh，并且防火墙默认开放22端口。

那就从ssh开始。

```shell
# 安装ssh，默认已安装好

# yum install ssh

# 启动ssh服务器端

# service sshd start
```

### ssh登陆 ###

如果本地端是Linux


```shell
# ssh root@192.168.1.1
```

其中root表示的是登录用户名，192.168.1.1为主机的IP地址，当然也可以使用主机名、域名来指代IP地址。


```shell
# ssh 192.168.1.1
```

则会以当前客户端的用户名进行登录。

 

### ssh无密码登录 ###

但是每次输入密码登录十分麻烦，有没有一种方式可以让服务器能够确定我的身份，无需输入密码可以直接通过认证？

ssh除了使用密码验证外，还提供了一种公私密钥的验证方式。客户端生成一个私钥，并生成一个与之对应的公钥，然后将公钥上传到服务器上。下面是Linux示例。

#### 在客户端生成私钥、公钥（注意，在客户端完成）：

    # ssh-keygen -t rsa

`-t` 指定要创建的密钥类型，默认就是rsa了，所以只执行ssh-keygen是一样的。

期间会提示你输入你私钥的加密密码。如果需要完全脱离密码，此处可留空，直接回车，否则以后每次连接需要本地解锁。

完成后，会当前用户的主目录下的`~/.ssh/`路径下生成两个文件`id_rsa`与`id_rsa.pub`分别是私钥与公钥。

接下来，要把生成的公钥上传到服务器上，同样还是在客户端执行以下的代码。

	# ssh-copy-id -i ~/.ssh/id_rsa.pub root@192.168.1.1

其中root可以修改为你想要自动登录的服务器端用户名，192.168.1.1修改为你的VPS主机名或IP地址。

### 最后，ssh登录远程服务器。

	# ssh root@192.168.1.1

此时就不需要密码就可以登录了。