---
title: 使用DenyHosts防止SSH暴力破解的安装与配置教程
tags:
  - Linux
  - SSH
  - DenyHosts
  - 网络安全
  - 服务器运维
toc: false
abbrlink: 7680
date: 2018-04-15 18:27:00
updated:
categories:
  - Linux
  - 网络安全
description: 本教程详细介绍了如何在Linux系统上安装和配置DenyHosts，一个用于防止SSH暴力破解的实用工具。内容涵盖了从下载、安装、配置（如日志路径、屏蔽时间、阈值设置）到启动服务的完整步骤。
keywords: DenyHosts, SSH, 暴力破解, Linux安全, 服务器防护, hosts.deny, chkconfig, daemon-control, 网络安全
---
![](https://ws1.sinaimg.cn/large/e3bf8736ly1fypzd8dhstj20zk0npe81.jpg)

<!--more-->

> DenyHosts（项目主页：http://denyhosts.sourceforge.net/）是运行于Linux上的一款预防SSH暴力破解的软件，可以从http://sourceforge.net/projects/denyhosts/files/进行下载，然后将下载回来的DenyHosts-2.6.tar.gz源码包上传到Linux系统中。
>

### 下面是安装过程 ###

****************************************************************
```shell
wget https://www.cubecloud.net/DenyHosts-2.6.tar.gz           #下载安装包
tar zxvf DenyHosts-2.6.tar.gz 		     #解压源码包
cd DenyHosts-2.6						 #进入安装解压目录
python setup.py install					 #安装DenyHosts
cd /usr/share/denyhosts/				 #默认安装路径
cp denyhosts.cfg-dist denyhosts.cfg      #denyhosts.cfg为配置文件
cp daemon-control-dist daemon-control    #daemon-control为启动程序
chown root daemon-control  				 #添加root权限
chmod 700 daemon-control				 #修改为可执行文件
ln -s /usr/share/denyhosts/daemon-control /etc/init.d          #对daemon-control进行软连接，方便管理
```

安装到这一步就完成了。

```shell
/etc/init.d/daemon-control start    #启动denyhosts
chkconfig daemon-control on 		#将denghosts设成开机启动
```
******************************************************************

```shell
vi /usr/share/denyhosts/denyhosts.cfg       #编辑配置文件，另外关于配置文件一些参数，通过grep -v "^#" denyhosts.cfg查看
SECURE_LOG = /var/log/secure                  #ssh 日志文件，redhat系列根据/var/log/secure文件来判断；Mandrake、FreeBSD根据 /var/log/auth.log来判断
                                                              #SUSE则是用/var/log/messages来判断，这些在配置文件里面都有很详细的解释。
```
******************************************************************

```shell
HOSTS_DENY = /etc/hosts.deny                 #控制用户登陆的文件
PURGE_DENY = 30m                                  #过多久后清除已经禁止的，设置为30分钟；
# 'm' = minutes
# 'h' = hours
# 'd' = days
# 'w' = weeks
# 'y' = years
BLOCK_SERVICE = sshd                           #禁止的服务名，当然DenyHost不仅仅用于SSH服务
DENY_THRESHOLD_INVALID = 1             #允许无效用户失败的次数
DENY_THRESHOLD_VALID = 3                 #允许普通用户登陆失败的次数
DENY_THRESHOLD_ROOT = 3                 #允许root登陆失败的次数
DAEMON_LOG = /var/log/denyhosts      #DenyHosts日志文件存放的路径，默认
```

更改DenyHosts的默认配置之后，重启DenyHosts服务即可生效: 


``` shell
/etc/init.d/daemon-control restart #重启denyhosts
```