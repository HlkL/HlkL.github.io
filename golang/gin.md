官方文档： https://gin-gonic.com/zh-cn/

下载

```go
go get -u github.com/gin-gonic/gin
```

**<font color=green>Hello,world</font>**

```go
import (
	"net/http"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "hello world!")
	})

	r.Run()
}
```



# 路由

```go
r.GET("/get", func(ctx *gin.Context) {
  ctx.String(http.StatusOK, "get")
})
r.POST("/post", func(ctx *gin.Context) {
  ctx.String(http.StatusOK, "add")
})
r.DELETE("/delete", func(ctx *gin.Context) {
  ctx.String(http.StatusOK, "del")
})
r.PUT("/put", func(ctx *gin.Context) {
  ctx.String(http.StatusOK, "modify")
})

// json/xml 响应
r.GET("/json", func(ctx *gin.Context) {
  ctx.JSON(200, gin.H{
    "message":"ok",
  })
})

r.GET("/xml", func(ctx *gin.Context) {
  ctx.XML(200, gin.H{
    "message":"ok",
  })
})
```

**参数传递**

1. 路径参数拼接 `http://ip:port/query?name=&age=`

```go
r.GET("/query", func(ctx *gin.Context) {
  name := ctx.Query("name")
  age := ctx.Query("age")
  rst := map[string]interface{}{
    "name" : name,
    "age" : age,
  }
  // 使用 AsciiJSON 生成具有转义的非 ASCII 字符的 ASCII-only JSON
  ctx.AsciiJSON(http.StatusOK, rst)
})
```

2. 路径参数 `http://ip:port/query/zhangsan/16`

```go
r.GET("user/:name/:age", func(ctx *gin.Context) {
  name := ctx.Param("name")
  age := ctx.Param("age")

  rst := map[string]interface{}{
    "name" : name,
    "age" : age,
  }

  ctx.AsciiJSON(http.StatusOK, rst)
})
```

3. 表单参数

```go
// gin 默认默认解析 form-data，x-www-form-urlencoded 类型参数
r.POST("/form", func(ctx *gin.Context) {
  name := ctx.PostForm("name")
  age := ctx.PostForm("age")
  idcard := ctx.DefaultPostForm("idcard", "00000001")

  rst := fmt.Sprintf("name is %s, age is %s, idcard is %s", name, age, idcard)
  ctx.Writer.Write([]byte(rst))
})
```

**Gin 框架主要使用标准库 `encoding/json` 和 `encoding/xml` 处理 JSON 和 XML 数据。**

4. 解析 `application/json` 数据

```go
// 解析json/xml需要使用结构体，通过 tag 进行数据解析
// 定义 User 结构体
type User struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

r.POST("/user", func(c *gin.Context) {
  var user User
  if err := c.BindJSON(&user); err != nil {
    c.String(http.StatusExpectationFailed, err.Error())
  }
  // 使用解析后的 user 数据
  rst := fmt.Sprintf("name is %s, age is %d", user.Name, user.Age)
  c.Writer.Write([]byte(rst))
})
```

5. 解析 `application/xml` 数据

```go
import "encoding/xml"

// 定义结构体
type XmlUser struct {
	XMLName xml.Name `xml:"user"`
	Name    string   `xml:"name"`
	Age     int      `xml:"age"`
}

//解析 application/xml 数据
r.POST("/user/xml", func(c *gin.Context) {
  var user XmlUser
  if err := c.BindXML(&user); err != nil {
    c.String(http.StatusExpectationFailed, err.Error())
  }
  // 使用解析后的 user 数据
  rst := fmt.Sprintf("name is %s, age is %d", user.Name, user.Age)
  c.Writer.Write([]byte(rst))
})
```

6. 直接解析 `json/xml` 数据

```go
r.POST("/data", func(c *gin.Context) {
  xmlData, err := c.GetRawData()
  if err != nil {
    c.String(http.StatusExpectationFailed, err.Error())
  }
  c.String(http.StatusOK, string(xmlData))
})
```

**<font color=red>为了能够更方便的获取请求相关参数，提高开发效率，可以基于请求的`Content-Type`识别请求数据类型并利用反射机制自动提取请求中`QueryString`、`form表单`、`JSON`、`XML`等参数到结构体中。</font>**

`ShouldBind`会按照下面的顺序解析请求中的数据完成绑定：

- 如果是 `GET` 请求，只使用 `Form` 绑定引擎（`query`）。

- 如果是 `POST` 请求，首先检查 `content-type` 是否为 `JSON` 或 `XML`，然后再使用 `Form`（`form-data`）。

7. 动态解析数据

```go
// 定义结构体
type DynamicUser struct {
	Name string `form:"name" json:"name" binding:"required"`
	Age  int    `form:"age" json:"age" binding:"required"`
}

// 参数动态解析
r.POST("dynamic", func(ctx *gin.Context) {
  var user DynamicUser
  if err := ctx.ShouldBind(&user); err != nil {
    ctx.String(http.StatusExpectationFailed, err.Error())
  }
  ctx.JSON(200, gin.H{
    "name": user.Name,
    "age":  user.Age,
  })
})

// /dynamic?name=&age=
r.GET("dynamic", func(ctx *gin.Context) {
  var user DynamicUser
  if err := ctx.ShouldBind(&user); err != nil {
    ctx.String(http.StatusExpectationFailed, err.Error())
  }
  ctx.JSON(200, gin.H{
    "name": user.Name,
    "age":  user.Age,
  })
})
```

8. 单文件上传

```go
r.POST("upload", func(ctx *gin.Context) {
  file, err := ctx.FormFile("file")
  if err != nil {
    ctx.JSON(http.StatusExpectationFailed, gin.H{
      "message": err.Error(),
    })
  }

  fmt.Printf("file.Filename: %v\n", file.Filename)
  // 将上传的文件保存到指定位置
  if err := ctx.SaveUploadedFile(file, "/Users/hougen/Downloads/"+file.Filename); err != nil {
    ctx.JSON(http.StatusInternalServerError, gin.H{
      "message": err.Error(),
    })
  }

  ctx.JSON(http.StatusOK, gin.H{
    "message": "ok",
  })
})
```

9. 多文件上传

```go
form, err := ctx.MultipartForm()
if err != nil {
  ctx.JSON(http.StatusExpectationFailed, gin.H{
    "message": err.Error(),
  })
}

files := form.File["file"]
```

9. 重定向

```go
// 外部链接重定向
r.GET("/r", func(ctx *gin.Context) {
  ctx.Redirect(300, "https://hougen.fun")
})

// 内部重定向
r.GET("/r2", func(ctx *gin.Context) {
  fmt.Println("内部重定向 -> r3")
  ctx.Request.URL.Path = "/r3"
  r.HandleContext(ctx)
})

r.GET("/r3", func(ctx *gin.Context) {
  fmt.Println("r3")
  ctx.JSON(200, gin.H{
    "msg": "ok",
  })
})
```

10. 路由匹配

```go
// 匹配任意请求方式
r.Any("/any", func(ctx *gin.Context) {
  ctx.JSON(200, gin.H{
    "msg": "any request method",
  })
})

// 定义没有处理函数的路由
r.NoRoute(func(ctx *gin.Context) {
  ctx.JSON(404, gin.H{
    "msg": "page not found",
  })
})

r.GET("/users", func(ctx *gin.Context) {
  ctx.String(http.StatusOK, "This is /users with GET")
})

// 定义 r.NoMethod() 在所有路由之后
r.HandleMethodNotAllowed = true
r.NoMethod(func(ctx *gin.Context) {
  ctx.JSON(http.StatusMethodNotAllowed, gin.H{
    "msg": "method not allowed",
  })
})
```

在 Gin 框架中，`r.NoMethod()` 和 `r.NoRoute()` 都是用来处理没有匹配路由的情况，但它们针对的场景不同：

**`r.NoMethod()`** 通常用于返回 `405 Method Not Allowed` 错误，告知客户端可以使用哪些方法访问该路径。

* **触发条件:** 当一个 HTTP 请求到达服务器，并且 Gin 找到了**匹配的路径**，但是**请求方法**（GET、POST、PUT 等）与该路径上定义的任何处理函数都不匹配时，就会触发 `r.NoMethod()`。需要使用 `r.HandleMethodNotAllowed = true` 手动开启。

    * 应用定义了一个路由 `/users`，只接受 `GET` 请求。

    * 当用户发送 `POST` 请求到 `/users` 时，就会触发 `r.NoMethod()`，因为没有定义处理 `POST` 请求的函数。

      ```go[r.NoMethod源码]
      // NoMethod sets the handlers called when Engine.HandleMethodNotAllowed = true.
      func (engine *Engine) NoMethod(handlers ...HandlerFunc) {
      	engine.noMethod = handlers
      	engine.rebuild405Handlers()
      }
      ```

**`r.NoRoute()`** 通常用于处理 404 Not Found 错误，例如返回自定义的 404 页面。

* **触发条件:** 当一个 HTTP 请求到达服务器，并且 Gin **找不到任何匹配的路由路径**时，就会触发 `r.NoRoute()`。
    * 应用只定义了 `/users` 和 `/products` 两个路由。
    * 当用户请求 `/articles` 时，就会触发 `r.NoRoute()`，因为没有定义 `/articles` 路由。

> `r.NoMethod()`:  找到了路径，但方法不对。
>
> `r.NoRoute()`:  完全找不到匹配的路径。

11. 路由组

```go
g := r.Group("/g")
{
  g.GET("/get", func(ctx *gin.Context) {
    ctx.JSON(200, gin.H{
      "msg": ctx.Request.URL.Path,
    })
  })

  // 嵌套路由组
  xx := g.Group("/xx")
  xx.GET("oo", func(ctx *gin.Context) {
    ctx.JSON(200, gin.H{
      "msg": ctx.Request.URL.Path,
    })
  })

}
```



# 数据渲染

**1. JSON 渲染**

这是最常用的方式，特别是在构建 API 时。Gin 提供了 `ctx.JSON` 方法来方便地将 Go 数据结构序列化为 JSON 格式并返回给客户端。

```go
// 返回状态码 200 和一个包含 name 和 age 字段的 JSON 对象
ctx.JSON(http.StatusOK, gin.H{
    "name": "Alice",
    "age":  30,
})
```

**2. 结构体渲染 (JSON, XML, YAML)**

Gin 可以直接渲染 Go 结构体为 JSON、XML 或 YAML 格式。 你只需要设置 `Content-Type` 头信息，Gin 会自动进行序列化。

```go
type User struct {
    Name string `json:"name"`
    Age  int    `json:"age"`
}

// JSON 渲染
ctx.JSON(http.StatusOK, User{"Alice", 30})

// XML 渲染
ctx.XML(http.StatusOK, User{"Bob", 25})

// YAML 渲染
ctx.YAML(http.StatusOK, User{"Charlie", 28})
```

**3. 模板渲染 (HTML)**

Gin 支持使用模板引擎渲染 HTML 页面。 默认情况下，Gin 可以解析 `HTML`, `YAML`, `YML` 和 `TPL` 文件。 你可以使用 `LoadHTMLGlob` 或 `LoadHTMLFiles` 加载模板文件，然后使用 `ctx.HTML` 渲染。

```go
// 加载 templates 目录下的所有模板文件
router := gin.Default()
router.LoadHTMLGlob("templates/*")

// 渲染 index.html 模板
router.GET("/", func(ctx *gin.Context) {
    ctx.HTML(http.StatusOK, "index.html", gin.H{
        "title": "首页",
    })
})
```

**4. 字符串渲染**

你可以使用 `ctx.String` 方法直接返回字符串作为响应内容。

```go
ctx.String(http.StatusOK, "Hello, World!")
```

**5. 文件渲染**

Gin 可以直接将文件内容作为响应返回。 你可以使用 `ctx.File` 方法来实现。

```go
// 返回 static/img.png 文件
ctx.File("static/img.png")
```

除了以上方式，Gin 还支持一些其他的渲染方式：

* `ctx.Data`: 返回自定义数据和 Content-Type
* `ctx.Redirect`: 重定向到其他 URL
* `ctx.Render`: 使用自定义渲染器

**在 Gin 框架中，`LoadHTMLFiles` 和 `LoadHTMLGlob` 都是用于加载 HTML 模板文件的方法，但它们的工作方式略有不同：**

* `LoadHTMLFiles` 用于加载指定路径下的单个或多个模板文件。
* `LoadHTMLGlob` 用于加载匹配指定 glob 模式的所有模板文件。

**1. `LoadHTMLFiles`** 当只想加载特定几个模板文件时，可以使用 `LoadHTMLFiles`。

* **功能：** 加载指定路径下的**单个或多个**模板文件。
* **参数：** 接收一个或多个字符串作为参数，每个字符串代表一个模板文件的路径。

```go
router.LoadHTMLFiles("templates/index.html", "templates/about.html")
```

**2. `LoadHTMLGlob`** 需要加载某个目录下所有模板文件，或者需要使用更灵活的匹配模式时，可以使用 `LoadHTMLGlob`。

* **功能：** 加载**匹配指定模式**的所有模板文件。
* **参数：** 接收一个字符串作为参数，该字符串代表一个 glob 模式，用于匹配多个文件路径。

```go
router.LoadHTMLGlob("templates/*.html")  // 加载 templates 目录下所有 .html 文件
router.LoadHTMLGlob("templates/**/*.html") // 加载 templates 目录及其子目录下所有 .html 文件
```



# 中间件

Gin 中间件（Middleware）是在请求到达主处理函数之前或之后执行的函数。它们可以用于修改请求、响应，以及执行一些通用的逻辑。

- **身份验证和授权:** 检查用户是否已登录，以及是否有权限访问请求的资源。
- **日志记录:** 记录请求和响应信息，例如请求方法、URL、状态码等。
- **性能监控:** 跟踪请求的处理时间，并记录慢请求。
- **错误处理:** 捕获应用程序中的错误，并返回友好的错误页面。
- **数据预处理:** 例如解析 JSON 数据、绑定表单数据等。

**Gin 中间件的类型:**

- **全局中间件:** 应用于所有路由。
- **路由组中间件:** 应用于特定路由组。
- **单个路由中间件:** 应用于单个路由。

**`gin.Default()` 使用了默认的中间件 gin.Logger()、gin.Recovery()， 不使用任何中间件可使用 gin.New()**

**<font color=green>示例</font>** Gin 中间件是一个接收 `*gin.Context` 参数并返回 `gin.HandlerFunc` 的函数。

```go
func main() {
	r := gin.Default()

	// 使用全局中间件
	// r.Use(myMiddleware())
	r.GET("/", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{"msg": "ok"})
	})

	// 单独使用中间件
	r.GET("/api",myMiddleware(),func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{"msg": "ok"})
	})

	// 路由组
	g := r.Group("/g")
	g.Use(myMiddleware())
	{
		g.GET("/api",func(ctx *gin.Context) {
			ctx.JSON(200, gin.H{"msg": "ok"})
		})
	}

	r.Run(":8080")
}

func myMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		fmt.Println("myMiddleware中间件开始执行")

		// 继续执行后续中间件
		c.Next()
		// 不再执行当前请求后续代码流程
		// c.Abort()

		latencyTime := time.Since(startTime)
		// 记录请求信息
		reqMethod := c.Request.Method
		reqURI := c.Request.RequestURI
		statusCode := c.Writer.Status()
		fmt.Printf("[myMiddleware] %s %3d %s %13v\n", reqMethod, statusCode, reqURI, latencyTime)
		fmt.Println("myMiddleware执行结束")
	}
}
```

**<font color=red>当在中间件或 `handler` 中启动新的 `Goroutine` 时，不能使用原始的上下文，必须使用只读副本。</font>**

**<font color=green>BasicAuth 中间件</font>**

```go
auth := r.Group("basic-auth", gin.BasicAuth(gin.Accounts{
  "foo":    "foo",
  "austin": "123423",
  "lena":   "lena",
}))

auth.GET("/secrets", func(ctx *gin.Context) {
  user := ctx.MustGet(gin.AuthUserKey).(string)
  if secret, ok := secrets[user]; ok {
    ctx.JSON(200, gin.H{"user": user, "secret": secret})
  } else {
    ctx.JSON(403, gin.H{"user": user, "secret": "NO SECRET :("})
  }
})

// 模拟数据
var secrets = gin.H{
	"foo":    gin.H{"email": "foo@bar.com", "phone": "123433"},
	"austin": gin.H{"email": "austin@example.com", "phone": "666"},
	"lena":   gin.H{"email": "lena@guapa.com", "phone": "523443"},
}
```



# server push

:::detail  前端代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gin Server-Sent Events</title>
    <style>
        body {
            font-family: sans-serif;
        }
        #messages {
            border: 1px solid #ccc;
            padding: 10px;
            height: 200px;
            overflow-y: scroll;
        }
    </style>
</head>
<body>
    <h1>Gin Server-Sent Events</h1>
    <div id="messages"></div>

    <script>
        const eventSource = new EventSource('/events');

        eventSource.onmessage = function(event) {
            const messagesDiv = document.getElementById('messages');
            const newMessage = document.createElement('p');
            newMessage.textContent = event.data;
            messagesDiv.appendChild(newMessage);
        };

        eventSource.onerror = function(error) {
            console.error('SSE error:', error);
        };
    </script>
</body>
</html>
```

:::

```go
func main() {
	r := gin.Default()
	r.LoadHTMLGlob("./static/*")

	r.GET("/events", func(c *gin.Context) {
		c.Header("Content-Type", "text/event-stream")
		c.Header("Cache-Control", "no-cache")
		c.Header("Connection", "keep-alive")

		for {
			c.Writer.Write([]byte(fmt.Sprintf("data: %s\n\n", time.Now().Format("15:04:05"))))
			c.Writer.Flush()
			time.Sleep(2 * time.Second)
		}
	})

	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})

	r.Run(":8080")
}
```



# jsonp 跨域请求

参考博文：https://cloud.tencent.com/developer/article/2166803

jsonp是一种需要服务器端配合的跨域技术，利用script脚本天然跨域的特性，可以访问第三方资源。服务器端收到请求后，将数据作为参数生成一个执行的函数字符，返回给浏览器。浏览器收到后执行这个函数，这样就可以访问到服务端的数据。

> 1. 前端定义一个解析函数。例如jsonpCallback = function(data) {}
>
> 2. 通过params的形式包装jsonp请求参数，并且声明执行函数(如cb=jsonpCallback)
>
> 3. 后端获取到前端声明的执行函数(jsonpCallback),并以携带参数并且调用执行函数的方式传给前端。
>
> 4. 前端加载返回资源的时候执行jsonpCallback,并且以回调函数的方式拿到返回的数据。

**<font color=green>示例</font>**

```html
<!DOCTYPE html>
<html>
<head>
  <title>JSONP Example</title>
</head>
<body>
  <h1>JSONP Demo</h1>
  <div id="message"></div>

  <script>
    function handleData(data) {
      document.getElementById('message').innerText = data.message;
    }

    var script = document.createElement('script');
    // 动态添加一个<script>标签，script标签的src属性没有跨域的限制
    script.src = 'http://localhost:8080/jsonp?callback=handleData';
    document.head.appendChild(script);
  </script>
</body>
</html>
```

```go
func main()  {
	r := gin.Default()

	// 使用 JSONP 向不同域的服务器请求数据。如果查询参数存在回调，则将回调添加到响应体中。
	r.GET("/jsonp", func(c *gin.Context) {
		data := map[string]interface{}{
			"message": "Hello from the server!",
		}

		// /jsonp?callback=x
		// 将输出：x({\"message\":\"Hello from the server!\"})
		c.JSONP(200, data)
	})

	r.Run(":8080")
}
```

