---
title: docker
tags:
  - devops
abbrlink: f255ffad
date: 2022-10-23 10:32:44
updated: 2022-10-23 10:32:44
---

# CentOS7安装docker

**如果之前安装过旧版本的[Docker](https://www.docker.com/)，可以使用下面命令卸载：**

```sh
yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine \
                  docker-ce
```

**安装yum工具**

```sh
yum install -y yum-utils \
           device-mapper-persistent-data \
           lvm2 --skip-broken
```

**配置阿里云镜像源**

```sh
# 设置docker镜像源
yum-config-manager \
    --add-repo \
    https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
  
sed -i 's/download.docker.com/mirrors.aliyun.com\/docker-ce/g' /etc/yum.repos.d/docker-ce.repo

yum makecache fast
```

**安装**`Docker-ce`

```shell
yum install -y docker-ce
```

**防火墙设置**

```sh
# 关闭
systemctl stop firewalld
# 禁止开机启动防火墙
systemctl disable firewalld
```

**启动**`Docker`

```sh
systemctl start docker  # 启动docker服务

systemctl stop docker  # 停止docker服务

systemctl restart docker  # 重启docker服务
```

**查看**`Docker`**版本**

```sh
docker -v
```

`Portainer`可视化工具

```shell
#拉取镜像
docker pull portainer/portainer
#运行
docker run \
--name portainer \
-p 9000:9000 \
-v /var/run/docker.sock:/var/run/docker.sock \
-v $PWD/portainer_data:/data \
-d portainer/portainer
```

# 镜像相关命令

> - 镜像名称—般分两部分组成 `[repository]:[tag]`
> - 在没有指定`tag`时，默认是`latest`，代表最新版本的镜像

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676958-5de174f12003491324a5e7a0cd4a58001e853e2c.png" alt="image-20221226000406956" style="zoom:50%;" />


|                      指令                      | 操作                 |
| :----------------------------------------------: | ---------------------- |
|                 docker images                 | 查看本地镜像         |
|         docker pull [镜像名称]:[版本]         | 拉取镜像             |
|                  docker push                  | 推送镜像             |
|                  docker build                  | 构建镜像             |
|          docker rmi [镜像名称]:[版本]          | 删除镜像             |
| docker save -o [保存的目标文件名称] [镜像名称] | 将镜像保存为压缩文件 |
|            docker load -i [压缩包]            | 将压缩文件加载为镜像 |
|               docker [xx] --help               | 命令帮助             |

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676967-c3c844d6319171c3de1d67e64c65d2186ed2e7c9.png" alt="image-20221226000548354" style="zoom:50%;" />

**拉取镜像&查看镜像**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676971-94e98f77cba5d6316d69deb7a382dc290df20de8.png" alt="image-20221226002358598" style="zoom:50%;" />

**保存 加载 删除镜像**

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676974-509264b821cb59403df7866319720aa182c7749c.png)

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676977-010225951fc3bc86b63ab16a5d26084d18b0a8cd.png" alt="image-20221226004023402" style="zoom:50%;" />

# 容器操作

**容器保护三个状态**

> - 运行：进程正常运行
> - 暂停：进程暂停，CPU不再运行，并不释放内存
> - 停止：进程终止，回收进程占用的内存、CPU等资源

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676981-d3a683bb0bc834b64a62e5175a8d44556c1d2738.png" alt="image-20221226011730692" style="zoom:67%;" />


|                指令                | 操作                             |
| :----------------------------------: | ---------------------------------- |
| docker run [-v] [-d] [-p] [--name] | 创建并运行一个容器，处于运行状态 |
|            docker pause            | 让一个运行的容器暂停             |
|           docker unpause           | 让一个容器从暂停状态恢复运行     |
|            docker stop            | 停止一个运行的容器               |
|            docker start            | 让一个停止的容器再次运行         |
|             docker rm             | 删除一个容器                     |

**创建并运行一个容器**

> ```sh
> docker run --name nginx -p 80:80 -d nginx:latest
> ```
>
> - `docker run` 创建并运行一个容器
> - `--name`  给容器起一个名字，比如叫做**mn**
> - `-p`  将容器端口映射到宿主机端口，冒号左侧是宿主机端口，右侧是容器端口
> - `-d` 后台运行容器
> - `nginx` 镜像名称，例如**nginx**
> - `latest` 镜像版本
>
> **默认情况下，容器是隔离环境，我们直接访问宿主机的80端口，访问不到容器中的nginx。现在，将容器的80与宿主机的80关联起来，当我们访问宿主机的80端口时，就会被映射到容器的80，这样就能访问到nginx了**
>
> <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676988-bc626e2e3e7f5a6634e11fbc70af0c8ed7e70eca.png" alt="image" style="zoom:80%;" />

**进入容器修改文件**

> ```sh
> docker exec -it nginx bash
> ```
>
> - `docker exec` 进入容器内部，执行一个命令
> - `-it` :给当前进入的容器创建一个标准输入、输出终端，允许我们与容器交互
> - `nginx` 要进入的容器的名称
> - `bash`进入容器后执行的命令，bash是一个linux终端交互命令
>
> **容器内部会模拟一个独立的`Linux`文件系统，看起来如同一个`linux`服务器一样**
>
> - 进入**nginx**的**HTML**所在目录 `/usr/share/nginx/html`
> - 容器内没有vi命令，无法直接修改
>
>   ```sh
>   sed -i -e 's#Welcome to nginx#docker#g' -e 's#<head>#<head><meta charset="utf-8">#g' index.html
>   ```
>
> ![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676994-11d00089ab4988b4bd3938fd90eb4de4478c6d85.png)
>
> **重启容器,在浏览器访问服务器地址和容器设置的端口号**
>
> <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676999-c692d43f634bd08d1bc99f0e105ec26225099d21.png" alt="image" style="zoom:80%;" />

**数据卷操作**

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677004-08547327db42960b2316364b96409e5eb2a68c80.png)

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677007-11be811f0dc923101ba78b4ded07ccab04ad7d6c.png)

**数据卷的基本语法**

```sh
docker volume [COMMAND]
```


| COMMAND | 操作                     |
| :-------: | -------------------------- |
| create | 创建一个volume           |
| inspect | 显示一个或多个volume信息 |
|   ls   | 列出所有volume           |
|  prune  | 删除未使用的volume       |
|   rm   | 删除一个或多个volume     |

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677014-7f359505471ca4b0f5323e244c115b43027cebb3.png)

**挂载数据卷**

在创建容器时可以使用`-v` 参数来挂载一个数据卷到某个容器目录,数据卷不存在会自己创建数据卷

> ```sh
> docker run --name nginx \
> -v $PWD/nginx/html:/usr/share/nginx/html \
> -v $PWD/nginx/nginx.conf:/etc/nginx/conf.d/default.conf \
> -p 80:80 -d nginx
> ```
>
> `-v` 挂载数据卷
>
> `html` 物理主机目录
>
> `/usr/share/nginx/html` 容器数据目录
>
> 数据卷的作用: **将容器与数据分离，解耦合，方便操作容器内数据，保证数据安全**

**挂载本地目录**

**容器不仅仅可以挂载数据卷，也可以直接挂载到宿主机目录**

- 带数据卷模式：宿主机目录 --> 数据卷 ---> 容器内目录
- 直接挂载模式：宿主机目录 ---> 容器内目录

> 在当前目录创建数据挂载目录
>
> ```sh
> mkdir -p /mysql/data
> mkdir -p /mysql/conf
> ```
>
> 创建**mysql**容器并挂载
>
> ```sh
> docker run --name mysql -e MYSQL_ROOT_PASSWORD=admin -p 3306:3306 \
> -v $PWD/mysql/conf/hmy.cnf:/etc/mysql/conf.d/hmy.cnf \
> -v $PWD/mysql/data:/var/lib/mysql \
> -d mysql:5.7
> ```

**数据卷挂载方式对比**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677023-167e463b20c69e450ddb3c34947d542252736ad5.png" alt="image" style="zoom:50%;" />

**数据卷挂载与目录直接挂载**

- 数据卷挂载耦合度低，由docker来管理目录，但是目录较深，不好找
- 目录挂载耦合度高，需要我们自己管理目录，不过目录容易寻找查看

# dockerfile自定义镜像

**Dockerfile**就是一个文本文件，其中包含一个个的**[指令(Instruction)](https://docs.docker.com/engine/reference/builder)**，用指令来说明要执行什么操作来构建镜像。每一个指令都会形成一层**Layer**


| **指令**   | **说明**                                     | **示例**                    |
| ------------ | ---------------------------------------------- | ----------------------------- |
| FROM       | 指定基础镜像                                 | FROM centos:6               |
| ENV        | 设置环境变量，可在后面指令使用               | ENV key value               |
| COPY       | 拷贝本地文件到镜像的指定目录                 | COPY ./mysql-5.7.rpm /tmp   |
| RUN        | 执行Linux的shell命令，一般是安装过程的命令   | RUN yum install gcc         |
| EXPOSE     | 指定容器运行时监听的端口，是给镜像使用者看的 | EXPOSE 8080                 |
| ENTRYPOINT | 镜像中应用的启动命令，容器运行时调用         | ENTRYPOINT java -jar xx.jar |

> 1. 将`java.jar`文件和`jdk1.8`上传到主机任意目录
> 2. 进入目录并创建`Dockerfile`文件
>
>    ```dockerfile
>    # 指定基础镜像
>    FROM java:8-alpine
>         
>    # 拷贝jdk和java项目的包
>    COPY ./docker-demo.jar /tmp/java.jar
>         
>    # 暴露端口
>    EXPOSE 8090
>         
>    # 入口，java项目的启动命令
>    ENTRYPOINT java -jar /tmp/java.jar
>    ```
> 3. 运行`docker build -t [imagesName]:[tag]` 命令

# docker-Compose

`Compose`**文件是一个文本文件，通过指令定义集群中的每个容器如何运行**

> ```yaml
> version: "3.8"
>  services:
>   mysql:
>     image: mysql:5.7
>     environment:
>      MYSQL_ROOT_PASSWORD: 123 
>     volumes:
>      - "/tmp/mysql/data:/var/lib/mysql"
>      - "/tmp/mysql/conf/hmy.cnf:/etc/mysql/conf.d/hmy.cnf"
>   web:
>     build: .
>     ports:
>      - "3306:3306"
> ```
>
> - mysql：基于`mysql:5.7`镜像构建的容器，并且挂载了两个目录
> - web：基于`docker build`临时构建的镜像容器，映射端口时3306

**安装**`DockerCompose`

```sh
curl -L https://github.com/docker/compose/releases/download/2.14.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```

**添加权限**

```sh
chmod +x /usr/local/bin/docker-compose
```

**检测版本**

```sh
docker-compose version
```

***[手动安装](https://github.com/docker/compose/releases)***

**安装依赖**

```sh
yum -y install epel-release
yum -y install python-pip
pip install --upgrade pip
```

**将下载的文件上传到主机,使用`docker-compose version`命令查看版本**

`Base`**自动补全命令**

```sh
curl -L https://raw.githubusercontent.com/docker/compose/1.29.1/contrib/completion/bash/docker-compose > /etc/bash_completion.d/docker-compose
```

**如果这里出现错误，需要修改自己的`hosts`文件**

```sh
echo "199.232.68.133 raw.githubusercontent.com" >> /etc/hosts
```

# 微服务部署

**编写**`docker-compose`

> ```yaml
> version: "3.2"
>
> services:
>   nacos:
>     image: nacos/nacos-server
>     environment:
>       MODE: standalone
>     ports:
>       - "8848:8848"
>   mysql:
>     image: mysql:5.7
>     environment:
>       MYSQL_ROOT_PASSWORD: 123
>     volumes:
>       - "$PWD/mysql/data:/var/lib/mysql"
>       - "$PWD/mysql/conf:/etc/mysql/conf.d/"
>   userservice:
>     build: ./user-service
>   orderservice:
>     build: ./order-service
>   gateway:
>     build: ./gateway
>     ports:
>       - "10010:10010"
> ```
>
> `docker-compose`**文件中包含5个`service`服务**
>
> - `nacos`：作为注册中心和配置中心
>
>   - `image: nacos/nacos-server`： 基于nacos/nacos-server镜像构建
>   - `environment`：环境变量
>     - `MODE: standalone`：单点模式启动
>   - `ports`：端口映射，这里暴露了8848端口
> - `mysql`：数据库
>
>   - `image: mysql:5.7.25`：镜像版本是mysql:5.7.25
>   - `environment`：环境变量
>     - `MYSQL_ROOT_PASSWORD: 123`：设置数据库root账户的密码为123
>   - `volumes`：数据卷挂载，这里挂载了mysql的data、conf目录，其中有我提前准备好的数据
> - `userservice`、`orderservice`、`gateway`：都是基于Dockerfile临时构建的
> - 每个微服务目录下都包含`Dockerfile`文件
>
>   ```dockerfile
>   FROM java:8-alpine
>   COPY ./app.jar /tmp/app.jar
>   ENTRYPOINT java -jar /tmp/app.jar
>   ```
> - `maven`打包后,将`jar`包放到`Dockerfile`的同级目录中
>
>   ```xml
>   <build>
>     <!-- 服务打包的最终名称 -->
>     <finalName>app</finalName>
>     <plugins>
>       <plugin>
>         <groupId>org.springframework.boot</groupId>
>         <artifactId>spring-boot-maven-plugin</artifactId>
>       </plugin>
>     </plugins>
>   </build>
>   ```
> - 进入项目目录运行项目
>
>   ```sh
>   docker-compose up -d
>   ```

# 镜像仓库

**搭建镜像仓库可以基于Docker官方提供的[`DockerRegistry`](https://hub.docker.com/_/registry)来实现,Docker官方的Docker Registry是一个基础版本的Docker镜像仓库，具备仓库管理的完整功能，但是没有图形化界面`registry-data`[是私有镜像库存放数据目录](http://YourIp:5000/v2/_catalog ) **

```sh
docker run -d  --restart=always  --name registry -p 5000:5000 \
    -v registry-data:/var/lib/registry \
    registry
```

**使用`DockerCompose`部署带有图象界面的`DockerRegistry`**

```sh
version: '3.0'
services:
  registry:
    image: registry
    volumes:
      - ./registry-data:/var/lib/registry
  ui:
    image: joxit/docker-registry-ui:static
    ports:
      - 80:80
    environment:
      - REGISTRY_TITLE=myDocker
      - REGISTRY_URL=http://registry:5000
    depends_on:
      - registry
```

**私服采用的是`http`协议，默认不被`Docker`信任,需要配置`Docker`信任地址**

```sh
# 打开要修改的文件
vi /etc/docker/daemon.json
# 添加内容：
"insecure-registries":["http://43.139.96.22:80"]
# 重加载
systemctl daemon-reload
# 重启docker
systemctl restart docker
```

**推送镜像到仓库**

1. 重新`tag`本地镜像，名称前缀为私有仓库的地址：43.139.96.22:80/

   ```sh
   docker tag nginx:latest 43.139.96.22:80/nginx:1.0 
   ```
2. 推送镜像

   ```sh
   docker push 43.139.96.22:80/nginx:1.0 
   ```
3. 拉取镜像

   ```sh
   docker pull 43.139.96.22:80/nginx:1.0 
   ```



<font color=red>**镜像加速源**</font>

**使用阿里云搭建私有仓库：** https://github.com/HlkL/docker_image_pusher

**使用 clouadflare 搭建docker镜像加速源**

1. 购买[域名](https://wanwang.aliyun.com/domain)

2. 注册 [cloudflare](https://dash.cloudflare.com/) 账号

3. 打开cloud flare，新建站点，选择免费。 注册后绑定一个域名，这个域名的DNS需要设置为cloudflare的才能绑定成功。

   <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1719921636-image-20240702200036012.png" alt="image-20240702200036012" style="zoom:33%;" />

4. 修改域名 DNS 服务器

   <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1719921933-image-20240702200533547.png" alt="image-20240702200533547" style="zoom:50%;" />

5. 创建 Workers

   <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1719922157-image-20240702200917437.png" alt="image-20240702200917437" style="zoom: 33%;" />

6. 创建完成后编辑代码

   ![image-20240702201153320](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1719922313-image-20240702201153320.png)

7. 配置展示页，创建 index.html

   ```html
<!DOCTYPE html>
   <html lang="zh-CN">
   
   <head>
       <meta charset="UTF-8">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>镜像使用说明</title>
       <style>
           body {
               font-family: Arial, sans-serif;
               background-color: #f4f4f4;
               color: #333;
           }
   
           .container {
               max-width: 800px;
               margin: 0 auto;
               background-color: #f8f4f4;
               padding: 20px;
               border-radius: 10px;
               box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
           }
   
           h1 {
               text-align: center;
               color: #5a67d8;
           }
   
           .section {
               margin-bottom: 20px;
           }
   
           .code-container {
               background-color: #080808;
               color: #a59f9f;
               padding: 10px;
               border-radius: 5px;
               /* overflow-x: auto; */
               position: relative;
               overflow: hidden;
           }
   
           pre {
               max-height: 85px;
               overflow: auto;
               margin: 8px 0 6px 0;
   
               &::-webkit-scrollbar {
                   display: none;
               }
           }
   
           code {
               color: #7a8688;
           }
   
           .command {
               margin-bottom: 10px;
           }
   
           .copy-button {
               position: absolute;
               top: 10px;
               right: 10px;
               background-color: #0f0f0f;
               color: #929191;
               border: none;
               padding: 5px 10px;
               border-radius: 5px;
               cursor: pointer;
           }
   
           code {
               max-height: 20px;
               overflow: auto;
           }
       </style>
       <script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.10/clipboard.min.js"></script>
   </head>
   
   <body>
       <div class="container">
           <h1>镜像使用说明</h1>
           <div class="section">
               <h2>设置 registry mirror</h2>
               <p>为了加速 Docker 镜像拉取，你可以使用以下命令设置 registry mirror:</p>
               <div class="code-container">
                   <button class="copy-button" data-clipboard-target="#registry-config">复制</button>
                   <pre>
   <code id="registry-config">sudo tee /etc/docker/daemon.json &lt;&lt;EOF
   {
       "registry-mirrors": ["https://{{host}}"]
   }
   EOF</code></pre>
               </div>
               <div class="command">
                   <p>配置完后需要重启 Docker 服务</p>
                   <div class="code-container">
                       <button class="copy-button" data-clipboard-target="#docker">复制</button>
                       <pre><code id="docker">sudo systemctl restart docker</code></pre>
                       </pre>
                   </div>
               </div>
   
               <div class="section">
                   <h2>拉取不同镜像仓库的镜像</h2>
   
                   <div class="command">
               
                       <div class="command">
   
                           <div class="command">
                               <p>拉取 Docker 官方镜像</p>
                               <div class="code-container">
                                   <button class="copy-button" data-clipboard-target="#docker-official">复制</button>
                                   <pre><code id="docker-official">docker pull docker://library/nginx:latest</code></pre>
                               </div>
                           </div>
   
                           <div class="command">
                               <p>拉取 GitHub 容器镜像</p>
                               <div class="code-container">
                                   <button class="copy-button" data-clipboard-target="#github-linter">复制</button>
                                   <pre><code id="github-linter">docker pull ghcr.io/github/super-linter:latest</code></pre>
                               </div>
                           </div>
   
                           <div class="section">
                               <h2>其他说明</h2>
                               <p>为了避免 Worker 用量耗尽，你可以手动 pull 镜像然后 re-tag 后 push 至本地镜像仓库。</p>
                           </div>
   
                       </div>
   
                       <script>
                           new ClipboardJS('.copy-button');
                       </script>
                   </div>
               </div>
   </body>
   
   </html>
   ```
   
   ![image-20240702201600806](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1719922560-image-20240702201600806.png)

8. 配置 Workers.js

   ```js
import HTML from './index.html';
   export default {
       async fetch(request) {
           const url = new URL(request.url);
           const path = url.pathname;
           const originalHost = request.headers.get("host");
           const registryHost = "registry-1.docker.io";
           if (path.startsWith("/v2/")) {
           const headers = new Headers(request.headers);
           headers.set("host", registryHost);
           const registryUrl = `https://${registryHost}${path}`;
           const registryRequest = new Request(registryUrl, {
               method: request.method,
               headers: headers,
               body: request.body,
               redirect: "follow",
           });
           const registryResponse = await fetch(registryRequest);
           console.log(registryResponse.status);
           const responseHeaders = new Headers(registryResponse.headers);
           responseHeaders.set("access-control-allow-origin", originalHost);
           responseHeaders.set("access-control-allow-headers", "Authorization");
           return new Response(registryResponse.body, {
               status: registryResponse.status,
               statusText: registryResponse.statusText,
               headers: responseHeaders,
           });
           } else {
           return new Response(HTML.replace(/{{host}}/g, originalHost), {
               status: 200,
               headers: {
               "content-type": "text/html"
               }
           });
           }
       }
   }
   ```
   
   配置完成后点击部署按钮，[并访问分配的域名。](https://mirror.hougen.fun)

9. 自定义域名

   ![image-20240702201928546](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1719922768-image-20240702201928546.png)

