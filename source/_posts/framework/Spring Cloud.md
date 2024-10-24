---
title: 微服务框架springcloud使用
date: 2022-12-03 08:12:34
updated: 2022-12-03 08:12:34
tags:
  - framework
---

**微服务是一种经过良好架构设计的分布式架构方案，微服务架构特征：**

- **单一职责**：微服务拆分粒度更小，每一个服务都对应唯一的业务能力，做到单一职责，避免重复业务开发
- **面向服务**：微服务对外暴露业务接口
- **自治**：团队独立、技术独立、数据独立、部署独立
- **隔离性强**：服务调用做好隔离、容错、降级，避免出现级联问题

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677883-7ed126b850aa25c9a6beb56ee5fa568fc236417b.png" alt="image-20221224234402956" style="zoom: 50%;" />

# 微服务远程调用

![image-20221224234908523](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677891-1143b8ecf0b8a0e28de316c8b578099243c79cb9.png)

**远程调用方式**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677895-4c4661404196207db225cb5846774d3bf39ef590.png" alt="image-20221224235018434" style="zoom:50%;" />

1. 在order服务中注册***RestTemplate***

   ```java
   @Bean
   public RestTemplate restTemplate(){
       return new RestTemplate();
   }
   ```
2. 服务远程调用***RestTemplate***

   ```java
   @Resource
   private RestTemplate restTemplate;
   /**
   * 查询用户信息
   */
   private User restTemplateFindById( Long id ){
       return restTemplate.getForObject( "http://localhost:8080/user/"+id, User.class );
   }
   ```
3. user服务接口

   ```java
   /**
    * 路径： /user/110
    *
    * @param id 用户id
    * @return 用户
    */
   @GetMapping("/{id}")
   public User queryById(@PathVariable("id") Long id,
                         @RequestHeader(value = "msg",required = false) String msg) {
       log.info( msg );
       return userService.queryById(id);
   }
   ```

# Eureka注册中心

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677900-1bafe5b07c34c75fa4bdda611bdb7e3943213e74.png" alt="image-20221225000528790" style="zoom:50%;" />

## Eureka原理

在**Eureka**架构中，微服务角色有两类：

- **EurekaServer**：服务端，注册中心
  - 记录服务信息
  - 心跳监控
- **EurekaClient**：客户端
  - **Provider**：服务提供者，例如案例中的 **user-service**
    - 注册自己的信息到**EurekaServer**
    - 每隔30秒向**EurekaServer**发送心跳
  - **consumer**：服务消费者，例如案例中的 **order-service**
    - 根据服务名称从**EurekaServer**拉取服务列表
    - 基于服务列表做负载均衡，选中一个微服务后发起远程调用

## 搭建EurekaServer

1. 引入依赖

   ```xml
   <dependency>
       <groupId>org.springframework.cloud</groupId>
       <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
       <version>2.2.7.RELEASE</version>
   </dependency>
   ```
2. 启动类添加 `@EnableEurekaServer` 注解

   ```java
   @EnableEurekaServer
   @SpringBootApplication
   public class EurekaApplication {
   
       public static void main(String[] args) {
           SpringApplication.run( EurekaApplication.class, args);
       }
   
   }
   ```
3. 添加yml配置文件

   ```yaml
   server:
     port: 10010       #服务端口
   spring:
     application:
       name: eurekaservice          #服务名称
   eureka:
     client:
       service-url:    #eureka地址信息
         defaultZone: http://localhost:10010/eureka/
   ```

## 服务注册

将`user-service` 注册到`EurekeServer` 中

1. 在`user-service` 项目项目中导入依赖

   ```xml
   <dependency>
       <groupId>org.springframework.cloud</groupId>
       <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
   </dependency>
   ```
2. 添加yml配置

   ```yaml
   spring:
     application:
       name: userservice          #服务名称
   eureka:
     client:
       service-url:    #eureka地址信息
         defaultZone: http://localhost:10010/eureka/
   ```

## 服务发现

服务拉取是基于服务名称获取服务列表，然后在对服务列表做负载均衡

1. 修改`OrderService`的代码，修改访问的url路径，用服务名代替ip、端口：

   ```java
   /**
   * 查询用户信息
   */
   private User restTemplateFindById( Long id ){
       return restTemplate.getForObject( "http://userservice/user/" + id, User.class );
   }
   ```
2. 在`OrderService`启动类上的`RestTemplate`上添加`@LoadBalanced` 注解开启**负载均衡**

   ```java
   /**
   * LoadBalanced 开启负载均衡
   */
   @Bean
   @LoadBalanced
   public RestTemplate restTemplate(){
       return new RestTemplate();
   }
   ```

# Ribbon 负载均衡

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677907-412f2cabd11f58601b1fd3b12896fa910d8c387c.png" alt="image-20221225003829282" style="zoom: 80%;" />

**Ribbon**的负载均衡策略规则是有 `IRule` 的接口来定义的,每个子接口都是一种规则

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677911-310e3cfa966e8bd45d1a4ba946d5f7e57fd5cd47.png" alt="image-20221225004356598" style="zoom:50%;" />

- **内置负载均衡规则类**

  - **RoundRobinRule**

  >   简单轮询服务列表来选择服务器。它是Ribbon默认的负载均衡规则
  - **AvailabilityFilteringRule**  
    > 对以下两种服务器进行忽略：
    > 1. 在默认情况下，这台服务器如果3次连接失败，这台服务器就会被设置为“短路”状态。短路状态将持续30秒，如果再次连接失败，短路的持续时间就会几何级地增加
    > 2. 并发数过高的服务器。如果一个服务器的并发连接数过高，配置了**AvailabilityFilteringRule**规则的客户端也会将其忽略。并发连接数的上限，可以由客户端的 `clientName` `clientConfigNameSpace` `ActiveConnectionsLimit`属性进行配置
    >
    >

    - **WeightedResponseTimeRule**
      > 为每一个服务器赋予一个权重值。服务器响应时间越长，这个服务器的权重就越小。这个规则会随机选择服务器，这个权重值会影响服务器的选择
      >

      - **ZoneAvoidanceRule**

        > 以区域可用的服务器为基础进行服务器的选择。使用Zone对服务器进行分类，这个Zone可以理解为一个机房、一个机架等。而后再对Zone内的多个服务做轮询
        >
      - **BestAvailableRule**

        > ```
        > 忽略那些短路的服务器，并选择并发数较低的服务器
        > ```
        >
      - **RandomRule**

        > 随机选择一个可用的服务器
        >
      - **RetryRule**

        > ```
        > 重试机制的选择逻辑
        > ```
        >

    - 修改负载均衡规则

      - 通过`Bean` 设置

        ```java
        /**
        * 负载均衡随机策略
        * 可使用yml文件配置
        */
        @Bean
        public IRule randomRule(){
            return new RandomRule();
        }
        ```
      - 配置文件设置

        ```yaml
        userservice:
          ribbon:  #负载均衡的规则，表示加权规则，yml配置优先级第一，Java代码第二，默认的最后
            NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RandomRule  #随机访问
        ```
    - 饥饿加载

      > Ribbon默认是采用懒加载，需要第一次访问时才会去创建`LoadBalanceClient`，请求时间会很长。而饥饿加载则会在项目启动时创建，降低第一次访问的耗时
      >

      - 饥饿加载配置

        ```yaml
        #饥饿加载配置，系统默认懒加载
        ribbon:
          eager-load:
            enabled: true #开启饥饿加载，默认false
            clients: #指定饥饿加载服务器名称
              - userservice
        ```
  # Nacos注册中心

  ## 启动初始化配置

  **[启动命令](https://github.com/alibaba/nacos)**

  ```shell
  startup.cmd -m standalone
  # 启动时指定端口号
  -Dserver.port=8848
  #可在nacos的.cmd文件同目录下创建yml文件,启动时会优先目录下的配置
  ```
  ![image-20221225011917941](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677918-6203822827ec2918a8fa2ee6c5b19537edacf239.png)

  **父工程引入Spring Cloud Alibaba管理依赖**

  ```xml
  <dependency>
      <groupId>com.alibaba.cloud</groupId>
      <artifactId>spring-cloud-alibaba-dependencies</artifactId>
      <version>2.2.6.RELEASE</version>
      <type>pom</type>
      <scope>import</scope>
  </dependency>
  ```
  **导入nacos依赖**

  ```xml
  <dependency>
      <groupId>com.alibaba.cloud</groupId>
      <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
  </dependency>
  ```
  **配置nacos服务地址**

  ```yaml
  spring:
    cloud:
      nacos:
        server-addr: localhost:8848
  ```
  **访问[nacos](http://192.168.43.1:8848/nacos/index.html)查看服务**

  ![image-20221225012138295](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677923-5b4adec4c4f63439a4fb9ec46a862292041e3d30.png)

  **Nacos服务分级存储模型**

  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677927-bfcd1377ebb9fe203f41da8a99be90505dd863e9.png" alt="image-20221225144309341" style="zoom:50%;" />

  **服务跨集群调用**

  > 服务调用尽可能的选择本地集群的服务,跨集群调用延迟较高,本地集群不可用时,再去访问其他集群
  >

  **服务集群属性配置**

  ```yaml
  spring:
    cloud:
      nacos:
        server-addr: localhost:8848		#nacos服务地址
        discovery:
          cluster-name: CZ				#集群名称
  #设置负载均衡的IRule为nacos
  userservice:
    ribbon:  #负载均衡的规则，表示加权规则，yml配置优先级第一，Java代码第二，默认的最后
      NFLoadBalancerRuleClassName: com.alibaba.cloud.nacos.ribbon.NacosRule  #优先访问本地集群
  ```
  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677933-43a80c271868a0444e434308ea2e33f5b36baa60.png" alt="image-20221225145227525" style="zoom:80%;" />

  **根据权重负载均衡**

  服务器设备性能有差异，部分实例所在机器性能较好，另一些较差，可以通过设置 **nacos** 的权重来控制访问频率,权重大的访问频率越高 ,将性能好的机器承担更多的用户请求

  > - 权重值通常在0-1之间
  > - 权重值越大被访问概率越高
  > - 权重值为0时不会被访问
  >

  **环境隔离** `namespace`

  `Naocs` 中服务存储和数据存储的最外层`namespace` 做外层隔离,在`Nacos` 控制台命名空间创建`namespace` 用来隔离不同环境

  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677938-8a491f1f658c2118ec8366b8b7cd62b3e06535cc.png" alt="image-20221225152106043" style="zoom: 50%;" />

  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677942-50d01f05550f39d7c759277308077fc8d0de7e0d.png" alt="image-20221225152436216" style="zoom: 50%;" />

  添加`namespace`

  ```yaml
  spring:
    cloud:
      nacos:
        discovery:
          namespace: 7c0f4809-32f3-4ad6-9e10-0c1816161ebd  #namespace环境id
  ```
  > 1. 不同`namespace`的服务不能相互访问
  > 2. 每个`namespace`都有唯—id,可在添加时设置,也可使用默认生成的id
  > 3. 服务设置namespace时要写id而不是名称
  >

  `Nacos`**的注册和推送**

  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677946-970b4a712257c2fad26ba5736d5ec85fc1ccf274.png" alt="image-20221225154402081" style="zoom:67%;" />

  服务注册到`Nacos`时，可以选择注册为临时或非临时实例，临时实例宕机时，会从`Nacos`的服务列表中剔除，而非临时实例则不会

  ```yaml
  spring:
    cloud:
      nacos:
        discovery:
          ephemeral: true       #临时实列配置
  ```
  ***Nacos*** 和 ***Eureke***- 共同点

    > - 都支持服务注册和服务拉取
    > - 都支持服务提供者心跳方式做健康检测
    >
  - 区别

    > - `Nacos`支持服务端主动检测提供者状态:临时实例采用心跳模式，非临时实例采用主动检测模式
    > - 临时实例心跳不正常会被剔除，非临时实例则不会被剔除
    > - `Nacos`支持服务列表变更的消息推送模式，服务列表更新更及时
    > - `Nacos`集群默认采用**AP**方式，当集群中存在非临时实例时，采用**CP**模式;`Eureka`采用**AP**方式
    >


  ## Nacos 配置管理

  **统一配置管理**

  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677952-f284129c70d1e41f4072ceeb81709987466f667a.png" alt="image-20221225161301098" style="zoom: 33%;" />

  1. 配置更改热更新

     可以将一些关键参数，需要运行时调整的参数放到**Nacos**配置中心，一般都是自定义配置

     <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677957-28f7cfb8578cf426e2b0de27aaceed3fdd5d496c.png" alt="image-20221225160722455" style="zoom:50%;" />

     <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677965-a02167e27666ce340377300dd2213a7d90fef58d.png" alt="image-20221225161459559" style="zoom: 50%;" />

     ![image-20221225162501214](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677969-6e7e7662e049f8247b4949b20286ec7e7dc0909d.png)
  2. 配置获取步骤

     ![image-20221225161738191](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677972-c5268b091efbaf1db7351373f865fefdb8bb9361.png)
  3. 服务配置

     1. 导入**Nacos**客户端管理依赖

        ```xml
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>
        ```
     2. 在微服务的resource目录下新建`bootstrap.yml`引导文件

        ```yaml
        spring:
          application:
            name: userservice
          profiles:
            active: dev #环境
          cloud:
            nacos:
              server-addr: localhost:8848 #nacos地址
              config:
                file-extension : yaml #文件后缀
        ```
  4. 配置**demo**

     **Nacos**中的配置文件变更后，微服务无需重启就可以感知。不过需要通过下面两种配置实现:

     - 在`@Value`注入的变量所在类上添加注解`@RefreshScope`

     ```java
     @Slf4j
     @RestController
     @RequestMapping("/user")
     @RefreshScope
     public class UserController {
         /**
          *   pattern:
          *     dateformat: MM-dd HH:mm:ss
          */
         @Value( "${pattern.dateformat}" )
         private String dateFormat;
     
         /**
          * 是否读取bootstrap文件
          */
         @GetMapping("/now")
         public String now(){
             log.info( dateFormat );
             return LocalDateTime.now().format(
                     DateTimeFormatter.ofPattern( dateFormat )
             );
         }
     }
     ```
     - 使用`@ConfigurationProperties`注解

     ```java
     @Component
     @ConfigurationProperties("pattern")
     public class PatternProperties {
         private String dateformat;
     }
     ```
     ```java
     @Slf4j
     @RestController
     @RequestMapping("/user")
     public class UserController {
         @Resource
         private PatternProperties patternProperties;
     
         @GetMapping("/now")
         public String now(){
             log.info( dateFormat );
             return LocalDateTime.now().format(
                     DateTimeFormatter.ofPattern( patternProperties )
             );
         }
     }
     ```

  **多环境配置共享**

  > 微服务启动时会从**Nacos**读取多个配置文件
  >
  > - [spring.application.name]-[spring.profiles.active].yaml，例如: userservice-dev.yaml
  > - [spring.application.name].yaml，例如: userservice.yaml
  >
  > 无论profile如何变化，[spring.application.name].yaml这个文件一定会加载，因此多环境共享配置可以写入这个文件
  >

  ![image-20221225164427343](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677980-661ebc8e7936680d504a4b3648e54c7c51494899.png)

  **多种环境配置的优先级**

  ![image-20221225164633913](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677984-649c8ccd89d0fe5c0043ba7942a6dd7176ad3371.png)

  ## Nacos集群搭建

  1. **Nacos**反向代理

     1. 进入**nacos**的**conf**目录，修改配置文件`cluster.conf.example`，重命名为`cluster.conf`添加端口信息

        ```shell
        127.0.0.1:8845
        127.0.0.1.8846
        127.0.0.1.8847
        ```
     2. 然后修改`application.properties`文件，添加数据库配置(35行)

        ```properties
        spring.datasource.platform=mysql
        
        db.num=1
        
        db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
        db.user.0=root
        db.password.0=123
        ```
     3. 将**nacos**文件夹复制三份，分别命名为：**nacos1**、**nacos2**、**nacos3**,然后分别修改三个文件夹中的`application.properties`中的端口信息

        ```properties
        server.port=8845
        ```
     4. 启动节点

        ```text
        startup.cmd
        ```
  2. **Nginx**配置

     1. 修改`conf/nginx.conf`文件,设置反向代理和负载均衡

        ```c
        upstream nacos-cluster {
           server 127.0.0.1:8845;
        	server 127.0.0.1:8846;
        	server 127.0.0.1:8847;
        }
        
        server {
           listen       80;
           server_name  localhost;
        
           location /nacos {
               proxy_pass http://nacos-cluster;
           }
        }
        ```
     2. 将**java**代码中的端口号改为**nginx**代理的端口号

  # Http客户端Feign

  **[Feign](https://github.com/OpenFeign/feign) 概述**

  - 可插拔的注解支持，包括 **Feign** 注解和**AX-RS**注解
  - 支持可插拔的 **HTTP** 编码器和解码器
  - 支持 **Hystrix** 和它的 **Fallback**
  - 支持 **Ribbon** 的负载均衡
  - 支持 **HTTP** 请求和响应的压缩。**Feign** 是一个声明式的 **WebService** 客户端，它的目的就是让 **Web Service** 调用更加简单。它整合了 Ribbon 和 **Hystrix**，从而不需要开发者针对 Feign 对其进行整合。**Feign** 还提供了 **HTTP** 请求的模板，通过编写简单的接口和注解，就可以定义好 HTTP 请求的参数、格式、地址等信息。**Feign** 会完全代理 **HTTP** 的请求，在使用过程中我们只需要依赖注入 Bean，然后调用对应的方法传递参数即可

  `RestTemplate`**方式调用存在的问题**

  ```java
  private User restTemplateFindById( Long id ){
      return restTemplate.getForObject( "http://userservice/user/" + id, User.class );
  }
  ```
  - 代码可读性差，编程体验不统一
  - 参数复杂URL难以维护

  **导入依赖**

  ```xml
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-openfeign</artifactId>
  </dependency>
  ```
  **在启动类上添加 `@EnableFeignClients` 注解开启Feign功能**

  ```java
  @SpringBootApplication
  @EnableFeignClients(clients = UserClient.class,defaultConfiguration = UserClientFallbackFactory.class)
  public class OrderApplication {

      public static void main(String[] args) {
          SpringApplication.run(OrderApplication.class, args);
      }
  }
  ```
  **编写Feign客户端**

  ```java
  @FeignClient( value = "userservice")
  public interface UserClient {

      /**
       * 查询user服务的用户信息
       */
      @GetMapping("/user/{id}")
      User findById( @PathVariable("id") Long id );
  }
  ```
  **使用Feign客户端替代**`RestTemplate`

  ```java
  @Service
  public class OrderService {

      @Resource
      private OrderMapper orderMapper;

      @Resource
      private UserClient userClient;

      public Order queryOrderById(Long orderId) {
          // 1.查询订单
          Order order = orderMapper.findById( orderId );
          //查询用户信息
          order.setUser( this.feignFindById( order.getUserId() ) );
          return order;
      }

      private User feignFindById( Long id ){
          return userClient.findById( id );
      }

  }
  ```
  ## 自定义Feign配置

  **Feign运行自定义配置来覆盖默认配置**


  | 类型                    | 作用             | 说明                                                   |
  | ------------------------- | ------------------ | -------------------------------------------------------- |
  | **feign.Logger.Level**  | 修改日志级别     | 包含四种不同的级别：NONE、BASIC、HEADERS、FULL         |
  | **feign.codec.Decoder** | 响应结果的解析器 | http远程调用的结果做解析，例如解析json字符串为java对象 |
  | **feign.codec.Encoder** | 请求参数编码     | 将请求参数编码，便于通过http请求发送                   |
  | **feign. Contract**     | 支持的注解格式   | 默认是SpringMVC的注解                                  |
  | **feign. Retryer**      | 失败重试机制     | 请求失败的重试机制，默认是没有，不过会使用Ribbon的重试 |

  **自定义Feign日志**

  1. **yml**文件配置

     - 全局 生效

       ```yaml
       feign:
         client:
           config:
             dedfault: #全局配置,如果写服务名称,则是针对某个微服务的配置
       		loggerLevel: FULL	#日志级别
       ```
     - 局部生效

       ```yaml
       feign:
         client:
           config:
             userservice: #全局配置,如果写服务名称,则是针对某个微服务的配置
       		loggerLevel: FULL	#日志级别
       ```
  2. **java**代码配置

     ```java
     public class DefaultFeignConfiguration {
         @Bean
         public Logger.Level level(){
             return Logger.Level.BASIC;
         }
     }
     ```
     - 全局配置，把它放到`@EnableFeignClients`这个注解中

       ```java
       @EnableFeignClients(defaultConfiguration=DefaultFeignConfiguration.class)
       ```
     - 局部配置，把它放到`@FeignClient`这个注解中

       ```java
       FeignClient(value="userservice", configuration=DefaultFeignConfiguration.class)
       ```

  ## Feign性能优化

  **Feign底层的客户端实现**

  - **URLConnection** 默认实现，不支持连接池.
  - **Apache HttpClient**  支持连接池
  - **OKHttp** 支持连接池

  **优化Feign的性能主要包括**

  1. 使用连接池代替默认的**URLConnection**
  2. 日志级别，最好用**basic**或**none**

  **连接池配置**

  导入依赖

  ```xml
  <!--httpClient的依赖 -->
  <dependency>
      <groupId>io.github.openfeign</groupId>
      <artifactId>feign-httpclient</artifactId>
  </dependency>
  ```
  配置连接池

  ```yaml
  feign:
    client:
  	config:
  	  default: # default全局的配置
  		loggerLevel: BASIC # 日志级别，BASIC就是基本的请求和响应信息 
    httpclient:
      enabled: true # 开启feign对HttpClient的支持
      max-connections: 200 # 最大的连接数
      max-connections-per-route: 50 # 每个路径的最大连接数
  ```
  **Feign最佳实践**

  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678000-771c5def7278480cfd783e3212c160d11730f2ef.png" alt="image-20221225175948373" style="zoom: 50%;" />

  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678005-4a55c26c853e5ae6af38419df4269c558076fd08.png" alt="image-20221225180104056" style="zoom:50%;" />

  当定义的**FeignClient**不在`SpringBootApplication`的扫描包范围时，这些**FeignClient**无法使用。有两种方式解决:

  1. 指定FeignClient所在包

     ```java
     @EnableFeignClients(basePackages = "com.hg.feign.clients")
     ```
  2. 指定FeignClient字节码

     ```java
     @EnableFeignClients(clients = {UserClient.class})
     ```

  # 统一网关Gateway

  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678014-434943be867b6c634d31a7f55de92a5d52d09962.png" alt="image-20221225213134241" style="zoom: 50%;" />

  **网关功能**

  - 身份认证和权限校验
  - 服务路由、负载均衡
  - 请求限流

  **搭建网关服务**

  创建新的**module**，引入**SpringCloudGateway**的依赖和**Nacos**的服务发现依赖

  ```xml
  <!--网关-->
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-gateway</artifactId>
  </dependency>
  <!--nacos服务发现依赖-->
  <dependency>
      <groupId>com.alibaba.cloud</groupId>
      <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
  </dependency>
  ```
  编写路由配置和**Nacos**地址

  ```yaml
  server:
    port: 10010 # 网关端口
  spring:
    application:
      name: gateway # 服务名称
    cloud:
      nacos:
        server-addr: localhost:8848 # nacos地址
      gateway:
        routes: # 网关路由配置
          - id: user-service # 路由id，自定义，只要唯一即可
            # uri: http://127.0.0.1:8081 # 路由的目标地址 http就是固定地址
            uri: lb://userservice # 路由的目标地址 lb就是根据服务名负载均衡，后面跟服务名称
            predicates: # 路由断言，也就是判断请求是否符合路由规则的条件
              - Path=/user/** # 这个是按照路径匹配，只要以/user/开头就符合要求
          - id: order-service
            uri: lb://orderservice
            predicates:
              - Path=/order/**
  ```
  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678021-f242206436c3f0013273500fe0a494e208539e61.png" alt="image-20221225214103879" style="zoom:50%;" />

  **路由断言工厂**`Route Predicate Factory`

  网关路由可以配置的内容包括

  > - 路由**id**  路由唯一标示
  > - **uri** 路由目的地，支持**lb**和**http两**种
  > - **predicates** 路由断言，判断请求是否符合要求，符合则转发到路由目的地
  > - **filters** 路由过滤器，处理请求或响应
  >

  Spring提供了11中基本的**Predicate**工厂


  | **名称**   | **说明**                       | **示例**                                                                                                 |
  | ------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
  | After      | 某个时间点后的请求             | -  After=2037-01-20T17:42:47.789-07:00[America/Denver]                                                   |
  | Before     | 某个时间点之前的请求           | -  Before=2031-04-13T15:14:47.433+08:00[Asia/Shanghai]                                                   |
  | Between    | 两个时间点之前的请求           | -  Between=2037-01-20T17:42:47.789-07:00[America/Denver],  2037-01-21T17:42:47.789-07:00[America/Denver] |
  | Cookie     | 求必须包含某些cookie           | - Cookie=chocolate, ch.p                                                                                 |
  | Header     | 请求必须包含某些header         | - Header=X-Request-Id, \d+                                                                               |
  | Host       | 请求必须是访问某个host（域名） | -  Host=.somehost.org,.anotherhost.org                                                                   |
  | Method     | 请求方式必须是指定方式         | - Method=GET,POST                                                                                        |
  | Path       | 请求路径必须符合指定规则       | - Path=/red/{segment},/blue/**                                                                           |
  | Query      | 请求参数必须包含指定参数       | - Query=name, Jack或者-  Query=name                                                                      |
  | RemoteAddr | 请求者的ip必须是指定范围       | - RemoteAddr=192.168.1.1/24                                                                              |
  | Weight     | 权重处理                       |                                                                                                          |

  **路由过滤器**`GatewayFilter`

  **GatewayFilter**是网关中提供的一种过滤器，可以对进入网关的请求和微服务返回的响应做处理

  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678027-fe21ab4654b040d15c208fe81ec5fb5d28c7762d.png" alt="image-20221225220721378" style="zoom:50%;" />

  **Spring**提供了31种不同的路由过滤器工厂


  | **名称**             | **说明**                     |
  | ---------------------- | ------------------------------ |
  | AddRequestHeader     | 给当前请求添加一个请求头     |
  | RemoveRequestHeader  | 移除请求中的一个请求头       |
  | AddResponseHeader    | 给响应结果中添加一个响应头   |
  | RemoveResponseHeader | 从响应结果中移除有一个响应头 |
  | RequestRateLimiter   | 限制请求的流量               |
  | ...                  | ...                          |

  **demo** 给所有进入userservice的请求添加一个请求头

  ```yaml
  server:
    port: 10010 # 网关端口
  spring:
    application:
      name: gateway # 服务名称
    cloud:
      nacos:
        server-addr: localhost:8848 # nacos地址
      gateway:
        routes: # 网关路由配置
          - id: user-service # 路由id，自定义，只要唯一即可
            # uri: http://127.0.0.1:8081 # 路由的目标地址 http就是固定地址
            uri: lb://userservice # 路由的目标地址 lb就是负载均衡，后面跟服务名称
            predicates: # 路由断言，也就是判断请求是否符合路由规则的条件
              - Path=/user/** # 这个是按照路径匹配，只要以/user/开头就符合要求
            filters:
              - AddRequestHeader=msg,SpringCloud!!!   #请求头
        default-filters: #默认过滤器对所有的路由生效
          - AddRequestHeader=msg,SpringCloud!!!
  ```
  **全局过滤器** `GlobalFilter`

  全局过滤器的作用也是处理一切进入网关的请求和微服务响应，与**GatewayFilter**的作用一样。区别在于**GatewayFilter**通过配置定义，处理逻辑是固定的。而**GlobalFilter**的逻辑需要自己写代码实现。定义方式是实现**GlobalFilter**接口

  ```java
  //@Order(1)
  @Component
  public class AuthorizeFilter implements GlobalFilter, Ordered {
      @Override
      public Mono<Void> filter( ServerWebExchange exchange, GatewayFilterChain chain ) {
          //获取请求参数
          ServerHttpRequest request = exchange.getRequest();
          MultiValueMap<String, String> queryParams = request.getQueryParams();

          String authorization = queryParams.getFirst( "authorization" );

          //判断参数值是否等于admin
          if ( "admin".equals( authorization ) ) {
              //放行
              return chain.filter( exchange );
          }
          //拦截
          //设置状态码
          exchange.getResponse().setStatusCode( HttpStatus.UNAUTHORIZED );
          return exchange.getResponse().setComplete();
      }

      /**
       * 过滤器优先级
       * @return 值越小,优先级越高
       */
      @Override
      public int getOrder() {
          return -1;
      }
  }
  ```
  全局过滤器的优先级可以使用 `@Order` 来设置,也可以实现`Ordered` 重写`getOrder()`方法来设置

  **过滤器的执行顺序**

  - 请求进入网关会碰到三类过滤器  **当前路由的过滤器**、**DefaultFilter**、**GlobalFilter**
  - 请求路由后，会将**当前路由过滤器**和**DefaultFilter**、GlobalFilter，合并到一个过滤器链（集合)中，排序后依次执行每个过滤器

  <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678034-30166a8ef52c7561f19c3e5b55a767327eb49121.png" alt="image-20221225223128057" style="zoom:50%;" />

  > - 每一个过滤器都必须指定一个**int**类型的**order**值，**order值越小，优先级越高，执行顺序越靠前**
  > - **GlobalFilter**通过实现**Ordered**接口，或者添加**@Order**注解来指定**order值**，由我们自己指定
  > - 路由过滤器和**defaultFilter**的**order**由**Spring**指定，默认是按照声明顺序从1递增
  > - 当过滤器的**order**值一样时，会按照**defaultFilter** >**路由过滤器**>**GlobalFilter**的顺序执行
  >
  > <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678040-68ac9c372a589dcd8bd3d1af11a88cfcdc20b2df.png" alt="image-20221225223612114" style="zoom:50%;" />
  >

  **跨域**

  > - 域名不同` www.taobao.com`和 `www.taobao.org`和` www.jd.com`
  > - 域名相同,端口不同: `localhost:8080`和`localhost8081`
  > - `localhost` 和`127.0.0.1` 也是跨域
  >

  网关跨域问题处理 **CORS** 方式

  ```yaml
  spring:
    cloud:
      gateway:
        globalcors: # 全局的跨域处理
          add-to-simple-url-handler-mapping: true # 解决options请求被拦截问题
          corsConfigurations:
            '[/**]':
            allowedOrigins: # 允许哪些网站的跨域请求
              - "http://localhost:8090"
              - "http://www.leyou.com"
            allowedMethods: # 允许的跨域ajax的请求方式
              - "GET"
              - "POST"
              - "DELETE"
              - "PUT"
              - "OPTIONS"
            allowedHeaders: "*" # 允许在请求中携带的头信息
            allowCredentials: true # 是否允许携带cookie
            maxAge: 360000 # 这次跨域检测的有效期
  ```
