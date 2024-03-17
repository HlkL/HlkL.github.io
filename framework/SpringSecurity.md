8. security 三种方式设置登录用户名和密码
9. 数据库查询用户
10. 自定义登录页面
11. 基于角色或权限进行访问控制

    - ***hasAuthority*** 单个权限
    - ***hasAnyAuthority*** 多个权限
12. 基于角色或权限进行访问控制

    - ***hasRole*** 指定角色
    - ***hasAnyRole*** 多个角色
13. 自定义没权限跳转页面
14. **权限注解**

    - ```java
      @Secured( "admin" ) 拥有 某个角色可以访问
      ```
    - ```java
      @PreAuthorize( "hasAnyAuthority( 'admin' )" ) 在方法前校验
      ```
    - ```java
      @PostAuthorize( "hasAnyAuthority( 'admin' )" ) 在方法之后校验
      ```
    - ```java
      @PostFilter( "filterObject.name == 'admin'" ) 在输出结果过滤
      ```
15. 退出登录
16. 自动登录原理
17. 自动登录配置



只要引入依赖默认所有接口被拦截

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710678199-202307242251968.png" alt="image-20230724225138925" style="zoom:25%;" />
