---
title: rabbitMQ
tags:
  - middleware
abbrlink: 4c35ac86
date: 2022-12-27 19:31:59
updated: 2022-12-27 19:31:59
---

![image-20221227193159640](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676316-5460d89f94a72806d149d6fe19a51497c88bf10c.png)

**[`RabbitMQ`](https://www.rabbitmq.com/)docker容器安装**

```sh
docker pull rabbitmq:3.8-management
```

**运行**`RabbitMQ`

```sh
docker run \
 -e RABBITMQ_DEFAULT_USER=admin \
 -e RABBITMQ_DEFAULT_PASS=admin \
 -v $PWD/rabbitmq-plugins:/plugins \
 --name rabbitmq \
 --hostname rabbitmq \
 -p 15672:15672 \
 -p 5672:5672 \
 -d rabbitmq:3.8-management
```

`SpringAMQP`**依赖导入**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

## 基本消息队列

***hello world***![image-20221227214442279](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676325-90f6ee9995ff1f0efaf14ddd20f78b37b4c944e4.png)

- `publisher`消息发布者，将消息发送到队列**queue**
- `queue` 消息队列，负责接受并缓存消息
- `consumer`订阅队列，处理队列中的消息

`publisher`**代码实现**

```java
public class PublisherTest {
    @Test
    public void SendMessage() throws IOException, TimeoutException {
        // 1.建立连接
        ConnectionFactory factory = new ConnectionFactory();
        // 1.1.设置连接参数，分别是：主机名、端口号、vhost、用户名、密码
        factory.setHost("192.168.43.10");
        factory.setPort(5672);
        factory.setVirtualHost("/");
        factory.setUsername("admin");
        factory.setPassword("admin");
        // 1.2.建立连接
        Connection connection = factory.newConnection();

        // 2.创建通道Channel
        Channel channel = connection.createChannel();

        // 3.创建队列
        String queueName = "hello world";
        channel.queueDeclare(queueName, false, false, false, null);

        // 4.发送消息
        String message = "hello world";
        channel.basicPublish("", queueName, null, message.getBytes());
        System.out.println("发送消息成功：【" + message + "】");

        // 5.关闭通道和连接
        channel.close();
        connection.close();

    }
}
```

![image-20221227222020669](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676331-1752076664d4b1ca6563f8d672317fc674a645cc.png)

`consumer`**代码实现**

```java
public class ConsumerTest {

    public static void main(String[] args) throws IOException, TimeoutException {
        // 1.建立连接
        ConnectionFactory factory = new ConnectionFactory();
        // 1.1.设置连接参数，分别是：主机名、端口号、vhost、用户名、密码
        factory.setHost("192.168.43.10");
        factory.setPort(5672);
        factory.setVirtualHost("/");
        factory.setUsername("admin");
        factory.setPassword("admin");
        // 1.2.建立连接
        Connection connection = factory.newConnection();

        // 2.创建通道Channel
        Channel channel = connection.createChannel();

        // 3.创建队列
        String queueName = "simple.queue";
        channel.queueDeclare(queueName, false, false, false, null);

        // 4.订阅消息
        channel.basicConsume(queueName, true, new DefaultConsumer(channel){
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope,
                                       AMQP.BasicProperties properties, byte[] body){
                // 5.处理消息
                String message = new String(body);
                System.out.println("接收到消息：【" + message + "】");
            }
        });
        System.out.println("等待接收消息。。。。");
    }
}
```

`RabbitMQ`**连接配置**

```yaml
spring:
  rabbitmq:
    host: 192.168.43.10
    port: 5672
    virtual-host: /
    username: admin
    password: admin
```

`AMQP`**发送消息**

```java
@RunWith( SpringRunner.class )
@SpringBootTest
public class SpringAmqpTest {

    @Resource
    private RabbitTemplate rabbitTemplate;

    @Test
    public void sendMessage(){
        String queueName = "hello world";
        String message = "hello world";
        rabbitTemplate.convertAndSend( queueName,message );
    }
}
```

`AMQP`**消息监听**

```java
@Slf4j
@Component
public class SpringRabbitListener {

    @RabbitListener(queues = "hello world")
    public void listenerQueueMessage(String msg){
        log.info( "spring 消费着监听到 [ {} ]",msg );
    }
}
```

`RabbitMQ` **默认发过去的消息使用的是jdk默认的序列化流**

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```

**配置序列化流**

```java
@Bean
public MessageConverter messageContext(){
    return new Jackson2JsonMessageConverter();
}
```

**demo**

**发送对象**

```java
/**
* 发送对象
*/
@Test
public void sendObjectMessage(){
    Map<String, Object> map = new HashMap<>();
    map.put( "name","张三" );
    map.put( "age",18 );
    rabbitTemplate.convertAndSend( "object.queue",map );
}
```

**消息监听**

```java
@RabbitListener( queues = "object.queue" )
public void listenerObjectQueueMessage2( Map<String,Object> msg){
    System.err.println( "object.queue : [ "+msg+" ]    "+LocalDateTime.now() );
}
```

## Work Queue工作队列

`Work queues`也被称为**（Task queues）任务模型**,简单来说就是**让多个消费者绑定到一个队列，共同消费队列中的消息**,当消息处理比较耗时的时候，可能生产消息的速度会远远大于消息的消费速度。长此以往，消息就会堆积越来越多，无法及时处理。使用work 模型，多个消费者共同处理消息处理，速度就能大大提高了

![image-20221227231049081](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676340-76afd17514cf303e04aa768769897f051485322c.png)

**消费预取限制**

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 1 # 每次只能获取一条消息，处理完成才能获取下一个消息
```

**消息监听**

```java
/**
* 监听work
*/
@RabbitListener(queues = "simple.queue")
public void listenerWorkQueueMessage1(String msg) throws InterruptedException {
    System.out.println( "spring 消费着(1)监听到simple.queue : [ "+msg+" ]    "+LocalDateTime.now() );
    Thread.sleep( 20 );
}

@RabbitListener(queues = "simple.queue")
public void listenerWorkQueueMessage2(String msg) throws InterruptedException {
    System.err.println( "spring 消费着(2)监听到simple.queue : [ "+msg+" ]    "+LocalDateTime.now() );
    Thread.sleep( 200 );
}
```

**消息发送**

```java
@Test
public void sendWorkQueue(){
    String queueName = "simple.queue";
    String message = "message__";

    for ( int i = 1; i <= 50; i++ ) {
        rabbitTemplate.convertAndSend( queueName,message + i );
    }
}
```

> - 多个消费者绑定到一个队列，同一条消息只会被一个消费者处理
> - 通过设置prefetch来控制消费者预取的消息数量

## 发布订阅

![image-20221227232710269](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676347-b1d7df0c0f7fa9e5258e90be59eb4d38e4cdbdd4.png)

> - `Publisher`：生产者，也就是要发送消息的程序，但是不再发送到队列中，而是发给**Exchange**
> - `Exchange`：交换机，一方面，接收生产者发送的消息。另一方面，知道如何处理消息，例如递交给某个特别队列、递交给所有队列、或是将消息丢弃。到底如何操作，取决于**Exchange**的类型
>   - `Fanout`：广播，将消息交给所有绑定到交换机的队列
>   - `Direct`：定向，把消息交给符合指定**routing key** 的队列
>   - `Topic`：通配符，把消息交给符合**routing pattern（路由模式）** 的队列
> - `Consumer`：消费者，与以前一样，订阅队列，没有变化
> - `Queue`：消息队列也与以前一样，接收消息、缓存消息

**`Exchange`（交换机）只负责转发消息，不具备存储消息的能力，因此如果没有任何队列与Exchange绑定，或者没有符合路由规则的队列，那么消息会丢失**

### Fanout Exchange

![image-20221227233718006](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676351-43361ba872d58101e8e19708de27a6d962215229.png)

> - 可以有多个队列
> - 每个队列都要绑定到**Exchange（交换机）**
> - 生产者发送的消息，只能发送到交换机，交换机来决定要发给哪个队列，生产者无法决定
> - 交换机把消息发送给绑定过的所有队列
> - 订阅队列的消费者都能拿到消息

**声明队列和交换机**

**Spring**提供了**Exchange**接口，来表示所有不同类型的交换机

![image-20221227234053430](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676357-8c67dada57635a10125f58bc3e4b971ad7d31dc7.png)

在**consumer**中声明队列和交换机

```java
@Configuration
public class FanoutConfig {
    /**
     * 交换机
     */
    @Bean
    public FanoutExchange fanoutExchange(){
        return new FanoutExchange( "rabbitMQ.fanout" );
    }

    /**
     * 声明队列
     */
    @Bean("queue1")
    public Queue fanoutQueue1(){
        return new Queue( "fanout.queue1" );
    }

    @Bean("queue2")
    public Queue fanoutQueue2(){
        return new Queue( "fanout.queue2" );
    }

    /**
     * 绑定队列和交换机
     */
    @Bean
    public Binding bindingQueue1(Queue queue1,FanoutExchange fanoutExchange){
        return BindingBuilder.bind( queue1 ).to( fanoutExchange );
    }

    @Bean
    public Binding bindingQueue2(Queue queue2,FanoutExchange fanoutExchange){
        return BindingBuilder.bind( queue2 ).to( fanoutExchange );
    }

}
```

**监听消息**

```java
/**
* 监听fanoutExchange
*/
@RabbitListener(queues = "fanout.queue1")
public void listenerFanoutQueueMessage1(String msg){
    System.err.println( "spring 消费着(1)监听到fanout.queue : [ "+msg+" ]    "+LocalDateTime.now() );
}

@RabbitListener(queues = "fanout.queue2")
public void listenerFanoutQueueMessage2(String msg){
    System.out.println( "spring 消费着(2)监听到fanout.queue : [ "+msg+" ]    "+LocalDateTime.now() );
}
```

**发送消息**

```java
/**
* fanout发布消息
*/
@Test
public void sendFanoutMessage(){
    String exchangeName = "rabbitMQ.fanout";
    String message = "fanout message";
    rabbitTemplate.convertAndSend( exchangeName,"",message );
}
```

> - 接收**publisher**发送的消息
> - 将消息按照规则路由到与之绑定的队列
> - 不能缓存消息，路由失败，消息丢失
> - **FanoutExchange**的会将消息路由到每个绑定的队列

### Direct Exchange

**将消息发送到指定的**`queue`

- 每一个**Queue**都与**Exchange**设置一个`BindingKey`
- 发布者发送消息时，指定消息的`RoutingKey`
- **Exchange**将消息路由到`BindingKey`与消息`RoutingKey`一致的队列

![image-20221228001338423](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676364-0fe6f9754a7e2d51d6c45d08274cc33680374779.png)

**监听消息**

```java
/**
* 监听directExchange
*/
@RabbitListener( bindings = @QueueBinding (
    value = @Queue( name = "direct.queue1" ),
    exchange = @Exchange( name = "RabbitMQ.direct",type = ExchangeTypes.DIRECT ),
    key = {"red","blue"}
))
public void listenerDirectQueueMessage1(String msg){
    System.out.println( "spring 消费着(1)监听到direct.queue : [ "+msg+" ]    "+LocalDateTime.now() );
}

@RabbitListener( bindings = @QueueBinding (
    value = @Queue( name = "direct.queue2" ),
    exchange = @Exchange( name = "RabbitMQ.direct",type = ExchangeTypes.DIRECT ),
    key = {"yellow","blue"}
))
public void listenerDirectQueueMessage2(String msg){
    System.err.println( "spring 消费着(2)监听到direct.queue : [ "+msg+" ]    "+LocalDateTime.now() );
}
```

**发送消息**

```java
/**
* direct发布消息
*/
@Test
public void sendDirectMessage(){
    String exchangeName = "RabbitMQ.direct";
    String message = "red message";
    rabbitTemplate.convertAndSend( exchangeName,"blue",message );
}
```

> - 队列与交换机的绑定，不能是任意绑定，而是要指定一个`RoutingKey`（路由key）
> - 消息的发送方在 向 Exchange发送消息时，也必须指定消息的 `RoutingKey`
> - Exchange不再把消息交给每一个绑定的队列，而是根据消息的`Routing Key`进行判断，只有队列的`Routingkey`与消息的 `Routing key`完全一致，才会接收到消息
> - 系统默认发布订阅方式
>   - 与Fanout交换机的差异
>     1. **Fanout**交换机将消息路由给每一个与之绑定的队列
>     2. **Direct**交换机根据**RoutingKey**判断路由给哪个队列
>     3. 如果多个队列具有相同的**RoutingKey**，则与**Fanout**功能类似

### Topic Exchange

Topic类型的Exchange与Direct相比，都是可以根据`RoutingKey`把消息路由到不同的队列。只不过Topic类型Exchange可以让队列在绑定`Routing key` 的时候使用通配符！`Routingkey` 一般都是有一个或多个单词组成，多个单词之间以”.”分割，例如： `mq.send`

> **#** 匹配一个或多个词 `mq.#` `#.mq`
>
> ***** 匹配一个词 `*.mq` `mq.*`

![image-20221228003846852](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676369-fd46c301e2ea7ed2f181d042014a7f6819f68b68.png)

**消息监听**

```java
/**
* 监听topicExchange
*/
@RabbitListener( bindings = @QueueBinding (
    value = @Queue( name = "topic.queue1" ),
    exchange = @Exchange( name = "RabbitMQ.topic",type = ExchangeTypes.TOPIC ),
    key = "china.#"
))
public void listenerTopicQueueMessage1(String msg){
    System.out.println( "spring 消费着(1)监听到topic.queue1 : [ "+msg+" ]    "+LocalDateTime.now() );
}

@RabbitListener( bindings = @QueueBinding (
    value = @Queue( name = "topic.queue2" ),
    exchange = @Exchange( name = "RabbitMQ.topic",type = ExchangeTypes.TOPIC ),
    key = "#.news"
))
public void listenerTopicQueueMessage2(String msg){
    System.err.println( "spring 消费着(2)监听到topic.queue2 : [ "+msg+" ]    "+LocalDateTime.now() );
}
```

**消息发送**

```java
/**
* topic发布消息
*/
@Test
public void sendTopicMessage(){
    String exchangeName = "RabbitMQ.topic";
    String message = "topic message";
    rabbitTemplate.convertAndSend( exchangeName,".",message );
}
```

## 服务异步通信

### 生产者确认机制

**消息从发送，到消费者接收，会经理多个过程,其中的每一步都可能导致消息丢失，常见的丢失原因包括：**

- 发送时丢失：
  - 生产者发送的消息未送达**exchange**
  - 消息到达**exchange**后未到达**queue**
- **MQ**宕机，**queue**将消息丢失
- **consumer**接收到消息后未消费就宕机

***RabbitMQ提供了`publisher confirm`机制来避免消息发送到MQ过程中丢失。这种机制必须给每个消息指定一个唯一ID。消息发送到MQ以后，会返回一个结果给发送者，表示消息是否处理成功***

![image-20221228180118020](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676375-19d570850d6766190ba5bfb4d7c014df4e26dd6c.png)

- **publisher-confirm**，发送者确认
  - 消息成功投递到交换机，返回**ack**
  - 消息未投递到交换机，返回**nack**
- **publisher-return**，发送者回执
  - 消息投递到交换机了，但是没有路由到队列。返回**ACK**，及路由失败原因

**确认机制发送消息时,需要给每个消息设置一个全局唯一的`id`,以区分不同消息,避免`ack`冲突**

#### `SpringAMQP`***实现生产者确认***

**配置**`publisher`

```yaml
spring:
  rabbitmq:
    publisher-confirm-type: correlated
    publisher-returns: true
    template:
      mandatory: true
```

> - `publish-confirm-type`：开启**publisher-confirm**
>   - `simple`：同步等待**confirm**结果，直到超时
>   - `correlated`：异步回调，定义**ConfirmCallback**，MQ返回结果时会回调这个**ConfirmCallback**
> - `publish-returns`：开启**publish-return**功能，同样是基于**callback**机制，不过是定义**ReturnCallback**
> - `template.mandatory`：消息路由失败时的策略**true**，则调用**ReturnCallback**；**false**：则直接**丢弃消息**

**定义`Return`回调**

每个`RabbitTemplate`只能配置一个`ReturnCallback`，因此需要在项目加载时配置

```java
@Slf4j
@Configuration
public class CommonConfig implements ApplicationContextAware {

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        // 获取RabbitTemplate对象
        RabbitTemplate rabbitTemplate = applicationContext.getBean(RabbitTemplate.class);
        // 配置ReturnCallback
        rabbitTemplate.setReturnCallback((message, replyCode, replyText, exchange, routingKey) -> {
            // 记录日志
            log.error("消息发送到队列失败，响应码：{}, 失败原因：{}, 交换机: {}, 路由key：{}, 消息: {}",
                     replyCode, replyText, exchange, routingKey, message);
            // 如果有需要的话，重发消息,人工处理?
        });
    }
}
```

**定义**`ConfirmCallBack`

```java
@Test
public void sendMessagesSimpleQueue() throws InterruptedException {
    //key
    String routingKey = "simple.msg";
    //消息
    String message = "hello,spring amqp";
    //交换机
    String exchange = "simple.topic";
    //添加correlationData设置id
    CorrelationData correlationData = new CorrelationData( UUID.randomUUID().toString() );
    //回调
    correlationData.getFuture().addCallback( confirm -> {
        //判断ack
        if ( confirm.isAck() ) {
            log.info( "消息发送到交换机,消息ID: {}",correlationData.getId() );
        }else {
            //nack
            log.error( "消息投送到交换机失败,消息ID:  {}",correlationData.getId() );
        }
    }, throwable -> {
        log.error( "消息发送失败" );
        //重发?
    } );

    //发送消息
    rabbitTemplate.convertAndSend( exchange,routingKey,message,correlationData );

    //当测试方法结束，rabbitmq相关的资源也就关闭了，
    // 消息发送出去，但异步的ConfirmCallback却由于资源关闭而出现了发送交换机失败的的问题
    Thread.sleep( 300 );
}
```

#### 消息持久化

**生产者确认可以确保消息投递到`RabbitMQ`的队列中，但是消息发送到`RabbitMQ`以后，如果突然宕机，也可能导致消息丢失**

***交换机持久化***

```java
@Bean
public DirectExchange simpleDirect(){
    //交换机名称,是否持久化,当没有队列与其绑定时是否自动删除
    return new DirectExchange("simple.direct",true,false);
}
```

***队列持久化***

```java
@Bean
public Queue simpleQueue(){
    return QueueBuilder.durable("simple.queue").build();
}
```

***消息持久化***

```java
/**
* 持久化消息
*/
@Test
public void durableMessage(){
    //构建持久化消息
    Message message = MessageBuilder.withBody( "hello,spring".getBytes(StandardCharsets.UTF_8) )
        .setDeliveryMode( MessageDeliveryMode.PERSISTENT )
        .build();
    rabbitTemplate.convertAndSend( "simple.queue",message );
}
```

**:star: 在RabbitMQ中交换机,队列和消息默认都是持久化的**

### 消费者消息确认

**`RabbitMQ`是阅后即焚机制，`RabbitMQ`确认消息被消费者消费后会立刻删除。而`RabbitMQ`是通过消费者回执来确认消费者是否成功处理消息的,消费者获取消息后，应该向`RabbitMQ`发送`ACK`回执，表明自己已经处理消息`SpringAMQP`允许配置三种确认模式**

- `manual`  手动ack，需要在业务代码结束后，调用api发送ack(代码侵入)
- `auto`  自动ack，由spring监测listener代码是否出现异常，没有异常则返回ack；抛出异常则返回nack(AOP)
- `none`  关闭ack，MQ假定消费者获取消息后会成功处理，因此消息投递后立即被删除

**配置`auto` 模式**

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 1
        acknowledge-mode: auto
```

### 消费失败重试机制

**当消费者出现异常后，消息会不断`requeue（重入队）`到队列，再重新发送给消费者，然后再次异常，再次`requeue`，无限循环，导致mq的消息处理飙升，带来不必要的压力**

==本地方法重试==

*利用**Spring**的**retry**机制，在消费者出现异常时利用本地重试，而不是无限制的**requeue**到**mq**队列*

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true # 开启消费者失败重试
          initial-interval: 1000 # 初识的失败等待时长为1秒
          multiplier: 1 # 失败的等待时长倍数，下次等待时长 = multiplier * last-interval
          max-attempts: 3 # 最大重试次数
          stateless: true # true无状态；false有状态。如果业务中包含事务，这里改为false
```

> - 开启本地重试时，消息处理过程中抛出异常，不会**requeue**到队列，而是在消费者本地重试
> - 重试达到最大次数后，**Spring**会返回**ack**，消息会被丢弃

==失败策略==

**开启重试模式后，重试次数耗尽，如果消息依然失败，则需要有`MessageRecovery`接口来处理，它包含三种不同**

- `RejectAndDontRequeueRecoverer`  重试耗尽后，直接`reject`，丢弃消息。默认就是这种方式
- `ImmediateRequeueMessageRecoverer`  重试耗尽后，返回`nack`，消息重新入队
- `RepublishMessageRecoverer`  重试耗尽后，将失败消息投递到指定的交换机

![image-20221229203341438](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676386-92bd06098aabf91a3caf062f294178355a6f579d.png)

**配置处理消费失败的交换机和队列**

```java
@Bean
public DirectExchange errorMessageExchange(){
    return new DirectExchange("error.direct");
}
@Bean
public Queue errorQueue(){
    return new Queue("error.queue", true);
}
@Bean
public Binding errorBinding(Queue errorQueue, DirectExchange errorMessageExchange){
    return BindingBuilder.bind(errorQueue).to(errorMessageExchange).with("error");
}
```

**配置消费重试策略**

```java
@Bean
public MessageRecoverer republishMessageRecoverer(RabbitTemplate rabbitTemplate){
    return new RepublishMessageRecoverer(rabbitTemplate, "error.direct", "error");
}
```

==保证消息的可靠性?==

- 开启生产者确认机制，确保生产者的消息能到达队列
- 开启持久化功能，确保消息未消费前在队列中不会丢失
- 开启消费者确认机制为**auto**，由**spring**确认消息处理成功后完成**ack**
- 开启消费者失败重试机制，并设置**MessageRecoverer**，多次重试失败后将消息投递到异常交换机，交由人工处理

## 死信交换机

当一个队列中的消息满足下列情况之一时，可以成为死信dead letter

- 消费者使用basic.reject或 basic.nack声明消费失败，并且消息的requeue参数设置为false
- 消息是一个过期消息，超时无人消费
- 要投递的队列消息满了，无法投递

如果这个包含死信的队列配置了`dead-letter-exchange`属性，指定了一个交换机，那么队列中的死信就会投递到这个交换机中，而这个交换机称为**死信交换机**`Dead Letter Exchange`

![image-20221229203950775](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676393-10012a25c5efe725ac004f903eb76785ea8ea073.png)

==TTL==

一个队列中的消息如果超时未消费，则会变为死信，超时分为两种情况：

- 消息所在的队列设置了超时时间
- 消息本身设置了超时时间

![image-20221229215450981](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676402-7eddead11560dcbe2ce35c687f96b4fea0e3ceb8.png)

**监听死信队列**

```java
@RabbitListener( bindings = @QueueBinding(
        value = @Queue( name = "dl.queue",durable = "true"),
        exchange = @Exchange( name = "dl.exchange"),
        key = "dl"
))
public void listenDeadLetterQueue(String msg){
    log.info( "监听到消息: {}",msg );
}
```

**声明队列**

```java
@Bean
public DirectExchange ttlExchange(){
    return new DirectExchange( "ttl.exchange",true,false );
}

@Bean
public Queue ttlQueue(){
    return QueueBuilder.durable( "ttl.queue" )
        .deadLetterExchange( "dl.exchange" )
        .deadLetterRoutingKey( "dl" )
        .ttl( 10000 )
        .build();
}

@Bean
public Binding binding(){
    return BindingBuilder.bind( ttlQueue() ).to( ttlExchange() ).with( "ttl" );
}
```

### 延迟队列

**利用TTL结合死信交换机，我们实现了消息发出后，消费者延迟收到消息的效果。这种消息模式就称为延迟队列（Delay Queue）模式,延迟队列的需求非常多，所以RabbitMQ的官方也推出了一个[`DelayExchange`](https://www.rabbitmq.com/community-plugins.html)插件，原生支持延迟队列效果**

**延迟队列的使用场景包括：**

- 延迟发送短信
- 用户下单，如果用户在15 分钟内未支付，则自动取消
- 预约工作会议，20分钟后自动通知所有参会人员

==下载插件后将插件上传到mq容器数据卷位置,并进入mq容器内开启插件==

```sh
# 进入容器内部
docker exec -it rabbitmq bash
#开启插件
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

DelayExchange需要将一个交换机声明为delayed类型。当我们发送消息到delayExchange时，流程如下：

- 接收消息
- 判断消息是否具备x-delay属性
- 如果有x-delay属性，说明是延迟消息，持久化到硬盘，读取x-delay值，作为延迟时间
- 返回routing not found结果给消息发送者
- x-delay时间到期后，重新投递消息到指定队列

**声明`DelayExchange`交换机**

```java
@RabbitListener( bindings = @QueueBinding(
    value = @Queue( "delay.queue" ),
    exchange = @Exchange( value = "delay.exchange",delayed = "true"),
    key = "delay"
) )
public void listenDelayMessages(String msg){
    log.info( "延迟队列监听到消息: {}",msg );
}
```

**发送消息**

```java
@Test
public void sendDelayedMessages(){
    Message message = MessageBuilder.withBody( "hello".getBytes() )
        .setDeliveryMode( MessageDeliveryMode.PERSISTENT )
        .setHeader( "x-delay",5000 )
        .build();
    CorrelationData correlationData = new CorrelationData( UUID.randomUUID().toString() );
    rabbitTemplate.convertAndSend( "delay.exchange","delay",message,correlationData );
}
```

### 惰性队列

==消息堆积==

**当生产者发送消息的速度超过了消费者处理消息的速度，就会导致队列中的消息堆积，直到队列存储消息达到上限。之后发送的消息就会成为死信，可能会被丢弃，这就是消息堆积问题**

> 消息堆积问题的解决方案？
>
> - 队列上绑定多个消费者，提高消费速度
> - 使用惰性队列，可以再mq中保存更多消息

==惰性队列==

- 接收到消息后直接存入磁盘而非内存
- 消费者要消费消息时才会从磁盘中读取并加载到内存
- 支持数百万条的消息存储

> 优点
>
> - 基于磁盘存储，消息上限高
> - 没有间歇性的page-out，性能比较稳定
>
> 缺点
>
> - 基于磁盘存储，消息时效性会降低
> - 性能受限于磁盘的IO

**基于命令行设置lazy-queue**

```sh
rabbitmqctl set_policy Lazy "^lazy-queue$" '{"queue-mode":"lazy"}' --apply-to queues
```

- `rabbitmqctl`   RabbitMQ的命令行工具
- `set_policy`  添加一个策略
- `Lazy`   策略名称，可以自定义
- `"^lazy-queue$"`   用正则表达式匹配队列的名字
- `'{"queue-mode":"lazy"}'`   设置队列模式为lazy模式
- `--apply-to queues  `  策略的作用对象，是所有的队列

**基于`@Bean`声明lazy-queue**

```java
@Bean
public Queue lazyQueue() {
    return QueueBuilder.durable("lazy.queue")
            .lazy()
            .build();
}
```

**基于`@RabbitListener`声明lazy-queue**

```java
@RabbitListener( queuesToDeclare = @Queue(
        name = "lazy.queue",
        durable = "true",
        arguments = @Argument( name = "x-queue-mode",value = "lazy")
))
public void listenLazyQueue(String msg){
    log.info( "惰性队列监听到消息:   {}",msg );
}
```

## 集群

**普通集群，或者叫标准集群（classic cluster）**

- 会在集群的各个节点间共享部分数据，包括：交换机、队列元信息。不包含队列中的消息
- 当访问集群某节点时，如果队列不在该节点，会从数据所在节点传递到当前节点并返回
- 队列所在节点宕机，队列中的消息就会丢失

![image-20221230144348223](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676413-a4728c9c7b7e4e53be8bcb7b248fa702fdca6606.png)

==普通集群部署==

1. 获取cookie

   RabbitMQ底层依赖于Erlang，而Erlang虚拟机就是一个面向分布式的语言，默认就支持集群模式。集群模式中的每个RabbitMQ 节点使用 cookie 来确定它们是否被允许相互通信

   **获取任意一个mq容器的cookie值**

   ```sh
   docker exec -it rabbitmq cat /var/lib/rabbitmq/.erlang.cookie
   ```

   记录cookie值

   ```sh
   YXDTBEFTLPBBPUGFFWTJ
   ```
2. 准备集群配置

   创建目录存放集群配置信息

   ```sh
   mkdir mq-cluster
   ```

   编写 `rabbitmq.conf` 文件

   ```sh
   loopback_users.guest = false
   listeners.tcp.default = 5672
   cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config
   cluster_formation.classic_config.nodes.1 = rabbit@mq1
   cluster_formation.classic_config.nodes.2 = rabbit@mq2
   cluster_formation.classic_config.nodes.3 = rabbit@mq3
   ```

   创建文件记录cookie

   ```sh
   # 创建cookie文件
   touch .erlang.cookie
   # 写入cookie
   echo "YXDTBEFTLPBBPUGFFWTJ" > .erlang.cookie
   # 修改cookie文件的权限
   chmod 600 .erlang.cookie
   ```

   准备三个目录,mq1、mq2、mq3,并将配置信息拷贝入

   ```sh
   # 创建目录
   mkdir mq1 mq2 mq3
   # 拷贝
   cp rabbitmq.conf mq1
   cp rabbitmq.conf mq2
   cp rabbitmq.conf mq3
   cp .erlang.cookie mq1
   cp .erlang.cookie mq2
   cp .erlang.cookie mq3
   ```
3. 启动集群

   创建网络,用于节点之间互联

   ```sh
   docker network create mq-net
   ```

   创建运行容器

   ```sh
   docker run -d --net mq-net \
   -v ${PWD}/mq1/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf \
   -v ${PWD}/.erlang.cookie:/var/lib/rabbitmq/.erlang.cookie \
   -e RABBITMQ_DEFAULT_USER=admin \
   -e RABBITMQ_DEFAULT_PASS=admin \
   --name mq1 \
   --hostname mq1 \
   -p 8071:5672 \
   -p 8081:15672 \
   rabbitmq:3.8-management
   ```

查看启动状态

![image-20221230153554812](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676421-d7283d374ec0c9a6aac0b8fe1cf6827a86f5dd60.png)

登录mq1节点查看

![image-20221230153725792](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676426-590e93a8da8348017b54c6b9cf7f1b6dec7084e4.png)

**镜像集群**

- 交换机、队列、队列中的消息会在各个mq的镜像节点之间同步备份
- 创建队列的节点被称为该队列的主节点，备份到的其它节点叫做该队列的镜像节点
- 一个队列的主节点可能是另一个队列的镜像节点
- 所有操作都是主节点完成，然后同步给镜像节点
- 主宕机后，镜像节点会替代成新的主

![image-20221230144853062](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676429-b2dc70032c82e78997be2d5229940a8281273864.png)

==镜像集群部署==

镜像模式的配置有3种模式：


| ha-mode         | ha-params         | 效果                                                                                                                                                                                                                                                                                                                          |
| :---------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 准确模式exactly | 队列的副本量count | 集群中队列副本（主服务器和镜像服务器之和）的数量。count如果为1意味着单个副本：即队列主节点。count值为2表示2个副本：1个队列主和1个队列镜像。换句话说：count = 镜像数量 + 1。如果群集中的节点数少于count，则该队列将镜像到所有节点。如果有集群总数大于count+1，并且包含镜像的节点出现故障，则将在另一个节点上创建一个新的镜像。 |
| all             | (none)            | 队列在群集中的所有节点之间进行镜像。队列将镜像到任何新加入的节点。镜像到所有节点将对所有群集节点施加额外的压力，包括网络I / O，磁盘I / O和磁盘空间使用情况。推荐使用exactly，设置副本数为（N / 2 +1）。                                                                                                                       |
| nodes           | *node names*      | 指定队列创建到哪些节点，如果指定的节点全部不存在，则会出现异常。如果指定的节点在集群中存在，但是暂时不可用，会创建节点到当前客户端连接到的节点。                                                                                                                                                                              |

***exactly模式***

```sh
rabbitmqctl set_policy ha-two "^two\." '{"ha-mode":"exactly","ha-params":2,"ha-sync-mode":"automatic"}'
```

- `rabbitmqctl set_policy`：固定写法
- `ha-two`：策略名称，自定义
- `"^two\."`：匹配队列的正则表达式，符合命名规则的队列才生效，这里是任何以`two.`开头的队列名称
- `'{"ha-mode":"exactly","ha-params":2,"ha-sync-mode":"automatic"}'`: 策略内容
  - `"ha-mode":"exactly"`：策略模式，此处是exactly模式，指定副本数量
  - `"ha-params":2`：策略参数，这里是2，就是副本数量为2，1主1镜像
  - `"ha-sync-mode":"automatic"`：同步策略，默认是manual，即新加入的镜像节点不会同步旧的消息。如果设置为automatic，则新加入的镜像节点会把主节点中所有消息都同步，会带来额外的网络开销

***all模式***

```sh
rabbitmqctl set_policy ha-all "^all\." '{"ha-mode":"all"}'
```

- `ha-all`：策略名称，自定义
- `"^all\."`：匹配所有以`all.`开头的队列名
- `'{"ha-mode":"all"}'`：策略内容
  - `"ha-mode":"all"`：策略模式，此处是all模式，即所有节点都会称为镜像节点

***nodes模式***

```sh
rabbitmqctl set_policy ha-nodes "^nodes\." '{"ha-mode":"nodes","ha-params":["rabbit@nodeA", "rabbit@nodeB"]}'
```

- `rabbitmqctl set_policy`：固定写法
- `ha-nodes`：策略名称，自定义
- `"^nodes\."`：匹配队列的正则表达式，符合命名规则的队列才生效，这里是任何以`nodes.`开头的队列名称
- `'{"ha-mode":"nodes","ha-params":["rabbit@nodeA", "rabbit@nodeB"]}'`: 策略内容
  - `"ha-mode":"nodes"`：策略模式，此处是nodes模式
  - `"ha-params":["rabbit@mq1", "rabbit@mq2"]`：策略参数，这里指定副本所在节点名称

**仲裁队列**

==创建仲裁队列==

```java
@Bean
public Queue quorumQueue() {
    return QueueBuilder
        .durable("quorum.queue") // 持久化
        .quorum() // 仲裁队列
        .build();
}
```

==连接MQ集群==

```java
spring:
  rabbitmq:
    addresses: 192.168.150.105:8071, 192.168.150.105:8072, 192.168.150.105:8073
    username: mq
    password: admin
    virtual-host: /
```

### 集群扩容

1. 启动一个新的MQ容器

   ```sh
   docker run -d --net mq-net \
   -v ${PWD}/.erlang.cookie:/var/lib/rabbitmq/.erlang.cookie \
   -e RABBITMQ_DEFAULT_USER=admin \
   -e RABBITMQ_DEFAULT_PASS=admin \
   --name mq4 \
   --hostname mq5 \
   -p 8074:15672 \
   -p 8084:15672 \
   rabbitmq:3.8-management
   ```
2. 进入容器

   ```sh
   docker exec -it mq4 bash
   #停止mq进程
   rabbitmqctl stop_app
   #重置RabbitMQ中的数据
   rabbitmqctl reset
   #加入mq1
   rabbitmqctl join_cluster rabbit@mq1
   #再次启动mq进程
   rabbitmqctl start_app
   ```
3. 增加仲裁队列副本

   ```sh
   docker exec -it mq1 bash
   rabbitmq-queues add_member "quorum.queue" "rabbit@mq4"
   rabbitmq-queues quorum_status "quorum.queue"
   ```
