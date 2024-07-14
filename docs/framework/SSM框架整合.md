## SSM资源整合

#### Maven配置

* 导包

```xml

<dependencies>
    <!--        springMVC-->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.3.23</version>
    </dependency>
    <!--        mybatis-->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.5.11</version>
    </dependency>
    <!--        mybatis-spring -->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis-spring</artifactId>
        <version>2.0.7</version>
    </dependency>
    <!--        spring-->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.3.23</version>
    </dependency>

    <!--        spring-jdbc -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jdbc</artifactId>
        <version>5.3.23</version>
    </dependency>

    <!--        单元测试-->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
    </dependency>
    <!--        数据库驱动-->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.30</version>
    </dependency>
    <!--数据库连接池: c3p0(当前)  dbcp(自带)  -->
    <dependency>
        <groupId>com.mchange</groupId>
        <artifactId>c3p0</artifactId>
        <version>0.9.5.5</version>
    </dependency>

    <!--        Servlet-->
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>4.0.1</version>
    </dependency>
    <!--        jsp-->
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>jsp-api</artifactId>
        <version>2.0</version>
    </dependency>
    <!--       jstl-->
    <dependency>
        <groupId>jstl</groupId>
        <artifactId>jstl</artifactId>
        <version>1.2</version>
    </dependency>
    <!--    lombok-->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>RELEASE</version>
    </dependency>

    <!--        gson-->
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.9.1</version>
    </dependency>

</dependencies>
```

* 资源过滤(静态资源导出)

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

#### 数据库连接

![在这里插入图片描述](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678207-d13f62279ce84537b1bb1b1089ef29c3.png)

* 建立基本结构和配置框架
  ![在这里插入图片描述](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678213-b6dd8ca26296470cbf78fd1b5a452c21.png)

#### 整合Mybatis

* 数据库配置文件 db.properties

```text
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/ssmbuild?useSSL=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=GMT
username=root
password=WntD436
```

* 编写Mybatis的核心配置文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
  <!--    配置数据源,交给spring做-->

  <!--    别名-->
  <typeAliases>
    <package name="com.hg.pojo"/>
  </typeAliases>

  <mappers>
    <mapper resource="com/hg/mapper/BookMapper"/>
  </mappers>

</configuration>
```

* 编写数据库实体类(实体类名称Books避免与java本身Book混淆)

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Books {
    private int bookID;
    private String bookName;
    private int bookCounts;
    private String detail;
}
```

* 接口

```java
@SuppressWarnings("all")
public interface BookMapper {
    //增加一本书
    int addBook(Books book);
    //删除一本书
    int deleteBookById(@Param("bookID") int id);
    //查找一本书
    Books queryBookById(@Param("bookID") int id);
    //修改一本书
    int updateBook(Books book);
    //查询所有书籍
    List<Books> queryAllBook();
}
```

* BookMapper

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.hg.mapper.BookMapper">

  <insert id="addBook" parameterType="Books">
    insert into ssmbuild.books(bookName, bookCounts, detail)
    VALUES (#{bookName},#{bookCounts},#{detail});
  </insert>

  <delete id="deleteBookById" parameterType="_int">
    delete from ssmbuild.books where bookID = #{bookID};
  </delete>

  <select id="queryBookById" resultType="Books">
    select * from ssmbuild.books where bookID = #{bookID};
  </select>

  <update id="updateBook" parameterType="Books">
    update ssmbuild.books
    set bookName = #{bookName},bookCounts = #{bookCounts},detail = #{detail}
    where bookID = #{bookID};
  </update>

  <select id="queryAllBook" resultType="Books">
    select * from ssmbuild.books;
  </select>

</mapper> 
```

###### service层编写

* 接口

```java
@SuppressWarnings("all")
public interface BookService {
    //增加一本书
    int addBook(Books book);
    //删除一本书
    int deleteBookById(int id);
    //查找一本书
    Books queryBookById(int id);
    //修改一本书
    int updateBook(Books book);
    //查询所有书籍
    List<Books> queryAllBook();
}
```

* 实现

```java
public class BookServiceImpl implements BookService{
    BookMapper bookMapper;

    public void setBookMapper(BookMapper bookMapper) {
        this.bookMapper = bookMapper;
    }

    @Override
    public int addBook(Books book) {
        return bookMapper.addBook(book);
    }

    @Override
    public int deleteBookById(int id) {
        return bookMapper.deleteBookById(id);
    }

    @Override
    public Books queryBookById(int id) {
        return bookMapper.queryBookById(id);
    }

    @Override
    public int updateBook(Books book) {
        return bookMapper.updateBook(book);
    }

    @Override
    public List<Books> queryAllBook() {
        return bookMapper.queryAllBook();
    }
}
```

#### 整合spring

* mapper层

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">

    <!--    1.关联数据库文件-->
    <context:property-placeholder location="classpath:db.properties"/>


    <!--    2.连接池
             1.dbcp:半自动化操作,不能自动连接
             2.c3p0:自动化操作(自动化的加载配置文件,并且可以自动化设置到对象中)
             3.druid:
             4.hikari:
    -->
    <bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
        <property name="driverClass" value="${driver}"/>
        <property name="jdbcUrl" value="${url}"/>
        <property name="user" value="${username}"/>
        <property name="password" value="${password}"/>

        <!--        c3p0私有属性-->
        <!--        最大连接-->
        <property name="maxPoolSize" value="30"/>
        <property name="minPoolSize" value="10"/>
        <!--        关闭连接后不自动commit-->
        <property name="autoCommitOnClose" value="false"/>
        <!--        获取连接超时时间-->
        <property name="checkoutTimeout" value="10000"/>
        <!--        获取连接失败重试次数-->
        <property name="acquireRetryAttempts" value="2"/>
    </bean>

    <!--    3.sqlSessionFactory-->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSource"/>

        <!--        绑定mybatis配置文件-->
        <property name="configLocation" value="classpath:mybatis-config.xml"/>
    </bean>


    <!--    配置mapper接口扫描包,动态的实现mapper可以注入spring容器中-->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <!--        注入sqlSessionFactory-->
        <property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"/>
        <!--        要扫描的包-->
        <property name="basePackage" value="com.hg.mapper"/>
    </bean>

</beans>
```

###### service层编写

* 接口

```java
@SuppressWarnings("all")
public interface BookService {
    //增加一本书
    int addBook(Books book);
    //删除一本书
    int deleteBookById(int id);
    //查找一本书
    Books queryBookById(int id);
    //修改一本书
    int updateBook(Books book);
    //查询所有书籍
    List<Books> queryAllBook();
}
```

* 实现

```java
public class BookServiceImpl implements BookService{
    BookMapper bookMapper;

    public void setBookMapper(BookMapper bookMapper) {
        this.bookMapper = bookMapper;
    }

    @Override
    public int addBook(Books book) {
        return bookMapper.addBook(book);
    }

    @Override
    public int deleteBookById(int id) {
        return bookMapper.deleteBookById(id);
    }

    @Override
    public Books queryBookById(int id) {
        return bookMapper.queryBookById(id);
    }

    @Override
    public int updateBook(Books book) {
        return bookMapper.updateBook(book);
    }

    @Override
    public List<Books> queryAllBook() {
        return bookMapper.queryAllBook();
    }
}
```

* service配置文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/aop https://www.springframework.org/schema/aop/spring-aop.xsd
        http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">

    <!--    1.扫描service下的包-->
    <context:component-scan base-package="com.hg.service"/>

    <!--    2.将我们的所有业务类注入到spring,可通过配置和注解实现-->
    <bean id="bookServiceImpl" class="com.hg.service.BookServiceImpl">
        <property name="bookMapper" ref="bookMapper"/>
    </bean>

    <!--    3.声明式事务配置-->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <!--        注入数据源-->
        <property name="dataSource" ref="dataSource"/>
    </bean>

    <!--    4.aop事务支持-->
</beans>
```

#### 整合springMVC

* 添加wab支持
* 配置web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <!--    1.DispatchService-->
    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:applicationContext.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>springmvc</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

    <!--    2.乱码过滤-->
    <filter>
        <filter-name>encoding</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>utf-8</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>encoding</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <!--    session过期时间-->
    <session-config>
        <session-timeout>10</session-timeout>
    </session-config>

</web-app>
```

* springMVC配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd
        http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">

    <!--    1.注解驱动-->
    <mvc:annotation-driven/>

    <!--    2.静态资源过滤-->
    <mvc:default-servlet-handler/>
    <!--    3.扫描包-->
    <context:component-scan base-package="com.hg.controller"/>
    <!--    4.视图解析器-->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <!--        前缀-->
        <property name="prefix" value="/WEB-INF/jsp/"/>
        <!--        后缀-->
        <property name="suffix" value=".jsp"/>
    </bean>
</beans>
```
