## 雪崩问题

**微服务调用链路中的某个服务故障，引起整个链路中的所有微服务都不可用，这就是雪崩**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677531-4285a263b9f2495596396ea3a03af20ff4d908d6.png" alt="image-20230105235420143" style="zoom:75%;" />

### 解决雪崩问题

1.   **超时处理**

     设定超时时间，请求超过一定时间没有响应就返回错误信息，不会无休止等待

![image-20230105235629295](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677534-9a4d27a0fe08bae01364042626afffb168a67d66.png)

2.   **仓壁模式**

     仓壁模式来源于船舱的设计,船舱都会被隔板分离为多个独立空间，当船体破损时，只会导致部分空间进入，将故障控制在一定范围内，避免整个船体被淹没

![image-20230105235818028](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677539-cd5f3fbfc0406cabacb3cf9cd310b1e13158db60.png)

**于此类似，我们可以限定每个业务能使用的线程数，避免耗尽整个tomcat的资源，因此也叫线程隔离**

![image-20230105235935770](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677543-fa703ffa378bf29c0ca86e64112ad479efe30190.png)

3.   **熔断降级**

     由**断路器**统计业务执行的异常比例，如果超出阈值则会**熔断**该业务，拦截访问该业务的一切请求。断路器会统计访问某个服务的请求数量，异常比例,当发现访问服务D的请求异常比例过高时，认为服务D有导致雪崩的风险，会拦截访问服务D的一切请求，形成熔断

     

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677547-22e2b1e9bc7ef17dda506daa0b8a8471f5d556fc.png" alt="image-20230106000331767" style="zoom:50%;" />

4.   **流量控制**

     限制业务访问的QPS，避免服务因流量的突增而故障,

     ![image-20230106000503240](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677550-5b774d2c45ee7409cf7550465d261627627b9d3c.png)

>   -   **限流**是对服务的保护，避免因瞬间高并发流量而导致服务故障，进而避免雪崩。是一种**预防**措施
>   -   **超时处理、线程隔离、降级熔断**是在部分服务故障时，将故障控制在一定范围，避免雪崩。是一种**补救**措施

**服务保护技术对比**

在SpringCloud当中支持多种服务保护技术：

- [Netfix Hystrix](https://github.com/Netflix/Hystrix)
- [Sentinel](https://github.com/alibaba/Sentinel)
- [Resilience4J](https://github.com/resilience4j/resilience4j)

早期比较流行的是Hystrix框架，但目前国内实用最广泛的还是阿里巴巴的Sentinel框架

|                | **Sentinel**                                   | **Hystrix**                   |
| -------------- | ---------------------------------------------- | ----------------------------- |
| 隔离策略       | 信号量隔离                                     | 线程池隔离/信号量隔离         |
| 熔断降级策略   | 基于慢调用比例或异常比例                       | 基于失败比率                  |
| 实时指标实现   | 滑动窗口                                       | 滑动窗口（基于 RxJava）       |
| 规则配置       | 支持多种数据源                                 | 支持多种数据源                |
| 扩展性         | 多个扩展点                                     | 插件的形式                    |
| 基于注解的支持 | 支持                                           | 支持                          |
| 限流           | 基于 QPS，支持基于调用关系的限流               | 有限的支持                    |
| 流量整形       | 支持慢启动、匀速排队模式                       | 不支持                        |
| 系统自适应保护 | 支持                                           | 不支持                        |
| 控制台         | 开箱即用，可配置规则、查看秒级监控、机器发现等 | 不完善                        |
| 常见框架的适配 | Servlet、Spring Cloud、Dubbo、gRPC  等         | Servlet、Spring Cloud Netflix |

## Sentinel安装

[Sentinel](https://sentinelguard.io/zh-cn/index.html)是阿里巴巴开源的一款微服务流量控制组件

-   **丰富的应用场景**：Sentinel 承接了阿里巴巴近 10 年的双十一大促流量的核心场景，例如秒杀（即突发流量控制在系统容量可以承受的范围）、消息削峰填谷、集群流量控制、实时熔断下游不可用应用等
-   **完备的实时监控**：Sentinel 同时提供实时的监控功能。您可以在控制台中看到接入应用的单台机器秒级数据，甚至 500 台以下规模的集群的汇总运行情况
-   **广泛的开源生态**：Sentinel 提供开箱即用的与其它开源框架/库的整合模块，例如与 Spring Cloud、Dubbo、gRPC 的整合。您只需要引入相应的依赖并进行简单的配置即可快速地接入 Sentinel
-   **完善的** **SPI** **扩展点**：Sentinel 提供简单易用、完善的 SPI 扩展接口。您可以通过实现扩展接口来快速地定制逻辑。例如定制规则管理、适配动态数据源等

[GitHub下载](https://github.com/alibaba/Sentinel/releases)

```sh
# 运行sentinel
java -jar sentinel-dashboard-1.8.1.jar
```

**修改Sentinel的默认端口、账户、密码**

| **配置项**                       | **默认值** | **说明**   |
| -------------------------------- | ---------- | ---------- |
| server.port                      | 8080       | 服务端口   |
| sentinel.dashboard.auth.username | sentinel   | 默认用户名 |
| sentinel.dashboard.auth.password | sentinel   | 默认密码   |

例如修改端口

```sh
java -Dserver.port=8090 -jar sentinel-dashboard-1.8.1.jar
```

## 微服务整合Sentinel

**导入依赖**

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId> 
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

**配置控制台**

```yaml

spring:
  cloud: 
    sentinel:
      transport:
        dashboard: localhost:8080
```

**访问任意服务,触发`sentinel`监控**

![image-20230106001904856](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677560-937e37eb07e162cbaafda08dd1b4cc06a94f4cf0.png)

## 限流规则

### 簇点链路

>   当请求进入微服务时，首先会访问`DispatcherServlet`，然后进入`Controller`、`Service`、`Mapper`，这样的一个调用链就叫做**簇点链路**。簇点链路中被监控的每一个接口就是一个**资源**。默认情况下`sentinel`会监控`SpringMVC`的每一个端点（`Endpoint`，也就是`controller`中的方法），因此`SpringMVC`的每一个端点（`Endpoint`）就是调用链路中的一个资源
>
>   ***流控、熔断等都是针对簇点链路中的资源来设置的，因此我们可以点击对应资源后面的按钮来设置规则***
>
>   -   流控：流量控制
>   -   降级：降级熔断
>   -   热点：热点参数限流，是限流的一种
>   -   授权：请求的权限控制

![image-20230106002457056](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677564-0b55516ff7b64e508c0865006872181ed6ecfdc3.png)

**快速入门**

点击资源/order/{orderId}后面的流控按钮，就可以弹出表单,表单中可以填写限流规则

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677567-50083f8643a53fb5d36fc1b658f8cf80d4b7a8e2.png" alt="image-20230106002645027" style="zoom:50%;" />

**其含义是限制` /order/{orderId}`这个资源的单机QPS为1，即每秒只允许1次请求，超出的请求会被拦截并报错**

### 流控模式

在添加限流规则时，点击高级选项，可以选择三种**流控模式**：

-   直接：统计当前资源的请求，触发阈值时对当前资源直接限流，也是默认的模式
-   关联：统计与当前资源相关的另一个资源，触发阈值时，对当前资源限流
-   链路：统计从指定链路访问到本资源的请求，触发阈值时，对指定链路限流

![image-20230106003009198](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677571-15a4b729de95f30e3d48443cf7fbc66b03447233.png)

#### 关联模式

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677575-965caac58eccee6120b7e482170bd97543c2c458.png" alt="image-20230106003117822" style="zoom:70%;" />

>   当`/write`资源访问量触发阈值时，就会对`/read`资源限流，避免影响`/write`资源

**使用场景**：比如用户支付时需要修改订单状态，同时用户要查询订单。查询和修改操作会争抢数据库锁，产生竞争。业务需求是优先支付和更新订单的业务，因此当修改订单业务触发阈值时，需要对查询订单业务限流

![image-20230106003403013](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677579-ff0a910b896cf5dc99fd327e0766d5c293b99a4d.png)

#### 链路模式

>   例如有两条请求链路：
>
>   - /test1 --> /common
>
>   - /test2 --> /common
>
>   如果只希望统计从/test2进入到/common的请求，则可以这样配置

![image-20230106003747248](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677582-42e55ba9e45ab226704c98ffdedc26b125fc929a.png)

**实战案例**有查询订单和创建订单业务，两者都需要查询商品。针对从查询订单进入到查询商品的请求统计，并设置限流

1.   **添加查询商品方法**

     在OrderService类添加一个queryGoods方法

     ```java
     public void queryGoods(){
         System.err.println("查询商品");
     }
     ```

2.   **查询订单时，查询商品**

     ```java
     @GetMapping("/query")
     public String queryOrder() {
         // 查询商品
         orderService.queryGoods();
         // 查询订单
         System.out.println("查询订单");
         return "查询订单成功";
     }
     ```

3.   **新增订单，查询商品**

     ```java
     @GetMapping("/save")
     public String saveOrder() {
         // 查询商品
         orderService.queryGoods();
         // 查询订单
         System.err.println("新增订单");
         return "新增订单成功";
     }
     ```

4.   **给查询商品添加资源标记**

     默认情况下，OrderService中的方法是不被Sentinel监控的，需要我们自己通过`@SentinelResource`注解来标记要监控的方法

     ```java
     @SentinelResource("goods")
     public void queryGoods(){
         System.err.println("查询商品");
     }
     ```

5.   **关闭SpringMVC的资源整合**

     链路模式中，是对不同来源的两个链路做监控。但是sentinel默认会给进入SpringMVC的所有请求设置同一个root资源，会导致链路模式失效

     ```yaml
     spring:
       cloud:
         sentinel:
           web-context-unify: false # 关闭context整合
     ```

6.   重启服务，访问`/order/query`和`/order/save`，可以查看到**sentinel**的簇点链路规则中，出现了新的资源

     <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677610-6195361b1bbfb0e73b6315be6ef85f5f8adb7afa.png" alt="image-20230106004511078" style="zoom:50%;" />

7.   **添加限流规则**

     <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677615-3358ce4136a847bea88706784147d739d5d2a62e.png" alt="image-20230106004656737" style="zoom:50%;" />

#### 流控效果

![image-20230106004943698](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677619-1284bb6712dc6eadf7fba8d9db319a86e281c7e4.png)

>   流控效果是指请求达到流控阈值时应该采取的措施，包括三种：
>
>   - 快速失败：达到阈值后，新的请求会被立即拒绝并抛出FlowException异常。是默认的处理方式
>
>   - warm up：预热模式，对超出阈值的请求同样是拒绝并抛出异常。但这种模式阈值会动态变化，从一个较小值逐渐增加到最大阈值
>
>   - 排队等待：让所有的请求按照先后次序排队执行，两个请求的间隔不能小于指定时长
>

##### warm up

阈值一般是一个微服务能承担的最大QPS，但是一个服务刚刚启动时，一切资源尚未初始化（**冷启动**），如果直接将QPS跑到最大值，可能导致服务瞬间宕机

warm up也叫**预热模式**，是应对服务冷启动的一种方案。请求阈值初始值是 **maxThreshold** / **coldFactor**，持续指定时长后，逐渐提高到**maxThreshold**值。而**coldFactor**的默认值是3

例如，设置QPS的maxThreshold为10，预热时间为5秒，那么初始阈值就是 10 / 3 ，也就是3，然后在5秒后逐渐增长到10

![image-20230106005254723](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677623-871a9634fdf1ff005da673e720ff98fbb4f6ff15.png)

**配置流控规则**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677627-64b49ac5f26957114b343c84aa691e504cf511ea.png" alt="image-20230106005533608" style="zoom:50%;" />

**/order/{orderId}这个资源设置限流，最大QPS为10，利用warm up效果，预热时长为5秒,Sentinel控制台实时监控**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677635-1710677632-e4c6f6a68cb60f11adc701ab819a20460a49ae66.png" alt="image-20230106010019480" style="zoom: 50%;" /><img src="https://i0.hdslb.com/bfs/album/fb904f5587aab2bae03574982204b9e9e4103dcd.png" alt="image-20230106010111717" style="zoom:50%;" />

##### 排队等待

排队等待是让所有请求进入一个队列中，然后按照阈值允许的时间间隔依次执行。后来的请求必须等待前面执行完成，如果请求预期的等待时间超出最大时长，则会被拒绝

例如：QPS = 5，意味着每200ms处理一个队列中的请求；timeout = 2000，意味着**预期等待时长**超过2000ms的请求会被拒绝并抛出异常

![image-20230106011226409](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677639-8fc7bec5b558090c37ce7ae026d7b64ef9e0afbf.png)

<span style="color: red">预期等待时长</span>比如现在一下子来了12 个请求，因为每200ms执行一个请求，那么：

- 第6个请求的**预期等待时长** =  200 * （6 - 1） = 1000ms
- 第12个请求的预期等待时长 = 200 * （12-1） = 2200ms

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677647-1710677643-4dab91437f24a37e3e3f4c0f28234558044f1a63.png" alt="image-20230106011544586" style="zoom: 33%;" /><img src="https://i0.hdslb.com/bfs/album/248c90bade2c237ad813277ff9adfe01c62052b1.png" alt="image-20230106011626071" style="zoom: 33%;" />

***平滑的QPS曲线，对于服务器来说是更友好的***

**案例**给/order/{orderId}这个资源设置限流，最大QPS为10，利用排队的流控效果，超时时长设置为5s

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677651-e1a86fb9f0e4549bfd803f10fce437cc53a247f8.png" alt="image-20230106012057654" style="zoom:50%;" />

sentinel查看实时监控的QPS曲线

![image-20230106012135321](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677655-a87f0c52801885841612cb8c1244b33dc3924766.png)

QPS非常平滑，一致保持在10，但是超出的请求没有被拒绝，而是放入队列。因此**响应时间**（等待时间）会越来越长。当队列满了以后，才会有部分请求失败：

![image-20230106012159563](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677659-e3fe4ab99a8911ba9a1d72c132182a62a9042c79.png)

### 热点参数限流

**之前的限流是统计访问某个资源的所有请求，判断是否超过QPS阈值。而热点参数限流是分别统计<span style="color: red">参数值相同</span>的请求，判断是否超过QPS阈值**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677663-3753392da56508ab32f96bb00e88444ea794d3f7.png" alt="image-20230106012853623" style="zoom:70%;" />

对hot这个资源的0号参数（第一个参数）做统计，**每1秒相同参数值的请求数不能超过5**

>   刚才的配置中，对查询商品这个接口的所有商品一视同仁，QPS都限定为5,而在实际开发中，可能部分商品是热点商品，例如秒杀商品，我们希望这部分商品的QPS限制与其它商品不一样，高一些。那就需要配置热点参数限流的高级选项了
>

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677666-d7749933fcb00a4ec0c7ea1b6a420836e18c64c9.png" alt="image-20230106013404189" style="zoom:67%;" />

对0号的long类型参数限流，每1秒相同参数的QPS不能超过5，有两个例外：

-   如果参数值是100，则每1秒允许的QPS为10
-   如果参数值是101，则每1秒允许的QPS为15

>   **案例**给/order/{orderId}这个资源添加热点参数限流
>
>   -   默认的热点参数规则是每1秒请求量不超过2
>   -   给102这个参数设置例外：每1秒请求量不超过4
>   -   给103这个参数设置例外：每1秒请求量不超过10
>
>   <span style="color: red">热点参数限流对默认的SpringMVC资源无效，需要利用@SentinelResource注解标记资源</span>

1.   **标记资源**

     ![image-20230106013918767](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677670-dd247ce6c3d68e0c6d5e3b580627f4974d2b18cd.png)

2.   **热点参数限流规则**

     访问该接口，可以看到我们标记的hot资源出现了,这里不要点击hot后面的按钮，页面有BUG

     点击左侧菜单中**热点规则**菜单,点击新增,填写表单

     ![image-20230106014458077](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677674-dd32ab56b2200389559e559e25716f2d38288399.png)

3.   配置限流规则

     <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677678-76cf95f12dc3d0cb940b36a901ec5ce85f99f0d1.png" alt="image-20230106014627752" style="zoom: 50%;" />

## 隔离和降级

限流是一种预防措施，虽然限流可以尽量避免因高并发而引起的服务故障，但服务还会因为其它原因而故障,而要将这些故障控制在一定范围，避免雪崩，就要靠**线程隔离**（舱壁模式）和**熔断降级**

>   -   **线程隔离**  调用者在调用服务提供者时，给每个调用的请求分配独立线程池，出现故障时，最多消耗这个线程池内资源，避免把调用者的所有资源耗尽
>   -   **熔断降级**  是在调用方这边加入断路器，统计对服务提供者的调用，如果调用的失败比例过高，则熔断该业务，不允许访问该服务的提供者了
>
>   不管是线程隔离还是熔断降级，都是对**客户端**（调用方）的保护。需要在**调用方** 发起远程调用时做线程隔离、或者服务熔断。
>
>   而微服务远程调用都是基于Feign来完成的，因此需要将Feign与Sentinel整合，在Feign里面实现线程隔离和服务熔断

### FeignClient整合Sentinel

**修改配置，开启`sentinel`功能**

```yaml
feign:
  sentinel:
    enabled: true # 开启feign对sentinel的支持
```

**编写失败降级逻辑**

业务失败后，不能直接报错，而应该返回用户一个友好提示或者默认结果,给**FeignClient**编写失败后的降级逻辑

1.   **FallbackClass**  无法对远程调用的异常做处理

2.   **FallbackFactory**  可以对远程调用的异常做处理

**在`Feign`中实现`FallbackFactory`接口**

```java
@Slf4j
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
    @Override
    public UserClient create(Throwable throwable) {
        //失败降级处理逻辑
        return new UserClient() {
            @Override
            public User findById(Long id) {
                log.error("查询用户异常", throwable);
                //根据业务需求返回默认数据,返回空对象
                return new User();
            }
        };
    }
}
```

**在`Feign`中注册`FallbackFactory`**

```Java
@Bean
public UserClientFallbackFactory userClientFallbackFactory(){
    return new UserClientFallbackFactory();
}
```

**在`Feign`项目中的`UserClient`接口中使用`UserClientFallbackFactory`**

```java
@FeignClient(value = "userservice", fallbackFactory = UserClientFallbackFactory.class)
public interface UserClient {

    @GetMapping("/user/{id}")
    User findById(@PathVariable("id") Long id);
}
```

**重启订单查询业务，查看sentinel控制台，可以看到新的簇点链路**

![image-20230106160827755](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677684-26f217cd8d15ef9a632b89374ebe817fd02a3eb4.png)

### 线程隔离

![image-20230106161717204](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677696-a3b929eac9deaf66c1affa4aa6d63b0dada355f6.png)

>   **线程池隔离**：给每个服务调用业务分配一个线程池，利用线程池本身实现隔离效果
>
>   -   **优点**  支持主动超时支持异步调用
>   -   **缺点**  线程的额外开销比较大
>   -   **场景**  低扇出
>
>   **信号量隔离**：不创建线程池，而是计数器模式，记录业务使用的线程数量，达到信号量上限时，禁止新的请求
>
>   -   **优点**  轻量级，无额外开销
>   -   **缺点**  不支持主动超时不支持异步调用
>   -   **场景**  高频调用高扇出

**`sentinel`的线程隔离**

在添加限流规则时，可以选择两种阈值类型

![image-20230106162306729](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677703-19bcb9c329a58850cef66662c2055158d5a22711.png)

- **QPS**：每秒的请求数

- **线程数**：是该资源能使用用的`tomcat`线程数的最大值。也就是通过限制线程数量，实现**线程隔离**（舱壁模式）

**案例**  给 `order-service`服务中的`UserClient`的查询用户接口设置流控规则，线程数不能超过 2

![image-20230106163054337](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677707-ce6c45ed8c0ef400a578b3164d2b609cce636f2b.png)

### 熔断降级

**熔断降级是解决雪崩问题的重要手段。其思路是由<span style="color: red">断路器,</span>统计服务调用的异常比例、慢请求比例，如果超出阈值则会<span style="color: red">熔断</span>该服务。即拦截访问该服务的一切请求；而当服务恢复时，断路器会放行访问该服务的请求**

![image-20230106163440875](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677711-f49dd4e97590ae869fcc1b6177e0ac65b5b35f0c.png)

>   - **closed**：关闭状态，断路器放行所有请求，并开始统计异常比例、慢请求比例。超过阈值则切换到open状态
>   - **open**：打开状态，服务调用被**熔断**，访问被熔断服务的请求会被拒绝，快速失败，直接走降级逻辑。Open状态5秒后会进入half-open状态
>   - **half-open**：半开状态，放行一次请求，根据执行结果来判断接下来的操作
>       - 请求成功：则切换到closed状态
>       - 请求失败：则切换到open状态
>
>   ***<span style="color: #67D0DB">断路器熔断策略有三种：慢调用、异常比例、异常数</span>***

#### 慢调用

**业务的响应时长（RT）大于指定时长的请求认定为慢调用请求。在指定时间内，如果请求数量超过设定的最小数量，慢调用比例大于设定的阈值，则触发熔断**

![image-20230106164316805](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677716-8f66b880ac1f1d8b266961a3638039256f7ac657.png)

>   RT超过500ms的调用是慢调用，统计最近10000ms内的请求，如果请求量超过10次，并且慢调用比例不低于0.5，则触发熔断，熔断时长为5秒。然后进入half-open状态，放行一次请求做测试

#### 异常比例、异常数

**统计指定时间内的调用，如果调用次数超过指定请求数，并且出现异常的比例达到设定的比例阈值（或超过指定异常数），则触发熔断**

![image-20230106164717927](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677719-a7e5657cfd9af9c23a1e2c6daf44b7cbff52553c.png)

>   -   统计最近1000ms内的请求，如果请求量超过10次，并且异常比例不低于0.4，则触发熔断
>   -   统计最近1000ms内的请求，如果请求量超过10次，并且异常比例不低于2次，则触发熔断

## 授权规则

![image-20230106165122747](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677722-b4e7fed580e12a3ca01d884cd56e3d77465d9412.png)

>   - **资源名**：就是受保护的资源，例如/order/{orderId}
>
>   - **流控应用**：是来源者的名单，
>       - 如果是勾选白名单，则名单中的来源被许可访问
>       - 如果是勾选黑名单，则名单中的来源被禁止访问

允许请求从gateway到order-service，不允许浏览器访问order-service，那么白名单中就要填写**网关的来源名称（origin）**

**获取origin**

Sentinel是通过RequestOriginParser这个接口的parseOrigin来获取请求的来源的

```java
public interface RequestOriginParser {
    /**
     * 从请求request对象中获取origin，获取方式自定义
     */
    String parseOrigin(HttpServletRequest request);
}
```

这个方法的作用是从request对象中，获取请求者的origin值并返回。默认情况下，sentinel不管请求者从哪里来，返回值永远是default，也就是说一切请求的来源都被认为是一样的值default。因此，我们需要自定义这个接口的实现，让**不同的请求，返回不同的origin**

```java
@Component
public class HeaderOriginParser implements RequestOriginParser {
    @Override
    public String parseOrigin(HttpServletRequest request) {
        // 1.获取请求头
        String origin = request.getHeader("origin");
        // 2.非空判断
        if (StringUtils.isEmpty(origin)) {
            origin = "blank";
        }
        return origin;
    }
}
```

**给网关添加请求头**

获取请求origin的方式是从reques-header中获取origin值，我们必须让**所有从gateway路由到微服务的请求都带上origin头**,修改gateway服务中的application.yml，添加一个defaultFilter

```yaml
spring:
  cloud:
    gateway:
      default-filters:
        - AddRequestHeader=origin,gateway
```

**配置授权规则**

![image-20230106170551940](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677728-736345f44936404e374034f5eb7ab61620ea3129.png)

### 自定义异常结果

**默认情况下，发生限流、降级、授权拦截时，都会抛出异常到调用方。异常结果都是flow limmiting（限流）。这样不够友好，无法得知是限流还是降级还是授权拦截**

***<span style="color: #7295C2">异常类型</span>***

自定义异常时的返回结果，需要实现BlockExceptionHandler接口

```java
public interface BlockExceptionHandler {
    /**
     * 处理请求被限流、降级、授权拦截时抛出的异常：BlockException
     */
    void handle(HttpServletRequest request, HttpServletResponse response, BlockException e) throws Exception;
}
```

>   -   `HttpServletRequest request`：request对象
>   -   `HttpServletResponse response`：response对象
>   -   `BlockException e`：被sentinel拦截时抛出的异常

**BlockException包含多个不同的子类**

| **异常**             | **说明**           |
| -------------------- | ------------------ |
| FlowException        | 限流异常           |
| ParamFlowException   | 热点参数限流的异常 |
| DegradeException     | 降级异常           |
| AuthorityException   | 授权规则异常       |
| SystemBlockException | 系统规则异常       |

***<span style="color: #7295C2">自定义异常处理</span>***

在order-service定义一个自定义异常处理类

```java
@Component
public class SentinelExceptionHandler implements BlockExceptionHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, BlockException e) throws Exception {
        String msg = "未知异常";
        int status = 429;

        if (e instanceof FlowException) {
            msg = "请求被限流了";
        } else if (e instanceof ParamFlowException) {
            msg = "请求被热点参数限流";
        } else if (e instanceof DegradeException) {
            msg = "请求被降级了";
        } else if (e instanceof AuthorityException) {
            msg = "没有权限访问";
            status = 401;
        }

        response.setContentType("application/json;charset=utf-8");
        response.setStatus(status);
        response.getWriter().println("{\"msg\": " + msg + ", \"status\": " + status + "}");
    }
}
```

## 规则持久化

**sentinel的所有规则都是内存存储，重启后所有规则都会丢失。在生产环境下，我们必须确保这些规则的持久化，避免丢失**

>   规则是否能持久化，取决于规则管理模式，sentinel支持三种规则管理模式
>
>   -   [原始模式](https://github.com/alibaba/Sentinel/wiki/在生产环境中使用-Sentinel)  Sentinel的默认模式，将规则保存在内存，重启服务会丢失
>
>   -   [Pull ](https://github.com/alibaba/Sentinel/wiki/在生产环境中使用-Sentinel)[模式](https://github.com/alibaba/Sentinel/wiki/在生产环境中使用-Sentinel)  
>   -   [Push ](https://github.com/alibaba/Sentinel/wiki/在生产环境中使用-Sentinel)[模式](https://github.com/alibaba/Sentinel/wiki/在生产环境中使用-Sentinel)

### pull模式

控制台将配置的规则推送到Sentinel客户端，而客户端会将配置规则保存在本地文件或数据库中。以后会定时去本地文件或数据库中查询，更新本地规则

![image-20230106172136755](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677735-1830bc54c67400703c18b520b58fbeec7e2958d4.png)

### push模式

控制台将配置规则推送到远程配置中心，例如Nacos。Sentinel客户端监听Nacos，获取配置变更的推送消息，完成本地配置更新

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677739-dbf3735203d886b8556f5e09eef8c4be62773d96.png" alt="image-20230106172408552" style="zoom:67%;" />

### 配置push模式

1.   **修改order-service服务,监听Nacos中的sentinel规则配置**

     -   导入sentinel监听nacos的依赖

         ```xml
         <dependency>
             <groupId>com.alibaba.csp</groupId>
             <artifactId>sentinel-datasource-nacos</artifactId>
         </dependency>
         ```

     -   配置nacos地址

         ```yaml
         spring:
           cloud:
             sentinel:
               datasource:
                 flow:
                   nacos:
                     server-addr: localhost:8848 # nacos地址
                     dataId: orderservice-flow-rules
                     groupId: SENTINEL_GROUP
                     rule-type: flow # 还可以是：degrade、authority、param-flow
         ```

2.   **SentinelDashboard默认不支持nacos的持久化，需要修改源码**

     -   解压sentinel源码包,并用IDEA打开这个项目

         <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677744-0488c21b7d45eb7746b5e36bd648eb7c987d5aaf.png" alt="image-20230106173019604" style="zoom:33%;" />

     -   修改sentinel-dashboard源码的pom文件中，nacos的依赖默认的scope是test，这里要去除

         ![image-20230106173223479](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677748-894867b7d47ee08a83df06ba20b8b48e479d15c0.png)

     -   在sentinel-dashboard的test包下，已经编写了对nacos的支持，将其拷贝到main下

         <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677751-67cb9af4dd9ec004e18c8180aab23becec2e8481.png" alt="image-20230106173337968" style="zoom:80%;" />

     -   修改测试代码中的NacosConfig类

         <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677755-49bc8bf837648f9523ad7efef25328bb7b047c11.png" alt="image-20230106173538580" style="zoom:67%;" />

     -   修改其中的nacos地址，让其读取application.properties中的配置

         <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677758-d08c9bba61de1797a22a44deb889dc3dfb316478.png" alt="image-20230106173616328" style="zoom: 33%;" />

     -   在sentinel-dashboard的application.properties中添加nacos地址配置

         ```properties
         nacos.addr=localhost:8848
         ```

     -   配置nacos数据源

         修改`com.alibaba.csp.sentinel.dashboard.controller.v2`包下的`FlowControllerV2`类

         <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677762-fb4f968539c1173e4e3c6b063e9c644dcb6091eb.png" alt="image-20230106173849775" style="zoom:33%;" />

         让我们添加的Nacos数据源生效

         <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677765-8363a89d994bdcdd2bbe1fb85b814ac600a449cc.png" alt="image-20230106173942521" style="zoom: 50%;" />

     -   修改前端页面,添加支持nacos的菜单

         修改`src/main/webapp/resources/app/scripts/directives/sidebar/`目录下的`sidebar.html`文件

         <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677769-09d1a6b880c8051ad8590a72c3cff8f0cd20a497.png" alt="image-20230106174106931" style="zoom: 33%;" />

         将其中的部分注释取消

         ![image-20230106174144697](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677772-3d76a0d6a5ed33028ed4102837537b195a55415a.png)

         修改其中的文本

         ![image-20230106174208898](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677775-5e1d742f79d859d564eb728b52a2e6e56cf7f65c.png)

     -   重新编译、打包项目

         <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677779-88e6674fd4aae139f8fd103e1f627deac6e88095.png" alt="image-20230106174320486" style="zoom:50%;" />

3.   **启动**

     启动方式跟官方一样

     ```sh
     java -jar sentinel-dashboard.jar
     ```

     如果要修改nacos地址，需要添加参数

     ```sh
     java -jar -Dnacos.addr=localhost:8848 sentinel-dashboard.jar
     ```