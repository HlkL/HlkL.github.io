## 线程相关API



**Thread 类 API：** 

|                    方法                     | 说明                                                         |
| :-----------------------------------------: | :----------------------------------------------------------- |
|             public void start()             | 启动一个新线程，Java虚拟机调用此线程的 run 方法              |
|              public void run()              | 线程启动后调用该方法                                         |
|      public void setName(String name)       | 给当前线程取名字                                             |
|            public void getName()            | 获取当前线程的名字 线程存在默认名称：子线程是 Thread-索引，主线程是 main |
|    public static Thread currentThread()     | 获取当前线程对象，代码在哪个线程中执行                       |
|     public static void sleep(long time)     | 让当前线程休眠多少毫秒再继续执行 **Thread.sleep(0)** : 让操作系统立刻重新进行一次 CPU 竞争 |
|      public static native void yield()      | 提示线程调度器让出当前线程对 CPU 的使用                      |
|       public final int getPriority()        | 返回此线程的优先级                                           |
| public final void setPriority(int priority) | 更改此线程的优先级，常用 1 5 10                              |
|           public void interrupt()           | 中断这个线程，异常处理机制                                   |
|     public static boolean interrupted()     | 判断当前线程是否被打断，清除打断标记                         |
|       public boolean isInterrupted()        | 判断当前线程是否被打断，不清除打断标记                       |
|          public final void join()           | 等待这个线程结束                                             |
|     public final void join(long millis)     | 等待这个线程死亡 millis 毫秒，0 意味着永远等待               |
|    public final native boolean isAlive()    | 线程是否存活（还没有运行完毕）                               |
|   public final void setDaemon(boolean on)   | 将此线程标记为守护线程或用户线程                             |



### run & start

`run`  称为线程体，包含了要执行的这个线程的内容，方法运行结束，此线程随即终止。直接调用 run 是在主线程中执行了 run，没有启动新的线程，需要顺序执行

`start` 使用 start 是启动新的线程，此线程处于就绪（可运行）状态，通过新的线程间接执行 run 中的代码

**<font color="red"> run() 方法中的异常不能抛出，只能  `try/catch` </font>**

- 因为父类中没有抛出任何异常，子类不能比父类抛出更多的异常
- **异常不能跨线程传播回 main() 中**，因此必须在本地进行处理



### sleep & yield

`sleep`

- 调用 sleep 会让当前线程从 `Running` 进入 `Timed Waiting` 状态（阻塞）
- sleep() 方法的过程中，**线程不会释放对象锁**
- 其它线程可以使用 interrupt 方法打断正在睡眠的线程，这时 sleep 方法会抛出 InterruptedException
- 睡眠结束后的线程未必会立刻得到执行，需要抢占 CPU
- 建议用 TimeUnit 的 sleep 代替 Thread 的 sleep 来获得更好的可读性

`yield`

- 调用 yield 会让提示线程调度器让出当前线程对 CPU 的使用，**是否让出由操作系统决定**
- 具体的实现依赖于操作系统的任务调度器
- **会放弃 CPU 资源，锁资源不会释放**



### join

> 等待当前线程运行结束，调用者轮询检查线程 alive 状态。

```java
public final synchronized void join(long millis) throws InterruptedException {
    // 调用者线程进入 thread 的 waitSet 等待, 直到当前线程运行结束
    while (isAlive()) {
        wait(0);
    }
}
```

- `join` 方法是被 `synchronized` 修饰的，本质上是一个对象锁，其内部的 wait 方法调用也是释放锁的，但是**释放的是当前的线程对象锁，而不是外面的锁**
- 当调用某个线程（t1）的 join 方法后，该线程（t1）抢占到 CPU 资源，就不再释放，直到线程执行完毕

线程同步：

- join 实现线程同步，因为会阻塞等待另一个线程的结束，才能继续向下运行
  - 需要外部共享变量，不符合面向对象封装的思想
  - 必须等待线程结束，不能配合线程池使用
- Future 实现（同步）：get() 方法阻塞等待执行结果
  - main 线程接收结果
  - get 方法是让调用线程同步等待

**<font color="green">示例：</font>** 

```java
public class Test {
    static int r = 0;
    public static void main(String[] args) throws InterruptedException {
        test1();
    }
    private static void test1() throws InterruptedException {
        Thread t1 = new Thread(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            r = 10;
        });
        t1.start();
        t1.join();//不等待线程执行结束，输出的10
        System.out.println(r);
    }
}
```



### interrupt

> 设置打断标志

`public void interrupt()`：打断这个线程，异常处理机制

`public static boolean interrupted()`：判断当前线程是否被打断，打断返回 true，**清除打断标记**，连续调用两次一定返回 false

`public boolean isInterrupted()`：判断当前线程是否被打断，不清除打断标记

打断的线程会发生上下文切换，操作系统会保存线程信息，抢占到 CPU 后会从中断的地方接着运行（打断不是停止）

- sleep、wait、join 方法都会让线程进入阻塞状态，打断线程**会清空打断状态**（false）

  ```java
  public static void main(String[] args) throws InterruptedException {
      Thread t1 = new Thread(()->{
          try {
              Thread.sleep(1000);
          } catch (InterruptedException e) {
              e.printStackTrace();
          }
      }, "t1");
      t1.start();
      Thread.sleep(500);
      t1.interrupt();
      System.out.println(" 打断状态: {}" + t1.isInterrupted());// 打断状态: {}false
  }
  ```

  

- 打断正常运行的线程：不会清空打断状态（true）

  ```java
  public static void main(String[] args) throws Exception {
      Thread t2 = new Thread(()->{
          while(true) {
              Thread current = Thread.currentThread();
              boolean interrupted = current.isInterrupted();
              if(interrupted) {
                  System.out.println(" 打断状态: {}" + interrupted);//打断状态: {}true
                  break;
              }
          }
      }, "t2");
      t2.start();
      Thread.sleep(500);
      t2.interrupt();
  }
  ```



### park

> 打断 park 线程，不会清空打断状态（true）

```java
public static void main(String[] args) throws Exception {
    Thread t1 = new Thread(() -> {
        System.out.println("park...");
        LockSupport.park();
        System.out.println("unpark...");
        System.out.println("打断状态：" + Thread.currentThread().isInterrupted());//打断状态：true
    }, "t1");
    t1.start();
    Thread.sleep(2000);
    t1.interrupt();
}
```



如果打断标记已经是 true, 则 park 会失效

```java
LockSupport.park();
System.out.println("unpark...");
LockSupport.park();//失效，不会阻塞
System.out.println("unpark...");//和上一个unpark同时执行
```



### 终止模式 (Two Phase Termination)

**<font color="red">错误操作</font>** 

- 使用线程对象的 stop() 方法停止线程：stop 方法会真正杀死线程，如果这时线程锁住了共享资源，当它被杀死后就再也没有机会释放锁，其它线程将永远无法获取锁
- 使用 System.exit(int) 方法停止线程：目的仅是停止一个线程，但这种做法会让整个程序都停止

**两阶段终止模式图示：** 

![img](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1712673954-68747470733a2f2f7365617a65616e2e6f73732d636e2d6265696a696e672e616c6979756e63732e636f6d2f696d672f4a6176612f4a55432de4b8a4e998b6e6aeb5e7bb88e6ada2e6a8a1e5bc8f2e706e67.png)

**<font color="green">示例：</font>** 

```java
public class Test {
    public static void main(String[] args) throws InterruptedException {
        TwoPhaseTermination tpt = new TwoPhaseTermination();
        tpt.start();
        Thread.sleep(3500);
        tpt.stop();
    }
}
class TwoPhaseTermination {
    private Thread monitor;
    // 启动监控线程
    public void start() {
        monitor = new Thread(new Runnable() {
            @Override
            public void run() {
                while (true) {
                    Thread thread = Thread.currentThread();
                    if (thread.isInterrupted()) {
                        System.out.println("后置处理");
                        break;
                    }
                    try {
                        Thread.sleep(1000);					// 睡眠
                        System.out.println("执行监控记录");	// 在此被打断不会异常
                    } catch (InterruptedException e) {		// 在睡眠期间被打断，进入异常处理的逻辑
                        e.printStackTrace();
                        // 重新设置打断标记，打断 sleep 会清除打断状态
                        thread.interrupt();
                    }
                }
            }
        });
        monitor.start();
    }
    // 停止监控线程
    public void stop() {
        monitor.interrupt();
    }
}
```

### daemon

`public final void setDaemon(boolean on)`：如果是 true ，将此线程标记为守护线程

```java
Thread t = new Thread() {
    @Override
    public void run() {
        System.out.println("running");
    }
};
// 设置该线程为守护线程
t.setDaemon(true);
t.start();
```

用户线程：平常创建的普通线程

守护线程：服务于用户线程，只要其它非守护线程运行结束了，即使守护线程代码没有执行完，也会强制结束。守护进程是**脱离于终端并且在后台运行的进程**，脱离终端是为了避免在执行的过程中的信息在终端上显示

**<font color="red">注意：</font>**  当运行的线程都是守护线程，Java 虚拟机将退出，因为普通线程执行完后，JVM 是守护线程，不会继续运行下去

常见的守护线程：

- 垃圾回收器线程就是一种守护线程
- Tomcat 中的 Acceptor 和 Poller 线程都是守护线程，所以 Tomcat 接收到 shutdown 命令后，不会等待它们处理完当前请求

### 过时方法

> 不推荐使用的方法，这些方法已过时，容易破坏同步代码块，造成线程死锁：

- `public final void stop()`：停止线程运行

  废弃原因：方法粗暴，除非可能执行 finally 代码块以及释放 synchronized 外，线程将直接被终止，如果线程持有 JUC 的互斥锁可能导致锁来不及释放，造成其他线程永远等待的局面

- `public final void suspend()`：**挂起（暂停）线程运行**

  废弃原因：如果目标线程在暂停时对系统资源持有锁，则在目标线程恢复之前没有线程可以访问该资源，如果**恢复目标线程的线程**在调用 resume 之前会尝试访问此共享资源，则会导致死锁

- `public final void resume()`：恢复线程运行

### 线程运行机制

Java Virtual Machine Stacks（Java 虚拟机栈）：每个线程启动后，虚拟机就会为其分配一块栈内存

- 每个栈由多个栈帧（Frame）组成，对应着每次方法调用时所占用的内存
- 每个线程只能有一个活动栈帧，对应着当前正在执行的那个方法

线程上下文切换（Thread Context Switch）：一些原因导致 CPU 不再执行当前线程，转而执行另一个线程

- 线程的 CPU 时间片用完
- 垃圾回收
- 有更高优先级的线程需要运行
- 线程自己调用了 sleep、yield、wait、join、park 等方法

程序计数器（Program Counter Register）：记住下一条 JVM 指令的执行地址，是线程私有的

当 Context Switch 发生时，需要由操作系统保存当前线程的状态（PCB 中），并恢复另一个线程的状态，包括程序计数器、虚拟机栈中每个栈帧的信息，如局部变量、操作数栈、返回地址等

JVM 规范并没有限定线程模型，以 HotSopot 为例：

- Java 的线程是内核级线程（1:1 线程模型），每个 Java 线程都映射到一个操作系统原生线程，需要消耗一定的内核资源（堆栈）
- **线程的调度是在内核态运行的，而线程中的代码是在用户态运行**，所以线程切换（状态改变）会导致用户与内核态转换进行系统调用，这是非常消耗性能

Java 中 main 方法启动的是一个进程也是一个主线程，main 方法里面的其他线程均为子线程，main 线程是这些线程的父线程

------

### 线程调度

> 线程调度指系统为线程分配处理器使用权的过程，方式有两种：协同式线程调度、抢占式线程调度（Java 选择）

协同式线程调度：线程的执行时间由线程本身控制

- 优点：线程做完任务才通知系统切换到其他线程，相当于所有线程串行执行，不会出现线程同步问题
- 缺点：线程执行时间不可控，如果代码编写出现问题，可能导致程序一直阻塞，引起系统的奔溃

抢占式线程调度：线程的执行时间由系统分配

- 优点：线程执行时间可控，不会因为一个线程的问题而导致整体系统不可用
- 缺点：无法主动为某个线程多分配时间

Java 提供了线程优先级的机制，优先级会提示（hint）调度器优先调度该线程，但这仅仅是一个提示，调度器可以忽略它。在线程的就绪状态时，如果 CPU 比较忙，那么优先级高的线程会获得更多的时间片，但 CPU 闲时，优先级几乎没作用

**<font color="red">注意：</font>** 并不能通过优先级来判断线程执行的先后顺序

------

### 线程状态

> 进程的状态参考操作系统：创建态、就绪态、运行态、阻塞态、终止态

线程由生到死的完整过程（生命周期）：当线程被创建并启动以后，既不是一启动就进入了执行状态，也不是一直处于执行状态，在 API 中 `java.lang.Thread.State` 这个枚举中给出了六种线程状态：

|          线程状态          | 导致状态发生条件                                             |
| :------------------------: | :----------------------------------------------------------- |
|        NEW（新建）         | 线程刚被创建，但是并未启动，还没调用 start 方法，只有线程对象，没有线程特征 |
|     Runnable（可运行）     | 线程可以在 Java 虚拟机中运行的状态，可能正在运行自己代码，也可能没有，这取决于操作系统处理器，调用了 t.start() 方法：就绪（经典叫法） |
|      Blocked（阻塞）       | 当一个线程试图获取一个对象锁，而该对象锁被其他的线程持有，则该线程进入 Blocked 状态；当该线程持有锁时，该线程将变成 Runnable 状态 |
|    Waiting（无限等待）     | 一个线程在等待另一个线程执行一个（唤醒）动作时，该线程进入 Waiting 状态，进入这个状态后不能自动唤醒，必须等待另一个线程调用 notify 或者 notifyAll 方法才能唤醒 |
| Timed Waiting （限期等待） | 有几个方法有超时参数，调用将进入 Timed Waiting 状态，这一状态将一直保持到超时期满或者接收到唤醒通知。带有超时参数的常用方法有 Thread.sleep 、Object.wait |
|     Teminated（结束）      | run 方法正常退出而死亡，或者因为没有捕获的异常终止了 run 方法而死亡 |

![img](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1712673954-68747470733a2f2f7365617a65616e2e6f73732d636e2d6265696a696e672e616c6979756e63732e636f6d2f696d672f4a6176612f4a55432d254537254241254246254537254138253842362545372541372538442545372538412542362545362538302538312e706e67.png)

- NEW → RUNNABLE：当调用 t.start() 方法时，由 NEW → RUNNABLE
- RUNNABLE <--> WAITING：
  - 调用 obj.wait() 方法时
  - 调用 obj.notify()、obj.notifyAll()、t.interrupt()：
    - 竞争锁成功，t 线程从 WAITING → RUNNABLE
    - 竞争锁失败，t 线程从 WAITING → BLOCKED
  - 当前线程调用 t.join() 方法，注意是当前线程在 t 线程对象的监视器上等待
  - 当前线程调用 LockSupport.park() 方法
- RUNNABLE <--> TIMED_WAITING：调用 obj.wait(long n) 方法、当前线程调用 t.join(long n) 方法、当前线程调用 Thread.sleep(long n)
- RUNNABLE <--> BLOCKED：t 线程用 synchronized(obj) 获取了对象锁时竞争失败

### 查看线程



**Windows**

- 任务管理器可以查看进程和线程数，也可以用来杀死进程
- `tasklist`  查看进程
- `taskkill`  杀死进程

**Linux**

- `ps -ef`  查看所有进程
- `ps -fT -p`  查看某个进程（PID）的所有线程
- `kill`  杀死进程
- `top`  按大写 H 切换是否显示线程
- `top -H -p ` 查看某个进程（PID）的所有线程

**Java**

- `jps `  命令查看所有 Java 进程
- `jstack `  查看某个 Java 进程（PID）的所有线程状态
- `jconsole` 来查看某个 Java 进程中线程的运行情况（图形界面）