### Swagger2 使用示例

#### Gradle 依赖引入

```java
api 'io.springfox:springfox-swagger2:2.7.0'
api 'io.springfox:springfox-swagger-ui:2.7.0'
```

#### 配置类

```java
@Configuration
@EnableSwagger2
public class SwaggerConfig {
    // 生产环境关闭
    @Value("${swagger.enable}")
    private boolean enable;

    @Bean
    public Docket webApiConfig() {
        // 可以配置多个Docket,每个都对应一个swagger文档
        return new Docket(DocumentationType.SWAGGER_2)
                .groupName("webApi")
                .apiInfo(webApiInfo())
                .select()
                .paths(PathSelectors.any())
                .apis(RequestHandlerSelectors.basePackage("com.brilliant.im"))
                .build()
                // 是否开启swagger配置
                .enable(enable)
                // 请求头信息配置
                .securitySchemes(Lists.newArrayList(new ApiKey("token", "token", "header")))
                .securityContexts(Lists.newArrayList(context()));
    }

    private ApiInfo webApiInfo() {
        // 配置文档信息
        return new ApiInfoBuilder()
                .title("即时通讯接口")
                .description("项目API文档示例")
                .build();
    }

    private SecurityContext context() {
        // 请求头信息配置
        AuthorizationScope scope = new AuthorizationScope("global", "accessEverything");
        AuthorizationScope[] scopes = {scope};
        SecurityReference reference = new SecurityReference("token", scopes);
        return SecurityContext.builder()
                .securityReferences(Lists.newArrayList(reference))
                .build();
    }
}
```

访问url:  http://localhost:8080/swagger-ui.html

#### 常用注解

```java
@Api：					修饰整个类，描述Controller的作用
@ApiOperation：			描述一个类的一个方法，或者说一个接口
@ApiParam：				单个参数描述
@ApiModel：				用对象来接收参数
@ApiProperty：			用对象接收参数时，描述对象的一个字段
@ApiResponse：			HTTP响应其中1个描述
@ApiResponses：			HTTP响应整体描述
@ApiIgnore：				使用该注解忽略这个API
@ApiError：				发生错误返回的信息
@ApiImplicitParam：		一个请求参数
@ApiImplicitParams：		多个请求参数
```



#### 注解说明

##### @Api 

**注解参数**

> - **value** 描述类的作用
> - **tags** 说明该类的作用，非空时将覆盖value的值，可以在UI界面上看到的注解
> - **hidden** 默认为false， 配置为true 将在文档中隐藏

**使用示例**

```java
@Api(tags = "demo")
@RestController
@RequestMapping("/demo")
public class SwaggerDemoController {
}
```



##### @ApiOperation

**注解参数**

> - **value** 说明方法的用途、作用
> - **notes** 方法的备注说明
> - **tags** 操作标签，非空时将覆盖value的值
> - **response** 响应类型（即返回对象）
> - **responseContainer**   声明包装的响应容器（返回对象类型）。有效值为 "List", "Set" or "Map"
> - **responseReference** 指定对响应类型的引用。将覆盖任何指定的response（）类
> - **httpMethod** 指定HTTP方法，"GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS" and "PATCH".

**使用示例**

```java
public class SwaggerDemoController {
    @ApiOperation(value = "demo接口", notes = "查询用户信息", response = User.class)
    @GetMapping
    public Object demo() {
        return new User();
    }
}
```



##### @ApiParam

**注解参数**

> - **name** 参数名称，参数名称可以覆盖方法参数名称，路径参数必须与方法参数一致
> - **value** 参数的简要说明
> - **defaultValue** 参数默认值
> - **required** 属性是否必填，默认为false [路径参数必须填]

**使用示例**

```java
public class SwaggerDemoController {
    @GetMapping("/2")
    public void demo2(@ApiParam(name = "用户id", required = true) Long userId) {
    }
}
```



##### @ApiModel And @ApiProperty

**注解参数**

> **@ApiModel**
>
> - **value** 提供模型的替代名称
> - **description** 提供类的详细说明
>
> **@ApiProperty**
>
> - **allowableValues** 限制参数的可接受值。1.以逗号分隔的列表   2、范围值  3、设置最小值/最大值

**使用示例**

```java
@ApiModel(description = "用户实体类")
public class User {

    @ApiModelProperty(value = "主键id", allowableValues = "range[1, infinity]")
    private Long id;

    @ApiModelProperty("用户名")
    private String username;

    @ApiModelProperty("密码")
    private String password;
}
```



##### @ApiResponse

**注解参数**

> - **code** 提供模型的替代名称
> - **message** 提供类的详细说明

**使用示例**

```java
@GetMapping("/user/{id}")
@ApiOperation(value = "获取用户信息", notes = "打开页面并修改指定用户信息")
@ApiResponses({
    @ApiResponse(code = 400, message = "请求参数没填好"),
    @ApiResponse(code = 404, message = "请求路径没有或页面跳转路径不对")
})
public Object get(@PathVariable String id) {
    return id;
}
```



##### @ApiImplicitParam

**使用示例**

```java
@PostMapping("/login")
@ApiOperation(value = "登录检测", notes = "根据用户名、密码判断该用户是否存在")
@ApiImplicitParams({
        @ApiImplicitParam(name = "name", value = "用户名", required = true, paramType = "query", dataType = "String"),
        @ApiImplicitParam(name = "pass", value = "密码", required = true, paramType = "query", dataType = "String")
})
public Object login(@RequestParam(value = "name", required = false) String account,
                    @RequestParam(value = "pass", required = false) String password) {
    return account + password;
}
```

