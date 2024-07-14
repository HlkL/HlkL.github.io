# Spring学习笔记

**_使用jar包导入_**

```xml
<dependencies>
    <!-- https://mvnrepository.com/artifact/org.springframework/spring-webmvc -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.3.23</version>
    </dependency>

    <!-- https://mvnrepository.com/artifact/org.springframework/spring-jdbc -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jdbc</artifactId>
        <version>5.3.23</version>
    </dependency>

    <!-- https://mvnrepository.com/artifact/junit/junit -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
    </dependency>

    <!-- https://mvnrepository.com/artifact/org.aspectj/aspectjweaver -->
    <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjweaver</artifactId>
        <version>1.9.9.1</version>
    </dependency>


    <!-- https://mvnrepository.com/artifact/org.mybatis/mybatis-spring -->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis-spring</artifactId>
        <version>2.0.6</version>
    </dependency>


    <!-- https://mvnrepository.com/artifact/org.mybatis/mybatis -->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.5.7</version>
    </dependency>


    <!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.30</version>
    </dependency>

    <!-- https://mvnrepository.com/artifact/log4j/log4j -->
    <dependency>
        <groupId>log4j</groupId>
        <artifactId>log4j</artifactId>
        <version>1.2.17</version>
    </dependency>

    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>RELEASE</version>
        <scope>compile</scope>
    </dependency>

</dependencies>
```

**_Maven资源导出配置_**

```xml
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <includes>
                <include>**/*.properties</include>
                <include>**/*.xml</include>
            </includes>
            <filtering>true</filtering>
        </resource>
        <resource>
            <directory>src/main/java</directory>
            <includes>
                <include>**/*.properties</include>
                <include>**/*.xml</include>
            </includes>
            <filtering>true</filtering>
        </resource>
    </resources>
</build>
```

## 1. IOC容器

控制反转IoC(Inversion of Control)，是一种设计思想，DI(依赖注入)是实现IoC的一种方法，也有人认为DI只是IoC的另一种说法。没有IoC的程序中 , 我们使用面向对象编程
对象的创建与对象间的依赖关系完全硬编码在程序中，对象的创建由程序自己控制，控制反转后将对象的创建转移给第三方，个人认为所谓控制反转就是：获得依赖对象的方式反转了
<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678053-115741.png">

### 1. xml配置文件开发

#### 依赖注入

##### 构造方法注入

* 使用`spring`   创建对象 在`spring`都称为`bean`
* `bean`        对象
* `id`          变量名
* `class`       new的对象
* `property`    给对象中的属性赋值
* `name `       别名,可以取多个别名
* `import`      将多个配置文件合并
* `value`       具体的值,基本数据结构
* `ref`         引用spring容器中创建好的对象

**无参构造实体类**

```java
@Data
public class Hello {
    private String str;
    public Hello() {
        System.out.println("Hello无参构造");
    }
}
```

通过普通属性使用`property`标签通过set方法注入

```xml
 <bean id="hello" class="com.hg.pojo.Hello">
     <property name="str" value="hello,spring"/>
 </bean>
```

**有参构造实体类**

```java
@Data
public class User {
    private String name;
    public User(String name) {
        this.name = name;
    }
}
```

有参构造使用`constructor-arg`标签,可通过**有参构造变量下标**,**变量名称**,还有**变量类型**注入

1. 通过下标

```xml
 <bean id="user1" class="com.hg.pojo.User">
     <constructor-arg index="0" value="user1"/>
 </bean>

```

2. 通过名称

```xml
<bean id="user2" class="com.hg.pojo.User">
  <constructor-arg name="name" value="user2"/>
</bean>
```

3. 通过类型

```xml
<bean id="user3" class="com.hg.pojo.User">
  <constructor-arg type="java.lang.String" value="user3"/>
</bean>
```

4. 别名

```xml
 <!--    别名-->
 <alias name="user3" alias="user"/>
```

**测试**
**注意点** 所有交给IOC容器注册的类,在容器不管是否使用,只要容器中有任何其他bea被使用,所有的bean都会被spring创建对象

```java
public class MyTest {
    //获取spring上下文对象
    private static final ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");

    @Test
    public void helloTest(){
        //获取无参构造对象
        Hello hello = (Hello) context.getBean("hello");
        System.out.println(hello);
    }
  
   @Test
   public void userTest(){
      //获取有参构造对象
      User user = (User) context.getBean("user");
      System.out.println(user);
   }
}
```

`userTest`测试方法使用,控制台输出
![请添加图片描述](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678061-e86ee4b5e7e044d8816adceec282d187.png)

##### set方法注入

**实体类**

```java
@Data
public class Address {
    private String address;
}
```

```java
@Data
public class Student {
    private String name;
    private Address address;
    private String[] books;
    private List<String> hobbys;
    private Map<String,String> card;
    private Set<String> games;
    private String wife;
    private Properties info;

    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", address=" + address.toString() +
                ", books=" + Arrays.toString(books) +
                ", hobbys=" + hobbys +
                ", card=" + card +
                ", games=" + games +
                ", wife='" + wife + '\'' +
                ", info=" + info +
                '}';
    }
}
```

`Address`类注入

```xml
<bean id="address" class="com.hg.pojo.Address">
  <property name="address" value="株洲"/>
</bean>
```

`Student`类注入

```xml
 <bean id="student" class="com.hg.pojo.Student">
   
     <!--        普通注入-->
     <property name="name" value="hg"/>

     <!--        引用类型注入-->
     <property name="address" ref="address"/>

     <!--        数组注入-->
     <property name="books">
         <array>
             <value>数据结构</value>
             <value>spring</value>
             <value>mybatis</value>
             <value>JavaScript</value>
         </array>
     </property>
   
     <!--        list注入-->
     <property name="hobbys">
         <list>
             <value>听歌</value>
             <value>写代码</value>
             <value>看电影</value>
         </list>
     </property>
   
     <!--        map注入-->
     <property name="card">
         <map>
             <entry key="身份证" value="43102820568963125899"/>
             <entry key="银行卡" value="46858985549561811992"/>
         </map>
     </property>
   
     <!--        set注入-->
     <property name="games">
         <set>
             <value>LOL</value>
             <value>DATA2</value>
         </set>
     </property>
   
     <!--        null注入-->
     <property name="wife">
         <null/>
     </property>
   
     <!--        Properties注入-->
     <property name="info">
         <props>
             <prop key="driver">mysql.cj.jdbc.driver</prop>
             <prop key="url">www.mysql.com</prop>
             <prop key="username">root</prop>
             <prop key="password">123456</prop>
         </props>
     </property>
   
 </bean>
```

**测试**

```java
public class MyTest {
    private static final ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");

    @Test
    public void test1(){
        Student student = (Student) context.getBean("student");
        System.out.println(student);
    }
}
```

**输出结果**

```text
Student{
    name='hg',
    address=Address(address=株洲), 
    books=[数据结构, spring, mybatis, JavaScript], 
    hobbys=[听歌, 写代码, 看电影], 
    card={身份证=43102820568963125899, 银行卡=46858985549561811992}, 
    games=[LOL, DATA2], 
    wife='null', 
    info={
         password=123456, 
         url=www.mysql.com, 
         driver=mysql.cj.jdbc.driver, 
         username=root}
}
```

### 2. 注解开发

#### 1. xml文件+注解

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                           http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <!--    指定要扫描的包-->
    <context:component-scan base-package="com.hg"/>
    <!--    开启注解约束-->
    <context:annotation-config/>

</beans>
```

##### @Component注解

1. 通过注解`@Component`注册`bean`,

```java
@Component
public class Bean {
}
```

通过参数设置`bean`的`id`

```java
@Component("bean")
public class Bean {
}
```

2. 注解`@Component`的衍生类注解

`@Repository`注解,标志当前类为`dao`层

```java
@Repository("user")
public class User {
}
```

`@Service` 注解,标志当前类为`service`层

```java
@Service("userService")
public class UserService {
}
```

`@controller` 注解,标志当前类为`controller`层

```java
@controller("controller")
public class Controller {
}
```

##### 自动装配注解

###### @Autowired注解 和 @Qualifier注解

**Spring自动装配注解**

1. `byName`属性 在容器上下文查找,通过(id)名字自动装配
2. `byType`属性 在容器上下文查找,通过(class)类型自动装配
3. 默认优先通过`byType`属性进行自动装配,如果有多个`bean`按照`byName`属性装配

```java
@Data
@Repository("user")
public class User {
    @Autowired                      //引用类型自动注入,作用在属性上面和set方法上面
    @Qualifier("cat")               //指定注入beas,不能单独使用,必须和Autowired一起使用
    private Cat cat;
}
```

###### @Resource注解

**Java自动装配注解**

1. 可指定`bean`进行装配
2. 默认优先通过类型进行自动装配,如果有多个`bean`按照名称属性装配

###### @Value注解 和 @PropertySource注解

1. 直接注入数值

```java
@Repository("cat")      //dao层bean定义
public class Cat {
  
    @Value("小猫")
    private String name;
  
    public void setName(String name) {
        this.name = name;
    }
}
```

2. 注入外部配置文件数据需要配合`@PropertySource`使用

```java
@Component("jdbc")                              //注册bean
@PropertySource("classpath:db.properties")      //加载配置文件,可用classpath获取路径,可用数组加载多个配置文件,但不支持通配符
public class JdbcUtil {

    @Value("${driver}")                         //内部数值使用外部配置文件注入
    private String driver;

    @Value("${url}")
    private String url;

    @Value("${name}")
    private String username;

    @Value("${password}")
    private String password;

    @Override
    public String toString() {
        return "JdbcUilt{" +
                "driver='" + driver + '\'' +
                ", url='" + url + '\'' +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
```

3. 测试

```java
public class Test {
   @org.junit.Test
   public void valueTest(){
      ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
      JdbcUtil bean = (JdbcUtil) context.getBean("jdbc");
      System.out.println(bean);
   }
}
```

##### 作用域和生命周期注解

###### 单例模式

单例模式（Singleton Pattern）是 Java 中最简单的设计模式之一。这种类型的设计模式属于创建型模式，它提供了一种创建对象的最佳方式。
这种模式涉及到一个单一的类，该类负责创建自己的对象，同时确保只有单个对象被创建。这个类提供了一种访问其唯一的对象的方式，可以直接访问，不需要实例化该类的对象。

1. 单例类只能有一个实例。
2. 单例类必须自己创建自己的唯一实例。
3. 单例类必须给所有其他对象提供这一实例。
4. 保证一个类仅有一个实例，并提供一个访问它的全局访问点。
5. 避免了一个全局使用的类频繁地创建与销毁。

###### 原型模式

原型模式（Prototype Pattern）是用于创建重复的对象，同时又能保证性能。这种类型的设计模式属于创建型模式，它提供了一种创建对象的最佳方式。
这种模式是实现了一个原型接口，该接口用于创建当前对象的克隆。当直接创建对象的代价比较大时，则采用这种模式。
例如，一个对象需要在一个高代价的数据库操作之后被创建。我们可以缓存该对象，在下一个请求时返回它的克隆，在需要的时候更新数据库，以此来减少数据库调用。

###### @Scope注解 ,@PostConstruct注解,和@PreDestroy注解

1. `@Scope` 注解定义bean的作用域,默认为单例模式
2. `@PostConstruct` 注解定义方法在构造方法后执行
3. `@PreDestroy` 注解定义方法在销毁之前执行

```java
@Data
@Repository("user")
@Scope("singleton")                  //定义bean的作用范围   singleton(默认) :单列模式     prototype :原型模式
public class User {

    @Value("1")                     //注入数值,内部数值也可以是外部配置文件
    private int id;
    @Value("张三")                   //注入数值
    private String name;

    @Autowired                      //引用类型自动注入,作用在属性上面和set方法上面
    @Qualifier("cat")               //指定注入beas,不能单独使用,必须和Autowired一起使用
    private Cat cat;

    //生命周期
    @PostConstruct                  //在构造方法后执行
    public void init(){
        System.out.println("init.....");
    }

    @PreDestroy                     //在销毁之前执行
    public void destroy(){
        System.out.println("destroy.....");
    }
}
```

**测试**

```java
public class Test {
    /**
     *  单例模式和原型模式
     *  生命周期
     */
    @org.junit.Test
    public void scopeTest(){
       ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        User user1 = (User) context.getBean("user");
        User user2 = (User) context.getBean("user");
    
        System.out.println(user1.hashCode());
        System.out.println(user2.hashCode());

        context.close();
    }
}
```

1. 单例模式测试
   ![请添加图片描述](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678076-d46e8ff8b7e9416a8615724c24a82d29.png)
2. 原型模式测试
   ![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678080-16a7ae2d5b814f918962cbb2320c5678.png)

#### 2. 配置类+注解

1. `@Configuration`注解定义该类为配置类,可舍弃xml配置文件
2. `@ComponentScan`扫描包,该注解只能添加一次,多个数据可以使用数组格式
3. `@Import`导入第三方bean,多个数据可以使用数组格式

```java
import javax.xml.soap.Text;

@Configuration
@ComponentScan({"com.hg.pojo", "com.hg.service", "com.hg.config"})
@Import(Text.class)
public class SpringConfig {
}
```

**测试**

```java
public class Test {
   /**
    * 配置类
    */
   @org.junit.Test
   public void classTest() {
      //加载配置类初始化容器
      ApplicationContext context = new AnnotationConfigApplicationContext(SpringConfig.class);
      User user = (User) context.getBean("user");
      System.out.println(user);
   }
}
```

### 3. 注解开发和xml开发对比

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678085-665338da3d3e4204b500015a3185b658.png)

## 2. AOP

### 1. 代理模式

在代理模式（Proxy Pattern）中，一个类代表另一个类的功能。这种类型的设计模式属于结构型模式。
在代理模式中，我们创建具有现有对象的对象，以便向外界提供功能接口。
为其他对象提供一种代理以控制对这个对象的访问。
![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678091-308d3684def34e80b234b8e6c79e3b62.png)

#### 1. 静态代理

*在不改变实现类的情况下，对实现类进行功能的增加，由此而产生了代理类，生成代理对象,通过代理对象去实现需要添加的功能*
**`举个栗子`通过中介租房**
租客租房子一般都找不到房东，房东也不会轻易将自己暴露给广大租客，因此就需要中介来充当这个中间关系,
因此租客就只能通过中介来进行租房子这个工作，不需要通过房东，这就叫做代理----就是中介代理房东来处理租房子这件事情
**租房(目标客户)**

```java
public interface Renting {
    //房东要把房子租出去
    void house();
}
```

**租客(代理类)**

```java
public class User implements Renting{
    @Override
    public void house() {
        System.out.println("用户要租房");
    }
}
```

**中介(代理)**

```java
public class Agency implements Renting{
   private Renting renting;

   public Agency(Renting renting) {
      this.renting = renting;
   }

   //中介从房东获取房子,把房子租给需要的人
   @Override
   public void house() {
      System.out.println(this.renting.getClass().getName());
      //中介通过收取中介费,实现功能增强
      System.out.println("通过中介租房需要支付中介费");
      renting.house();
   }
}
```

**测试**

```java
public class Test {
    @org.junit.Test
    public void staticProxy(){
        User user = new User();
        Agency agency = new Agency(user);
        agency.house();
    }
}
```

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678099-52ed3e31606e481baa507ee703140eb9.png)

**缺点:**  当实际开发中有很多这样的主题接口和类需要功能增强时，就需要更多的代理类，即每一个主题接口都得创建一个代理类，会造成代码的繁多和冗余

#### 2. 动态代理

动态代理：无需声明式的创建java代理类，而是在运行过程中生成"虚拟"的代理类，被ClassLoader加载。从而避免了静态代理那样需要声明大量的代理类。
![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678104-7b131ab2c5de43cea928b456ddb46efe.png)
**出售**

```java
public interface UsbSell {
    float sell(int amount);
}
```

**U盘厂商出售U盘(目标类)**

```java
public class UsbKingFactory implements UsbSell {

    @Override
    public float sell(int amount) {
        System.out.println("目标类中执行了sell目标方法");
        return 85.0f;
    }
}
```

**经销商代理(代理类)**

```java
public class MySellHeader implements InvocationHandler {
    private Object target;

    /**
     *  动态代理:目标对象是活跃的,需要传入进来
     *  传进来是谁就给谁创建代理对象
     * @param target
     */
    public MySellHeader(Object target) {
        //目标对象
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //执行目标方法
        Object res = method.invoke(target, args);
        //增强功能
        if (res != null ){
            Float price = (Float) res;
            price = (price + 25) * (Integer)args[0];
            res = price;
        }
        System.out.println("动态代理");
        return res;
    }
}
```

**用户购买U盘**

```java
public class MainShop {
    public static void main(String[] args) {
        //创建代理对象,使用proxy
        //创建目标对象
        UsbSell factory = new UsbKingFactory();
        //创建InvocationHandler对象
        MySellHeader header = new MySellHeader(factory);
        //创建代理对象,转成接口
        UsbSell proxy = (UsbSell) Proxy.newProxyInstance(factory.getClass().getClassLoader(),
                factory.getClass().getInterfaces(),
                header);
        System.out.println(proxy.sell(2));
    }
}
```

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678111-b2c9ab107202426aa0ba250a20e4098b.png)

### 2. AOP织入

#### 方式一

**接口**

```java
public interface UserService {
    void add();
    void delete();
    void update();
    void select();
}
```

**切入前日志**

```java
public class AfterLog implements AfterReturningAdvice {

    @Override
    public void afterReturning(Object returnValue, Method method, Object[] args, Object target) throws Throwable {
        System.out.println("执行了" + method.getName() + "返回了" + returnValue);
    }
}
```

**切入后日志**

```java
public class Log implements MethodBeforeAdvice {
    /**
     *
     * @param method 要执行的目标对象的方法
     * @param args 参数
     * @param target 目标对象
     * @throws Throwable
     */
    @Override
    public void before(Method method, Object[] args, Object target) throws Throwable {
        System.out.println(target.getClass().getName()+"的"+method.getName()+"被执行了");
    }
}

```

**切入对象类**

```java
public class UserServiceImpl implements UserService{

    @Override
    public void add() {
        System.out.println("增加了一个用户");
    }

    @Override
    public void delete() {
        System.out.println("删除了一个用户");
    }

    @Override
    public void update() {
        System.out.println("修改了一个用户");
    }

    @Override
    public void select() {
        System.out.println("查找了一个用户");
    }
}
```

**xml配置**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/aop https://www.springframework.org/schema/aop/spring-aop.xsd">

    <bean id="userService" class="com.hg.service.UserServiceImpl"/>
    <bean id="log" class="com.hg.log.AfterLog"/>
    <bean id="afterLog" class="com.hg.log.Log"/>
    <!--方式一:使用原生SpringAPI接口-->
    <!--    配置aop,需要导入aop的约束-->
    <aop:config>
        <!--pointcut: 切入点
            expression : 表达式
            execution : 执行的位置(修饰词,返回值,类名,方法名,参数)
             -->
        <aop:pointcut id="pointcut" expression="execution(* com.hg.service.UserServiceImpl.*(..))"/>
        <!--        执行环绕增加-->
        <aop:advisor advice-ref="log" pointcut-ref="pointcut"/>
        <aop:advisor advice-ref="afterLog" pointcut-ref="pointcut"/>
    </aop:config>
</beans>
```

**测试**

```java
public class MyTest {
    private static final ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");

    @Test
    public void test() {
        //方式一
        UserService bean = (UserService) context.getBean("userService");
        bean.add();
    }
}
```

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678119-d97705370f8446edabd8b055aba4e7ad.png)

#### 方式二

**自己定义切入**

```java
public class DiyPointCut {
    public void before(){
        System.out.println("==================方法执行前=================");
    }

    public void after(){
        System.out.println("==================方法执行后=================");
    }
}
```

**配置文件**

```xml
<!--    方式二: 自定义类-->
<bean id="diy" class="com.hg.diy.DiyPointCut"/>

<aop:config>
    <!--        自定义切面 ref引用的类-->
    <aop:aspect ref="diy">
    <!--        切入点-->
        <aop:pointcut id="pointcut" expression="execution(* com.hg.service.UserServiceImpl.*(..))"/>
        <aop:before method="before" pointcut-ref="pointcut"/>
        <aop:after method="after" pointcut-ref="pointcut"/>

    </aop:aspect>
</aop:config>
```

**测试**

```java

public class MyTest {
    @Test
    public void test2() {
        ApplicationContext context = new ClassPathXmlApplicationContext("diyPointCut.xml");
        //方式二
        UserService bean = (UserService) context.getBean("userService");
        bean.add();
    }
}
```

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678125-a8f53437f0df49b5af6fc45491fb4d07.png)

#### 方式三

**通过注解**

```xml
<!--  
    开启注解支持
    默认 proxy-target-class="false" JDK
        proxy-target-class="true" cglib
-->
<aop:aspectj-autoproxy />
```

```java
@Component      //通过注解注册bean
@Aspect         //标注这个类是一个切面
public class AnnotationPointCut {
    @Before("execution(* com.hg.service.UserServiceImpl.*(..))")
    public void before(){
        System.out.println("==================方法执行前=================");
    }
    @After("execution(* com.hg.service.UserServiceImpl.*(..))")
    public void after(){
        System.out.println("==================方法执行后=================");
    }
    @Around("execution(* com.hg.service.UserServiceImpl.*(..))")
    public void Around(ProceedingJoinPoint pj) throws Throwable {
        System.out.println("      环绕前     ");
        pj.proceed();
        System.out.println("      环绕后     ");
    }
}
```

**测试**

```java
public class MyTest {
    @Test
    public void test3(){
        ApplicationContext context = new ClassPathXmlApplicationContext("annotationPointCut.xml");
        UserService bean = (UserService) context.getBean("userService");
        bean.add();
    }
}
```

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678132-16fdb8d37a484f7fb633fe2ead3a8347.png)

## 3. 整合Mybatis

**实体类**

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuppressWarnings("all")
public class User {
    private int id;
    private String name;
    private String pwd;
}
```

**接口**

````java
@SuppressWarnings("all")
public interface UserMapper {
    public List<User> getUser();
}
````

**UserMapper接口映射文件**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.hg.mapper.UserMapper">

    <select id="getUser" resultType="user">
        select * from mybatis.user
    </select>
</mapper>
```

**mybatis核心配置文件**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>


    <settings>
        <!-- 系统日志-->
        <setting name="logImpl" value="STDOUT_LOGGING"/>
        <!--        开启驼峰命名自动映射-->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
    </settings>

    <typeAliases>
        <package name="com.hg.pojo"/>
    </typeAliases>

</configuration>
```

**bean管理文件**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <import resource="classpath:springConfig.xml"/>

    <bean id="userMapperImpl" class="com.hg.mapper.UserMapperImpl">
        <property name="sqlSession" ref="sqlSessionTemplate"/>
    </bean>

    <bean id="userMapperImpl2" class="com.hg.mapper.UserMapperImpl2">
        <property name="sqlSessionFactory" ref="sqlSessionFactory"/>
    </bean>

</beans>
```

**spring配置**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!--    配置 Mybatis 数据源-->
    <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver"/>
        <property name="url"
                  value="jdbc:mysql://localhost:3306/mybatis?useSSL=true&useUnicode=true&characterEncoding=UTF-8"/>
        <property name="username" value="root"/>
        <property name="password" value="123456"/>
    </bean>

    <!--    配置工厂SqlSessionFactory-->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <!--        绑定mybatis-->
        <property name="configLocation" value="classpath:mybatisConfig.xml"/>
        <property name="mapperLocations" value="classpath:com/hg/mapper/*.xml"/>
    </bean>

    <!--    sqlSessionTemplate-->
    <bean id="sqlSessionTemplate" class="org.mybatis.spring.SqlSessionTemplate">
        <!--        底层没有set方法,只能通过构造方法注入-->
        <constructor-arg index="0" ref="sqlSessionFactory"/>
    </bean>

</beans>
```

### 方式一

**接口实现**

```java
public class UserMapperImpl implements UserMapper{
    /**
     *  所有操作之前用sqlSession来执行,现在可以完全使用sqlSessionTemplate代替sqlSession来执行所有操作
     */
    private SqlSessionTemplate sqlSession;

    public void setSqlSession(SqlSessionTemplate sqlSession) {
        this.sqlSession = sqlSession;
    }

    @Override
    public List<User> getUser() {
        UserMapper mapper = sqlSession.getMapper(UserMapper.class);
        return mapper.getUser();
    }
}
```

**测试**

```java
public class MyTest {
    @Test
    public void implTest1() {
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        UserMapper userMapper = (UserMapper) context.getBean("userMapperImpl");
        userMapper.getUser();
    }
}
```

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678141-a5eff94eb0504d1b82c8dc8b5d25a7ce.png)

### 方式二

通过继承`SqlSessionDaoSupport`直接使用`getSqlSessionTemplate`

```java
public class UserMapperImpl2 extends SqlSessionDaoSupport implements UserMapper{

    @Override
    public List<User> getUser() {
        return getSqlSessionTemplate().getMapper(UserMapper.class).getUser();
    }
}
```

**测试**

```java
public class MyTest {
    @Test
    public void implTest2(){
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        UserMapper userMapper = (UserMapper) context.getBean("userMapperImpl2");
        userMapper.getUser();
    }
}
```

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678148-63ab4f89cff04c38950eb27d38c1851b.png)

## 4. 事务

### 事务的 ACID 原则

#### 1. 事务的原子性(Atomicity)

是指一个事务要么全部执行，要么不执行，也就是说一个事务不可能只执行了一半就停止了。
比如你从取款机取钱，这个事务可以分成两个步骤：1划卡，2出钱。不可能划了卡，而钱却没出来。这两步必须同时完成，要么就不完成。

#### 2. 事务的一致性(Consistency)

是指事务的运行并不改变数据库中数据的一致性。例如，完整性约束了a+b=10，一个事务改变了a，那么b也应该随之改变。

#### 3. 独立性(Isolation）

事务的独立性也称作隔离性，是指两个以上的事务不会出现交错执行的状态。因为这样可能会导致数据不一致，更加具体的来讲，就是事务之间的操作是独立的。

#### 4. 持久性(Durability）

事务的持久性是指事务执行成功以后，该事务对数据库所作的更改便是持久的保存在数据库之中，不会无缘无故的回滚。

### 事务的传播特性

1. `PROPAGATION_REQUIRED`：默认事务类型，如果没有，就新建一个事务；如果有，就加入当前事务。适合绝大多数情况。
2. `PROPAGATION_REQUIRES_NEW`：如果没有，就新建一个事务；如果有，就将当前事务挂起。
3. `PROPAGATION_NESTED`：如果没有，就新建一个事务；如果有，就在当前事务中嵌套其他事务。
4. `PROPAGATION_SUPPORTS`：如果没有，就以非事务方式执行；如果有，就使用当前事务。
5. `PROPAGATION_NOT_SUPPORTED`：如果没有，就以非事务方式执行；如果有，就将当前事务挂起。即无论如何不支持事务。
6. `PROPAGATION_NEVER`：如果没有，就以非事务方式执行；如果有，就抛出异常。
7. `PROPAGATION_MANDATORY`：如果没有，就抛出异常；如果有，就使用当前事务。

**接口**

```java
public interface UserMapper {
    public List<User> getUser();
    public int addUser(User user);

    public int delUser(int id);

}
```

**接口映射**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.hg.mapper.UserMapper">

    <select id="getUser" resultType="user">
        select * from mybatis.user
    </select>

    <insert id="addUser" parameterType="user">
        insert into mybatis.user(name, pwd) VALUES (#{name},#{pwd})
    </insert>

    <delete id="delUser" parameterType="_int">
        delete from mybatis.user where id = #{id}
    </delete>
</mapper>
```

**bean**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <import resource="classpath:springConfig.xml"/>


    <bean id="userMapperImpl" class="com.hg.mapper.UserMapperImpl">
        <property name="sqlSessionFactory" ref="sqlSessionFactory"/>
    </bean>

</beans>
```

**mybatis配置**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
  
    <settings>
        <!-- 系统日志-->
        <setting name="logImpl" value="STDOUT_LOGGING"/>
        <!--        开启驼峰命名自动映射-->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
    </settings>

    <typeAliases>
        <package name="com.hg.pojo"/>
    </typeAliases>

</configuration>
```

**spring配置**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/aop https://www.springframework.org/schema/aop/spring-aop.xsd
        http://www.springframework.org/schema/tx https://www.springframework.org/schema/tx/spring-tx.xsd">

    <!--    配置 Mybatis 数据源-->
    <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver"/>
        <property name="url"
                  value="jdbc:mysql://localhost:3306/mybatis?useSSL=true&useUnicode=true&characterEncoding=UTF-8"/>
        <property name="username" value="root"/>
        <property name="password" value="123456"/>
    </bean>

    <!--    配置工厂SqlSessionFactory-->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <!--        绑定mybatis-->
        <property name="configLocation" value="classpath:mybatisConfig.xml"/>
        <property name="mapperLocations" value="classpath:com/hg/mapper/*.xml"/>
    </bean>

    <!--    配置声名制事务管理-->
    <bean id="transactionManagement" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>

    <!--    开启事务通知,使用AOP进行事务的织入-->
    <tx:advice transaction-manager="transactionManagement" id="txAdvisor">
        <!--    选择要开始事务的方法,并配置事务的传播的特性,默认使用 propagation="REQUIRED -->
        <tx:attributes>
            <!--     配置要开启事务方法的名字,可使用通配符-->
            <tx:method name="addUser" propagation="REQUIRED"/>
            <tx:method name="delUser" propagation="REQUIRED"/>
            <tx:method name="*"/>
        </tx:attributes>
    </tx:advice>

    <!--    配置AOP实现织入-->
    <aop:config>
        <!--    aop织入点-->
        <aop:pointcut id="aopPointcut" expression="execution(* com.hg.mapper.*.*(..))"/>
        <!--    切入事务-->
        <aop:advisor advice-ref="txAdvisor" pointcut-ref="aopPointcut"/>
    </aop:config>

</beans>

```

**接口实现**

```java
public class UserMapperImpl extends SqlSessionDaoSupport implements UserMapper{
    @Override
    public List<User> getUser() {
        UserMapper mapper = getSqlSessionTemplate().getMapper(UserMapper.class);
        User user = new User(5, "李兴", "123456");
        mapper.addUser(user);
        mapper.delUser(25);
        return mapper.getUser();
    }

    @Override
    public int addUser(User user) {
        return getSqlSessionTemplate().getMapper(UserMapper.class).addUser(user);
    }

    @Override
    public int delUser(int id) {
        return getSqlSessionTemplate().getMapper(UserMapper.class).delUser(id);
    }
  
}
```

### 事务测试

数据库原始数据
![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678158-8ed32456f41e4964ad531df0316d9931.png)

```java
public class MyTest {

    @Test
    public void test(){
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        UserMapper userMapper = (UserMapper) context.getBean("userMapperImpl");
        List<User> user = userMapper.getUser();
        for (User user1 : user) {
            System.out.println(user1);
        }
    }
}
```

1. 通过修改sql语句制造错误
   ![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678162-b79822b68a0e40cfb3218e631d38327c.png)

**运行结果**
![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678167-f2eb9664b88d48d69cffe693d5258418.png)

**尽管运行日志中显示插入一条数据,但此时因为删除操作sql语句的错误,数据库中并没有写入数据**
![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678170-48656a1f48234464875c9e4d31830b48.png)

2. 使用正确的sql语句进行测试
![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678175-d4202b26a99a4e8f9499cba1af208736.png)
**测试通过的同时,数据库中也对应的更新了数据**
![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678179-8d84cb164c184aaf85a33d0f2e18cff3.png)
