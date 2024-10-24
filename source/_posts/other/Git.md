---
title: git
date: 2023-03-17 12:24:49
tags:
  - other
---

1. 设置用户信息

   ```shell
   $ git config --global user.name "AL"    # 设置用户名
   $ git config --global user.email "1961154734@qq.com"		#邮箱
   $ git config --list		 #查看配置信息
   ```
2. 创建仓库

   - 本地

     ```shell
     git init
     git remote add origin <url>
     ```
   - 远程仓库克隆
   - ![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677037-fe72f6846465553afc80df12a588221def785e54.png)
   - **在控制面板/用户账户/凭据管理器/Windows 凭据/编辑gitee凭据，下修改账户密码**

     ```shell
     git status		#查看文件状态
     git add * 		#将文件添加到暂存区
     ```
     ![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677041-5af6b317ec6055ee1b8043502235bfa9902b866f.png)
   - 未跟踪状态

     ![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677044-bbaf37a1793b7744db212e03d88ff6543a36c32d.png)
   - 常用命令

     ```shell
     git reset		              #取消文件暂存区
     git reset --hard <file> 	         #切换版本
     git add <file>					       #将指定文件添加到暂存区
     git commit -m <提交描述><file>                   #将暂存区文件提交到版本库
     git log 			             #日志
     git remote	<-v>			        #查看远程仓库
     git remote add <仓库别名origin> <仓库url>	    	 #添加远程仓库
     git clone <url>			      #从远程仓库克隆
     git pull/push	 			      # 拉取,提交
     
     ```
   - ![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677048-92c4dc6db4f6bb1aea2cf34bef207d1e545505a2.png)
   - 分支操作

     ```shell
     git branch [-r/a]	  #查看本地[远程/所有]分支
     git branch [name] 	    #创建分支
     git checkout[name]	     #切换分支
     git push [shortName][name]     #推送分支到远程仓库
     git merge [name]	    #合并分支
     ```
   - 标签操作

     ```shell
     git tag	  #列出已有标签
     git tag [name]		 #创建标签
     git push[shortName][name]	  #将标签推送到远程仓库
     git checkout -b [branch][name] 	#检出标签
     git pull --rebase origin master
     ```
