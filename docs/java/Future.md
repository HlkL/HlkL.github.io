`Future` 模式的核心思想是能够让主线程将原来需要同步等待的这段时间用来做其他的事情。（因为可以异步获得执行结果，所以不用一直同步等待去获得执行结果）

![image-20230514170337760](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675772-202305141703146.png)

源码

```java
public interface Future<V> {

    boolean cancel(boolean mayInterruptIfRunning);

    boolean isCancelled();

    boolean isDone();

    V get() throws InterruptedException, ExecutionException;

    V get(long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
}
```

>-   `cancel()` 取消这个执行逻辑，如果这个逻辑已经正在执行，提供可选的参数来控制是否取消已经正在执行的逻辑。
>-   `isCancelled()` 判断执行逻辑是否已经被取消。
>-   `isDone()` 判断执行逻辑是否已经执行完成。
>-   `get()` 
>    1.   获取执行逻辑的执行结果。
>    2.   允许在一定时间内去等待获取执行结果，如果超过这个时间，抛`TimeoutException`。















[CompletableFuture](https://juejin.cn/post/6970558076642394142)







[CompletableFuture 组合处理 allOf 和 anyOf太赞了](https://cloud.tencent.com/developer/article/1834779)

[强大的CompletableFuture](https://juejin.cn/post/6996114750971052046)





