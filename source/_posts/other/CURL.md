---
title: CURL命令
date: 2023-01-01 12:13:49
updated: 2023-01-01 12:13:49
tags:
  - other
---

[curl 是常用的命令行工具，用来请求 Web 服务器](https://baike.baidu.com/item/curl/10098606)

[curl 的用法指南](https://zhuanlan.zhihu.com/p/336945420)

curl默认发送get请求 例如：`curl www.baidu.com`

可以添加参数发送post请求 例如：`curl -X -POST url` ,可以将两个参数合并为`-XPOST `, 可以简单理解默认的就是 `curl -X -GET url`。

![image-20230821231353552](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/202308222231334.png)

使用 `-d` 添加请求参数 使用 `-H` 设置标头 例如 

```shell
curl -XPOST  localhost:8080/save -d '{
  "name": "test_8cd49a0fa3be",
  "age": 36
}' -H 'Content-Type:application/json' 
```



![image-20230821232910021](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/202308222231335.png)

`-I` 获取头信息

`````shell
curl -I  localhost:8080
`````

![image-20230821233206062](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/202308222231336.png)

`-o` 下载文件到当前目录，参数后面可设置文件名称

```shell
curl -0 文件名 url
```

![image-20230821233948695](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/202308222231337.png)

`--limit-rate` 限制文件的下载速度，默认字节单位，不小心中断下载，可使用`-C`恢复下载

![image-20230821235337507](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/202308222231338.png)

使用 curl 测试网址时，大部分的会重定向，crul默认不会跟随，使用`-L`跟随重定向

![image-20230821235827555](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/202308222231339.png)

使用curl代理访问目标网址 `curl –proxy “协议://用户名:密码@代理地址:端口” url`

```shell
curl --proxy "http://zs:123@127.0.0.0:7890" www.github.com
```