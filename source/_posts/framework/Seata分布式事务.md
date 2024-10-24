---
title: 分布式事务框架seata使用
date: 2022-12-19 11:44:56
updated: 2022-12-19 11:44:56
tags:
  - framework
---

传统的**单机事务**。在传统数据库事务中，必须要满足四个原则

![image-20210724165045186](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677250-f6cd94d605a6c52bc4f999bee732dac916ab2c5d.png)

## 分布式事务

**在数据库水平拆分、服务垂直拆分之后，一个业务操作通常要跨多个数据库、服务才能完成。例如电商行业中比较常见的下单付款案例**

- 创建新订单
- 扣减商品库存
- 从用户账户余额扣除金额

![image-20230106222247822](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677258-670f8b04ac443ea7104f3b77887391410d79c80a.png)

订单的创建、库存的扣减、账户扣款在每一个服务和数据库内是一个本地事务，可以保证ACID原则,但是当三件事情看做一个"业务"，要满足保证“业务”的原子性，要么所有操作全部成功，要么全部失败，不允许出现部分成功部分失败的现象，这就是**分布式系统下的事务**

### CAP定理

1998年，加州大学的计算机科学家 Eric Brewer 提出，分布式系统有三个指标

> - Consistency（一致性）
> - Availability（可用性）
> - Partition tolerance （分区容错性）

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677262-bfca6f51a916fbe03676b71dc2854e20ac9b0b7f.png" alt="image-20230106222542549" style="zoom:33%;" />

**一致性**用户访问分布式系统中的任意节点，得到的数据必须一致

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677269-858afcb90564a0bcb82e2317b9a3d84315c64d83.png" alt="image-20230106222648287" style="zoom: 50%;" />

**可用性**用户访问集群中的任意健康节点，必须能得到响应，而不是超时或拒绝

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677273-46fa878b829e9a2e3e39388d51743fc480ef6750.png" alt="image-20230106222811680" style="zoom: 50%;" />

**分区容错**因为网络故障或其它原因导致分布式系统中的部分节点与其它节点失去连接，形成独立分区

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677276-a8d8431f4fb753641119400198350ed37b8a29f6.png" alt="image-20230106222934717" style="zoom: 33%;" />

### BASE理论

- **Basically Available** **（基本可用）**：分布式系统在出现故障时，允许损失部分可用性，即保证核心可用
- **Soft State（软状态）：**在一定时间内，允许出现中间状态，比如临时的不一致状态
- **Eventually Consistent（最终一致性）**：虽然无法保证强一致性，但是在软状态结束后，最终达到数据一致

### 分布式事务的思路

**分布式事务最大的问题是各个子事务的一致性问题，因此可以借鉴CAP定理和BASE理论**

- **AP模式：**各子事务分别执行和提交，允许出现结果不一致，然后采用弥补措施恢复数据即可，实现最终一致
- **CP模式：**各个子事务执行后互相等待，同时提交，同时回滚，达成强一致。但事务等待过程中，处于弱可用状态

但不管是哪一种模式，都需要在子系统事务之间互相通讯，协调事务状态，也就是需要一个**事务协调者(TC)**

![image-20230106223420048](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677281-27ad700e6b65d43a99a75ac4e3b9d78c88de5303.png)

## Seata

**[Seata](http://seata.io/)是 2019 年 1 月份蚂蚁金服和阿里巴巴共同开源的分布式事务解决方案。致力于提供高性能和简单易用的分布式事务服务，为用户打造一站式的分布式解决方案**

> Seata事务管理中有三个重要的角色
>
> - **TC (Transaction Coordinator) -** **事务协调者：**维护全局和分支事务的状态，协调全局事务提交或回滚
> - **TM (Transaction Manager) -** **事务管理器：**定义全局事务的范围、开始全局事务、提交或回滚全局事务
> - **RM (Resource Manager) -** **资源管理器：**管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚

![image-20230106223733229](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677285-c71d0213453404bfda5ca1855d550fedf3149cdb.png)

Seata基于上述架构提供了四种不同的分布式事务解决方案

- **XA模式：**强一致性分阶段事务模式，牺牲了一定的可用性，无业务侵入
- **TCC模式：**最终一致的分阶段事务模式，有业务侵入
- **AT模式：**最终一致的分阶段事务模式，无业务侵入，也是Seata的默认模式
- **SAGA模式：**长事务模式，有业务侵入

### 部署Seata

1. **下载[Seata](http://seata.io/zh-cn/blog/download.html)**
2. **解压后修改配置**

   - 修改conf目录下的registry.conf文件

     ```sh
     registry {
       # tc服务的注册中心类，这里选择nacos，也可以是eureka、zookeeper等
       type = "nacos"
     
       nacos {
         # seata tc 服务注册到 nacos的服务名称，可以自定义
         application = "seata-tc-server"
         serverAddr = "127.0.0.1:8848"
         group = "DEFAULT_GROUP"
         namespace = ""
         cluster = "SH"
         username = "nacos"
         password = "nacos"
       }
     }
     
     config {
       # 读取tc服务端的配置文件的方式，这里是从nacos配置中心读取，这样如果tc是集群，可以共享配置
       type = "nacos"
       # 配置nacos地址等信息
       nacos {
         serverAddr = "127.0.0.1:8848"
         namespace = ""
         group = "SEATA_GROUP"
         username = "nacos"
         password = "nacos"
         dataId = "seataServer.properties"
       }
     }
     ```
3. **在nacos添加配置**

   为了让tc服务的集群可以共享配置，选择nacos作为统一配置中心。因此服务端配置文件**seataServer.properties**文件需要在nacos中配好

   <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677302-1e33714a07f092432613f7469a2053c32095408e.png" alt="image-20230106224429204" style="zoom: 50%;" />

   配置内容

   ```properties
   # 数据存储方式，db代表数据库
   store.mode=db
   store.db.datasource=druid
   store.db.dbType=mysql
   store.db.driverClassName=com.mysql.jdbc.Driver
   store.db.url=jdbc:mysql://127.0.0.1:3306/seata?useUnicode=true&rewriteBatchedStatements=true
   store.db.user=root
   store.db.password=123
   store.db.minConn=5
   store.db.maxConn=30
   store.db.globalTable=global_table
   store.db.branchTable=branch_table
   store.db.queryLimit=100
   store.db.lockTable=lock_table
   store.db.maxWait=5000
   # 事务、日志等配置
   server.recovery.committingRetryPeriod=1000
   server.recovery.asynCommittingRetryPeriod=1000
   server.recovery.rollbackingRetryPeriod=1000
   server.recovery.timeoutRetryPeriod=1000
   server.maxCommitRetryTimeout=-1
   server.maxRollbackRetryTimeout=-1
   server.rollbackRetryTimeoutUnlockEnable=false
   server.undo.logSaveDays=7
   server.undo.logDeletePeriod=86400000
   
   # 客户端与服务端传输方式
   transport.serialization=seata
   transport.compressor=none
   # 关闭metrics功能，提高性能
   metrics.enabled=false
   metrics.registryType=compact
   metrics.exporterList=prometheus
   metrics.exporterPrometheusPort=9898
   ```
4. **创建数据库表**

   tc服务在管理分布式事务时，需要记录事务相关数据到数据库中，需要提前创建好这些表,这些表主要记录全局事务、分支事务、全局锁信息

   ```sql
   
   SET NAMES utf8mb4;
   SET FOREIGN_KEY_CHECKS = 0;
   
   -- ----------------------------
   -- 分支事务表
   -- ----------------------------
   DROP TABLE IF EXISTS `branch_table`;
   CREATE TABLE `branch_table`  (
     `branch_id` bigint(20) NOT NULL,
     `xid` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
     `transaction_id` bigint(20) NULL DEFAULT NULL,
     `resource_group_id` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
     `resource_id` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
     `branch_type` varchar(8) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
     `status` tinyint(4) NULL DEFAULT NULL,
     `client_id` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
     `application_data` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
     `gmt_create` datetime(6) NULL DEFAULT NULL,
     `gmt_modified` datetime(6) NULL DEFAULT NULL,
     PRIMARY KEY (`branch_id`) USING BTREE,
     INDEX `idx_xid`(`xid`) USING BTREE
   ) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;
   
   -- ----------------------------
   -- 全局事务表
   -- ----------------------------
   DROP TABLE IF EXISTS `global_table`;
   CREATE TABLE `global_table`  (
     `xid` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
     `transaction_id` bigint(20) NULL DEFAULT NULL,
     `status` tinyint(4) NOT NULL,
     `application_id` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
     `transaction_service_group` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
     `transaction_name` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
     `timeout` int(11) NULL DEFAULT NULL,
     `begin_time` bigint(20) NULL DEFAULT NULL,
     `application_data` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
     `gmt_create` datetime NULL DEFAULT NULL,
     `gmt_modified` datetime NULL DEFAULT NULL,
     PRIMARY KEY (`xid`) USING BTREE,
     INDEX `idx_gmt_modified_status`(`gmt_modified`, `status`) USING BTREE,
     INDEX `idx_transaction_id`(`transaction_id`) USING BTREE
   ) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;
   
   SET FOREIGN_KEY_CHECKS = 1;
   ```
5. **启动TC服务**

   进入bin目录，运行其中的seata-server.bat

   <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677307-3c0c4dfa67b99a8389fb122ed7ca41bc2932f752.png" alt="image-20210622205427318" style="zoom:80%;" />
6. **访问nacos,查看服务列表**

   <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677310-fee5c851e072c351ce656a1818dddadb8391ba5a.png" alt="image-20230106224934086" style="zoom:80%;" />

### 微服务集成seata

**引入Seata依赖**

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
    <exclusions>
        <!--版本较低，1.3.0，因此排除-->
        <exclusion>
            <artifactId>seata-spring-boot-starter</artifactId>
            <groupId>io.seata</groupId>
        </exclusion>
    </exclusions>
</dependency>
<!--seata starter 采用1.4.2版本-->
<dependency>
    <groupId>io.seata</groupId>
    <artifactId>seata-spring-boot-starter</artifactId>
    <version>${seata.version}</version>
</dependency>
```

**修改配置文件**

![image-20230106225339992](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677314-4feaa6302106d617adf48958de31fe20a908f591.png)

```yaml
seata:
  registry: # TC服务注册中心的配置，微服务根据这些信息去注册中心获取tc服务地址
    # 参考tc服务自己的registry.conf中的配置
    type: nacos
    nacos: # tc
      server-addr: 127.0.0.1:8848
      namespace: ""
      group: DEFAULT_GROUP
      application: seata-tc-server # tc服务在nacos中的服务名称
      cluster: SH
  tx-service-group: seata-demo # 事务组，根据这个获取tc服务的cluster名称
  service:
    vgroup-mapping: # 事务组与TC服务cluster的映射关系
      seata-demo: SH
```

### XA模式

**XA 规范 是 X/Open 组织定义的分布式事务处理（DTP，Distributed Transaction Processing）标准，XA 规范 描述了全局的TM与局部的RM之间的接口，XA是规范，目前主流数据库都实现了这种规范，实现的原理都是基于两阶段提交**

- 正常情况

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677318-306cfee1a85771cc79aeb9dd06c21bab55441204.png" alt="image-20210724174102768" style="zoom: 50%;" />

- 异常情况

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677321-f0740e89d6690fc75138814d1d688c706c1f84de.png" alt="image-20210724174234987" style="zoom:50%;" />

> 一阶段：
>
> - 事务协调者通知每个事物参与者执行本地事务
> - 本地事务执行完成后报告事务执行状态给事务协调者，此时事务不提交，继续持有数据库锁
>
> 二阶段：
>
> - 事务协调者基于一阶段的报告来判断下一步操作
>   - 如果一阶段都成功，则通知所有事务参与者，提交事务
>   - 如果一阶段任意一个参与者失败，则通知所有事务参与者回滚事务

#### Seata的XA模型

**Seata对原始的XA模式做了简单的封装和改造，以适应自己的事务模型**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677325-9fd15d5bd9bdb901fae6572d489bbbe7bc655395.png" alt="image-20230106225949804" style="zoom:50%;" />

> RM一阶段的工作：
>
> ```
> ① 注册分支事务到TC
> ```
>
>
> ```
> ② 执行分支业务sql但不提交
> ```
>
>
> ```
> ③ 报告执行状态到TC
> ```
>
>
> TC二阶段的工作：
>
> - TC检测各分支事务执行状态
>
>   a.如果都成功，通知所有RM提交事务
>
>   b.如果有失败，通知所有RM回滚事务
>
> RM二阶段的工作：
>
> - 接收TC指令，提交或回滚事务

**优缺点**

优点

- 事务的强一致性，满足ACID原则。
- 常用数据库都支持，实现简单，并且没有代码侵入

缺点

- 因为一阶段需要锁定数据库资源，等待二阶段结束才释放，性能较差
- 依赖关系型数据库实现事务

**Seata的starter已经完成了XA模式的自动装配，实现非常简单**

1. 修改配置,开启XA模式

   ```yaml
   seata:
     data-source-proxy-mode: XA
   ```
2. 给发起全局事务的入口方法添加`@GlobalTransactional`注解

   <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677331-da3a36ed8eb26ce3ef21e738bc0cac5d5c4bc643.png" alt="image-20230106230549442" style="zoom:50%;" />

### Seata的AT模型

**AT模式同样是分阶段提交的事务模型，不过缺弥补了XA模型中资源锁定周期过长的缺陷**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677341-74a9d5d1ab55fdf5f6d7b67309a964154d4d75f1.png" alt="image-20230106230912778" style="zoom:50%;" />

> 阶段一RM的工作：
>
> - 注册分支事务
> - 记录undo-log（数据快照）
> - 执行业务sql并提交
> - 报告事务状态
>
> 阶段二提交时RM的工作：
>
> - 删除undo-log即可
>
> 阶段二回滚时RM的工作：
>
> - 根据undo-log恢复数据到更新前

**AT模式与XA模式的区别**

- XA模式一阶段不提交事务，锁定资源；AT模式一阶段直接提交，不锁定资源
- XA模式依赖数据库机制实现回滚；AT模式利用数据快照实现数据回滚
- XA模式强一致；AT模式最终一致

**<span style="color: red">在多线程并发访问AT模式的分布式事务时，有可能出现脏写问题</span>**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677345-3ad9d98184e898c7e1a55331ff84455b65a6a95c.png" alt="image-20230106231428017" style="zoom:50%;" />

**<span style="color: red">引入全局锁。在释放DB锁之前，先拿到全局锁。避免同一时刻有另外一个事务来操作当前数据</span>**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677348-ebdeda2c18b208b37394a8a7fd95e09190e0c7ce.png" alt="image-20230106231912806" style="zoom:50%;" />

**<span style="color: red">引入CAS,在获取锁时,保存操作前后的两次快照</span>**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677356-166dbc72f7cf5e808fb35b21625561a86a30d251.png" alt="image-20230106232337951" style="zoom:50%;" />

> AT模式的优点：
>
> - 一阶段完成直接提交事务，释放数据库资源，性能比较好
> - 利用全局锁实现读写隔离
> - 没有代码侵入，框架自动完成回滚和提交
>
> AT模式的缺点：
>
> - 两阶段之间属于软状态，属于最终一致
> - 框架的快照功能会影响性能，但比XA模式要好很多

#### 实现AT模式

AT模式中的快照生成、回滚等动作都是由框架自动完成，没有任何代码侵入，只不过，AT模式需要一个表来记录全局锁、另一张表来记录数据快照undo_log

```sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for lock_table
-- ----------------------------
DROP TABLE IF EXISTS `lock_table`;
CREATE TABLE `lock_table`  (
  `row_key` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `xid` varchar(96) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `transaction_id` bigint NULL DEFAULT NULL,
  `branch_id` bigint NOT NULL,
  `resource_id` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `table_name` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `pk` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `gmt_create` datetime NULL DEFAULT NULL,
  `gmt_modified` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`row_key`) USING BTREE,
  INDEX `idx_branch_id`(`branch_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = COMPACT;

SET FOREIGN_KEY_CHECKS = 1;
```

修改application.yml文件，将事务模式修改为AT模式

```yaml
seata:
  data-source-proxy-mode: AT # 默认就是AT
```

### TCC模式

**TCC模式与AT模式非常相似，每阶段都是独立事务，不同的是TCC通过人工编码来实现数据恢复,需要实现三个方法**

- **Try**  资源的检测和预留
- **Confirm**  完成资源操作业务；要求 Try 成功 Confirm 一定要能成功
- **Cancel**  预留资源释放，可以理解为try的反向操作

![image-20230106233352378](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677422-9395b959ce49c6cd6a83256366b1fa5a41fdbf71.png)

**Seata的TCC模型**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677472-ba67849937c3af57b73cd9fbce119ffaf513711e.png" alt="image-20230106233528900" style="zoom:50%;" />

> TCC的优点
>
> - 一阶段完成直接提交事务，释放数据库资源，性能好
> - 相比AT模型，无需生成快照，无需使用全局锁，性能最强
> - 不依赖数据库事务，而是依赖补偿操作，可以用于非事务型数据库
>
> TCC的缺点
>
> - 有代码侵入，需要人为编写try、Confirm和Cancel接口，太麻烦
> - 软状态，事务是最终一致
> - 需要考虑Confirm和Cancel的失败情况，做好幂等处理

#### 事务悬挂和空回滚

**空回滚** 当某分支事务的try阶段**阻塞**时，可能导致全局事务超时而触发二阶段的cancel操作。在未执行try操作时先执行了cancel操作，这时cancel不能做回滚，就是**空回滚**,执行cancel操作时，应当判断try是否已经执行，如果尚未执行，则应该空回滚

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677477-728b81d5d289f2439c5b85b1db0b8e577b4843dc.png" alt="image-20230106233829495" style="zoom:50%;" />

**业务悬挂** 对于已经空回滚的业务，之前被阻塞的try操作恢复，继续执行try，就永远不可能confirm或cancel ，事务一直处于中间状态，这就是**业务悬挂**,执行try操作时，应当判断cancel是否已经执行过了，如果已经执行，应当阻止空回滚后的try操作，避免悬挂

#### 实现TCC模式

**思路分析**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677481-f9f9b985562f85eeea147f9e2fd5027bccfb090e.png" alt="image-20230106234621201" style="zoom: 67%;" />

**创建表**

```sql
CREATE TABLE `account_freeze_tbl` (
  `xid` varchar(128) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL COMMENT '用户id',
  `freeze_money` int(11) unsigned DEFAULT '0' COMMENT '冻结金额',
  `state` int(1) DEFAULT NULL COMMENT '事务状态，0:try，1:confirm，2:cancel',
  PRIMARY KEY (`xid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
```

**声明TCC接口**

TCC的Try、Confirm、Cancel方法都需要在接口中基于注解来声明

![image-20230106235222709](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677487-7b88013b74e6c85b80deaaddb5f85850d15eb97b.png)

```java
@LocalTCC
public interface AccountTCCService {

    @TwoPhaseBusinessAction(name = "deduct", commitMethod = "confirm", rollbackMethod = "cancel")
    void deduct(@BusinessActionContextParameter(paramName = "userId") String userId,
                @BusinessActionContextParameter(paramName = "money")int money);

    boolean confirm(BusinessActionContext ctx);

    boolean cancel(BusinessActionContext ctx);
}
```

**编写实现类**

```java
@Service
@Slf4j
public class AccountTCCServiceImpl implements AccountTCCService {

    @Autowired
    private AccountMapper accountMapper;
    @Autowired
    private AccountFreezeMapper freezeMapper;

    @Override
    @Transactional
    public void deduct(String userId, int money) {
        // 0.获取事务id
        String xid = RootContext.getXID();
        // 1.扣减可用余额
        accountMapper.deduct(userId, money);
        // 2.记录冻结金额，事务状态
        AccountFreeze freeze = new AccountFreeze();
        freeze.setUserId(userId);
        freeze.setFreezeMoney(money);
        freeze.setState(AccountFreeze.State.TRY);
        freeze.setXid(xid);
        freezeMapper.insert(freeze);
    }

    @Override
    public boolean confirm(BusinessActionContext ctx) {
        // 1.获取事务id
        String xid = ctx.getXid();
        // 2.根据id删除冻结记录
        int count = freezeMapper.deleteById(xid);
        return count == 1;
    }

    @Override
    public boolean cancel(BusinessActionContext ctx) {
        // 0.查询冻结记录
        String xid = ctx.getXid();
        AccountFreeze freeze = freezeMapper.selectById(xid);

        // 1.恢复可用余额
        accountMapper.refund(freeze.getUserId(), freeze.getFreezeMoney());
        // 2.将冻结金额清零，状态改为CANCEL
        freeze.setFreezeMoney(0);
        freeze.setState(AccountFreeze.State.CANCEL);
        int count = freezeMapper.updateById(freeze);
        return count == 1;
    }
}
```

### SAGA模式

在 [Saga](https://seata.io/zh-cn/docs/user/saga.html) 模式下，分布式事务内有多个参与者，每一个参与者都是一个冲正补偿服务，需要用户根据业务场景实现其正向操作和逆向回滚操作。

分布式事务执行过程中，依次执行各参与者的正向操作，如果所有正向操作均执行成功，那么分布式事务提交。如果任何一个正向操作执行失败，那么分布式事务会去退回去执行前面各参与者的逆向回滚操作，回滚已提交的参与者，使分布式事务回到初始状态

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677493-bc53a1377e6eee17182b9f410f16d4a05d6815e4.png" alt="image-20230107000529968" style="zoom: 67%;" />

- 一阶段：直接提交本地事务
- 二阶段：成功则什么都不做；失败则通过编写补偿业务来回滚

> 优点：
>
> - 事务参与者可以基于事件驱动实现异步调用，吞吐高
> - 一阶段直接提交事务，无锁，性能好
>
> 缺点：
>
> - 软状态持续时间不确定，时效性差
> - 没有锁，没有事务隔离，会有脏写


|              | **XA**                         | **AT**                                       | **TCC**                                                    | **SAGA**                                                                                        |
| -------------- | -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **一致性**   | 强一致                         | 弱一致                                       | 弱一致                                                     | 最终一致                                                                                        |
| **隔离性**   | 完全隔离                       | 基于全局锁隔离                               | 基于资源预留隔离                                           | 无隔离                                                                                          |
| **代码侵入** | 无                             | 无                                           | 有，要编写三个接口                                         | 有，要编写状态机和补偿业务                                                                      |
| **性能**     | 差                             | 好                                           | 非常好                                                     | 非常好                                                                                          |
| **场景**     | 对一致性、隔离性有高要求的业务 | 基于关系型数据库的大多数分布式事务场景都可以 | •对性能要求较高的事务。  •有非关系型数据库要参与的事务。 | •业务流程长、业务流程多  •参与者包含其它公司或遗留系统服务，无法提供  TCC  模式要求的三个接口 |

### 高可用

**Seata的TC服务作为分布式事务核心，一定要保证集群的高可用性和异地容灾**

![image-20230107001446132](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677507-e9d83267b70c702544155447bf3ff3d866c3b07e.png)

微服务基于事务组（tx-service-group)与TC集群的映射关系，来查找当前应该使用哪个TC集群。当SH集群故障时，只需要将vgroup-mapping中的映射关系改成HZ。则所有微服务就会切换到HZ的TC集群了

#### TC服务的高可用和异地容灾

启动两台seata的tc服务节点


| 节点名称 | ip地址    | 端口号 | 集群名称 |
| ---------- | ----------- | -------- | ---------- |
| seata1   | 127.0.0.1 | 8091   | SH       |
| seata2   | 127.0.0.1 | 8092   | HZ       |

修改`seata2/conf/registry.conf`内容

```sh
registry {
  # tc服务的注册中心类，这里选择nacos，也可以是eureka、zookeeper等
  type = "nacos"

  nacos {
    # seata tc 服务注册到 nacos的服务名称，可以自定义
    application = "seata-tc-server"
    serverAddr = "127.0.0.1:8848"
    group = "DEFAULT_GROUP"
    namespace = ""
    cluster = "HZ"
    username = "nacos"
    password = "nacos"
  }
}

config {
  # 读取tc服务端的配置文件的方式，这里是从nacos配置中心读取，这样如果tc是集群，可以共享配置
  type = "nacos"
  # 配置nacos地址等信息
  nacos {
    serverAddr = "127.0.0.1:8848"
    namespace = ""
    group = "SEATA_GROUP"
    username = "nacos"
    password = "nacos"
    dataId = "seataServer.properties"
  }
}
```

启动Seata2

```powershell
seata-server.bat -p 8092
```

打开nacos控制台，查看服务列表

![image-20210624151150840](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677513-d5cd8aafc8b9b530b65600b6e280798419d57433.png)

详情查看

![image-20210624151221747](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677517-d0eb3a874dfed345d0cb470f54cc796242f5545e.png)

#### 将事务组映射配置到nacos

将tx-service-group与cluster的映射关系都配置到nacos配置中心

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677522-5e2ca5d3b8075edc9c0fe68eff3a11f6ff0755fb.png" alt="image-20230107002149659" style="zoom:50%;" />

```properties
# 事务组映射关系
service.vgroupMapping.seata-demo=SH

service.enableDegrade=false
service.disableGlobalTransaction=false
# 与TC服务的通信配置
transport.type=TCP
transport.server=NIO
transport.heartbeat=true
transport.enableClientBatchSendRequest=false
transport.threadFactory.bossThreadPrefix=NettyBoss
transport.threadFactory.workerThreadPrefix=NettyServerNIOWorker
transport.threadFactory.serverExecutorThreadPrefix=NettyServerBizHandler
transport.threadFactory.shareBossWorker=false
transport.threadFactory.clientSelectorThreadPrefix=NettyClientSelector
transport.threadFactory.clientSelectorThreadSize=1
transport.threadFactory.clientWorkerThreadPrefix=NettyClientWorkerThread
transport.threadFactory.bossThreadSize=1
transport.threadFactory.workerThreadSize=default
transport.shutdown.wait=3
# RM配置
client.rm.asyncCommitBufferLimit=10000
client.rm.lock.retryInterval=10
client.rm.lock.retryTimes=30
client.rm.lock.retryPolicyBranchRollbackOnConflict=true
client.rm.reportRetryCount=5
client.rm.tableMetaCheckEnable=false
client.rm.tableMetaCheckerInterval=60000
client.rm.sqlParserType=druid
client.rm.reportSuccessEnable=false
client.rm.sagaBranchRegisterEnable=false
# TM配置
client.tm.commitRetryCount=5
client.tm.rollbackRetryCount=5
client.tm.defaultGlobalTransactionTimeout=60000
client.tm.degradeCheck=false
client.tm.degradeCheckAllowTimes=10
client.tm.degradeCheckPeriod=2000

# undo日志配置
client.undo.dataValidation=true
client.undo.logSerialization=jackson
client.undo.onlyCareUpdateColumns=true
client.undo.logTable=undo_log
client.undo.compress.enable=true
client.undo.compress.type=zip
client.undo.compress.threshold=64k
client.log.exceptionRate=100
```

#### 微服务读取nacos配置

修改每一个微服务的application.yml文件，让微服务读取nacos中的client.properties文件

```yaml
seata:
  config:
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      username: nacos
      password: nacos
      group: SEATA_GROUP
      data-id: client.properties
```

重启微服务，现在微服务连接tc的集群，都统一由nacos的client.properties来决定
