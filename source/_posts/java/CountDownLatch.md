---
title: countDownLatch使用
tags:
  - java
abbrlink: c75ed573
date: 2023-05-14 16:08:23
updated: 2023-05-14 16:08:23
---

`CountDownLatch`一般用作多线程倒计时计数器，强制它们等待其他一组（`CountDownLatch`的初始化决定）任务执行完成，`CountDownLatch`初始化后计数器值递减到0的时候，不能再复原的。

源码

```java
package java.util.concurrent;

import java.util.concurrent.locks.AbstractQueuedSynchronizer;

public class CountDownLatch {

    private static final class Sync extends AbstractQueuedSynchronizer {
        private static final long serialVersionUID = 4982264981922014374L;

        Sync(int count) {
            setState(count);
        }

        int getCount() {
            return getState();
        }

        protected int tryAcquireShared(int acquires) {
            return (getState() == 0) ? 1 : -1;
        }

        protected boolean tryReleaseShared(int releases) {
            // Decrement count; signal when transition to zero
            for (;;) {
                int c = getState();
                if (c == 0)
                    return false;
                int nextc = c - 1;
                if (compareAndSetState(c, nextc))
                    return nextc == 0;
            }
        }
    }

    private final Sync sync;

    public CountDownLatch(int count) {
        if (count < 0) throw new IllegalArgumentException("count < 0");
        this.sync = new Sync(count);
    }

    public void await() throws InterruptedException {
        sync.acquireSharedInterruptibly(1);
    }

    public boolean await(long timeout, TimeUnit unit)
        throws InterruptedException {
        return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));
    }

    public void countDown() {
        sync.releaseShared(1);
    }

    public long getCount() {
        return sync.getCount();
    }

    public String toString() {
        return super.toString() + "[Count = " + sync.getCount() + "]";
    }
}
```

**<font color = “green“>使用示例：</font>**

```java
public class CountDownLatchModule {

    //线程数
    private static int N = 10;

    // 单位：min
    private static int countDownLatchTimeout = 5;

    public static void main(String[] args) {
        //创建CountDownLatch并设置计数值，该count值可以根据线程数的需要设置
        CountDownLatch countDownLatch = new CountDownLatch(N);

		//创建线程池
        ExecutorService cachedThreadPool = Executors.newCachedThreadPool();

        for (int i = 0; i < N; i++) {
            cachedThreadPool.execute(() ->{
                try {
                    System.out.println(Thread.currentThread().getName() + " do something!");
                } catch (Exception e) {
                    System.out.println("Exception: do something exception");
                } finally {
                    //该线程执行完毕-1
                    countDownLatch.countDown();
                }
            });
        }

        System.out.println("main thread do something-1");
        try {
            countDownLatch.await(countDownLatchTimeout, TimeUnit.MINUTES);
        } catch (InterruptedException e) {
            System.out.println("Exception: await interrupted exception");
        } finally {
            System.out.println("countDownLatch: " + countDownLatch.toString());
        }
        System.out.println("main thread do something-2");
        //若需要停止线程池可关闭;
//        cachedThreadPool.shutdown();

    }
```

结果输出：

![image-20230514160823458](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675757-202305141608627.png)

>   -   `public void await() throws InterruptedException`：调用`await()`方法的线程会被挂起，等待直到`count`值为`0`再继续执行。
>   -   `public boolean await(long timeout, TimeUnit unit) throws InterruptedException`：同`await()`，若等待`timeout`时长后，`count`值还是没有变为0，不再等待，继续执行。时间单位如下常用的毫秒、天、小时、微秒、分钟、纳秒、秒。
>   -   `public void countDown()`： count值递减1。
>   -   `public long getCount()`：获取当前count值。
>   -   `public String toString()`：重写了toString()方法，多打印了count值。

## CountDownLatch使用场景

一个程序中有N个任务在执行，我们可以创建值为N的CountDownLatch，当每个任务完成后，调用一下`countDown()`方法进行递减`count值`，再在主线程中使用`await()`方法等待任务执行完成，主线程继续执行。

**<font color = “green“>示例：</font>**作为线程启动信号。

```java
@Test
void test2() throws InterruptedException {
    CountDownLatch startSignal = new CountDownLatch(1);
    CountDownLatch doneSignal = new CountDownLatch(10);
    for (int i = 0; i < 10; i++) {
        // create and start threads
        new Thread(new Worker(startSignal, doneSignal)).start();
    }
    // don't let run yet
    System.out.println("do something else 1");
    // let all threads proceed
    startSignal.countDown();
    System.out.println("do something else 2");
    // wait for all to finish
    doneSignal.await();
    System.out.println("wait for all to finsh");
}

static class Worker implements Runnable {

    private final CountDownLatch startSignal;
    private final CountDownLatch doneSignal;

    Worker(CountDownLatch startSignal, CountDownLatch doneSignal) {
        this.startSignal = startSignal;
        this.doneSignal = doneSignal;
    }

    @Override
    public void run() {
        try {
            this.startSignal.await();
            doWork();
            this.doneSignal.countDown();
        } catch (InterruptedException ex) {
            ex.printStackTrace();
        }
    }

    void doWork() {
        System.out.println("do work!");
    }
}
```

结果输出

```java
do something else 1
do work!
do work!
do work!
do work!
do work!
do work!
do something else 2
do work!
do work!
do work!
do work!
wait for all to finsh
```

>   1.  主线程先打印`do something else 1`和`do something else 2`。因为`startSignal.countDown();`完后，count才为0，子线程才能打印。
>   2.  因为`startSignal.await();`是在子线程内，所有子线程都等待`startSignal.countDown()`执行后才能打印`do work!`。
>   3.  `doneSignal.await();`等待所有子线程执行后，每次都`doneSignal.countDown()`，最后count为0，主线程才执行打印`wait for all to finsh`。

**<font color = “green”>示例：</font>**作为线程等待完成信号。

```java
@Test
void test3() throws InterruptedException {
    CountDownLatch doneSignal = new CountDownLatch(5);
    ExecutorService cachedThreadPool = Executors.newCachedThreadPool();
    for (int i = 0; i < 10; i++) {
        // create and start threads
        cachedThreadPool.execute(new Work(doneSignal, i));
    }
    // don't let run yet
    System.out.println("do something else 1");
    // wait for all to finish
    doneSignal.await();
    System.out.println("===========================count: " + doneSignal.getCount());
    System.out.println("do something else 2");
    cachedThreadPool.shutdown();
}

static class Work implements Runnable {

    private final CountDownLatch doneSignal;
    private final int i;

    Work(CountDownLatch doneSignal, int i) {
        this.doneSignal = doneSignal;
        this.i = i;
    }

    @Override
    public void run() {
        try {
            doWork();
            this.doneSignal.countDown();
            System.out.println("i = " + this.i + ", " + this.doneSignal.toString());
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    void doWork() {
        System.out.println("do work!");
    }
}
```

结果输出

```java
do work!
do work!
do work!
do work!
do work!
do work!
i = 3, java.util.concurrent.CountDownLatch@707128b6[Count = 1]
i = 5, java.util.concurrent.CountDownLatch@707128b6[Count = 0]
i = 4, java.util.concurrent.CountDownLatch@707128b6[Count = 0]
i = 2, java.util.concurrent.CountDownLatch@707128b6[Count = 2]
do work!
i = 6, java.util.concurrent.CountDownLatch@707128b6[Count = 0]
i = 0, java.util.concurrent.CountDownLatch@707128b6[Count = 3]
i = 1, java.util.concurrent.CountDownLatch@707128b6[Count = 3]
do work!
i = 7, java.util.concurrent.CountDownLatch@707128b6[Count = 0]
do work!
i = 8, java.util.concurrent.CountDownLatch@707128b6[Count = 0]
do something else 1
do work!
i = 9, java.util.concurrent.CountDownLatch@707128b6[Count = 0]
===========================count: 0
do something else 2
```

>   主线程是等待其他线程运行了5次结束后就打印了`do something else 2`信息，因为CountDownLatch数值为5。