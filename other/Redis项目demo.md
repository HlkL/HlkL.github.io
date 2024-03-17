## 1. 短信验证码登录

1. 将前端传进来的userDto,通过hash结构保存到redis中,保存为token存放到请求头中,实现多个服务器共享
2. 通过登录拦截器刷新token的过期时间,并将数据保存到threadlocal中
   - 一个拦截器是更新拦截器,主要是更新token的有效期,一个拦截不合法的路径,更新拦截器首先获得token对象 如果token为空直接放行。若不为空的话token刷新token的有效期，然后用token从redis里面拿出UserDTO的map对象,然后把map对象转换为UserDTO对象,存入ThreadLocal域中。在拦截器执行之后将TheadLocal域中的对象释放掉,避免发生内存泄漏.一个拦截器只用判断ThreadLocal域中有没有UserDTO对象,如果有则放行,如果没有就拦截.

## 2. 店铺查询

### 2.1 缓存雪崩,缓存穿透

> 缓存雪崩 : 同一时段大量的缓存key同时失效或者Redis服务宕机，导致大量请求到达数据库，带来巨大压力
>
> - 给不同的Key的TTL添加随机值
> - 利用Redis集群提高服务的可用性
> - 给缓存业务添加降级限流策略
> - 给业务添加多级缓存
>
> 缓存穿透 : 客户端请求的数据在缓存中和数据库中都不存在，这样缓存永远不会生效，这些请求都会打到数据库
>
> - 缓存空对象
>   优点：实现简单，维护方便
>   缺点：额外的内存消耗，可能造成短期的不一致
>   **适合命中不高，但可能被频繁更新的数据**
> - 布隆过滤
>   优点：内存占用较少，没有多余key
>   缺点：实现复杂，存在误判可能
>
> ***访问数据库不存在数据返回null值,添加数据到redis中设置添加随机过期时间,将频繁访问的key设置为null***
>
> <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678384-69b76a635057f6537c8af937362e88a68b1393ac.png" alt="image-20221202204132091" style="zoom: 33%;" /> <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678393-c0c1e0993f79328cd23e3758fabab281b0452836.png" alt="image-20221202204332664" style="zoom: 25%;" />

```java
    private Result cachePenetrationQueryShop( Long id ) {
        //查询redis缓存是否存在店铺信息,使用string类型
        String shopJson = stringRedisTemplate.opsForValue().get( RedisConstants.CACHE_SHOP_KEY + id );
        //redis中存在店铺信息
        if ( StrUtil.isNotBlank( shopJson ) ) {
            //将json转化为shop对象
            Shop shop = JSONUtil.toBean( shopJson, Shop.class );
            log.info( "queryShopById return shop cache" );
            return Result.ok( shop );
        }

        //判断命中的数据是否为空值
        if ( shopJson != null ) {
            return Result.fail( "店铺信息不存在" );
        }

        //查询数据库
        Shop shop = this.getById( id );

        //添加随机失效时间,防止缓存雪崩
        int randomTime = new Random().nextInt( 5 );

        //店铺信息不存在
        if ( shop == null ) {
            log.info( "shop is null" );
            //将空值缓存到redis中,防止缓存穿透
            stringRedisTemplate.opsForValue().set( RedisConstants.CACHE_SHOP_KEY + id, "",
                    RedisConstants.CACHE_NULL_TTL + randomTime, TimeUnit.MINUTES );
            return Result.fail( "店铺不存在" );
        }

        //将查询的数据更新到缓存中
        stringRedisTemplate.opsForValue().set( RedisConstants.CACHE_SHOP_KEY + id, JSONUtil.toJsonStr( shop ),
                RedisConstants.CACHE_SHOP_TTL + randomTime, TimeUnit.MINUTES );
        log.info( "queryShopById return shop data" );
        return Result.ok( shop );
    }
```

### 2.2 互斥锁解决缓存击穿

> 缓存击穿 : 缓存击穿问题也叫热点Key问题，就是一个被高并发访问并且缓存重建业务较复杂的key突然失效了，无数的请求访问会在瞬间给数据库带来巨大的冲击
> 常见的解决方案有两种：
>
> - 互斥锁
> - 逻辑过期
>
> <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678398-a2fa66de85e00c4fb1705e25032b2de8e4f49622.png" alt="image-20221202204628809" style="zoom:50%;" />

```java
    private Result queryThroughMutexShop( Long id ) {
        //查询redis缓存是否存在店铺信息,使用string类型
        String shopJson = stringRedisTemplate.opsForValue().get( RedisConstants.CACHE_SHOP_KEY + id );
        //redis中存在店铺信息
        Shop shop;
        if ( StrUtil.isNotBlank( shopJson ) ) {
            //将json转化为shop对象
            shop = JSONUtil.toBean( shopJson, Shop.class );
            log.info( "queryShopById return shop cache" );
            return Result.ok( shop );
        }

        //判断命中的数据是否为空值
        if ( shopJson != null ) {
            return Result.fail( "店铺信息不存在" );
        }

        try {
            //获取互斥锁
            boolean lock = this.tryLock( id );
            if ( !lock ) {
                //没有获取,当前数据正在被其他线程操作,休眠等待并重试
                Thread.sleep( 50 );
                this.queryThroughMutexShop( id );
            }

            //查询数据库
            shop = this.getById( id );
            //高并发test
            Thread.sleep( 200 );

            //添加随机失效时间,防止缓存雪崩
            int randomTime = new Random().nextInt( 5 );

            //店铺信息不存在
            if ( shop == null ) {
                log.info( "shop is null" );
                //将空值缓存到redis中,防止缓存穿透
                stringRedisTemplate.opsForValue().set( RedisConstants.CACHE_SHOP_KEY + id, "",
                        RedisConstants.CACHE_NULL_TTL + randomTime, TimeUnit.MINUTES );
                return Result.fail( "店铺不存在" );
            }

            //将查询的数据更新到缓存中
            stringRedisTemplate.opsForValue().set( RedisConstants.CACHE_SHOP_KEY + id, JSONUtil.toJsonStr( shop ),
                    RedisConstants.CACHE_SHOP_TTL + randomTime, TimeUnit.MINUTES );
            log.info( "queryShopById return shop data" );

        } catch ( InterruptedException e ) {
            throw new RuntimeException( e );
        } finally {
            //释放锁
            this.unLock( id );
        }

        return Result.ok( shop );
    }
```

### 2.3  逻辑过期解决缓存击穿

> <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678404-8a368625af96d9b52642060db2a3076ec1e3875d.png" alt="image-20221202205332915" style="zoom: 33%;" /><img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678410-41643458eff44a851e7449a36f531c28e8e54ea7.png" alt="image-20221202205448807" style="zoom: 33%;" />

```java
private Result logicalExpiration( Long id ) {
        //查询redis缓存是否存在店铺信息,使用string类型
        String shopJson = stringRedisTemplate.opsForValue().get( RedisConstants.CACHE_SHOP_KEY + id );

        //redis中存在店铺信息
        if ( StrUtil.isBlank( shopJson ) ) {
            log.info( "shop is null" );
            return Result.ok( shopJson );
        }

        //把json反序列化为对象
        RedisData redisData = JSONUtil.toBean( shopJson, RedisData.class );
        //获取对象信息
        JSONObject jsonObject = ( JSONObject ) redisData.getData();
        //将jsonObject转化为Shop
        Shop shop = JSONUtil.toBean( jsonObject, Shop.class );

        //判断缓存是否过期
        LocalDateTime expireTime = redisData.getExpireTime();
        if ( expireTime.isAfter( LocalDateTime.now() ) ) {
            log.info( "queryShopById return shop cache" );
            return Result.ok( shop );
        }

        //获取互斥锁
        boolean lock = this.tryLock( id );

        if ( lock ) {
            try {
                //创建独立线程,让独立线程去更新缓存
                CACHE_REBUILD_EXECUTOR.submit( () -> this.updateShopCache( id ) );
            } catch ( Exception e ) {
                throw new RuntimeException( e );
            } finally {
                //释放锁
                this.unLock( id );
            }
        }

        //没有获取到锁,返回旧数据
        log.info( "queryShopById return old shop cache" );
        return Result.ok( shop );
    }
```

### 2.4 工具类封装

```java
@Slf4j
@Component
public class CacheClient {

    private final StringRedisTemplate stringRedisTemplate;

    /**
     * 创建线程池
     */
    private static final ExecutorService CACHE_REBUILD_EXECUTOR = new ThreadPoolExecutor( 10, 100,
            1, TimeUnit.MINUTES,
            new ArrayBlockingQueue<>( 10 ),
            new UtilityElf.DefaultThreadFactory( "CacheClient", false ) );

    public CacheClient( StringRedisTemplate stringRedisTemplate ) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    /**
     * 添加缓存
     */
    private void set( String key, Object value, Long time, TimeUnit unit ) {
        //添加随机失效时间,防止缓存雪崩
        int randomTime = new Random().nextInt( 5 );
        this.stringRedisTemplate.opsForValue().set( key, JSONUtil.toJsonStr( value ), time + randomTime, unit );
    }

    /**
     * 添加缓存,设置逻辑过期时间
     */
    private void setWithLogicalExpire( String key, Object value, Long time, TimeUnit unit ) {
        RedisData redisData = new RedisData();
        redisData.setData( value );
        //设置逻辑过期时间
        redisData.setExpireTime( LocalDateTime.now().plusSeconds( unit.toSeconds( time ) ) );
        this.stringRedisTemplate.opsForValue().set( key, JSONUtil.toJsonStr( redisData ) );
    }


    /**
     * 缓存穿透
     * @param keyPrefix 前缀
     * @param dataId id
     * @param type  操作对象数据类型
     * @param dbFallback  操作对象数据库信息
     * @param time  时间
     * @param unit 单位
     * @param <R> 返回结果
     * @param <ID>  id
     * @return R
     */
    public <R, ID> R cachePenetrationQuery( String keyPrefix, ID dataId, Class<R> type,
                                            Function<ID, R> dbFallback, Long time, TimeUnit unit ) {

        //查询redis缓存是否存在店铺信息,使用string类型
        String json = stringRedisTemplate.opsForValue().get( keyPrefix + dataId );
        //redis中存在店铺信息
        if ( StrUtil.isNotBlank( json ) ) {
            return JSONUtil.toBean( json, type );
        }

        //判断命中的数据是否为空值
        if ( json != null ) {
            return null;
        }

        //查询数据库
        R apply = dbFallback.apply( dataId );

        //店铺信息不存在
        if ( apply == null ) {
            //将空值缓存到redis中,防止缓存穿透
            this.set( keyPrefix + dataId, "", time, unit );
            return null;
        }

        //将查询的数据更新到缓存中
        this.set( keyPrefix + dataId, apply, time, unit );
        return apply;
    }


    /**
     * 互斥锁解决击穿
     */
    public <R, ID> R queryThroughMutex( String keyPrefix, ID dataId, Class<R> type,
                                        Function<ID, R> dbFallback, Long time, TimeUnit unit ) {

        //查询redis缓存是否存在店铺信息,使用string类型
        String json = stringRedisTemplate.opsForValue().get( keyPrefix + dataId );
        //redis中存在店铺信息
        if ( StrUtil.isNotBlank( json ) ) {
            return JSONUtil.toBean( json, type );
        }

        //判断命中的数据是否为空值
        if ( json != null ) {
            return null;
        }

        //获取互斥锁
        boolean isLock = this.tryLock( RedisConstants.LOCK_SHOP_KEY + dataId );
        R apply = null;
        try {
            if ( !isLock ){
                Thread.sleep( 50 );
                return this.queryThroughMutex( keyPrefix,dataId,type,dbFallback,time,unit );
            }

            //查询数据库
            apply = dbFallback.apply( dataId );

            //店铺信息不存在
            if ( apply == null ) {
                //将空值缓存到redis中,防止缓存穿透
                this.set( keyPrefix + dataId, "", time, unit );
                return null;
            }

            //将查询的数据更新到缓存中
            this.set( keyPrefix + dataId, apply, time, unit );
        } catch ( InterruptedException e ) {
            throw new RuntimeException( e );
        }finally {
            unLock( RedisConstants.LOCK_SHOP_KEY + dataId );
        }

        return apply;
    }

    /**
     * 逻辑过期,解决缓存击穿
     */
    public <R, ID> R logicalExpiration( String keyPrefix, ID dataId, Class<R> type,
                                        Function<ID, R> dbFallback, Long time, TimeUnit unit ) {

        //查询redis缓存是否存在店铺信息,使用string类型
        String json = stringRedisTemplate.opsForValue().get( keyPrefix + dataId );
        //redis中存在店铺信息
        if ( StrUtil.isBlank( json ) ) {
            return null;
        }

        //把json反序列化为对象
        RedisData redisData = JSONUtil.toBean( json, RedisData.class );
        //获取对象信息
        JSONObject jsonObject = ( JSONObject ) redisData.getData();
        //将jsonObject转化为Shop
        R r = JSONUtil.toBean( jsonObject, type );

        if ( redisData.getExpireTime().isAfter( LocalDateTime.now() ) ){
            return r;
        }

        boolean isLock = this.tryLock( RedisConstants.LOCK_SHOP_KEY + dataId );
        if( isLock ){

            //创建独立线程更新缓存
            CACHE_REBUILD_EXECUTOR.submit( ()->{
                try {
                    R apply = dbFallback.apply( dataId );
                    this.setWithLogicalExpire( keyPrefix + dataId,apply,time,unit );
                } catch ( Exception e ) {
                    throw new RuntimeException( e );
                } finally {
                    unLock( RedisConstants.LOCK_SHOP_KEY + dataId );
                }
            } );

        }

        //返回旧数据
        return r;
    }


    /**
     * 添加互斥锁
     */
    private boolean tryLock( String key ) {
        //setnx
        Boolean flag = stringRedisTemplate.opsForValue().setIfAbsent( key, "lock",
                RedisConstants.LOCK_SHOP_TTL, TimeUnit.SECONDS );
        //自动拆箱可能出现null值
        return BooleanUtil.isTrue( flag );
    }

    /**
     * 释放互斥锁
     */
    private void unLock( String key ) {
        stringRedisTemplate.delete( key );
    }

}
```

## 3. 优惠券秒杀

### 3.0全局唯一ID

> <img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678419-301c365a9259ce77ecbe6c22fa08621ca0220eb2.png" alt="image-20221202213428626" style="zoom:33%;" />
>
> - 符号位:1bit,永远为0
> - 时间戳:31bit,以秒为单位,可使用69年
> - 序列号:32bit,秒内的计数器,支持每秒产生2^32割不同的id

```java
public class RedisIdWorker {
    /**
     * 开始时间戳
     */
    private static final long BEGIN_TIMESTAMP = 1669420800L;
    /**
     * 序列号的位数,前32位作为日期
     */
    private static final int COUNT_BITS = 32;

    @Resource
    private StringRedisTemplate stringRedisTemplate;

    public long nextId( String keyPrefix ) {
        //生成时间戳
        LocalDateTime now = LocalDateTime.now();
        long nowSecond = now.toEpochSecond( ZoneOffset.UTC );
        long time = nowSecond - BEGIN_TIMESTAMP;

        //序列号
        //获取当前时间
        String date = now.format( DateTimeFormatter.ofPattern("yyyy:MM:dd"));
        Long increment = stringRedisTemplate.opsForValue().increment( "icr:" + keyPrefix + ":" + date );
        //拼接
        return time << COUNT_BITS | increment;
    }

    public static void main( String[] args ) {
        LocalDateTime time = LocalDateTime.of( 2022, 11, 26, 0, 0, 0 );
        long l = time.toEpochSecond( ZoneOffset.UTC );
        System.out.println( l );
    }
}
```

***超卖问题*** 请求a查询库存，发现库存为1，请求b这时也来查询库存，库存也为1，然后请求a让数据库减1，这时候b查询到的仍然是1，也继续让库存减1，就会导致超卖

***解决方案***

1. ***乐观锁：***认为线程安全问题不一定会发生，因此不加锁，只是在更新数据时去判断有没有其它线程对数据做了修改。如果没有修改则认为是安全的，自己才更新数据。如果已经被其它线程修改说明发生了安全问题，此时可以重试或异常。
2. ***悲观锁：***认为线程安全问题一定会发生，因此在操作数据之前先获取锁，确保线程串行执行。例如Synchronized、Lock都属于悲观锁

***CAS***

1. CAS是英文单词`Compare And Swap`的缩写，翻译过来就是**比较并替换**。
2. CAS机制当中使用了3个基本操作数：内存地址V，旧的预期值A，要修改的新值B。
   更新一个变量的时候，只有当变量的预期值A和内存地址V当中的实际值相同时，才会将内存地址V对应的值修改为B

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678425-4f7668d0f6ebec92c1d360d02dce9ca419954801.png" alt="image-20221202211448826" style="zoom:50%;" />

### 3.1 乐观锁cas实现一人一单

```java
@Override
@Transactional( rollbackFor = Exception.class )
public Result createVoucherOrder( Long voucherId,Long userId ){

    //一人一单,查询数据库中的用户id和优惠卷id,保证唯一
    int count = this.query().eq( "user_id", userId ).eq( "voucher_id", voucherId ).count();
    if ( count > 0 ) {
        return Result.fail( "当前用户已抢购优惠卷" );
    }

    //减少优惠卷数量,通过cas乐观锁实现保证线程安全
    boolean success = seckillVoucherService.update().setSql( "stock = stock - 1" )
        .eq( "voucher_id", voucherId )
        .gt( "stock", 0 )
        .update();

    if ( !success ) {
        return Result.fail( "优惠券库存不足" );
    }

    //创建订单
    VoucherOrder voucherOrder = new VoucherOrder();
    //订单id
    long orderId = redisIdWorker.nextId( "order" );
    voucherOrder.setId( orderId );
    //用户id
    voucherOrder.setUserId( userId );
    //优惠卷id
    voucherOrder.setVoucherId( voucherId );
    //保存订单
    this.save( voucherOrder );

    return Result.ok( orderId );
}
```

### 3.2 分布式锁解决并发问题

==通过AOP动态代理本类对象==

```java
private Result distributedLock ( Long voucherId ){
    if ( ! this.voucherStatus( voucherId ) ) {
        return Result.fail( "抢购异常" );
    }

    //获取用户id
    Long userId = UserHolder.getUser().getId();

    //获取用户id
    Long userId = UserHolder.getUser().getId();
    //intern: 获取字符串池中拥有与该对象相同的值
    synchronized ( userId.toString().intern() ){
        //获取当前类的代理对象,防止事务失效
        proxy = ( IVoucherOrderService ) AopContext.currentProxy();
        return proxy.createVoucherOrder( voucherId );
    }
}
```

==lua脚本== 保证操作的原子性

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678432-21d167cb0cca669a34e74addf49dbcda7cd44b11.png" alt="image-20221202215759951" style="zoom:33%;" />

```lua
-- 比较线程标示与锁中的标示是否一致
if(redis.call('get', KEYS[1]) ==  ARGV[1]) then
    -- 释放锁 del key
    return redis.call('del', KEYS[1])
end
return 0
```

```java
//使用redis中的setnx 和lua 脚本创建分布式锁
SimpleRedisLock lock = new SimpleRedisLock( "order" + userId, stringRedisTemplate );
//获取锁
if ( !lock.tryLock( RedisConstants.DISTRIBUTED_LOCK ) ) {
    return Result.fail( "已抢购优惠卷" );
}

try {
    IVoucherOrderService proxy = ( IVoucherOrderService ) AopContext.currentProxy();
    return proxy.createVoucherOrder( voucherId );
} finally {
    lock.unlock();
}
```

==redissonClient==

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678437-97a1925cad75ceb9517a6b8bb375b5a48ee5d113.png" alt="image-20221202215701164" style="zoom:33%;" />

```java
@Configuration
public class RedissonConfig {

    @Bean
    public RedissonClient redissonClient() {
        // 配置
        Config config = new Config();
        config.useSingleServer().setAddress( "redis://127.0.0.1:6379" ).setPassword( "123456.." );
        // 创建RedissonClient对象
        return Redisson.create( config );
    }
}
```

```java
//使用redissonClient创建分布式锁
RLock lock = redissonClient.getLock( "lock:order" );
//tryLock:默认超过30秒自动释放锁
if ( !lock.tryLock(  ) ) {
return Result.fail( "已抢购优惠卷" );
}
```

==redission可重入锁==

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678441-7ad0dc2a5696a12925f9a88bca587e4d02fef046.png" alt="image-20221202215437243" style="zoom: 33%;" />

### 3.3 阻塞队列解决并发问题

```
src
├── main
│   ├── java
│   │   └── com
Comment
├── config ：存放项目依赖相关配置；
│   ├── LocalDateTimeSerializerConfig.java ：解决 Json timestamp 转 LocalDateTime 的报错问题；
│   ├── MybatisPlusConfiguration.java ：配置 MyBatis Plus 分页插件；
│   ├── RedisConfiguration.java ：创建单例 Redisson 客户端；
│   ├── WebExceptionAdvice.java ：全局响应拦截器；
│   └── WebMvcConfiguration.java ：配置了登录、自动刷新登录 Token 的拦截器。
│
├── controller ：存放 Restful 风格的 API 接口；
│
├── dto ：存放业务封装类，如 Result 通用响应封装（不推荐学习它的写法）；
│
├── entity ：存放和数据库对应的 Java POJO；
│
├── interceptor ：登录拦截器 & 自动刷新 Redis 登录 Token 有效期；
│
├── mapper ：存放操作数据库的代码；
│
├── service ：存放业务逻辑处理代码；
│   ├── BlogCommentsService.java
│   ├── BlogService.java ： 基于 Redis 实现点赞、按时间排序的点赞排行榜；基于 Redis 实现拉模式的 Feed 流；
│   ├── FollowService.java ：基于 Redis 集合实现关注、共同关注；
│   ├── ShopService.java ： 基于 Redis 缓存优化店铺查询性能；基于 Redis GEO 实现附近店铺按距离排序；
│   ├── UserService.java ： 基于 Redis 实现短信登录（分布式 Session）；
│   ├── VoucherOrderService.java ：基于 Redis 分布式锁、Redis + Lua 两种方式，结合消息队列，共同实现了秒杀和一人一单功能；
│   ├── VoucherService.java ：添加优惠券，并将库存保存在 Redis 中，为秒杀做准备。
│
└── utils ：存放项目内通用的工具类；
    ├── CacheClient.java ：封装了通用的缓存工具类，涉及泛型、函数式编程等知识点；
    ├── DistributedLock.java
    ├── RedisConstants.java ：保存项目中用到的 Redis 键、过期时间等常量；
    ├── RedisData.java
    ├── RedisIdWorker.java ：基于 Redis 的全局唯一自增 ID 生成器；
    ├── SimpleDistributedLockBasedOnRedis.java ：简单的 Redis 锁实现，了解即可，一般用 Redisson；
    └── UserHolder.java ：线程内缓存用户信息。
```
