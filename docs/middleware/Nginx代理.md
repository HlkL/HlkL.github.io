#### Nginx

##### Nginx安装配置

1. 安装编译工具

```shell
yum -y install make zlib zlib-devel gcc-c++ libtool  openssl openssl-devel
```

2. 下载

   - 官网下载安装压缩包
   - wget 安装
   
   ```shell
   #安装wget
   yum install wget
   wget https://nginx.org/download/nginx-1.22.1.tar.gz
   #解压
   tar -zxvf nginx-1.22.1.tar.gz -C /usr/local/src/
   #安装到指定位置
   ./configure --prefix=/usr/local/src/nginx
   #编译安装
   make && make install
   #配置全局环境
   vim /etc/profile
   source /etc/profile
   ```
   
3. ![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676271-0396c6f86ab8c1e1d0b9277546c48269235a11a0.png)

   ![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676276-396fb4d2d3df0c7d13b72474ffe5f49ed80237bc.png)

##### 常用命令


| 命令                |            操作            |
| :-------------------- | :--------------------------: |
| ./nginx -v          |       ***查看版本***       |
| ./nginx -t          | ***检测配置文件是否正常*** |
| ./nginx             |       ***启动服务***       |
| ./nginx -s stop     |       ***关闭服务***       |
| ps -ef\| grep nginx |       ***查看进程***       |
| ./nginx -s reload   |   ***重新加载配置文件***   |

##### nginx配置文件结构

- ***全局块*** *Nginx* 运行相关的全局配置
- ***events块***  网络连接相关的配置
- ***http块*** 代理,缓存,日志,虚拟主机配置

  - **http块** 中可以配置多个Server块,每个Server块可以配置多个localtion块
  - http全局块
  - Server块

    - Server全局块
    - localtion块

```shell
#全局块
worker_processes  1;

#events块
events {
    worker_connections  1024;
}

http {
	#http全局块
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;

    keepalive_timeout  65;
	#server块
    server {
    	#Server全局块
        listen       80;#监听端口
        server_name  localhost;#服务器名称(域名)
		#localtion块
        location / {#匹配客户端请求url
            root   html;#指定静态资源根目录
            index  index.html index.htm;#指定默认首页
            proxy_pass http://127.0.0.1#反向代理配置,将请求转发到指定服务器
        }
      
        error_page   500 502 503 504  /50x.html;
        #localtion块
        location = /50x.html {
            root   html;
        }
    }
}
```

##### 反向代理

[正向代理和反向代理](https://cloud.tencent.com/developer/article/1418457#:~:text=%E6%AD%A3%E5%90%91%E4%BB%A3%E7%90%86.%20%E6%AD%A3%E5%90%91%E4%BB%A3%E7%90%86%EF%BC%88forward%20proxy%EF%BC%89%EF%BC%9A%E6%98%AF%E4%B8%80%E4%B8%AA%E4%BD%8D%E4%BA%8E%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%92%8C%E7%9B%AE%E6%A0%87%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%B9%8B%E9%97%B4%E7%9A%84%E6%9C%8D%E5%8A%A1%E5%99%A8,%28%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1%E5%99%A8%29%EF%BC%8C%E4%B8%BA%E4%BA%86%E4%BB%8E%E7%9B%AE%E6%A0%87%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%8F%96%E5%BE%97%E5%86%85%E5%AE%B9%EF%BC%8C%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%90%91%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%8F%91%E9%80%81%E4%B8%80%E4%B8%AA%E8%AF%B7%E6%B1%82%E5%B9%B6%E6%8C%87%E5%AE%9A%E7%9B%AE%E6%A0%87%EF%BC%8C%E7%84%B6%E5%90%8E%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%90%91%E7%9B%AE%E6%A0%87%E6%9C%8D%E5%8A%A1%E5%99%A8%E8%BD%AC%E4%BA%A4%E8%AF%B7%E6%B1%82%E5%B9%B6%E5%B0%86%E8%8E%B7%E5%BE%97%E7%9A%84%E5%86%85%E5%AE%B9%E8%BF%94%E5%9B%9E%E7%BB%99%E5%AE%A2%E6%88%B7%E7%AB%AF%E3%80%82.%20%E8%BF%99%E7%A7%8D%E4%BB%A3%E7%90%86%E5%85%B6%E5%AE%9E%E5%9C%A8%E7%94%9F%E6%B4%BB%E4%B8%AD%E6%98%AF%E6%AF%94%E8%BE%83%E5%B8%B8%E8%A7%81%E7%9A%84%EF%BC%8C%E6%AF%94%E5%A6%82%E8%AE%BF%E9%97%AE%E5%A4%96%E5%9B%BD%E7%BD%91%E7%AB%99%E6%8A%80%E6%9C%AF%EF%BC%8C%E5%85%B6%E7%94%A8%E5%88%B0%E7%9A%84%E5%B0%B1%E6%98%AF%E4%BB%A3%E7%90%86%E6%8A%80%E6%9C%AF%E3%80%82.%20%E6%9C%89%E6%97%B6%E5%80%99%EF%BC%8C%E7%94%A8%E6%88%B7%E6%83%B3%E8%A6%81%E8%AE%BF%E9%97%AE%E6%9F%90%E5%9B%BD%E5%A4%96%E7%BD%91%E7%AB%99%EF%BC%8C%E8%AF%A5%E7%BD%91%E7%AB%99%E6%97%A0%E6%B3%95%E5%9C%A8%E5%9B%BD%E5%86%85%E7%9B%B4%E6%8E%A5%E8%AE%BF%E9%97%AE%EF%BC%8C%E4%BD%86%E6%98%AF%E6%88%91%E4%BB%AC%E5%8F%AF%E4%BB%A5%E8%AE%BF%E9%97%AE%E5%88%B0%E4%B8%80%E4%B8%AA%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1%E5%99%A8%EF%BC%8C%E8%BF%99%E4%B8%AA%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%8F%AF%E4%BB%A5%E8%AE%BF%E9%97%AE%E5%88%B0%E8%BF%99%E4%B8%AA%E5%9B%BD%E5%A4%96%E7%BD%91%E7%AB%99%E3%80%82.)

- ***正向代理***  (代理客户)
  
  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676282-33d7eb2db0e4664b9d81dd63513e5cdf108639a7.png" alt="image" style="zoom: 50%;" />
  
  - 又或者国内访问不上 GitHub,但是可以使用代理工具,代理工具替你去访问GitHub服务器,并将结果返回给你,你只需要访问代理服务器即可
  
- ***反向代理***  (代理服务器)
  
  - 客户端访问服务器,服务器为了防止恶意访问(DoS/DDoS),在访问中间增加代理服务器用于接收客户端的请求,代理服务器再去请求服务器,服务器将响应的结果放回给代理,最后代理将请求的结果返回
  
    <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676286-78a28966da0a86fdae6d55c39dd42517fecf17c7.png" alt="image" style="zoom:50%;" />

##### 反向代理demo

* 配置文件(代理服务器ip:192.168.43.10)

  ```shell
  server{
  	listen 8080;
  	server_name localhost;
  	location / {
  		proxy_pass http://192.168.43.11:8080;
  	}
  }
  ```
* 192.168.43.11服务器开启Web服务
* <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676291-19674737573a102ed02300c3372f348b825fc544.png" alt="image" style="zoom:50%;" />
*  | <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676297-34dd05d43096f8b83bbc9267c0cf5dfe5aa1a9b7.png" alt="image" style="zoom:25%;" /> | <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676302-f206d309d98ba7a5730ab20b689a72f1e654f067.png" alt="image" style="zoom:25%;" /> |
  | :----------------------------------------------------------: | :----------------------------------------------------------: |

##### 负载均衡

1. 配置

```shell
upstream targetServer{#定义一组服务器
	server 192.168.43.10:8080;
	server 192.168.43.10:8081;
}

server{
	listen 8080;
	server_name localhost;
	location / {
		proxy_pass http://targetServer;
	}
}
```

2. 策略(默认轮询方式)


| 名称       | 说明            |
| ------------ | ----------------- |
| weight     | 权重方式        |
| ip_hash    | 根据ip分配方式  |
| least_conn | 依据最少连接数  |
| url_hash   | 依据url分配方式 |
| fair       | 依据响应时间    |

##### win操作

> 1. cmd进入nginx安装目录
> 2. 启动nginx
>
>    ```shell
>    start nginx
>    ```
> 3. 停止nginx
>
>    1. 查看nginx所有进程
>
>       ```shell
>       tasklist /fi "imagename eq nginx.exe"
>       ```
>    2. 通过指令停止nginx
>
>       ```shell
>       nginx.exe -s stop
>       ```
>    3. 通过查看到的进程PID,强行杀死进程
>
>       ```shell
>       TASKKILL /PID xxxx /F
>       ```
