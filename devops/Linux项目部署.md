#### 项目部署

***手动部署***

:star:  前台部署

```text
java -jar hello-0.0.1-SNAPSHOT.jar
```

:star: 后台部署(可查看日志文件,通过进程关闭)

```java
nohup java -jar hello-0.0.1-SNAPSHOT.jar &> hello.log &
```

***自动部署***

1. 安装git
2. 创建远程仓库
3. 本地克隆远程仓库
4. 下载maven并配置

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677065-202302010133055.png)

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677070-202302010133057.png)

5. 克隆运程仓库地址
6. ![image-20221119032223474](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677074-202302010133058.png)
7. 设置文件权限

   ```shell
   chmod 777 file
   ```
8. 执行shell脚本

   ```shell
   #!/bin/sh
   echo =================================
   echo  自动化部署脚本启动
   echo =================================
   
   echo 停止原来运行中的工程
   APP_NAME=hello
   
   tpid=`ps -ef|grep $APP_NAME|grep -v grep|grep -v kill|awk '{print $2}'`
   if [ ${tpid} ]; then
       echo 'Stop Process...'
       kill -15 $tpid
   fi
   sleep 2
   tpid=`ps -ef|grep $APP_NAME|grep -v grep|grep -v kill|awk '{print $2}'`
   if [ ${tpid} ]; then
       echo 'Kill Process!'
       kill -9 $tpid
   else
       echo 'Stop Success!'
   fi
   
   echo 准备从Git仓库拉取最新代码
   cd /home/user/app
   
   echo 开始从Git仓库拉取最新代码
   git pull
   echo 代码拉取完成
   
   echo 开始打包
   output=`mvn clean package -Dmaven.test.skip=true`
   
   cd target
   
   echo 启动项目
   nohup java -jar hello-0.0.1-SNAPSHOT.jar &> hello.log &
   echo 项目启动完成
   ```
