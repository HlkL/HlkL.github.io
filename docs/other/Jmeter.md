# Jmeter快速入门

## 设置中文语言

默认[Jmeter](http://jmeter.apache.org/download_jmeter.cgi)的语言是英文，需要设置：

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678282-382d0b63d2a399217c5a988b2e5fc36b4822a6e0.png)

效果：

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678289-abb2a19c2369996ee1e6f88647ee3909b6d34b50.png)

> **注意**：上面的配置只能保证本次运行是中文，如果要永久中文，需要修改Jmeter的配置文件

打开jmeter文件夹，在bin目录中找到 **jmeter.properties**，添加下面配置：

```properties
language=zh_CN
```

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678294-b58451bc47d41077c8961e007949899c4fff8c72.png)

> 注意：前面不要出现#，#代表注释，另外这里是下划线，不是中划线

## 基本用法

在测试计划上点鼠标右键，选择添加 > 线程（用户） > 线程组：

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678299-40d390784fdf60f3f540d00576adb655867d6f8c.png)

在新增的线程组中，填写线程信息：

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678304-9a7b286c41688a8f683dd10952e668490f27eae4.png)

给线程组点鼠标右键，添加http取样器：

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678308-a8789b9323ecfa3d5d315e413048f4c0834406eb.png)

编写取样器内容：

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678312-fe7576cde30f25af8b37bd9e72c253d7cdaa08e5.png)

添加监听报告：

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678316-83d995887db40ee953b43bdef4189dd8a97bc0ec.png)

添加监听结果树：

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678320-9ac72dda38390b6d01678804da02e1b41c357ec6.png)

汇总报告结果：

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678323-c5bad80668a3e3449b8eef7e882f7d8f604f64a7.png)

结果树：

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678327-54066f3eafe2d2a8f20bb64e7c1a7c3fc6e6d07a.png)
