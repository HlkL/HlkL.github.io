---
title: linux学习笔记
tags:
  - devops
abbrlink: 9dafd965
date: 2021-11-23 08:02:14
updated: 2021-11-23 08:02:14
---

## 基础命令

> `ls` 										  显示当前目录文件
> `ls /tmp` 								显示指定目录文件	(/绝对路径)(\转义字符)
> `midir` `wulian20102` 			在当前目录创建目录
> `mkdir -p` a/b/n/c/a/c 		 嵌套递归创建目录
> `cd /etc`								 切换到指定目录
> `cd ..` 									切换到上级目录
> `cd` 										  切换到家目录
> `pwd `										 显示当前路径
> `rmdir a/b/n/c/a`                删除空目录
> `-p` 										  嵌套删除
> `cp` `anaconda-ks.cfg` ` wulian20102`/`2.test` `-r` 						复制文件到指定路径,和改名
> `-p`											保留文件属性
> `rm -rf ` `wulian20102` 			强制删除文件或目录

**文件查看**

> `cat `									  正向查看文件
> `tac` 									 逆向
> `head`									文件前面几行
> `tail`									文件后面几行
> `more`									只能向下翻页查看文件
> `less`									能向上和向下翻页查看文件

**连接文件**

> ln -s									 目标文件  软连接文件(快捷方式)
> ln -s 									目标文件  硬链接文件

*不能跨分区,不能是目录,文件同步*

## 权限命令

> `chmod`									   修改文件读写权限
> `ugo + -  rwx`						添加删除权限
> `-R 421`									递归添加权限
>
> `umask(/etc/bashrc)`		系统中指定新建文件目录权限
> 新建目录默认权限是 777-umask
> 新建文件默认权限是 666-umask
>
> `chown` 									改变文件拥有者  `chown:root:root 1 2 3`			更改拥有者和所属组
> `chgrp`  								  所属组

## 文件搜索命令

**find**

- `find / -name boot` 					根据名字查找文件
- `find / -iname centos` 				忽略大小写
- `-size` 											根据文件大小
- `-user `										   用户
- `-group`										  所属组
- `find / -mmin -1 `						文件在1分钟之内被修改的文件
- `locate`								 需更新数据库 `updatedb`

## vim

> w  													保存文本
> q  													退出文本
> set number									显示行数
> set nonu	    									取消行号
> dyy													复制当前行
> d 														行数
> p/P													粘贴到上面/下面
> dd													剪切
> u														 撤销

**行数跳转**

> gg												跳到首行
> 0/$												行首/行尾
> G												末尾行
> n												跳到第n行

**插入**

> a :在光标后面插入
> A:在行后面插入
> i : 在当前行插入
> I :在行前面插入
> o/O:在上面/下面  新建行插入
> /String :高亮显示String,n:跳到下个字符串
> nohl :取消高亮
> %s/要替换的字符/目标字符/ :替换
> n,m,s/替换区间

## ip配置

> ```text
> 网络地址
> [root@centos ~]# cd /etc/sysconfig/network-scripts/
> [root@centos network-scripts]# vi ifcfg-ens33 
>  1 TYPE="Ethernet"
>   2 PROXY_METHOD="none"
>   3 BROWSER_ONLY="no"
>   4 BOOTPROTO="static"                                //设定开机时网卡启动协议，使用DHCP获得动态IP地址，还是手动配置静态IP地址
>   5 DEFROUTE="yes"
>   6 IPV4_FAILURE_FATAL="no"
>   7 NAME="ens33"
>   8 UUID="3da1c851-d530-4602-9d56-cafb39f9f351"
>   9 DEVICE="ens33"
>  10 ONBOOT="yes"                                       //设定开机时，激活网卡
>  11 IPADDR="192.168.38.88"                       //设定网卡IP地址
>  12 PREFIX="24"                                            //设定网卡的掩码
>  13 GATEWAY="192.168.38.2"                      //设定网卡的网关
>  14 DNS1=114.114.114.114                            //设定网卡的DNS地址                                                                                                         
>  15 DNS2=8.8.8.8
>  
> [root@centos network-scripts]# nmcli con reload ens33     //加载网卡配置文件
> [root@centos network-scripts]# nmcli con up ens33          //重新激活网卡
> ```

## 文件压缩命令

>> **在Linux系统中，只要是磁盘（包括硬盘），都是需要挂载到某个目录，才能使用的，硬盘之所以在系统每次开机时，不需要我们手动挂载，那是因为，系统有一个自动挂载的配置文件，在每次系统启动时，系统会加载配置文件自动挂载硬盘。**
>>
>
> ```text
> gzip :只能压缩文件(不保存原文件)
> gunzip :只能解压缩目录
> tar 
> -c 打包
> -z 打包后压缩
> -v 显示压缩过程
> -f 压缩包命名
> 解压缩
> -x 解压缩
> -v 显示过程
> -f 解压缩文件
> -C /目录地址 :解压缩到指定目录
> 文件格式 .tar.gz
> netstat -tunlp :查看主机有哪些连接
> mount -t iso9660 /dev/sr0 /mnt  :将sr0光驱临时(重启失效)挂载到mnt上
> df -h  mount -l :查看光驱挂载
> shutdown -r +5  :5分钟后重启
> -h  :关机
> -c  :取消
> logout  :注销
> hostnamectl set-hostname xxx  :更改主机名
> /etc/fstab      //这是系统中自动挂载磁盘的配置文件
> 系统出现灾难时，进行内存转储
> init 3   切换成多用户CLI界面；
> init 5   切换图形界面；
> 四、主机与网卡的配置
> 1、主机名
> root@centos:~# hostnamectl set-hostname xxx
> 2、网卡的配置
> root@centos:~# vi /etc/sysconfig/network-scripts/ifcfg-ens33
> 3、DNS域解析文件hosts
> root@centos:~# vi /etc/hosts
> 192.168.38.88   centos centos
> 127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
> ::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
> 4、DNS服务器地址配置文件（一般不是手动配置的）
> root@centos:~# vi /etc/resolv.conf
> 五、网卡的重启
> 1、重启系统；
> 2、不关机启用网卡配置的方法
> root@centos:~# nmcli connection reload ens33
> root@centos:~# nmcli connection up ens33
> ```

## 网络命令

> ```text
> CentOS7以上的版本，默认情况下是安装的firewall防火墙服务，没有安装iptables-services服务（但系统中有iptables基础组件）
>
> 二、停用firewall防火墙，并安装iptables-services防火墙服务组件
> root@centos:~# systemctl stop firewalld       //停卡firewall防火墙服务
> root@centos:~# systemctl disable firewalld  //设置系统开机不自动启动firewall防火墙服务
>
> root@centos:~# yum install -y iptables iptables-services     //在系统上安装iptables防火墙服务
> root@centos:~# systemctl start iptables                                  //启动iptables防火墙服务
> root@centos:~# systemctl enable iptables                             //设置系统开机自动启动iptables服务
>
> root@centos:~# iptables -nvL                                  //查看当前iptables防火墙的数据过滤规则
> iptables -F清空内存中的配置文件
> root@centos:/etc/sysconfig# service iptables save           //将内存中iptables防火墙的配置写入磁盘上的配置文件
> root@centos:/etc/sysconfig# vi /etc/sysconfig/iptables   //防火墙磁盘上的配置文件，重启系统仍然会在
> root@centos:~# iptables -A INPUT -p tcp --dport 22 -j ACCEPT      //配置防火墙策略，允许SSH协议的进栈数据通过
> root@centos:~# iptables -A OUTPUT -p tcp --sport 22 -j ACCEPT       //配置防火墙策略，允许SSH协议的出栈数据通过
> root@centos:~# iptables -P INPUT DROP      //配置进栈链的默认策略为丢弃
> root@centos:~# iptables -P OUTPUT DROP    //配置出栈链的默认策略为丢弃
> root@centos:~# iptables -A INPUT -p icmp -j ACCEPT          //允许PING进栈
> root@centos:~# iptables -A OUTPUT -p icmp -j ACCEPT      //允许PING出栈
> root@centos:/etc/sysconfig# service iptables save
> ```

## RPM包管理

> ```text
> 一、RPM包(手动)管理
> 1、从光盘上打出RPM软件包来做实验；
> root@centos:~# mount -t iso9660 /dev/sr0 /mnt                                                            //挂载光驱
> root@centos:/mnt/Packages# cd /mnt/Packages                                                            //进入光盘的软件包目录
> root@centos:/mnt/Packages# cp /mnt/Packages/zsh-5.0.2-34.el7_8.2.x86_64.rpm ~    //随意选择一个软件包，复制到家目录，以便后续的实验
> root@centos:/mnt/Packages# cd          //返回家目录
> root@centos:~# rpm -ivh zsh-5.0.2-34.el7_8.2.x86_64.rpm                //安装软件包
>
> Preparing...                          ################################# [100%]
> Updating / installing...
> 1:zsh-5.0.2-34.el7_8.2             ################################# [100%]
>
> root@centos:~# ls /mnt/Packages/ |grep mariadb                                                          //查询光盘的软件包目录下，显示与mariadb软件相关的安装包；
> root@centos:~# cp /mnt/Packages/mariadb* ~            //将光盘软件包目录下，与mariadb软件相关的安装包，复制到家目录
> root@centos:~# rpm -ivh mariadb-5.5.68-1.el7.x86_64.rpm             //安装mariadb的主文件
> root@centos:~# rpm -evh mariadb-5.5.68-1.el7.x86_64.rpm
> error: package mariadb-5.5.68-1.el7.x86_64.rpm is not installed          //卸载出错，原因是安装时，用的是包全名，卸载时用的是包名
> root@centos:~# rpm -qa | grep mariadb
> root@centos:~# rpm -evh mariadb-5.5.68-1.el7.x86_64               //使用“软件”包名卸载
>
> Preparing...                          ################################# [100%]
> Cleaning up / removing...
> 1:mariadb-1:5.5.68-1.el7           ################################# [100%]
>
> root@centos:~# rpm -qRp mariadb-libs-5.5.68-1.el7.x86_64.rpm            //查询软件包的依赖性，-p参数，是后面带“包全名”
> root@centos:~# rpm -qR mariadb-libs-5.5.68-1.el7.x86_64                   //查询软件包的依赖性，后面带“包名”
> 二、RPM包(自动)管理，YUM命令
> 1、YUM是什么东西
> 2、YUM的工作原理
> 3、YUM的配置目录
> root@centos:~# cd /etc/yum.repos.d/                        //在这个目录下，是YUM软件管理器的所有配置文件
> root@centos:/etc/yum.repos.d# yum update -y        //从YUM源服务器，下载更新软件库中软件包的索引数据；
> 4、YUM的配置文件
> root@centos:/etc/yum.repos.d# ll
> total 40
> -rw-r--r--. 1 root root 1664 Nov 23  2020 CentOS-Base.repo
> -rw-r--r--. 1 root root 1309 Nov 23  2020 CentOS-CR.repo
> -rw-r--r--. 1 root root  649 Nov 23  2020 CentOS-Debuginfo.repo
> -rw-r--r--. 1 root root  314 Nov 23  2020 CentOS-fasttrack.repo
> -rw-r--r--. 1 root root  630 Nov 23  2020 CentOS-Media.repo
> -rw-r--r--. 1 root root 1331 Nov 23  2020 CentOS-Sources.repo
> -rw-r--r--. 1 root root 8515 Nov 23  2020 CentOS-Vault.repo
> -rw-r--r--. 1 root root  616 Nov 23  2020 CentOS-x86_64-kernel.repo
> 5、YUM基本配置文件的配置
> root@centos:/etc/yum.repos.d# vi CentOS-Base.repo
> 三、将CentOS7的系统默认YUM源，修改为阿云的YUM源
> 1、安装下载器
> root@centos:/etc/yum.repos.d# yum install -y wget
> 2、将原配置文件备份
> root@centos:/etc/yum.repos.d# mv CentOS-Base.repo CentOS-Base.repo.bak
> 3、从互联网上下载阿里云YUM源的配置文件
> root@centos:/etc/yum.repos.d# wget -O CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
> root@centos:/etc/yum.repos.d# mv Centos-7.repo CentOS-Base.repo   //如果上面用的是大写O参数，则这条命令不需要
> 4、更新YUM管理器的数据
> root@centos:/etc/yum.repos.d# yum clean all    //清除原来的YUM索引数据
> root@centos:/etc/yum.repos.d# yum update -y   //从新的YUM源服务器下载YUM索引数据
> 5、对新的YUM源服务器，做安装测试
> root@centos:/etc/yum.repos.d# yum install -y iptables-services
> ```

## FTP服务

> ```text
> 一、什么是文件传输服务器FTP
> FTP服务器（File Transfer Protocol Server）是在互联网上提供文件存储和访问服务的计算机，它们依照FTP协议提供服务。 FTP是File Transfer Protocol(文件传输协议)。顾名思义，就是专门用来传输文件的协议。简单地说，支持FTP协议的服务器就是FTP服务器。
> 二、FTP的工作原理
> 1、C/S模式
> 2、工作模式
> FTP服务，在工作时，服务器端会与客户端建立两条信道（控制信道，数据信道）
> 被动模式：数据信道的建立，服务器是被动确认数据端口的。控制信道21，数据信道是一个随机数
> 主动模式：数据信道的建立，服务器是主动确认数据端口的。控制信道21，数据信道20
> 三、FTP安装
> root@centos:~# systemctl stop iptables                           //停止防火墙iptables
> root@centos:~# systemctl disable iptables                      //设置开机不要启动防火墙iptables
> root@centos:~# yum install -y vsftpd                               //安装vsftpd
> root@centos:~# systemctl status vsftpd                          //查看vsftpd服务的运行状态
> root@centos:~# systemctl start vsftpd                           //启动vsftpd服务
> root@centos:~# systemctl enable vsftpd                       //设置vsftpd服务开机启动
> root@centos:~# ss -tnlp |grep vsftpd                             //检查vsftpd服务启用的端口号
> root@centos:~# yum install -y ftp                                  //安装ftp服务的客户端组件
> 四、FTP服务测试
> 安装完成并启动之后，服务会使用默认的配置文件运行，可以用客户端机器测试（在宿主机）
> 打开资源管理器==>在地址栏中输入FTP服务器的地址（如：ftp://192.168.38.88)
> 注意：使用默认配置启动的FTP服务，只开启了匿名访问
> 五、FTP的配置
> 1、匿名访问（允许匿名上传文件）
> root@centos:~# cd /etc/vsftpd/                                                      //进入FTP服务的配置目录
> root@centos:/etc/vsftpd# cp vsftpd.conf vsftpd.conf.bak              //备份主配置文件
> root@centos:/etc/vsftpd# vi  vsftpd.conf                                       //编辑FTP主配置文件
> anonymous_enable=YES
> #允许匿名用户登录
> local_enable=YES
> #允许本地用户登录
> write_enable=YES
> #开启全局的写权限
> local_umask=022
> #配置本地用户上传文件时，文件的默认权限
> anon_upload_enable=YES
> #允许匿名用户上传文件
> anon_mkdir_write_enable=YES
> #允许匿名用户在工作目录创建文件夹（目录）
> anon_other_write_enable=YES
> #允许匿名用户在工作目录修改文件及文件内容
> dirmessage_enable=YES
> #启用改变工作目录时，提示消息
> xferlog_enable=YES
> #启用FTP服务的日志记录
> connect_from_port_20=YES
> #使用主动模式，20端口来创建数据通道
> xferlog_std_format=YES
> #日志记录采用标准格式
> listen=YES
> #配置vsftpd服务侦听IPv4的接口地址
> pam_service_name=vsftpd
> #指定登录用户的身份验证策略文件（/etc/pam.d/vsftpd）
> userlist_enable=YES
> #用户控制列表文件，默认情况下，此文件中的用户是禁止登录FTP服务的
> tcp_wrappers=YES
> root@centos:/etc/vsftpd# mkdir /var/ftp/pub/test     //给匿名用户新建一个可以拥有写权限的子目录
> root@centos:/etc/vsftpd# chown ftp:ftp /var/ftp/pub/test    //给匿名用户对上面创建的子目录在磁盘的层面，给予写权限
> root@centos:/etc/vsftpd# systemctl restart vsftpd
> 2、本地用户访问
> 3、虚拟用户访问
> ```

## Web服务

> ```text
> web服务HTTPD
> 一、什么web服务？
> 互联网网站服务，全天候在线的服务器，给客户端的用户提供数据访问。
> 二、web的工作原理
> C/S
> 三、服务的组成
> 服务器端：IIS、Apache、Nginx
> 客户机端：IE、Edge、Chrome、Firefox
> 四、在CentOS7中安装Apache（httpd）
> root@centos:~# yum install -y httpd
> root@centos:~# systemctl status httpd
> root@centos:~# systemctl start httpd
> root@centos:~# systemctl enable httpd
> root@centos:~# yum remove -y firewalld         //卸载防火墙firewalld
> root@centos:~# setenforce 0                            //暂停安全软件selinux
> root@centos:~# cd /etc/selinux
> root@centos:/etc/selinux# vi config
> SELINUX=disabled
> 五、在宿主机上测试web服务器
> 六、apache服务的几个主要配置文件
> 1、主配置文件：/etc/httpd/conf/httpd.conf
> 2、子配置文件目录：/etc/httpd/conf.d/       （子配置文件系统会自动加载)
> 3、系统默认站点的工作目录：/var/www/html
> 例 ：修改默认站点的主页文件
> root@centos:/etc/httpd# echo "This is a sample webpage." > /var/www/html/index.html
> 七、映射虚拟目录到默认站点
> 1、root@centos:/etc/httpd/conf# cp httpd.conf httpd.conf.bak
> 2、root@centos:/etc/httpd/conf# vi httpd.conf    //在配置文件的第232行后，增加如下二行
> Alias /dira /var/www/dira
> Alias /dirb /var/www/dirb
> root@centos:/etc/httpd/conf# systemctl restart httpd
> root@centos:/etc/httpd/conf# mkdir /var/www/dira /var/www/dirb
> root@centos:/etc/httpd/conf# echo "This is A website." > /var/www/dira/index.html
> root@centos:/etc/httpd/conf# echo "This is B website." > /var/www/dirb/index.html
> 八、将不同的站点映射到不同的IP上
> 1、在网卡上配置不同的IP地址
> 注意：同一块网卡，可以配置不同的多个IP地址；但是一个IP地址，不能配置到不同的网卡上
> root@centos:/etc/httpd/conf# vi /etc/sysconfig/network-scripts/ifcfg-ens33      //编辑网卡的配置文件，增加IP地址
> 省略********
> IPADDR0=192.168.38.88
> IPADDR1=192.168.38.89
> IPADDR2=192.168.38.90
> 省略********
> root@centos:/etc/httpd/conf# systemctl restart network                           //使用新的配置文件，重启网卡
> root@centos:/etc/httpd/conf# ip a                                                              //查看网卡的配置情况
> root@centos:/etc/httpd/conf# vi httpd.conf                                              //修改主配置文件，将默认站点，绑定到网卡的具体IP地址上
> Listen 192.168.38.88:80                                                                                //启用主配置文件第38行，并做相应的修改
> root@centos:/etc/httpd/conf# systemctl restart httpd
> 到客户机上测试，这时，应该只有被具体绑定的IP地址能访问web服务器，没有具体绑定的IP地址（这里是89、90）则不能访问web服务。
> 2、将两个新web站点绑定到新的IP地址上
> root@centos:/etc/httpd/conf# cd ..
> root@centos:/etc/httpd# cd conf.d/
> root@centos:/etc/httpd/conf.d# vi wulian.conf                                       //新编辑一个子配置文件
> <VirtualHost 192.168.38.89:80>
> DocumentRoot /var/www/wuliana
> <Directory "/var/www/wuliana">
> Require all granted
> </Directory>
> </VirtualHost>
> <VirtualHost 192.168.38.90:80>
> DocumentRoot /var/www/wulianb
> <Directory "/var/www/wulianb">
> Require all granted
> </Directory>
> </VirtualHost>
> root@centos:/etc/httpd/conf# vi /etc/httpd/conf/httpd.conf                 //编辑主配置文件，增加新网站的IP地址侦听
> 省略********
> Listen 192.168.38.88:80
> Listen 192.168.38.89:80
> Listen 192.168.38.90:80
> 省略********
> root@centos:/etc/httpd/conf.d# mkdir /var/www/wuliana /var/www/wulianb
> root@centos:/etc/httpd/conf.d# echo "This is the wulianA website." > /var/www/wuliana/index.html
> root@centos:/etc/httpd/conf.d# echo "This is the wulianB website." > /var/www/wulianb/index.html
> root@centos:/etc/httpd/conf.d# systemctl restart httpd
> ```

## 防火墙

> ```text
> 防火墙
> 二、停用firewall防火墙，并安装iptables-services防火墙服务组件
> root@centos:~# systemctl stop firewalld       //停卡firewall防火墙服务
> root@centos:~# systemctl disable firewalld  //设置系统开机不自动启动firewall防火墙服务
> root@centos:~# yum install -y iptables iptables-services     //在系统上安装iptables防火墙服务
> root@centos:~# systemctl start iptables                                  //启动iptables防火墙服务
> root@centos:~# systemctl enable iptables                             //设置系统开机自动启动iptables服务
> 三、iptables防火墙的基本配置
> root@centos:~# iptables -nvL                                           //查看当前iptables防火墙的数据过滤规则
> root@centos:~# iptables -F                                               //清空内存中iptables防火墙的配置
> root@centos:/etc/sysconfig# service iptables save           //将内存中iptables防火墙的配置写入磁盘上的配置文件
> root@centos:/etc/sysconfig# vi /etc/sysconfig/iptables   //防火墙磁盘上的配置文件，重启系统仍然会在
> root@centos:~# iptables -A INPUT -p tcp --dport 22 -j ACCEPT          //配置防火墙策略，允许SSH协议的进栈数据通过
> root@centos:~# iptables -A OUTPUT -p tcp --sport 22 -j ACCEPT       //配置防火墙策略，允许SSH协议的出栈数据通过
> root@centos:~# iptables -P INPUT DROP      //配置进栈链的默认策略为丢弃
> root@centos:~# iptables -P OUTPUT DROP    //配置出栈链的默认策略为丢弃
> root@centos:~# iptables -A INPUT -p icmp -j ACCEPT          //允许PING进栈
> root@centos:~# iptables -A OUTPUT -p icmp -j ACCEPT      //允许PING出栈
> root@centos:/etc/sysconfig# service iptables save
> ```
