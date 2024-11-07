---
title: mybatisPlus框架学习
date: 2022-11-16 10:14:22
updated: 2022-11-16 10:14:22
tags:
  - framework
---

![img](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677110-4c8f42ff25bb8862d8fdf5a7042613631cb8516e.png)

**`MyBatis-Plus`（简称 MP）是一个 MyBatis 的增强工具，在 MyBatis 的基础上只做增强不做改变，为简化开发、提高效率而生。**

**特征**

> - `无侵入`：只做增强不做改变，引入它不会对现有工程产生影响，如丝般顺滑
> - `损耗小`：启动即会自动注入基本 CURD，性能基本无损耗，直接面向对象操作
> - `强大的 CRUD 操作`：内置通用 Mapper、通用 Service，仅仅通过少量配置即可实现单表大部分 CRUD 操作，更有强大的条件构造器，满足各类使用需求
> - `支持 Lambda 形式调用`：通过 Lambda 表达式，方便的编写各类查询条件，无需再担心字段写错
> - `支持多种数据库`：支持 MySQL、MariaDB、Oracle、DB2、H2、HSQL、SQLite、Postgre、SQLServer2005、SQLServer 等多种数据库
> - `支持主键自动生成`：支持多达 4 种主键策略（内含分布式唯一 ID 生成器 - Sequence），可自由配置，完美解决主键问题
> - `内置代码生成器`：采用代码或者 Maven 插件可快速生成 Mapper 、 Model 、 Service 、 Controller 层代码，支持模板引擎，更有超多自定义配置
> - `内置分页插件`：基于 MyBatis 物理分页，开发者无需关心具体操作，配置好插件之后，写分页等同于普通 List 查询
>   就是mybatis的加强版,功能更强大

**框架结构**

![framework](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677115-64b505fb73548267943b08e285f720442e88d2f0.jpg)

## 第一个`MybatisPlus`工程

1. 新建一个`sprongBoot`工程
2. 在`pom`文件中添加依赖

   ```xml
   <dependencies>
   
           <dependency>
               <groupId>org.projectlombok</groupId>
               <artifactId>lombok</artifactId>
               <optional>true</optional>
           </dependency>
   
           <dependency>
               <groupId>com.baomidou</groupId>
               <artifactId>mybatis-plus-boot-starter</artifactId>
               <version>3.5.2</version>
           </dependency>
   
           <dependency>
               <groupId>mysql</groupId>
               <artifactId>mysql-connector-java</artifactId>
           </dependency>
   </dependencies>
   ```
3. `application.yml`配置文件

   ```yml
   spring:
     datasource:
       #    设置数据类型
       type: com.zaxxer.hikari.HikariDataSource
       #    驱动
       driver-class-name: com.mysql.cj.jdbc.Driver
       url: jdbc:mysql://localhost:3306/mybatis_plus?serverTimezone=GMT%2B8&characterEnding=utf-8&useSSL=false&allowPublicKeyRetrieval=true
       username: root
       password: 123456
   ---
   mybatis-plus:
     configuration:
   #    配置日志输出
       log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
     mapper-locations: classpath*:/mapper/**/*.xml
   #    别名
     type-aliases-package: com.hg.mybatisplus1.pojo
   #  实体类全局配置
     global-config:
       db-config:
   #      设置实体类对应表的统一前缀
         table-prefix: t_
   #      全局主键策略
         id-type: assign_id
   ---
   ```
4. 数据库`sql`

   ```sql
   DROP TABLE IF EXISTS user;
   
   CREATE TABLE user
   (
       id BIGINT(20) NOT NULL COMMENT '主键ID',
       name VARCHAR(30) NULL DEFAULT NULL COMMENT '姓名',
       age INT(11) NULL DEFAULT NULL COMMENT '年龄',
       email VARCHAR(50) NULL DEFAULT NULL COMMENT '邮箱',
       PRIMARY KEY (id)
   );
   DELETE FROM user;
   
   INSERT INTO user (id, name, age, email) VALUES
   (1, 'Jone', 18, 'test1@baomidou.com'),
   (2, 'Jack', 20, 'test2@baomidou.com'),
   (3, 'Tom', 28, 'test3@baomidou.com'),
   (4, 'Sandy', 21, 'test4@baomidou.com'),
   (5, 'Billie', 24, 'test5@baomidou.com');
   ```
5. 实体类(使用`lombok`快捷创建)

   ```java
   @SuppressWarnings("all")
   @Data
   @AllArgsConstructor
   @NoArgsConstructor
   @TableName("user")                                 //设置实体类所对应的表名
   public class User {
   
       /**
        *  TableId 将属性对应的字段指定为主键
        *      value : 设置数据库指定主键名
        *      type(enum)  : 设置主键生成策略
        */
       @TableId
       private Long id;
       @TableField("name")                             //指定属性中对应的字段名
       private String name;
       private Integer age;
       private String email;
       @TableLogic                                     //逻辑删除,被删除的数据查询不到,但存在
       private Integer isDelete;
   }
   ```
6. 创建`Mapper`接口继承`BaseMapper`

   ```java
   @Repository											//Repository 将类或接口标志为持久组件
   public interface UserMapper extends BaseMapper<User> {
   }
   ```
7. 在springBoot启动类中添加`@MapperScan`扫描注解

   ```java
   @MapperScan("com.hg.mybatisplus1.mapper")
   @SpringBootApplication
   public class MybatisPlus1Application {
   
       public static void main(String[] args) {
           SpringApplication.run(MybatisPlus1Application.class, args);
       }
   
   }
   ```
8. 测试

   ```java
   @Slf4j												//lombok日志工具
   @SpringBootTest
   public class MybatisPlusTest {
   
       @Autowired
       private UserMapper userMapper;
   
       /**
        * 查询所有用户信息
        */
       @Test
       public void selectList(){
           List<User> users = userMapper.selectList(null);
           users.forEach(System.out::println);
       }
   }
   ```

   ![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677122-465f62b6597d9c83dbdb27a8e590d64498a8fef5.png)

## 继承`BaseMapper` 实现基础的`CRUD`操作

- 插入一条数据

  ```java
  @Slf4j
  @SpringBootTest
  public class MybatisPlusTest {
  
      @Autowired
      private UserMapper userMapper;
  
      /**
       * 插入用户
       */
      @Test
      public void insertUser() {
          User user = new User();
          user.setName("张三");
          user.setAge(18);
          user.setEmail("zs@136.com");
          int result = userMapper.insert(user);
          log.info("result:"+result);
          //plus中默认使用雪花算法生成id
          log.info("id:"+user.getId());
      }
  }
  ```
- 删除数据

  ```java
  @Slf4j
  @SpringBootTest
  public class MybatisPlusTest {
  
      @Autowired
      private UserMapper userMapper;
  
      /**
       * 根据id删除用户
       */
      @Test
      public void deleteUserById(){
          int result = userMapper.deleteById(1587839739382059009L);
      }
  
      /**
       * 根据map删除用户
       */
      @Test
      public void deleteUserByMap(){
          HashMap<String, Object> map = new HashMap<>();
          map.put("id",2);
          map.put("age",15);
          int result = userMapper.deleteByMap(map);
      }
  
      /**
       * 多个id批量删除
       */
      @Test
      public void deleteUserBatchIds(){
          List<Long> list = Arrays.asList(1L, 2L, 3L);
          int result = userMapper.deleteBatchIds(list);
      }
  
  }
  ```
- 修改数据

  ```java
  @Slf4j
  @SpringBootTest
  public class MybatisPlusTest {
  
      @Autowired
      private UserMapper userMapper;
  
      /**
       * 根据id修改用户
       */
      @Test
      public void updateUser(){
          User user = new User();
          user.setId(4L);
          user.setName("李四");
          int result = userMapper.updateById(user);
          log.info("result====>"+result);
      }
  }
  ```
- 查询数据

  ```java
  @Slf4j
  @SpringBootTest
  public class MybatisPlusTest {
  
      @Autowired
      private UserMapper userMapper;
  
      /**
       * 批量查询用户
       */
      @Test
      public void selectUserBatchIds(){
          List<Long> list = Arrays.asList(4L, 5L, 6L);
          userMapper.selectBatchIds(list);
      }
  
      /**
       * 根据map查询用户
       */
      @Test
      public void selectUserByMap(){
          HashMap<String, Object> map = new HashMap<>();
          map.put("id",4);
          map.put("name","李四");
          List<User> users = userMapper.selectByMap(map);
          users.forEach((user )-> log.info("user====>"+user));
      }
  }
  ```
- 使用`xml`文件查询数据

  在`yml`文件中声明扫描`mapper`文件

```yml
mybatis-plus:
  configuration:
  mapper-locations: classpath*:/mapper/**/*.xml
#    别名
  type-aliases-package: com.hg.mybatisplus1.pojo
```

编写`mapper`文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.hg.mybatisplus1.mapper.UserMapper">

    <select id="getUserMapById" resultType="map">
        select u.id,u.name,u.age,u.email from mybatis_plus.user as u where id=#{id}
    </select>
  
</mapper>
```

实体类添加方法

```java
Map<String,Object> getUserMapById(int id);
```

测试

```java
@Slf4j
@SpringBootTest
public class MybatisPlusTest {

    @Autowired
    private UserMapper userMapper;
  
    /**
     * 自定义查询
     */
    @Test
    public void selectDiyUser(){
        Map<String, Object> userMapById = userMapper.getUserMapById(4);
        log.info(userMapById.toString());
    }
}
```

## 通用`Service`接口

```java
//service接口
public interface UserService extends IService<User> {
}
```

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
}
```

1. 查询数据记录数

   ```java
   @Slf4j
   @SpringBootTest
   public class ServiceTest {
   
       @Autowired
       private UserService userService;
   
       @Test
       public void serviceGetCount(){
           long count = userService.count();
           log.info("count====>"+count);
       }
   }
   ```
2. 批量添加数据

   ```java
   @Slf4j
   @SpringBootTest
   public class ServiceTest {
   
       @Autowired
       private UserService userService;
   
       /**
        * 添加多个用户
        */
       @Test
       public void serviceBatchAddUser(){
           ArrayList<User> users = new ArrayList<>();
           for (int i = 0; i < 10; i++) {
               User user = new User();
               user.setAge(20+i);
               user.setName("user"+i);
               users.add(user);
           }
   
           boolean saveBatch = userService.saveBatch(users);
           log.info("saveBatch====>"+saveBatch);
       }
   }
   ```

## 常用注解

> 1. `@TableName("user")` **设置实体类所对应的表名**
> 2. `@TableId` **将属性对应的字段指定为主键, `value ` 设置数据库指定主键名`type(enum)`  : 设置主键生成策略**
> 3. `@TableField("name") ` **指定属性中对应的字段名**
> 4. `@TableLogic`**逻辑删除,被删除的数据查询不到,但存在**
> 5. `@Version` **标注版本号(乐观锁)**
> 6. `@Repository` **将类或接口标志为持久组件**

## 条件构造器

> - `Wrapper` ： **条件构造抽象类，最顶端父类，抽象类中提供4个方法**
> - `AbstractWrapper` ： **用于查询条件封装，生成 `sql` 的 `where` 条件**
> - `AbstractLambdaWrapper` ： **`Lambda` 语法使用 `Wrapper`统一处理解析 `lambda` 获取 `column`。**
> - `LambdaQueryWrapper` ：**用于`Lambda`语法使用的查询`Wrapper`**
> - `LambdaUpdateWrapper` ： **`Lambda` 更新封装`Wrapper`**
> - `QueryWrapper` ： **`Entity` 对象封装操作类，不使用`lambda`语法**
> - `UpdateWrapper` ： **`Update` 条件封装，用于`Entity`对象更新操作

![download](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677132-bec2a02315ee34cfb5c8f8b2f6b268fcb1dbaeda.png)

属性( **[博客](https://www.cnblogs.com/nongzihong/p/12661446.html)** )

![png](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677137-9216e4713048635e971851a950856de35ede765d.png)

### `QueryWrapper`构造器

```java
@Slf4j
@SpringBootTest
public class QueryWrapperTest {

    @Autowired
    private UserMapper userMapper;

    /**
     *  多条件查询 名字中包含'a'且年龄在20~30之间,邮箱信息不为空 <p>
     *  sql : SELECT id,name,age,email,is_delete FROM user WHERE is_delete=0 AND (name LIKE ? AND age BETWEEN ? AND ? AND email IS NOT NULL)
     */
    @Test
    public void selectTest1(){
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.like("name","a")
                .between("age",20,23)
                .isNotNull("email");
        List<User> users = userMapper.selectList(wrapper);
        users.forEach(System.out::println);
    }

    /**
     *  查询用户信息  按年龄降序,相同按照id升序排序 <p>
     *  sql : SELECT id,name,age,email,is_delete FROM user WHERE is_delete=0 ORDER BY age DESC,id ASC
     */
    @Test
    public void selectTest2(){
        QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
        userQueryWrapper.orderByDesc("age")
                .orderByAsc("id");
        List<User> users = userMapper.selectList(userQueryWrapper);
        users.forEach(System.out::println);
    }

    /**
     *  删除邮箱地址为null的用户信息,由于添加了逻辑删除,sql变了修改 <p>
     *  sql : UPDATE user SET is_delete=1 WHERE is_delete=0 AND (email IS NULL)
     */
    @Test
    public void deleteTest1(){
        QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
        userQueryWrapper.isNull("email");
        int result = userMapper.delete(userQueryWrapper);
        log.info("result----"+result);
    }

    /**
     *  修改 (年龄大于20并且用户名中包含的'a') 或者 (邮箱为空的用户信息) <p>
     *  sql : UPDATE user SET age=? WHERE is_delete=0 AND (age > ? AND name LIKE ? OR email IS NULL)
     */
    @Test
    public void updateTest1(){
        QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
        userQueryWrapper.gt("age",20)
                .like("name","a")
                .or()
                .isNull("email");
        User user = new User();
        user.setAge(20);
        int result = userMapper.update(user,userQueryWrapper);
        log.info("result----"+result);
    }

    /**
     *  条件优先级
     *  修改用户名中包含'a' 并且 (年龄大于20或者邮箱为null) 的信息 <p>
     *  sql : UPDATE user SET age=? WHERE is_delete=0 AND (name LIKE ? AND (age > ? OR email IS NULL))
     */
    @Test
    public void updateTest2(){
        QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
        userQueryWrapper.like("name","a")
                .and(( i->i.gt("age",20).or().isNull("email") ) );
        User user = new User();
        user.setAge(35);
        int result = userMapper.update(user,userQueryWrapper);
        log.info("result----"+result);
    }

    /**
     *  组装select字句,查询指定字段 <p>
     *  sql : SELECT name,age,email FROM user WHERE is_delete=0
     */
    @Test
    public void select1(){
        QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
        userQueryWrapper.select("name","age","email");
        List<Map<String, Object>> maps = userMapper.selectMaps(userQueryWrapper);
        maps.forEach(System.out::println);
    }

    /**
     *  组装子查询,通过查询到的id查询所有信息 <p>
     *  sql : SELECT id,name,age,email,is_delete FROM user WHERE is_delete=0 AND (id IN (select id from user where id >= 4))
     */
    @Test
    public void select2(){
        QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
        userQueryWrapper.inSql("id","select id from user where id >= 4");
        List<User> users = userMapper.selectList(userQueryWrapper);
        users.forEach(System.out::println);
    }
  
}
```

### `UpdateWrapper`构造器

```java
@SpringBootTest
public class UpdateWrapperTest {

    @Autowired
    private UserMapper userMapper;

    /**
     *  将用户中包含a并且 (年龄大于20,或者邮箱为null) 的用户信息修改 <p>
     *  sql : UPDATE user SET name=?,email=? WHERE is_delete=0 AND (name LIKE ? AND (age > ? OR email IS NULL))
     */
    @Test
    public void update1(){
        UpdateWrapper<User> wrapper = new UpdateWrapper<>();
        wrapper.like("name","a1")
                .and(i -> i.gt("age",20).or().isNull("email"))
                .set("name","aaa")
                .set("email","123@qq.com");
        int result = userMapper.update(new User(), wrapper);
        System.out.println(result);
    }

    /**
     *  按条件拼接sql <p>
     *  sql : SELECT id,name,age,email,is_delete FROM user WHERE is_delete=0 AND (age > ? AND age <= ?)
     */
    @Test
    public void test2(){
        String name = "";
        Integer ageBegin = 20;
        Integer ageEnd = 30;

        QueryWrapper<User> wrapper = new QueryWrapper<>();

        //StringUtils.isNotBlank(name) plus包 判断一个字符串不能为空,不能为null,不能为""
        if( StringUtils.isNotBlank(name) ){
            wrapper.like("name",name);
        }
        if (ageBegin != null ){
            wrapper.gt("age",ageBegin);
        }
        if (ageEnd != null ){
            wrapper.le("age",ageEnd);
        }

        List<User> users = userMapper.selectList(wrapper);
        users.forEach(System.out::println);
    }

    /**
     *  按 condition 组装条件拼接sql <p>
     *  sql : SELECT id,name,age,email,is_delete FROM user WHERE is_delete=0 AND (age > ? AND age <= ?)
     */
    @Test
    public void test3(){
        String name = "";
        Integer ageBegin = 20;
        Integer ageEnd = 30;
        QueryWrapper<User> wrapper = new QueryWrapper<>();

        wrapper.like(StringUtils.isNotBlank(name),"name",name)
                .gt(ageBegin != null,"age",ageBegin)
                .le(ageEnd != null,"age",ageEnd);

        List<User> users = userMapper.selectList(wrapper);
        users.forEach(System.out::println);
    }

}
```

### `Lambda`语法构造器

```java
@Slf4j
@SpringBootTest
public class LambdaWrapperTest {

    @Autowired
    private UserMapper userMapper;

    /**
     *  sql : SELECT id,name,age,email,is_delete FROM user WHERE is_delete=0 AND (age > ? AND age <= ?)
     */
    @Test
    public void LambdaQueryWrapperTest(){
        String name = "";
        Integer ageBegin = 15;
        Integer ageEnd = 30;

        LambdaQueryWrapper<User> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.like(StringUtils.isNotBlank(name),User::getName,name)
                .gt(ageBegin != null,User::getAge,ageBegin)
                .le(ageEnd != null, User::getAge,ageEnd);
        List<User> users = userMapper.selectList(lambdaQueryWrapper);
        users.forEach(System.out::println);
    }

    /**
     *  将用户名中包含"A"并且 (年龄大于20或者邮箱为null) 的用户信息修改 <p>
     *  sql : UPDATE user SET name=?,email=? WHERE is_delete=0 AND (name LIKE ? AND (age > ? OR email IS NULL))
     */
    @Test
    public void LambdaUpdateWrapperTest(){
        LambdaUpdateWrapper<User> lambdaUpdateWrapper = new LambdaUpdateWrapper<>();
        lambdaUpdateWrapper.like(User::getName,"A")
                .and(i -> i.gt(User::getAge,20).or().isNull(User::getEmail))
                .set(User::getName,"张三")
                .set(User::getEmail,"123@qq.com");
        int result = userMapper.update(null, lambdaUpdateWrapper);
        log.info("result------"+result);
    }
}
```

## `MybatisPlus`分页

```java
@SpringBootTest
public class MybatisPlusPlugInsTest {
    @Autowired
    private UserMapper userMapper;

    /**
     *  分页查询 <p>
     *  SQL : SELECT id,name,age,email,is_delete FROM user WHERE is_delete=0 LIMIT ?,?
     */
    @Test
    public void pageTest1(){
        Page<User> page = new Page<>(2,3);
        QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
        //把结果封装到传入的page中
        userMapper.selectPage(page, userQueryWrapper);

        //获取当前页面数据
        System.out.println(page.getRecords());
        //总页数
        System.out.println(page.getPages());
        //当前页面
        System.out.println(page.getCurrent());
        //页面数据记录
        System.out.println(page.getSize());
        //总记录数
        System.out.println(page.getTotal());
        //是否有下一页
        System.out.println(page.hasNext());
        //是否有上一页
        System.out.println(page.hasPrevious());
    }
}
```

### 自定义分页查询

- 接口类添加分页方法

  ```java
  @Repository
  public interface UserMapper extends BaseMapper<User> {
  
      /**
       * 根据id查询用户
       */
      Map<String,Object> getUserMapById(int id);
  
      /**
       *  根据年龄查询具体页面数据
       * @param page  mybatisPlus提供,必须放在形式参数的第一位
       * @param age   年龄
       * @return
       */
      Page<User> selectPageVo(@Param("page") Page<User> page,@Param("age") Integer age);
  }
  ```
- 分页插件配置

  ```java
  @MapperScan("com.hg.mybatisplus1.mapper")
  @Configuration
  public class MybatisPlusConfig {
  
      @Bean
      public MybatisPlusInterceptor mybatisPlusInterceptor(){
          MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
          //分页插件
          interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL) );
          return interceptor;
      }
  }
  ```
- 映射文件编写sql

  ```xml
  <?xml version="1.0" encoding="UTF-8" ?>
  <!DOCTYPE mapper
          PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
          "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
  <mapper namespace="com.hg.mybatisplus1.mapper.UserMapper">
  
      <select id="getUserMapById" resultType="map">
          select u.id,u.name,u.age,u.email from mybatis_plus.user as u where id=#{id}
      </select>
  
      <select id="selectPageVo" resultType="user">
          select * from mybatis_plus.user where age > #{age}
      </select>
  </mapper>
  ```
- 测试

  ```java
  @SpringBootTest
  public class MybatisPlusPlugInsTest {
      @Autowired
      private UserMapper userMapper;
  
      /**
       *  自定义分页查询
       *  SQL : select * from mybatis_plus.user where age > ? LIMIT ?,?
       */
      @Test
      public void diyPage(){
          Page<User> page = new Page<>(2,3);
          userMapper.selectPageVo(page,15);
          page.getRecords().forEach(System.out::println);
      }
  }
  ```

## 乐观锁和悲观锁

**乐观锁和悲观锁是两种思想，用于解决并发场景下的数据竞争问题。**

> `乐观锁`：乐观锁在操作数据时非常乐观，认为别人不会同时修改数据。因此乐观锁不会上锁，只是在执行更新的时候判断一下在此期间别人是否修改了数据：如果别人修改了数据则放弃操作，否则执行操作。
>
> `悲观锁`：悲观锁在操作数据时比较悲观，认为别人会同时修改数据。因此操作数据时直接把数据锁住，直到操作完成后才会释放锁；上锁期间其他人不能修改数据。

### 乐观锁实现

**场景**

—件商品，成本价是80元，售价是100元。老板先是通知小李，说你去把商品价格增加50元。小李玩游戏，耽搁了一个小时。正好一个小时后，老板觉得商品价格增加到150元，价格太高，可能会影响销量。又通知小王，把商品价格降低30元。
此时，小李和小王同时操作商品后台系统。小李操作的时候，系统先取出商品价格100元;小王也在操作，取出的商品价格也是100元。小李将价格加了50元，并将100+50=150元存入了数据库;小王将商品减了30元，并将100-30=70元存入了数据库。因为没有锁，小李的操作完全被小王的覆盖。导致商品价格变为70元，比成本价低了10元。几分钟后，这个商品很快出售了1千多件商品，老板亏万多。

**开启乐观锁插件支持**

```java
@MapperScan("com.hg.mybatisplus1.mapper")
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor(){
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        //分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL) );
        //乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        return interceptor;
    }
}
```

**实体类属性添加`@Version`注解**

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("product")
public class Product {

    @TableId
    private Integer id;
    private String name;
    private Integer price;
    @Version
    private Integer version;
}
```

**接口**

```java
@Repository
public interface ProductMapper extends BaseMapper<Product> {
}
```

**测试**

```java
@Slf4j
@SpringBootTest
public class LockTest {

    @Autowired
    private ProductMapper productMapper;

    @Test
    public void test2(){
        Product xiaoWan = productMapper.selectById(1);
        log.info("小王查询到的价格是----"+xiaoWan.getPrice());

        Product xiaoLi = productMapper.selectById(1);
        log.info("小李查询到的价格是----"+xiaoLi.getPrice());

        //小王调整价格增加50
        xiaoWan.setPrice(xiaoWan.getPrice() + 50);
        productMapper.updateById(xiaoWan);
        log.info("小王修改后商品的价格是"+productMapper.selectById(1).getPrice());
        //小李将价格下降30
        xiaoLi.setPrice(xiaoLi.getPrice() - 30 );
        int result = productMapper.updateById(xiaoLi);
        //修改失败,重新获取版本号进行修改
        if (result == 0 ){
            //获取新的版本号
            Product productNew = productMapper.selectById(1);
            productNew.setPrice(productNew.getPrice()-30);
            productMapper.updateById(productNew);
        }
        log.info("小李修改后商品的价格是"+productMapper.selectById(1).getPrice());
    }

}
```

### 悲观锁实现

**悲观锁的实现，往往依靠数据库提供的锁机制**

> 1. 在对记录进行修改之前，先尝试为该记录加上排它锁`exclusive locking`
> 2. 如果加锁失败，说明该记录正在被修改，那么当前查询可能要等待或者抛出异常。具体响应方式由开发者根据实际需要决定。
> 3. 如果成功加锁，那么就可以对记录做修改，事务完成后就会解锁了
> 4. 期间如果有其他对该记录做修改或加排它锁的操作，都会等待解锁或直接抛出异常

**拿比较常用的MySql Innodb引擎举例，来说明一下在SQL中如何使用悲观锁。**

要使用悲观锁，必须关闭`MySQL`数据库的自动提交属性，因为`MySQL`默认使用`autocommit`模式，也就是说，当执行一个更新操作后，MySQL会立刻将结果进行提交。(sql语句： set autocomment=0)

以下单过程中扣减库存的需求说明一下悲观锁的使用：

![905646-863682648](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677153-f6b0b8c6c5b1dcf7b7184a7acb3e67626323980d.png)

以上，在对id = 1的记录修改前，先通过for update的方式进行加锁，然后再进行修改。这是比较典型的悲观锁策略

如果以上修改库存的代码发生并发，同一时间只有一个线程可以开启事务并获得id=1的锁，其它的事务必须等本次事务提交之后才能执行。这样可以保证当前的数据不会被其它事务修改。

上面提到，使用`select... for update`会把数据给锁住，不过需要注意一些锁的级别，MySQL InnoDB默认行级锁。行级锁都是基于索引的，**如果一条SQL语句用不到索引是不会使用行级锁的，会使用表级锁把整张表锁住**

**悲观锁**

> - **优点**：悲观锁利用数据库中的锁机制来实现数据变化的顺序执行，这是最有效的办法
> - **缺点**：一个事务用悲观锁对数据加锁之后，其他事务将不能对加锁的数据进行除了查询以外的所有操作，如果该事务执行时间很长，那么其他事务将一直等待，那势必影响我们系统的吞吐量。

**乐观锁**

> - **优点**：乐观锁不在数据库上加锁，任何事务都可以对数据进行操作，在更新时才进行校验，这样就避免了悲观锁造成的吞吐量下降的劣势。
> - **缺点**：乐观锁因为是通过我们人为实现的，它仅仅适用于自己业务中，如果有外来事务插入，那么就可能发生错误。

**应用场景**

> **悲观锁**：因为悲观锁会影响系统吞吐的性能，所以适合应用在写为居多的场景下。
>
> **乐观锁**：因为乐观锁就是为了避免悲观锁的弊端出现的，所以适合应用在读为居多的场景下。

#### 参考博客

> 知乎  [面试灵魂四问] https://zhuanlan.zhihu.com/p/95296289
>
> 博客园 [什么是乐观锁,悲观锁]  https://www.cnblogs.com/kiko2014551511/p/13129818.html
>
> 博客园 [面试题系列] https://www.cnblogs.com/kismetv/p/10787228.html

## 通用枚举

**创建枚举**

```java
@Getter
public enum SexEnum {
    MALE(1,"男"),
    FEMALE(0,"女");
    /**
     *  性别
     *  EnumValue : 将注解所标记的属性值存放到数据库中
     */
    @EnumValue
    final private Integer sex;

    /**
     *  性别名称
     */
    final private String sexName;

    SexEnum(Integer sex, String sexName) {
        this.sex = sex;
        this.sexName = sexName;
    }
}
```

**实体类添加枚举**

```java
@SuppressWarnings("all")
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("user")                                 //设置实体类所对应的表名
public class User {

    /**
     *  TableId 将属性对应的字段指定为主键
     *      value : 设置数据库指定主键名
     *      type(enum)  : 设置主键生成策略
     */
    @TableId
    private Long id;
    @TableField("name")                             //指定属性中对应的字段名
    private String name;
    private Integer age;
    private String email;
    @TableLogic                                     //逻辑删除,被删除的数据查询不到,但存在
    private Integer isDelete;
    private SexEnum sex;
}
```

![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677161-9476a88c23b19b680868af9f04a62e90bd0f0f4b.png)

## MybatisPlus逆向工程

**添加依赖**

```xml
<!--  mybatisPlus逆向工程代码生成器   -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>3.5.3</version>
</dependency>

<!--  引擎模板  -->
<dependency>
    <groupId>org.freemarker</groupId>
    <artifactId>freemarker</artifactId>
</dependency>
```

**Demo**

```java
public class FastAutoGeneratorTest {
    public static void main(String[] args) {
        FastAutoGenerator.create("jdbc:mysql://localhost:3306/mybatis_plus?serverTimezone=GMT%2B8&characterEnding=utf-8&useSSL=false&allowPublicKeyRetrieval=true",
                        "root", "123456")
                .globalConfig(builder -> {
                    // 设置作者
                    builder.author("demo")
                        //.enableSwagger() // 开启 swagger 模式
                        // 覆盖已生成文件
                        .fileOverride()
                        // 指定输出目录
                        .outputDir("D://demo//mybatis_plus");
                })
                .packageConfig(builder -> {
                    // 设置父包名
                    builder.parent("com.demo")
                            // 设置父包模块名
                            .moduleName("mybatisplus")
                            // 设置mapperXml生成路径
                            .pathInfo(Collections.singletonMap(OutputFile.mapper, "D://Temp//mybatis_plus"));
                })
                .strategyConfig(builder -> {
                    // 设置需要生成的表名
                    builder.addInclude("user")
                            // 设置过滤表前缀
                            .addTablePrefix("t_", "c_");
                })
                // 使用Freemarker引擎模板，默认的是Velocity引擎模板
                .templateEngine(new FreemarkerTemplateEngine())
                .execute();
    }
}
```

## 多环境数据源

- 创建两个数据库,主数据库`t_product`表中插入数据

  ```sql
  create database `mybatis_plus_2`;
  use `mybatis_plus_2`;
  
  CREATE TABLE `t_product` ( 
      id BIGINT(20) NOT NULL COMMENT '主键ID', 
      NAME VARCHAR(30) NULL DEFAULT NULL COMMENT '商品名称', 
      price INT(11) DEFAULT 0 COMMENT '价格', 
      version INT(11) DEFAULT 0 COMMENT '乐观锁版本号', 
      PRIMARY KEY (id)
  )engine=innodb default charset=utf8;
  
  INSERT INTO t_product_1 (id, NAME, price) VALUES (1, '外星人笔记本', 100);
  ```
  ![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677168-1fe480aa01c13fce7da825d3d27463f9d0b374e1.png)
- 依赖

  ```xml
  <!--  多数据源-->
  <dependency>
      <groupId>com.baomidou</groupId>
      <artifactId>dynamic-datasource-spring-boot-starter</artifactId>
      <version>3.5.2</version>
  </dependency>
  ```
- `dynamic`文档 https://www.kancloud.cn/tracy5546/dynamic-datasource/2264611
- 配置多套数据源

  ```yml
  spring:
    # 配置数据源信息
    datasource:
      dynamic:
        # 设置默认的数据源或者数据源组,默认值即为master
        primary: master
        # 严格匹配数据源,默认false.true未匹配到指定数据源时抛异常,false使用默认数据源
        strict: false
        datasource:
          master:
            driver-class-name: com.mysql.cj.jdbc.Driver
            url: jdbc:mysql://localhost:3306/mybatis_plus_1?serverTimezone=GMT%2B8&characterEnding=utf-8&useSSL=false&allowPublicKeyRetrieval=true
            username: root
            password: 123456
          server_1:
            driver-class-name: com.mysql.cj.jdbc.Driver
            url: jdbc:mysql://localhost:3306/mybatis_plus_2?serverTimezone=GMT%2B8&characterEnding=utf-8&useSSL=false&allowPublicKeyRetrieval=true
            username: root
            password: 123456
  mybatis-plus:
    configuration:
      log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
      #设置全局表前缀
    global-config:
      db-config:
    #    id-type: auto
        table-prefix: t_
    type-aliases-package: com.hg.mybatisplus.pojo
  ```
- `Service`接口&实现类

  **通过`@DS`注解选择数据源**

  ```java
  public interface ProductService extends IService<Product> {
  }
  ```
  ```java
  @DS("server_1")                           //选择数据源
  @Service
  public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {
  }
  ```
- 测试

  1. 主数据源

     ```java
     @SpringBootTest
     class MybatisPlus2ApplicationTests {
     
         @Autowired
         private ProductService productService;
     
         @Test
         void contextLoads() {
             Product byId = productService.getById(1);
             System.out.println(byId);
         }
     
     }
     ```
     ![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677177-7d82b522397d96e10689a034e4b5e7a96b4cb96d.png)
  2. 副数据源

     ![image](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710677180-4096b120c9d49311565b09c52f71207a0f5d59c3.png)
