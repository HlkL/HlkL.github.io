# 参考

[Redis中文网](https://www.redis.com.cn/)

[尚硅谷Redis 6学习笔记 - Komorebi_WH - 博客园 ](https://www.cnblogs.com/wenhaozou/articles/15858340.html)

[Redis主从复制原理总结 - 腾讯云开发者社区](https://cloud.tencent.com/developer/article/1644953)

[Redis哨兵模式详解 - 腾讯云开发者社区-腾讯云 ](https://cloud.tencent.com/developer/article/1409270)

[redis缓存穿透、缓存击穿、缓存雪崩问题与解决方案 - 柯南。道尔 - 博客园](https://www.cnblogs.com/shenStudy/p/16867966.html)

# Redis简介

官网 [Redis](https://redis.io/) 

![image-20221111152237144](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676443-759fbf4a6fe154bb4f6461e1e24f4310c7496e05.png)

> ***Redis*** 是一个开源的 ***key-value*** 存储系统，它支持存储的 ***value*** 类型包括 ***string、list、set、zset、sorted set、hash、***这些数据类型都支持 ***push/pop、add/remove*** 及取交集并集和差集等操作，而且这些操作都是原子性的,在此基础上，***Redis*** 还支持各种不同方式的排序，为了保证效率，***Redis*** 数据都是缓存在内存中, ***Redis*** 会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件,并且在此基础上实现了***master-slave*** （主从）同步
>
> ***Redis*** 是典型的 ***NoSQL*** 数据库，支持多种数据结构类型。设计思想是：**单线程+多路IO复用技术**

> *在此例子中,1,2,3号旅客都需要去火车站购买火车票,但是火车站人太多导致买不到票,于是通过黄牛去购票,而自己并不需要等待购票流程,把购票的任务交给黄牛去做,自己可以去做其他的事情,等黄牛买到票后便会通知旅客去拿*
>
> ![11](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676451-3deebea4df4b57012eaea426bd8f2b0f10b97c13.png)

# Redis配置

## 下载Redis解压

![image-20221107174209815](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676456-a9a062e9f374a80dffcc368f01012fe808e5db35.png)

![image-20221107174355879](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676594-a75c950336bc4906d42a7bfbcae5ebf9311176a5.png)

> 使用 ***make & make install*** 安装Redis,需要 ***GCC*** 环境
>
> 默认安装目录*** /usr/local/bin***
>
> - ***redis-benchmark*** 性能测试工具
> - ***redis-check-aof*** 修复有问题的aof文件
> - ***redis-check-dump***  修复有问题的dump.rdb文件
> - ***redis-sentienl*** 哨兵
> - ***redis-server*** Redis服务器启动
> - ***redis-cli*** 客户端

## 前台启动

![redis前台启动](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676599-49ab1bccea61de0ea57ae2ceead190784256fa3b.png)

## redis.conf文件

***Redis*** 的配置默认在 Redis 安装目录下

> * ***Units*** 配置大小单位，只支持 bytes，不支持 bit,大小写不敏感
> * ***INCLUDES*** 可以将多个配置文件导入进来
> * ***NETWORK*** 网络相关配置
>   - `bind=127.0.0.1` 只能接受本机的访问请求
>   - `protected-mode` 将本机访问保护模式
>   - `port` 端口号，默认 ***6379***
>   - `tcp-backlog` 在`linux`系统中控制tcp三次握手***已完成连接队列*** 的长度。在高并发系统中，你需要设置一个较高的`tcp-backlog`来避免客户端连接速度慢的问题（三次握手的速度）
>   - `timeout` 空闲的客户端维持多少秒会关闭，0 表示关闭该功能。即永不关闭
>   - `tcp-keepalive` 对访问客户端的一种心跳检测，每个 ***n*** 秒检测一次,只有 ***Linux*** 系统生效
> * ***GENERAL***
>   - `daemonize`是否为后台进程
>   - `pidfile`存放 ***pid*** 文件的位置，每个实例会产生一个不同的 ***pid*** 文件
>   - `loglevel` 日志记录级别，***Redis*** 总共支持四个级别：***debug、verbose、notice、warning***，默认为 ***notice***
>   - `logfile`日志文件名称
>   - `database` 数据库的数量
> * ***LIMITS***
>   - `maxclients`设置 ***redis*** 同时可以与多少个客户端进行连接
>   - `maxmemory` 最大内存设置,当 ***redis*** 到达内存使用上限，***redis*** 将会通过*** maxmemory-policy 设置的规则*** 移除内部数据
>   - ***maxmemory-policy***
>     - `volatile-lru` 使用 ***LRU*** 算法移除 ***key***，只对设置了过期时间的键（最近最少使用）
>     - `allkeys-lru` 在所有集合 ***key*** 中，使用 ***LRU*** 算法移除 ***key***
>     - `volatile-random` 在过期集合中移除随机的 ***key***，只对设置了过期时间的键
>     - `allkeys-random` 在所有集合 ***key*** 中，移除随机的 ***key***
>     - `volatile-ttl` 移除那些 ***TTL*** 值最小的 ***key***，即那些最近要过期的 ***key***
>     - `noeviction` 不进行移除。针对写操作，只是返回错误信息
>   - `maxmemory-samples` 设置样本数量

## 后台启动

![image-20221107174638823](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676605-87460bdf8dd8a8a14f9bd06c19a433ff69c5b7b0.png)

![开启远程服务](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676609-197282f00daa5f9c51d51503eceddfcef7bc8e70.png)

## 配置密码

![image-20221107174755060](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676619-8a01dec2a224cb5969747b82287236dc59796f5c.png)

## 开启&连接`Redis`

![直接使用密码连接](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676623-fd2f9c80e3a51bb230989a14264fa817dd4f250e.png)

![连接后使用密码](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676627-82e161af7a7bd3dd63bf285277cd771d57cd2a0b.png)

## 关闭连接

![关闭redis](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676631-a4105e9fd7b7c12b1d8eef0c8d33c1f95462aaf7.png)

![使用进程关闭redis](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676634-98d99d96a4790f8505b642dd18c0d2f8bfb9b778.png)

手机端 ***Termux*** 连接阿里云

1. **换源**

   ```bash
   sed -i 's@^\(deb.*stable main\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/termux-packages-24 stable main@' $PREFIX/etc/apt/sources.list
   
   sed -i 's@^\(deb.*games stable\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/game-packages-24 games stable@' $PREFIX/etc/apt/sources.list.d/game.list
   
   sed -i 's@^\(deb.*science stable\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/science-packages-24 science stable@' $PREFIX/etc/apt/sources.list.d/science.list
   
   apt update && apt upgrade
   ```



2. **安装ssh软件&连接服务器**

   ```bash
   apt install openssh
   ssh username@xxx.xxx.xxx.xxx
   ```



# 数据类型

## key键操作

> `set key value` 设置key
>
> `keys *` 查看当前库所有 ***key***
>
> `exists key` 判断 ***key*** 是否存在
>
> `type key `查看 ***key*** 数据类型
>
> `del` 删除指定key数据,直接删除
>
> `unlink`  根据value选择非阻塞删除,仅在`keysoace`元数据中删除,真正的删除会在后续的异步的操作中
>
> `expire key`  设置 ***key*** 过期时间
>
> `ttl key` 查看 ***key*** 过期时间，-1表示永不过期，-2表示已过期
>
> `select` 切换数据库
>
> `dbsize` 查看当前数据库 ***key*** 的数量
>
> `flushdb` 清空当前库
>
> `flushall`：通杀全部库

## 数据类型操作

### String

**`String `类型是最基本的类型，是二进制安全的。意味着 `Redis `的 `string `可以包含任何数据，比如 `jpg `图片或者序列化的对象，只要数据能够存储为字符串类型，redis都能通过k-v的形式存储**

**`String`的数据结构为简单的动态字符串,可以动态修改,类似`java`中的`ArrayList`,采用预分配冗余空间的方式减少内存消耗,字符串实际分配的内存空间一般高于字符串长度`strlen`,当字符串长度小于`1M`时,扩容都是加倍现有的空间,如果超过`1M`,扩容一次只会增加`1M`的空间,字符串的长度最大为`512M`**

> `set [key] [value] ` **设置key,可覆盖原先的值**
>
> `get [key]` **获取key的值**
>
> `append [key] [value]` **将给定的value追加到原值的末尾**
>
> `strlen [key]` 	**获取value的长度**
>
> `setnx [key] [value]` **设置不存在的key的值**
>
> `incr [key]` **将数字value的值增加1**
>
> `decr [key]` **减一**
>
> `incrby/decrby [key][步长]` 	**指定数值增减**
>
> `mset` `mget` `msetnx`  **批量操作**
>
> `getrange` `setrange` 	**指定位置操作左闭右开**
>
> `setex`	**设置key和过期时间**
>
> `getset`	**修改新值,获取旧值**

### List

**`Redis`*单值多键值在键在*列表是简单的字符串列表,按照插入的顺序排序,底层是个双向链表,数据结构为一个快速列表,在列表元素较少的时候会使用一块连续的内存存储,这个结构是`ziplist` 元素多时会使用`quicklist` **

1. **插入元素(左上右下)**

> `lpush` `rpush` **从左边插入元素&右边插入,`lpush` 类似队列先进后出,`rpush` 类似栈**
>
> `lrange` **查看指定位置的`list`元素**

![image-20221107153610446](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676647-287065be9cee06b38f1498273e13d49a2eef9eb3.png)

2. **获取元素(左上右下)**

> `lpop` `rpop` **从左&右弹出元素**
>
> `rpoplpush` **从[key1]右边弹出元素到[key2]的左边**
>
> ![image-20221107155305117](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676652-48fa07ae8b59100533181e9294c866f8cf60a032.png)
>
> `lindex` **按照索引下标获取元素 从左到右**
>
> `llen` **获取指定列表的长度**
>
> `linsert [key] before/after [newvalue]` **在[value]的前面/后面插入[value]  **
>
> `lrem` 从左边删除n个[value]
>
> `lset` 指定位置替换[value]

### Set

**`set` 是`String` 类型的*无序集合*,元素不重复.底层是一个`value` 为`null`的`hash`表,所有查找修改操作时间复杂度为O(1)**

> `sadd` 集合添加元素
>
> `smembers` 查看集合元素
>
> `sismember` 集合中是否存在元素
>
> `scard` 返回集合中元素个数
>
> `srem` 删除指定元素
>
> `spop` 随机弹出指定元素
>
> `srandmember` 随即从集合中取出N个元素,不会删除集合中的元素
>
> `smove` 把集合中的元素移动到另一个集
>
> `sinter` 返回多个集合的**交集**元素
>
> `sunion` 返回多个集合的**并集**元素
>
> `sdiff` 返回第一个集合与后面集合的**差集**

### Hash

**`hash` 类型使用的数据结构为`ziplist`和`hashtable` **

> `hset` 添加元素
>
> `hget` 获取元素
>
> ~~`hmset`~~ 批量设置`hash` 元素**已被弃用**
>
> `hexists` 判断是否存在`field`
>
> `hkeys` 列出`hash`集合中所有`field`
>
> `hincrby` 为哈希`key` 中的`field` 中的`value`增加指定值
>
> `hsetnx` 添加不存在`field`
>
> ![image-20221107225928324](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676658-8f4a64b12f62105bc9eb0d9c9c4333e7713442bf.png)

### Zset

`SortedSet` 给每一个元素赋予一个权重,内部根据权重值排序,可以通过权重的范围获取元素列表,使用 **跳跃表** 查询

> `zadd [key] [score] [value]` 添加一个或者多个元素
>
> `zrenge [WITHSCORES]` 获取指定位置元素 [WITHSCORES] 显示分数
>
> `zrangebyscore` 获取指定分数范围类由小到大的元素
>
> `zrevrangebyscore` 获取指定分数范围类由大到小的元素
>
> `zincrby` 指定元素的**score**增值
>
> `zrem` 删除指定元素
>
> `zcount` 统计指定范围元素个数
>
> `zrenk` 获取指定元素的排名,从0开始
>
> ![image-20221108135855854](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676663-a61c2a726741251fd6421cc3b52e36aa7f2269a8.png)

## 新数据类型

### Bitmaps

**Bitmaps 称为位图，是Redis提供给使用者用于操作位的“数据类型”。**

- Bitmaps 不是数据类型，底层就是字符串（key-value），byte数组。我们可以使用普通的get/set直接获取和设值位图的内容，也可以通过Redis提供的位图操作getbit/setbit等将byte数组看成“位数组”来处理
- Bitmaps 的“位数组”每个单元格只能存储0和1，数组的下标在Bitmaps中称为偏移量
- 如果设置的Bitmaps偏移量过大，容易造成分配内存时间过长，Redis服务器被阻塞

![image-20221108141047623](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676675-d52713f3ca8bb7c21c4e0bc1778de6fb3eb63a98.png)

> `setbit` `getbit` 获取和设置指定位置数值,设置的是bit位置
>
> `bitcount` 获取指定范围类比特值为1的个数计算的是byte位置
>
> `bitop [and/or/not/xor] [destkey] [key]` 将多个`bitmaps` 的 **交并非或** 集的结果放入`destkey`中
>
> ![image-20221108145640885](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676679-8d2695fa7c2dec7101c41face812e8d3271b1961.png)

### HyperLogLog

> `pfadd` `pfcount` 添加元素&计算个数
>
> `pfmerge` 合并
>
> ![image-20221108150231963](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676684-51a5b4699087e764c8ee9ff9c5beca101dd7a22b.png)

### Geospatial

**地址坐标信息** *经纬度设置*查询,和*范围*,*距离*的查询,*经纬度Hash*操作

> `geoadd` `geopos` 添加获取
>
> `geodist` 获取两个位置之间的直线距离
>
> - 单位 `M` 米`KM`千米 `MI` 英里  `FT` 英尺
> - 默认值 M
>
> ![image-20221108152554361](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676688-acb9a749015286702861a66946c3af7b65047cd9.png)
>
> `georedius` 以给定的经纬度为中心,找出指定半径内的元素

# Jedis操作

1. 导入依赖

   ```xml
   <dependencies>
       <!-- https://mvnrepository.com/artifact/redis.clients/jedis -->
       <dependency>
           <groupId>redis.clients</groupId>
           <artifactId>jedis</artifactId>
           <version>4.3.1</version>
       </dependency>
   
       <dependency>
           <groupId>junit</groupId>
           <artifactId>junit</artifactId>
           <version>4.13.2</version>
       </dependency>
   </dependencies>
   ```
2. `Redis`连接

   ```java
   public class Constant {
       public final static String REDIS_PASSWORD = "Nuli6854..";
   
       public static Jedis connectRedis(){
           //创建jedis对象
           Jedis jedis = new Jedis("47.115.221.10",6379);
           //连接密码
           jedis.auth(Constant.REDIS_PASSWORD);
           return jedis;
       }
   }
   ```
3. 数据类型操作

```java
public class JedisTest {
    /**
     * 创建redis连接
     */
    private static final Jedis jedis = Constant.connectRedis();

    @Test
    public void String(){
        //set不能以字符串批量元素只能以字节数组添加多个元素
        jedis.set("k1","v1");
        System.out.println("jedis.get(\"k1\") = " + jedis.get("k1"));
        byte[] keys = new byte[]{'a','b','c','d','e'};
        byte[] values = new byte[]{'1','2','3','4','5'};
        jedis.set(keys,values);
        //批量添加
        jedis.mset("k1","v1","k2","v2","k3","v3","k4","v4","k5","v5");
        System.out.println("jedis.append(\"k1\",\"1\") = " + jedis.append("k1", "1"));
        System.out.println("jedis.decrBy(\"abcde\",1000) = " + jedis.decrBy("abcde", 1000));
        System.out.println("jedis.keys(\"*\") = " + jedis.keys("*"));
        System.out.println("jedis.get(\"abcde\") = " + jedis.get("abcde"));
        System.out.println("jedis.incr(key) = " + jedis.incr(keys));
        System.out.println("jedis.dbSize() = " + jedis.dbSize());
        System.out.println("jedis.getrange(\"k1\",0,-1) = " + jedis.getrange("k1", 0, -1));
        jedis.flushDB();
        jedis.close();
    }

    @Test
    public void list(){
        jedis.lpush("k1","v1","v2","v3","v4","v5","v6","v7","v8","v9");
        jedis.rpush("k2","v1","v2","v3","v4","v5","v6","v7","v8","v9");
        System.out.println("jedis.lrange(\"k1\",0L,-1L) = " + jedis.lrange("k1", 0L, -1L));
        System.out.println("jedis.lrange(\"k2\",0L,-1L) = " + jedis.lrange("k2", 0L, -1L));

        System.out.println("jedis.lpop(\"k1\",2) = " + jedis.lpop("k1", 2));
        System.out.println("jedis.rpop(\"k2\",2) = " + jedis.rpop("k2", 2));

        jedis.flushDB();
        jedis.close();
    }

    @Test
    public void set(){
        jedis.sadd("k1","v1","v1","v2","v3","v4","v5","v5","v6","v6","v7","v8");
        jedis.sadd("k2","aa","bb","cc","dd","ee","ff","dd","ff","aa","bb","gg");
        System.out.println("jedis.scard(\"k1\") = " + jedis.scard("k1"));
        System.out.println("jedis.smembers(\"k1\") = " + jedis.smembers("k1"));
        System.out.println("jedis.srandmember(\"k1\") = " + jedis.srandmember("k1"));
        jedis.smove("k1","k2","7");
        System.out.println("jedis.sinter(\"k1\",\"k2\") = " + jedis.sinter("k1", "k2"));
        System.out.println("jedis.sunion(\"k1\",\"k2\") = " + jedis.sunion("k1", "k2"));
        jedis.flushDB();
        jedis.close();
    }

    @Test
    public void hash(){
        jedis.hset("k1","v1","1");
        HashMap<String, String> map = new HashMap<String,String>();
        map.put("v1","1");
        map.put("v2","2");
        map.put("v3","3");
        map.put("v4","4");
        map.put("v5","5");
        map.put("v6","6");
        jedis.hset("k2",map);
        System.out.println("jedis.hget(\"k1\",\"v1\") = " + jedis.hget("k1", "v1"));
        System.out.println("jedis.hkeys(\"k2\") = " + jedis.hkeys("k2"));
    }
}
```

4. `jedis`模拟发送手机短信

```java
public class JedisDemo {
    /**
     * 创建redis连接
     */
    private static final Jedis jedis = Constant.connectRedis();

    public static void main(String[] args) {

        System.out.print("请输入手机号获取验证码:");
        String phone = new Scanner(System.in).nextLine();
        if ( sendCode(phone) ){
            System.out.print("请输入获取的验证码:");
            verifyCode(phone,new Scanner(System.in).nextLine());
        }
    }

    /**
     * 获取随机验证码
     * @return
     */
    public static String getCode(){
        Random random = new Random();
        StringBuffer code = new StringBuffer();
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    /**
     * 发送短信
     * @param phone
     */
    public static boolean sendCode( String phone ){
        //发送短信次数
        String countKey = phone+"count";

        if( jedis.get(countKey) == null ){
            //设置验证码的过期时间
            jedis.setex(countKey,24*60*60,"1");
        } else if ( Integer.parseInt(jedis.get(countKey)) <= 2 ) {
            jedis.incr(countKey);
        }else {
            System.out.println("当前手机接收验证码已达上限,请明天在试!");
            jedis.close();
            return false;
        }

        System.out.println("验证码发送成功!");
        //获取验证码和失效时间
        jedis.setex(phone+"code",120,getCode());
        return true;
    }

    /**
     * 验证输入的验证码
     * @param phone
     * @param code
     */
    public static void verifyCode(String phone, String code ){
        if ( code == null ){
            System.out.println("请输入验证码");
            return;
        }
        String s = jedis.get(phone + "code");
        if( s == null ){
            System.out.println("验证码过期");
        } else if ( code.equals(s) ) {
            System.out.println("验证码正确");
            jedis.set(phone+"count","-1");
        }else {
            System.out.println("验证码错误");
        }
    }

}
```

![image-20221108224501104](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676698-1a1d84534ffc4c72896dbf7e0caf8a8a6b450127.png)

# 整合SpringBoot

1. 创建`springBoot`模块并添加`redis`依赖

   ```xml
   <!--   redis-->
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-redis</artifactId>
   </dependency>
   
   <!--  spring2.x 集成redis所需的 commons-pool2 -->
   <dependency>
       <groupId>org.apache.commons</groupId>
       <artifactId>commons-pool2</artifactId>
   </dependency>
   
   <!--  jackson -->
   <dependency>
       <groupId>com.fasterxml.jackson.core</groupId>
       <artifactId>jackson-databind</artifactId>
   </dependency>
   ```
2. 配置Redis

   ```yml
   spring:
     redis:
   #    服务器地址
       host: 47.115.221.10
   #    端口
       port: 6379
   #	 登录密码  
       password: 
   #    数据库索引
       database: 0
   #    连接超时时间
       timeout: 1800000
       lettuce:
         pool:
   #        连接池最大连接数(负数无限制)
           max-active: 20
   #        最大阻塞等待时间(负数无限制)
           max-wait: -1
   #        连接池空闲连接个数
           max-idle: 5
           min-idle: 0
   ---
   ```
3. `Redis`配置类

   ```java
   @EnableCaching
   @Configuration
   public class RedisConfig extends CachingConfigurerSupport {
   
       @Bean
       public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
           RedisTemplate<String, Object> template = new RedisTemplate<>();
           RedisSerializer<String> redisSerializer = new StringRedisSerializer();
           Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
           ObjectMapper om = new ObjectMapper();
           om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
           om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
           jackson2JsonRedisSerializer.setObjectMapper(om);
           template.setConnectionFactory(factory);
           //key序列化方式
           template.setKeySerializer(redisSerializer);
           //value序列化
           template.setValueSerializer(jackson2JsonRedisSerializer);
           //value hashmap序列化
           template.setHashValueSerializer(jackson2JsonRedisSerializer);
           return template;
       }
   
       @Bean
       public CacheManager cacheManager(RedisConnectionFactory factory) {
           RedisSerializer<String> redisSerializer = new StringRedisSerializer();
           Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
           //解决查询缓存转换异常的问题
           ObjectMapper om = new ObjectMapper();
           om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
           om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
           jackson2JsonRedisSerializer.setObjectMapper(om);
           // 配置序列化（解决乱码的问题）,过期时间600秒
           RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                   .entryTtl(Duration.ofSeconds(600))
                   .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(redisSerializer))
                   .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jackson2JsonRedisSerializer))
                   .disableCachingNullValues();
           return RedisCacheManager.builder(factory)
                   .cacheDefaults(config)
                   .build();
       }
   }
   ```
4. 创建`controller` 测试

![image-20221109005754353](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676706-20edd9e8f4af4c02e255805b404963dd3a97d0e4.png)

# 事务与锁

**Redis事务是一个单独的隔离操作,事务中的所有命令都会序列化,按顺序执行,事务在执行过程中不会被其他客户端发来的命令打断,Redis事务的主要作用就是`串联多个命令`防止被其他人命令插队**

`Multi` `Exec` `discard` **从输入`Multi`命令开始,输入的命令都会进入命令队列中,但不会执行,直到输入`Exec`后,`Redis`会将之前的命令队伍中的命令依次执行,组队过程中可以使用`discard`来放弃组队**

![image-20221109013347771](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676710-c9bc559aedb3e38847c179a21d43d19fdbcbb544.png)

## Multi  Exec  Discard 命令

> **`multi` `Exec` **操作
>
> ![image-20221109011422470](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676714-e37a2b187b7711bb773eae9fef935c435545807b.png)
>
> **`discard`**
>
> ![image-20221109011609448](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676720-c66d8fe03182cc730f478d86f8ff17af806d4891.png)

## 事务的错误处理

> - 组队中某个命令出现了报告错误,执行时整个队列中的命令都会被取消
> - ![image-20221109013502229](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676725-ec726f55315eb424a041fb2f75d300f30b8b5b9a.png)
> - 执行过程中某个命令出现错误,则只有出错的命令不被执行,而其他命令按顺序照常执行
> - ![image-20221109013535826](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676729-6cd0ca15ea400d8ad833b6084163f5c0d766eadb.png)
>
> ![image-20221109012733936](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676736-3f34a3bba7d8e4128d1ec1a67cf543e4499e7bf0.png)

## 乐观锁悲观锁

**参考博客**[乐观锁悲观锁](https://blog.csdn.net/WntD_/article/details/127711433)

> 命令：`watch key [key ...]`
>
> 在执行`multi`之前，先执行`watch key [key...]` ，可以监视一个或者多个key，如果事务在`exec`执行之前，这些key被其它命令所改动，那么事务将会被打断

## 秒杀案例

```java
public class SecKill_redis {

    public static void main(String[] args) {
        Jedis jedis =new Jedis("192.168.242.110",6379);
        System.out.println(jedis.ping());
        jedis.close();
    }

    //秒杀过程
    public static boolean doSecKill(String uid,String prodid) throws IOException {
        //1 uid和prodid非空判断
        if(uid == null || prodid == null){
            return false;
        }

        //2 连接redis
        Jedis jedis =new Jedis("192.168.xx.xxx",6379);

        //3 拼接key
        // 3.1 库存key
        String kcKey = "sk:"+prodid+":qt";
        // 3.2 秒杀成功用户key
        String userKey = "sk:"+prodid+":user";

        //4 获取库存，如果库存null，秒杀还没有开始
        String kc = jedis.get(kcKey);
        if(kc == null){
            System.out.println("秒杀还没开始，请稍等");
            jedis.close();
            return false;
        }

        // 5 判断用户是否重复秒杀操作
        if(jedis.sismember(userKey, uid)){
            System.out.println("每个用户只能秒杀成功一次，请下次再来");
            jedis.close();
            return false;
        }

        //6 判断如果商品数量，库存数量小于1，秒杀结束
        if(Integer.parseInt(kc) < 1){
            System.out.println("秒杀结束，请下次参与");
            jedis.close();
            return false;
        }

        //7 秒杀过程
        //7.1库存-1
        jedis.decr(kcKey);
        //7.2 把秒杀成功的用户添加到清单里面
        jedis.sadd(userKey,uid);
        System.out.println("用户" + uid + "秒杀成功");
        jedis.close();
        return true;
    }
}
```

# 持久化

## RDB

**在指定的`时间间隔`内将内存中的数据集`快照`写入磁盘(Redis默认机制)恢复时是将快照文件直接读到内存里,周期性地进行持久化的操作**

![rdb](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676744-f3b8e04ae65042250f75487f5a49dabe15d69a04.png)

> * **`Redis` 单独创建一个子进程`fork`进行持久化**
> * **先将`set` 操作的数据写入到一个临时文件中，持久化过程完成后，再将这个临时文件内容覆盖到 `dump.rdb`**
>
> - **整个过程中，主进程不进行任何的 `IO`操作，确保了极高的性能**
> - **同步过程中发生异常情况中断，不会导致数据库中的数据发生损坏，待同步过程完成后，用临时文件替代这个持久化的文件，保证了数据的完整性和一致性**
> - **最后一次持久化的数据可能丢失**

### Fork

**复制一个与当前进程一样的进程,新进程的所有数据（变量、环境变量、程序计数器等） 数值都和原进程一致，但是是一个全新的进程，并作为原进程的子进程**

> - **Redis进程执行fork操作创建子进程，RDB持久化过程由子进程负责，完成后自动结束,阻塞只发生在fork阶段，一般时间很短**
> - **在 `Linux`程序中，`fork`会产生一个和父进程完全相同的子进程，子进程由 `exec`系统调用，出于效率考虑，***Linux*** 中引入了 写时复制技术**
> - **一般情况父进程和子进程会共用同一段物理内存，只有进程空间的各段的内容要发生变化时，才会将父进程的内容复制一份给子进程**

### 特性

> - 适合大规模的数据恢复,对数据完整性和一致性要求不高更适合使用
> - 节省磁盘空间,恢复速度快
> - `Redis`主进程设置一个子进程来处理所有保存工作，主进程不需要进行任何磁盘IO操作
> - `Fork`的时候，内存中的数据被克隆了一份，大致 2 倍的膨胀性
> - 虽然 `Redis `在`fork`时使用了**写时拷贝技术**，但是如果数据庞大时还是比较消耗性能
> - 可能丢失最后一次快照数据

## AOF

**以日志的形式来记录每个写操作（增量保存），将`Redis`执行过的所有写指令记录下来， 只许追加文件但不可以改写文件,`Redis`启动之初会读取该文件重新构建数据，如果 `Redis` 重启就会`根据日志文件的内容`将写指令从前到后执行一次，以完成数据的恢复工作,如果在追加日志时，恰好遇到磁盘空间满、`inode `满或断电等情况导致日志写入不完整，也没有关系，`redis `提供了 `redis-check-aof` 工具，可以用来进行日志修复。**

> - 客户端的请求写命令会被 `append` 追加到 `AOF` 缓冲区内
> - `AOF` 缓冲区根据`AOF`持久化策略 `[always,everysec,no]` 将操作`sync`同步到磁盘的 `AOF` 文件中
> - `AOF`文件大小超过重写策略或手动重写时，会对`AOF`文件 ***Rewrite*** 重写，压缩`AOF`文件容量
> - `Redis` 服务重启时，会重新 `load` 加载`AOF`文件中的写操作达到数据恢复的目的
> - `AOF` 和`RDB`同时开启时，系统默认读取 ***AOF*** 的数据（数据不会丢失）
> - `redis.conf`中配置开启`AOF`，默认生成的配置文件为appendonly.aof，与rdb文件路径一致

### 修复出错aof文件

> 1. 备份被写坏的 AOF 文件
> 2. 运行 redis-check-aof –fix 进行修复
> 3. 用 diff -u 来看下两个文件的差异，确认问题点
> 4. 重启 redis，加载修复后的 AOF 文件

### 特性

> - 备份机制更稳健，丢失数据概率更低；
> - 可读的日志文本，通过操作 ***AOF*** 稳健，可以处理误操作
> - 比起 ***RDB*** 占用更多的磁盘空间（不仅记录数据还要记录操作）
> - 恢复备份速度要慢
> - 每次读写都同步的话，有一定的性能压力
> - 存在个别 ***Bug***，造成不能恢复

### AOF重写

在重写即将开始之际，redis 会创建（fork）一个“重写子进程”，这个子进程会首先读取现有的 AOF 文件，并将其包含的指令进行分析压缩并写入到一个临时文件中。

与此同时，主工作进程会将新接收到的写指令一边累积到内存缓冲区中，一边继续写入到原有的 AOF 文件中，这样做是保证原有的 AOF 文件的可用性，避免在重写过程中出现意外。

当“重写子进程”完成重写工作后，它会给父进程发一个信号，父进程收到信号后就会将内存中缓存的写指令追加到新 AOF 文件中。

当追加结束后，redis 就会用新 AOF 文件来代替旧 AOF 文件，之后再有新的写指令，就都会追加到新的 AOF 文件中了。

***AOF还有另外一个好处***

> `AOF `方式的另一个好处，我们通过一个“场景再现”来说明。某同学在操作 `redis `时，不小心执行了 `FLUSHALL`，导致 `redis `内存中的数据全部被清空了，这是很悲剧的事情。不过这也不是世界末日，只要 `redis `配置了 `AOF `持久化方式，且 `AOF `文件还没有被重写（rewrite），我们就可以用最快的速度暂停 `redis` 并编辑 `AOF `文件，将最后一行的 `FLUSHALL `命令删除，然后重启 `redis`，就可以恢复 `redis `的所有数据到 `FLUSHALL `之前的状态了。这是 `AOF `持久化方式的好处之一。但是如果 AOF 文件已经被重写了，那就无法通过这种方法来恢复数据了。

## Redis配置文件

> - 设置数据库文件的名称
>
>   ![image-20221109155033779](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676751-c2e0987146fc3cc1827fe8b11f85f602bbd65298.png)
> - 配置文件的保存位置,默认在`Redis` 的启动目录下
>
>   ![image-20221109155125337](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676754-2734957d338d28d9d76298eee925cdeceb15e5c9.png)
> - 当磁盘没有内存时,关闭`Redis`的写入,设置为*yes*
>
>   ![image-20221109160154895](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676757-726a99db86db05546bdfc82d8b7f75931c76661b.png)
> - 持久化文件是否压缩存储
>
>   ![image-20221109160921231](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676760-5ef43d1b13df945068c32fa19082b565915ce828.png)
> - 检查数据的完整和准确
>
>   ![image-20221109161144393](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676765-1f07064fa0f62855656528fb5e937c5bea1c2195.png)
> - 数据写入的时间间隔, 示例`save` `20` ` 3` 表示20秒内有三次数据的写入操作,20秒后则会将数据持久化,如果在20内服务器出现异常, 这20秒内的数据将会被丢失
>
>   ![image-20221109162318641](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676769-57316545291caa7fab7d6943702d85d3700e85c6.png)
> - 开启***AOF***
>
>   ![image-20221109164047554](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676774-f591effc2d4fc53a752504a31efc36c517277cdb.png)
> - ***AOF***文件名称
>
>   ![image-20221109164354663](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676778-44964870af99d59b0a343c11eb93a8659f942adf.png)
> - ***AOF***同步频率
> - ***always*** 都会立刻记入日志,性能较差但数据完整性比较好
> - ***everysec*** 每秒同步，每秒记入日志一次，如果宕机，本秒的数据可能丢失
> - ***no***  `Redis `不主动进行同步，把同步时机交给操作系统
>
>   ![image-20221109164623705](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676782-26ee4610709a663904fc89265336261cda748f49.png)
> - 指令压缩,当 ***AOF*** 文件的大小超过所设定的阈值时，***Redis*** 就会启动 ***AOF*** 文件的内容压缩，**只保留可以恢复数据的最小指令集**,可以使用命令 ***bgrewriteaof***
>
>   ![image-20221109165148156](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676785-cce2ed1e968cc6ecef5956173a892573d0b1d589.png)

## 总结

> 官方推荐两个都启用
>
> 如果对数据不敏感（允许数据有部分丢失），可以选单独用 ***RDB***
>
> 不建议单独用 ***AOF***，因为可能会出现 ***Bug***
>
> 如果只是做纯内存缓存，可以都不用

# 主从复制

**主机数据更新后根据配置和策略， 自动同步到备机的 master/slaver机制，Master以写为主，Slaver 以读为主，即主服务器承担写操作，复制的若干 从服务器 则承担读操作**

![image-20221109220730012](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676790-2fc04629ab4a06cf58e15d536b1d5d653b856677.png)

## 特征

> 1. 读写分离，性能扩展
>
>    ![image-20221109221015859](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676796-5a03f06c61bb99c465802e9f338f57d8d66fdffd.png)
> 2. 容灾快速恢复
>
>    - 某个从服务器发生故障，那么会快速切换到另一个从服务器中，不影响读操作的进行
> 3. 一主多从
>
>    - 只有一台主服务器，供其他从服务器进行复制

## 环境搭建

**配置**

```shell
include /myredis/redis.conf
pidfile /var/run/6379.pid
# 密码
masterauth xxxxxxx
# 可在配置文件中设置主机,也可以使用命令
slaveof  192.168.0.0 6379　
port 6379
dbfilename dump6379.rdb
```

启动全部***Redis***

从机设置主机 `slaveof [ip] [port]`

取消主机 `slaveof on one`

查看本机 `info replication`

查看进程 `ps -ef | grep redis`

开启服务器

![image-20221109223519212](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676801-26ac70ba459eb60c00552a79ff6ef2d84c377e41.png)

连接***Redis***

![image-20221109224454098](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676807-6487a1a73b16d2b60f4239c27cdfe65906933485.png)

主服务器

![image-20221110003059677](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676811-397d578ea072c5841f50452e5529457562d24fe8.png)

从服务器(1)

![image-20221110003115825](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676817-dd790a2fa791bd6980f4dee5facd32ea56957fb5.png)

从服务器(2)

![image-20221110003132656](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676821-431f2c2fb03b4561f274d387c4a0495058a7fc43.png)

测试

> 主服务器
>
> ![image-20221110003306468](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676825-62422a41a9bbc980b42adc32b398d1724a534ff1.png)
>
> 从服务器
>
> ![image-20221110003337402](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676829-b4f5486028e0e8095bb9480cba993c0d7e5074d2.png)
>
> ![image-20221110003348851](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676832-5d568049d110d3f20a6b73e5e8e3fb5d3d33dd96.png)

## 原理

> - 从服务器连接主服务器，发送***sync***命令,从服务器只有在连接时才会请求主服务器同步
> - 主服务器接收到***sync***命名后，开始执行***bgsave***命令生成***RDB***文件并使用缓冲区记录此后执行的所有写命令
> - 主服务器***bgsave***执行完后，向所有从服务器发送快照文件，并在发送期间继续记录被执行的写命令
> - 从服务器收到快照文件后丢弃所有旧数据，载入收到的快照
> - 主服务器快照发送完毕后开始向从服务器发送缓冲区中的写命令
> - 从服务器完成对快照的载入，开始接收命令请求，并执行来自主服务器缓冲区的写命令

## 增量同步

***Redis***增量复制是指***Slave***初始化后开始正常工作时主服务器发生的写操作同步到从服务器的过程

增量复制的过程主要是主服务器每执行一个写命令就会向从服务器发送相同的写命令，从服务器接收并执行收到的写命令

## Redis主从同步策略

*主从刚刚连接的时候，进行全量同步；全同步结束后，进行增量同步。当然，如果有需要，slave 在任何时候都可以发起全量同步。redis 策略是，无论如何，首先会尝试进行增量同步，如不成功，要求从机进行全量同步*

**注意点**

如果多个 ***Slave***断线了，需要重启的时候，因为只要Slave启动，就会发送***sync***请求和主机全量同步，当多个同时出现的时候，可能会导致***Master IO***剧增宕机。

***Redis***主从复制的配置十分简单，它可以使从服务器是主服务器的完全拷贝。需要清除***Redis***主从复制的几点重要内容：

- ***Redis***使用异步复制。但从***Redis 2.8***开始，从服务器会周期性的应答从复制流中处理的数据量
- 一个主服务器可以有多个从服务器
- 从服务器也可以接受其他从服务器的连接。除了多个从服务器连接到一个主服务器之外，多个从服务器也可以连接到一个从服务器上，形成一个图状结构
- Redis主从复制不阻塞主服务器端。也就是说当若干个从服务器在进行初始同步时，主服务器仍然可以处理请求
- 主从复制也不阻塞从服务器端。当从服务器进行初始同步时，它使用旧版本的数据来应对查询请求，假设你在redis.conf配置文件是这么配置的。否则的话，你可以配置当复制流关闭时让从服务器给客户端返回一个错误。但是，当初始同步完成后，需要删除旧的数据集和加载新的数据集，在这个短暂的时间内，从服务器会阻塞连接进来的请求
- 主从复制可以用来增强扩展性，使用多个从服务器来处理只读的请求（比如，繁重的排序操作可以放到从服务器去做），也可以简单的用来做数据冗余。
- 使用主从复制可以为主服务器免除把数据写入磁盘的消耗：在主服务器的redis.conf文件中配置“避免保存”（注释掉所有“保存“命令），然后连接一个配置为“进行保存”的从服务器即可。但是这个配置要确保主服务器不会自动重启（要获得更多信息请阅读下一段）

**主从复制的一些特点：**

- 采用异步复制
- 一个***master*** 可以含有多个  ***slaver* **
- 每个从服务器也可以接收来自其他  ***slaver* **服务器的连接
- 主从复制对于***master*** 服务器来说是非阻塞的，这意味着当  ***slaver* **服务器在进行主从复制同步过程中，***master*** 仍然可以处理外界的访问请求
- 主从复制对于  ***slaver* **服务器来说也是非阻塞的，这意味着，即使  ***slaver* **在进行主从复制过程中也可以接受外界的查询请求，只不过这时候  ***slaver* **返回的是以前老的数据， 如果你不想这样，那么在启动redis时，可以在配置文件中进行设置，那么  ***slaver* **在复制同步过程中来自外界的查询请求都会返回错误给客户端；（虽然说主从复制过程中对于  ***slaver* **是非阻塞的，但是当  ***slaver* **从 ***master*** 同步过来最新的数据后还需要将新数据加载到内存中，在加载到内存的过程中是阻塞的，在这段时间内的请求将会被阻，但是即使对于大数据集，加载到内存的时间也是比较多的）
- 主从复制提高了redis服务的扩展性，避免单个redis服务器的读写访问压力过大的问题，同时也可以给为数据备份及冗余提供一种解决方案
- 为了编码 ***master*** 服务器写磁盘压力带来的开销，可以配置让 ***master*** 不在将数据持久化到磁盘，而是通过连接让一个配置的  ***slaver* **服务器及时的将相关数据持久化到磁盘，不过这样会存在一个问题，就是 ***master*** 服务器一旦重启，因为 ***master*** 服务器数据为空，这时候通过主从同步可能导致  ***slaver* **服务器上的数据也被清空

## Redis主从同步实现

> **全量同步：** ***master***服务器会开启一个后台进程用于将redis中的数据生成一个rdb文件，与此同时，服务器会缓存所有接收到的来自客户端的写命令（包含增、删、改），当后台保存进程处理完毕后，会将该rdb文件传递给***slave***服务器，而***slave***服务器会将rdb文件保存在磁盘并通过读取该文件将数据加载到内存，在此之后***master***服务器会将在此期间缓存的命令通过redis传输协议发送给slave服务器，然后***slave***服务器将这些命令依次作用于自己本地的数据集上最终达到数据的一致性
>
> **部分同步：**从redis 2.8版本以前，并不支持部分同步，当主从服务器之间的连接断掉之后，***master***服务器和***slave***服务器之间都是进行全量数据同步，但是从redis 2.8开始，即使主从连接中途断掉，也不需要进行全量同步，因为从这个版本开始融入了部分同步的概念。部分同步的实现依赖于在***master***服务器内存中给每个slave服务器维护了一份同步日志和同步标识，每个***slave***服务器在跟***master***服务器进行同步时都会携带自己的同步标识和上次同步的最后位置。当主从连接断掉之后，***slave***服务器隔断时间（默认1s）主动尝试和***master***服务器进行连接，如果从服务器携带的偏移量标识还在***master***服务器上的同步备份日志中，那么就从***slave***发送的偏移量开始继续上次的同步操作，如果***slave***发送的偏移量已经不再***master***的同步备份日志中（可能由于主从之间断掉的时间比较长或者在断掉的短暂时间内***master***服务器接收到大量的写操作），则必须进行一次全量更新。在部分同步过程中，***master***会将本地记录的同步备份日志中记录的指令依次发送给***slave***服务器从而达到数据一致

## 无磁盘复制

完全同步需要在磁盘上创建一个RDB文件，然后加载这个文件以便为从服务器发送数据,如果使用比较低速的磁盘，这种操作会给主服务器带来较大的压力。Redis从2.8.18版本开始尝试支持无磁盘的复制,使用这种设置时，子进程直接将RDB通过网络发送给从服务器，不使用磁盘作为中间存储

## 只读从服务器

- 从Redis 2.6开始，从服务器支持只读模式，并且是默认模式。这个行为是由Redis.conf文件中的slave-read-only 参数控制的，可以在运行中通过***CONFIG SET***来启用或者禁用
- 只读的从服务器会拒绝所有写命令，所以对从服务器不会有误写操作。但这不表示可以把从服务器实例暴露在危险的网络环境下，因为像***DEBUG***或者***CONFIG***这样的管理命令还是可以运行的。不过你可以通过使用***rename-command***命令来为这些命令改名来增加安全性
- 你可能想知道为什么只读限制还可以被还原，使得从服务器还可以进行写操作。虽然当主从服务器进行重新同步或者从服务器重启后，这些写操作都会失效，还是有一些使用场景会想从服务器中写入临时数据的，但将来这个特性可能会被去掉

**限制有N个以上从服务器才允许写入**

从Redis 2.8版本开始，可以配置主服务器连接N个以上从服务器才允许对主服务器进行写操作。但是，因为Redis使用的是异步主从复制，没办法确保从服务器确实收到了要写入的数据，所以还是有一定的数据丢失的可能性

**这一特性的工作原理如下：**

- 从服务器每秒钟ping一次主服务器，确认处理的复制流数量
- 主服务器记住每个从服务器最近一次ping的时间
- 用户可以配置最少要有N个服务器有小于M秒的确认延迟
- 如果有N个以上从服务器，并且确认延迟小于M秒，主服务器接受写操作

> ***min-slaves-to-write***						最小从服务器数
>
> **min-slaves-max-lag**						从服务器最大确认延迟

**通过redis实现服务器崩溃等数据恢复**

由于redis存储在内存中且提供一般编程语言常用的数据结构存储类型，所以经常被用于做服务器崩溃宕机的数据恢复处理。服务器可以在某些指定过程中将需要保存的数据以json对象等方式存储到redis中，也就是我们常说的快照，当服务器运行时读取redis来判断是否有待需要恢复数据继续处理的业务。当一次业务处理结束后再删除redis的数据即可

# 哨兵模式

![image-20221111171459525](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676839-b6088c7c59f552f6637f4b6b8b5357eb3f17ff65.png)

**即能够后台监控主机是否故障，如果故障了根据投票数自动将从库转换为主库,主机挂掉，哨兵监控到之后，会按照选举的规则，从 从机 中选举中产生新的主机，原来挂掉的主机会变成新主机的从机,哨兵也能监控其他的哨兵**

**sentinel.conf文件**

```shell
sentinel monitor main 172.0.0.1 6379 1
sentinel auth-pass main xxxxxx
# mymaster：给监控对象起的服务器名称
# 1：至少有多少个哨兵同意迁移的数量
# 主机设置了密码需要在文件中配置              
```

通过 **redis-sentinel   sentinel.conf** 命令 启动哨兵

![image-20221111171850091](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676844-4b07c9557ef3272c30e518d77aa42fba8ff19750.png)

## 选举规则

选择条件依次为

- 根据优先级别，***slave-priority/replica-priority***，**优先选择优先级靠前的**
- 根据偏移量，***优先选择原主机数据最全的***
- 若前两个条件相同，那么选择 ***runid*** 最小的(每个redis实例启动后，都会随机生成一个40位的runid

## 复制延时

由于所有的写操作都是先在 ***master*** 上操作，然后同步更新到 ***slave*** 上，所以从 ***master*** 同步到 ***slave*** 从机有一定的延迟，当系统很繁忙的时候，延迟问题会更加严重，***slave*** 机器数量的增加也会使这个问题更加严重

# 集群

集群自带哨兵模式,当集群中的某个主机 down 掉后,集群会自动从该主机下的从机中按规选举出新的主机,***当主机重新上线后,会做为新选举主机***的从机,每个主机节点都会分配一块单独的 ***slot*** 空间,每个节点都只能对自己 ***slot*** 范围内的数据进行操作

**配置文件**

```shell
include /myredis/redis.conf
pidfile /var/run/6391.pid
port 6391
dbfilename 6391.rdb
# 打开集群模式
cluster-enabled yes
# 设置节点配置文件名称
cluster-config-file nodes-6391.conf
 # 设置节点超时时间(ms)，超过该时间集群自动进行主从切换
cluster-node-timeout 15000
```

***启动所有服务器***

![image-20221110200609606](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676850-157aada1e65a99db1815acf223e16b629fa3c6c4.png)

**启动集群 **

```shell
redis-cli --cluster create --cluster-replicas 1 127.0.0.1:6379 127.0.0.1:6389 127.0.0.1:6380 127.0.0.1:6390 127.0.0.1:6381 127.0.0.1:6391 -a password
```

![image-20221110200648739](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676855-da2ca8482d7cfcab393631af778a9d1d10bc4762.png)

> - 如果服务器设置了密码,需要使用 ***-a*** 命令设置密码连接
> - ***cluster-replicas 1*** 表示希望为集群中的每个主节点创建一个从节点(一主一从)
> - 开启集群后可以通过任意一个服务器连接

***连接集群***

```shell
redis-cli -c -p port -a password
```

![image-20221110202429610](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676860-bd96b4e0837d2b4c9b159cc77c3e1d9b051f1552.png)

***集群操作***

> - *** cluster nodes*** 查看集群节点信息
>   - ***myself*** 当前节点,***connected  0-xxxx*** 节点插槽范围
>
> ![image-20221110201202150](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676864-a050de1e33a11291a39255f419d9c262dcf6f02c.png)
>
> - 在集群中的每次操作，***redis*** 都会计算出该 ***key*** 应该送往的插槽，如果不是该客户端对应服务器的插槽，***redis*** 会报错，并告知应前往的 ***redis*** 实例地址和端口
>
> ![image-20221110202513096](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676869-b7807fba6f37b6f458b52f01ad03074d2da500da.png)
>
> - 插入操作,***多键操作需要用组***
>
>   - false
>
>     ![image-20221110202739080](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676873-425f12b9b1eb012b30000051348bf6ca43980a72.png)
>   - true
>
>     ![image-20221110202939678](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676877-ef8f5ff93bf0515c3eac57adc7a71f5d8e60cac7.png)
> - 查看key所在的插槽
>
> ![image-20221110203318318](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676880-3bab8ef8ee930cbbc308cfe706eede5210c99675.png)
>
> - 查看当前服务器指定插槽中key的个数
>
>   ```shell
>   cluster countkeysinslot xxxxx
>   ```
> - 查询集群中的值
>
>   ```shell
>   cluster getkeysinslot xxxxx
>   ```

**特性**

- 如果某一段插槽的主从都挂掉，而 ***cluster-require-full-coverage=yes***，那么 ，整个集群都挂掉
- 如果某一段插槽的主从都挂掉，而 ***cluster-require-full-coverage=no***，那么，该插槽数据全都不能使用，也无法存储

# 缓存穿透

![image-20221111200751764](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676887-4e173352c4808c198b305ff6aba199a7ecd3ebfe.png)

用户想要查询一个数据，访问发现 ***redis缓存和数据库都没有*** 该数据,这种数据库中也找不到对应的数据，就不会写入缓存中，缓存也失去了意义，当有人利用不存在的数据去频繁访问，这样会导致查询请求"跳过缓存"直接去访问数据库，会导致数据库的压力增大，甚至崩溃

**解决办法**

> - **对空值缓存**
>
>   如果一个查询返回的数据为空（不管是数据是否不存在），仍然把这个空结果（***null***）进行缓存，设置空结果的过期时间会很短，最长不超过五分钟
> - **设置白名单**
>
>   使用 ***bitmaps*** 类型定义一个可以访问的名单，名单 ***id*** 作为 ***bitmaps*** 的偏移量，每次访问和 ***bitmap*** 里面的 ***id*** 进行比较，如果访问 ***id*** 不在 ***bitmaps*** 里面，进行拦截，则不允许访问
> - **采用布隆过滤器**
>
>   布隆过滤器可以用于检索一个元素是否在一个集合中。它的优点是空间效率和查询时间都远远超过一般的算法**，**缺点是有一定的误识别率和删除困难，命中率不一定高
>
>   将所有可能存在的数据哈希到一个足够大的 ***bitmaps*** 中，一个一定不存在的数据会被这个 ***bitmaps*** 拦截掉，从而避免了对底层存储系统的查询压力
> - **进行实时监控**
>
>   当发现 ***Redis*** 的命中率开始急速降低，需要排查访问对象和访问的数据，和运维人员配合，设置黑名单限制服务

# 缓存击穿

![image-20221111203330146](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676893-e74643a31b143ea67cdcf818d43825a0f00f27c0.png)

当一个key是**热点数据**，不同用户同时(多并发)访问，并且长时间处理这样的高并发的状态，当这个key失效的瞬间，会导致高并发量的请求直接访问数据库,导致数据库压力增大，甚至崩溃

**解决办法**

> 1. 预先在缓存中设置热门数据
> 2. 在 ***redis*** 高峰访问时，实时监控**热门数据**,延长**热门数据 key**的失效时长
> 3. 设置热门数据永不过时
> 4. 使用锁,只让一个线程构建缓存，其他线程等待缓存构建完毕后，重新从缓存中获取结果

**与缓存穿透的区别**

> - 缓存穿透是频繁的访问**不存在的key**,造成“缓存失效”
> - 缓存击穿是频繁的访问 **失效的 key**

# 缓存雪崩

![image-20221111204000908](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676898-3e444b24370130e91cf763820fc709c27542a49f.png)

在某一时间段，缓存中的大量数据集中过期失效或者***redis***缓存宕机，导致请求全部访问数据库，导致数据库压力增大，甚至崩溃

**解决办法**

> - 构建多级缓存架构 **nginx缓存 + redis缓存 + 其他缓存（ehcache等**
> - 用加锁或者队列的方式保证来保证不会有大量的线程对数据库一次性进行读写，从而避免失效时大量的并发请求落到底层存储系统上。**不适用高并发情况**
> - 记录缓存数据是否过期（设置提前量）快过期的时候，提前进行一个缓存。如果过期会触发通知另外的线程在后台去更新实际 ***key*** 的缓存
> - 将每个key的失效时间分散

# 分布式锁

随着业务发展的需要，原单体单机部署的系统被演化成分布式集群系统后，由于分布式系统多线程、多进程并且分布在不同机器上，这将使原单机部署情况下的并发控制锁策略失效，单纯的Java API并不能提供分布式锁的能力。为了解决这个问题就需要一种跨JVM的互斥机制来控制共享资源的访问，这就是分布式锁要解决的问题！

分布式锁主流的实现方案：

- 基于数据库实现分布式锁
- 基于缓存（Redis等）
- 基于Zookeeper

**Redis设置锁**

```shell
# nx 上锁  ex 设置过期时间
set key value nx ex time 
```

**锁分布式锁产生的问题**

1. ***a服务器***在上锁过程中出现异常,造成锁的有效时间过期被提前释放,此时***b服务器***抢到了锁,在进行上锁的时候,***a服务器***恢复正常运行,进行释放锁操作,导致把***b服务器***的锁提前释放

![image-20221111211516660](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676905-aba4cb12fc5d28bc7e0708f068003c4acd460164.png)**解决办法:** 给每个锁设置一个 **id** ,在释放锁的时候,**判断当前id** 和**要释放锁的id** 是否一致

2. a服务器在比较完**id**后打算释放,但此时**锁的有效时间**过期导致被**b服务器抢到**了锁,这时a执行释放锁操作,因为已经比较过id,导致a服务器释放了b的锁

   ![image-20221111213110655](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676910-a94f42864a41ffd9092787afc0d7c6977298f402.png)

**解决办法:** 使用lua脚本保证删除的原子性

**为了保证分布式锁的可用性,必须保证**

> - 互斥性,在任意时刻，只有一个客户端能持有锁
> - 不会发生死锁,即使有一个客户端在持有锁的期间崩溃而没有主动解锁，也能保证后续其他客户端能加锁
> - 解铃还须系铃人,加锁和解锁必须是同一个客户端，客户端自己不能把别人加的锁给解了
> - 加锁和解锁必须具有原子性

# ACL

> `acl list`  展现用户权限列表
>
> `acl cat` 查看添加权限指令类别和指定类型的具体操作
>
> `acl whoami` 查看当前用户
>
> `aclsetuser` 创建和编辑用户ACL
>
> - `on`  `off`激活/禁用用户账号
> - `+[command]`  ``+[command]`   添加/删除 用户的操作指令
>
> `acl setuser` 创建新用户默认权限
>
> `acl setuser user2 on ]password ~cached:* +get` 设置用户名、密码、ACL权限、和启用的用户
