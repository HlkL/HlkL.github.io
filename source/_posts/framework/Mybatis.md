---
title: mybatis框架学习
date: 2022-11-02 15:34:22
updated: 2022-11-02 15:34:22
tags:
  - framework
---

#### Maven导入jar包

```xml

<dependencies>

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

    <!-- https://mvnrepository.com/artifact/junit/junit -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
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

#### mybatis核心配置文件

**在配置文件中所有的标签都要按照指定的顺序放置**
`properties`  `settings`  `typeAliases`  `typeHandlers`  `objectFactory`
`objectWrapperFactory`  `reflectorFactory`  `plugins`  `environments`
`databaseIdProvider`  `mappers`

###### 引入外部资源(数据库配置文件)

```xml

<!-- 引入外部资源-->
<properties resource="db.properties">
    <!--  添加属性 优先使用外部配置文件-->
    <property name="username" value="root"/>
</properties>

```

###### 配置文件设置

1. 日志配置 **`STDOUT_LOGGING`** Mybatis默认日志,**`LOG4J`** 第三方日志(需导入对应jar包)

```xml
<settings>
    <!-- 系统日志-->
    <!--        <setting name="logImpl" value="STDOUT_LOGGING"/>-->
    <setting name="logImpl" value="LOG4J"/>
</settings>
```

2. **`LOG4J`** 配置

```properties
log4j.rootLogger = debug,console,file

log4j.appender.console = org.apache.log4j.ConsoleAppender
log4j.appender.console.Target = System.out
log4j.appender.console.Threshold = DEBUG
log4j.appender.console.layout = org.apache.log4j.PatternLayout
log4j.appender.console.layout.ConversionPattern = [%c]-%m%n

log4j.appender.file = org.apache.log4j.FileAppender
log4j.appender.file.File = ./log/log4j.log
log4j.appender.file.Threshold = DEBUG
log4j.appender.file.layout = org.apache.log4j.PatternLayout
log4j.appender.file.layout.ConversionPattern = [%p][%d{yyyy-MM--dd}][%c]%m%n

log4j.logger.org.mybatis=dubug
log4j.logger.java.sql=dubug
log4j.logger.java.sql.Statement=dubug
log4j.logger.java.sql.PreparedStatement=dubug
log4j.logger.java.sql.ResultSet=dubug
```

3. 开启驼峰命名自动映射

```xml
<settings>
    <setting name="mapUnderscoreToCamelCase" value="true"/>
</settings>
```

###### 实体类起别名

1. 可以使用过注解 "`@Alias`" 起别名

```java

@Alias("hello")
public class User {
    private int id;
    private String name;
    private String pwd;
}
```

2. 给包起别名 子类可以直接使用类名

```xml
<typeAliases>
    <package name="com.hg.pojo"/>
</typeAliases>
```

3. 给实体类起别名

```xml
<typeAliases>
    <typeAlias type="com.hg.pojo.User" alias="user"/>
</typeAliases>
```

###### 环境配置

一个Mybatis可以有多套环境配置,但只会生效一个,JDBC参数可以引入外部资源,也可以手动添加

```xml
<environments default="development">
    <!--        默认环境,可以有多套环境-->
    <environment id="development">
        <transactionManager type="JDBC"/>
        <dataSource type="POOLED">
            <property name="driver" value="${driver}"/>
            <property name="url" value="${url}"/>
            <property name="username" value="${username}"/>
            <property name="password" value="${password}"/>
        </dataSource>
    </environment>
</environments>
```

###### Mapper文件映射

1. 当`mapper.xml`文件和`Mapper`接口类在同一个包下时可以使用class进行映射
2. 当`mapper.xml`文件和`Mapper`接口类所在包同名时用resource进行映射
3. `mapper.xml`文件可使用包扫描
4. `mapper.xml`文件必须和接口类同名同包

```xml
<mappers>
    <mapper resource="com/hg/mapper/UserMapper.xml"/>
    <!--        和接口在同一个包下-->
    <!--        <mapper class="com.hg.mapper.UserMapper"/>-->
    <!--        扫描包-->
    <!--        <package name="com/hg/mapper"/>-->
</mappers> 
```

#### Mapper文件编写

1. 每个`mapper.xml`文件都对应一个`mapper`接口类,使用 **`namespace`** 引入命名空间
2. 在idea编译器中连接数据后,配置sql方言可以在`mapper.xml`进行智能提醒
3. 在`mapper.xml`文件中java的包装类型都是用其对应的基本类型 比如`Integer`类型使用时为`_int`
4. java基础类型使用时须在类型前添加 **_** 比如`int`类型使用时为`_int`
5. 使用引用类时需添加完整路径

###### 基础数据库的 `CRUD` 操作代码示例

```xml
<select id="getUserList" resultType="hello">
    select *
    from mybatis.user
</select>

<insert id="addUser" parameterType="com.hg.pojo.User">
    insert into mybatis.user(name, pwd)
    values (#{name}, #{pwd})
</insert>

<update id="updateUser" parameterType="com.hg.pojo.User">
    update mybatis.user
    set name=#{name},
        pwd=#{pwd}
    where id = #{id}
</update>

<delete id="delUser" parameterType="_int">
    delete
    from mybatis.user
    where id = #{id}
</delete>
```

1. 使用注解实现查询

```java
@Select("select * from mybatis.user where id=#{id}")
User getUserById(int id);
```

2. 万能的Map

```java
List<User> getUserList2(Map<String,Object> map);
```

```xml
<!--    分页查询-->
<select id="getUserList2" resultType="com.hg.pojo.User" parameterType="map">
    select * from mybatis.user limit #{currentPageNode},#{pageSize};
</select>
```

```java
public class UserDaoTest {
    @Test
    public void getUserById2(){
        //第一步：获得SqlSession对象
        SqlSession sqlSession = MybatisUtils.getSqlSession();

        //方式一：getMapper
        UserMapper userDao = sqlSession.getMapper(UserMapper.class);
        Map<String, Object> map = new HashMap<>();
        map.put("currentPageNode",0);
        map.put("pageSize",2);
      
        List<User> userList2 = userDao.getUserList2(map);
        //关闭SqlSession
        sqlSession.close();
    }
}
```

###### mapper层操作数据库Demo

1. 新建数据库操作工具类获取`sqlSessionFactory`

```java
public class MybatisUtils {
    private static SqlSessionFactory sqlSessionFactory;

    static {
        try {
            String resource = "mybatis-config.xml";
            InputStream inputStream = Resources.getResourceAsStream(resource);
            sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     *
     * 既然有了 SqlSessionFactory，顾名思义，我们可以从中获得 SqlSession 的实例。
     * SqlSession 提供了在数据库执行 SQL 命令所需的所有方法。
     *
     */
    public static SqlSession getSqlSession(){
        return sqlSessionFactory.openSession();
    }
}
```

2. 使用`sqlSession`中的`getMaper`方法用过反射获取操作类对象
3. 通过获取到的对象使用具体方法,并传入所需参数

```java
public class UserDaoTest {
    @Test
    public void getUserList() {
        //第一步：获得SqlSession对象
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        //方式一：getMapper
        UserMapper userDao = sqlSession.getMapper(UserMapper.class);
        List<User> userList = userDao.getUserList();
        for (User user : userList) {
            System.out.println(user);
        }
        //关闭SqlSession
        sqlSession.close();
    }
}
```

#### 数据库查询

##### 多对一

学生实体类

```java
@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Student {
    private int id;
    private String name;
    private Teacher teacher;
}
```

老师实体类

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Teacher {
    private int id;
    private String name;
}
```

接口

```java
public interface StudentMapper {

    List<Student> getStudent();

    List<Student> getStudent2();

}
```

测试

```java
public class MapperTest {
    //生成日志对象
    static Logger logger = Logger.getLogger(MapperTest.class);

    @Test
    public void getStudent1() {
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        StudentMapper students = sqlSession.getMapper(StudentMapper.class);
        List<Student> studentsList = students.getStudent();
      
        sqlSession.close();
    }
}
```

###### 方式一

子查询 查询所有学生信息,根据id查询对应的老师

```xml
<select id="getStudent" resultMap="StudentTeacher">
    select * from mybatis.student;
</select>

<resultMap id="StudentTeacher" type="Student">
    <result property="id" column="id"/>
    <result property="name" column="name"/>
    <!--        复杂属性单独处理, association:对象   collection:集合 -->
    <association property="teacher" column="tid" javaType="Teacher" select="getTeacher"/>
</resultMap>

<select id="getTeacher" resultType="Teacher">
    select * from mybatis.teacher where id = #{tid};
</select>
```

###### 方式二

按结果嵌套查询

```xml
<select id="getStudent2" resultMap="StudentTeacher2">
    select s.id sid,s.name sname,t.name tname
    from mybatis.student s,mybatis.teacher t
    where s.tid = t.id;
</select>

<resultMap id="StudentTeacher2" type="Student">
    <result property="id" column="sid"/>
    <result property="name" column="sname"/>
    <association property="teacher" javaType="Teacher">
        <result property="name" column="tname"/>
    </association>
</resultMap>
```

##### 一对多

老师实体类

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Teacher {
    private int id;
    private String name;
    private List<Student> students;
}
```

学生实体类

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Student {
    private int id;
    private String name;
    private int tid;
}
```

接口

```java
public interface TeacherMapper {

    Teacher getTeacherById1(@Param("tid") int id);

    Teacher getTeacherById2(@Param("tid") int id);
}
```

测试

```java
public class MapperTest {
    @Test
    public void getTeacherById1() {
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        TeacherMapper mapper = sqlSession.getMapper(TeacherMapper.class);
        Teacher teacher = mapper.getTeacherById1(1);
        System.out.println(teacher);
        sqlSession.close();
    }
}
```

###### 方式一

子查询 查询所有老师信息,根据id查询对应的学生

```xml
<select id="getTeacherById2" resultMap="StudentTeacher2">
    select * from mybatis.teacher where id = #{tid};
</select>

<resultMap id="StudentTeacher2" type="Teacher">
    <!--        实体类属性和数据库字段一样,可以省略-->
    <collection property="students" javaType="ArrayList" ofType="Students" select="getStudent" column="id"/>
</resultMap>

<select id="getStudent" resultType="Student">
    select * from mybatis.student where tid = #{tid};
</select>
```

###### 方式二

按结果嵌套查询

```xml
<select id="getTeacherById1" resultMap="StudentTeacher1">
    select t.id tid,t.name tname,s.id sid,s.name sname
    from mybatis.teacher t,mybatis.student s
    where s.tid = t.id and t.id=#{tid};
</select>

<resultMap id="StudentTeacher1" type="Teacher">
    <result property="id" column="tid"/>
    <result property="name" column="tname"/>
    <!--   ofType : 集合中的类型
            javatype: 属性类型
         -->
    <collection property="students" ofType="Student">
        <result property="id" column="sid"/>
        <result property="name" column="sname"/>
        <result property="tid" column="tid"/>
    </collection>
</resultMap>
```

#### 动态SQL

实体类

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Blog {
    private String id;
    private String title;
    private String author;
    private Date createTime;
    private int views;
}
```

接口

```java
@SuppressWarnings("all")
public interface BlogMapper {
    //插入数据
    int addBlog(Blog blog);

    //查询博客
    List<Blog> queryBlogIF(Map map);

    List<Blog> queryBlogChoose(Map map);

    int updateBlogSET(Map map);

    Blog queryBlogForeach(Map map);

}
```

测试

```java
public class MapperTest {
    //生成日志对象
    static Logger logger = Logger.getLogger(MapperTest.class);

    @Test
    public void addBlog(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        BlogMapper mapper = sqlSession.getMapper(BlogMapper.class);
        Blog blog = new Blog();
        blog.setId(IDutils.getId());
        blog.setTitle("Mybatis");
        blog.setAuthor("狂神说");
        blog.setCreateTime(new Date());
        blog.setViews(9999);

        mapper.addBlog(blog);

        blog.setId(IDutils.getId());
        blog.setTitle("Java");
        mapper.addBlog(blog);

        blog.setId(IDutils.getId());
        blog.setTitle("Spring");
        mapper.addBlog(blog);

        blog.setId(IDutils.getId());
        blog.setTitle("微服务");
        mapper.addBlog(blog);

        sqlSession.commit();
        sqlSession.close();
    }

    @Test
    public void queryBlogIF(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        BlogMapper mapper = sqlSession.getMapper(BlogMapper.class);
        HashMap<String, Object> map = new HashMap<>();

        mapper.queryBlogIF(map);

        map.put("title","java");
        mapper.queryBlogIF(map);
        sqlSession.close();
    }

    @Test
    public void queryBlogIF2(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        BlogMapper mapper = sqlSession.getMapper(BlogMapper.class);
        HashMap<String, Object> map = new HashMap<>();

        map.put("title","java");
//        map.put("author","hg");
        map.put("views",9999);

        mapper.queryBlogChoose(map);
        sqlSession.close();
    }

    @Test
    public void updateBlogSET(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        BlogMapper mapper = sqlSession.getMapper(BlogMapper.class);
        HashMap<String, Object> map = new HashMap<>();

        map.put("title","Mybatis");
        map.put("author","hg");
//        map.put("views",9999);
        map.put("id","f5ad3bce81014d2e9b0c2d1add63b12e");

        mapper.updateBlogSET(map);
        sqlSession.commit();
        sqlSession.close();
    }


    @Test
    public void queryBlogForeach(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        BlogMapper mapper = sqlSession.getMapper(BlogMapper.class);

        HashMap<String, Object> map = new HashMap<>();
        ArrayList<Integer> ids = new ArrayList<>();
        ids.add(1);
        ids.add(2);
        ids.add(3);
        ids.add(4);
        map.put("ids",ids);
        mapper.queryBlogForeach(map);
        sqlSession.close();
    }
}
```

##### if语句动态查询

```xml
<select id="queryBlogIF" parameterType="map" resultType="Blog">
    select * from blog

    <where>
        <if test="title != null ">
            and title = #{title}
        </if>
        <if test="author != null ">
            and author = #{author}
        </if>
    </where>

</select>
```

##### choose查询

```xml
<select id="queryBlogChoose" parameterType="map" resultType="Blog">
    select * from blog
    <where>
        <choose>
            <when test=" title != null ">
                and title = #{title}
            </when>
            <when test=" author != null ">
                and author = #{author}
            </when>
            <otherwise>
                and views= #{views}
            </otherwise>
        </choose>
    </where>
</select>
```

##### set查询

```xml
<update id="updateBlogSET" parameterType="map">
    update blog
    <set>
        <include refid="updateBlogSET"/>
    </set>
    where id=#{id}
</update>
```

##### sql语句复用

**使用SQL标签抽取公共部分代码,通过 include 标签实现复用**

```xml
<sql id="updateBlogSET">
    <if test=" title != null ">
        title = #{title},
    </if>
    <if test=" author != null ">
        author = #{author},
    </if>
    <if test=" views != null ">
        views = #{views},
    </if>
</sql>
```

##### foreach查询

```xml
<select id="queryBlogForeach" parameterType="map" resultType="Blog">
    select * from blog
    <where>
        <foreach collection="ids" item="id" open="and (" close=")" separator="or">
            id = #{id}
        </foreach>
    </where>
</select>
```
