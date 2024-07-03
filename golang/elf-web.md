# hello,elf-web

Go语言内置了 `net/http`库，封装了HTTP网络编程的基础的接口，本项目实现的 Web 框架便是基于`net/http`的。当前 Go 代码创建了一个简单的 Web 服务器，监听端口 8080 并处理两种 HTTP 请求：

**1. 根路径请求 ("/")** ，调用`indexHandler` 函数。

**2. "/hello" 路径请求**，调用`helloHandler` 函数。

::: details **<font color=green>代码示例</font>**

```go
package main

import (
	"fmt"
	"net/http"
	"time"
)

func main() {
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/hello", helloHandler)

	http.ListenAndServe(":8080", nil)
}

func indexHandler(w http.ResponseWriter, req *http.Request) {
	w.Write([]byte("url.path: " + req.RequestURI))
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "hello,elf-web", time.Now())
}
```

:::

`http.Response` 和 `http.ResponseWriter` 都是 Go 语言 `net/http` 包中处理 HTTP 请求的关键类型，但它们的角色和功能不同：

**1.  `http.Response`**

   - **表示服务器对 HTTP 请求的响应。** 它包含了响应的所有信息。
   - **由服务器创建并发送给客户端。** 
   - **通常由 `http.Client` 的方法返回，例如 `http.Get` 或 `http.Post`。** 可以使用 `http.Response` 的字段和方法来访问响应的各个部分。

**2. `http.ResponseWriter`**

   - **<font color=red>是一个接口(指向底层具体类型值的指针)</font>，表示 HTTP 响应的编写器。** 服务器使用它来构建发送给客户端的响应。
   - **作为参数传递给 HTTP 处理程序函数。** 处理程序函数可以使用 `http.ResponseWriter` 的方法来设置响应的状态码、头信息和写入响应体数据。
   - **不会直接创建 `http.Response` 对象。** 相反，它提供方法来设置响应的各个部分，最终由 Go 的 `net/http` 包使用这些信息来构建 `http.Response` 并发送给客户端。

> `http.Response` 是服务器发送给客户端的完整响应，你可以读取它来获取响应信息。
>
> `http.ResponseWriter` 是一个接口，服务器用它来构建发送给客户端的响应，你可以使用它来设置响应信息。



# http.Handler

`http.Handler` 是 Go 语言 `net/http` 包中的一个核心接口，它定义了处理 HTTP 请求的标准方法。 任何实现了 `http.Handler` 接口的类型都可以用于处理 HTTP 请求。当你创建一个 HTTP 服务器时，需要将 `Handler` 注册到特定的路由上，以便服务器知道如何处理对应路径的请求。

**接口定义：**

```Go
type Handler interface {
    ServeHTTP(ResponseWriter, *Request)
}
```

* **`ServeHTTP(ResponseWriter, *Request)`:** 这是 `Handler` 接口的唯一方法。它接收两个参数：
    * `ResponseWriter`:  用于写入 HTTP 响应的对象。你可以使用它设置响应头、状态码和响应体。
    * `*Request`:  表示传入 HTTP 请求的对象，包含请求方法、URL、头部信息和请求体等数据。

::: details **<font color=green>代码示例</font>**

```go
// 定义处理结构体
type Engine struct{}

func (engine *Engine) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	url := req.URL.Path
	switch url {
	case "/":
		w.Write([]byte("url.path: " + url))
	case "/hello":
		fmt.Fprintln(w, "hello,elf-web", time.Now())
	}
}

func main() {
	http.ListenAndServe(":8080", new(Engine))
}
```

:::

- **req.URL.Path**是 URL 的路径部分，不包括查询参数和片段标识符（锚点）。对于 URL http://example.com/path/to/resource?query=1#section2，req.URL.Path 的值是 /path/to/resource。

- **req.RequestURI** 是整个请求 URI，包括路径、查询参数和片段标识符。对于 URL http://example.com/path/to/resource?query=1#section2，req.RequestURI 的值是 /path/to/resource?query=1#section2。



# elf

**封装http，搭建出框架雏形，代码结构：**

```text
elf/
  |--elf.go
  |--go.mod
main.go
go.mod
```

::: details **<font color="#6DD3E3">查看代码</font>**

::: code-group

```go[./elf/elf.go]
package elf

import (
	"fmt"
	"log"
	"net/http"
	"strings"
)

const (
	patternPrefix  = "/"
	routeSeparator = "-"
)

// 定义框架使用的请求处理函数类型
type HandlerFunc func(w http.ResponseWriter, req *http.Request)

type Engine struct {
	// 路由
	router map[string]HandlerFunc
}

// 创建实例
func New() *Engine {
	return &Engine{router: make(map[string]HandlerFunc)}
}

func (engine *Engine) addRouter(method string, pattern string, handler HandlerFunc) {
	// 如果 pattern 不以 '/' 开头，则在前面拼接 '/'
	if !strings.HasPrefix(pattern, patternPrefix) {
		pattern = patternPrefix + pattern
	}
	key := method + routeSeparator + pattern
	log.Printf("[elf] Route %4s - %s", method, pattern)
	engine.router[key] = handler
}

func (engine *Engine) GET(pattern string, handler HandlerFunc) {
	engine.addRouter("GET", pattern, handler)
}

func (engine *Engine) POST(pattern string, handler HandlerFunc) {
	engine.addRouter("POST", pattern, handler)
}

func (engine *Engine) Run(addr string) error {
	return http.ListenAndServe(addr, engine)
}

func (engine *Engine) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	url := req.URL.Path
	method := req.Method
	key := method + routeSeparator + url

	if handler, ok := engine.router[key]; ok {
		handler(w, req)
	} else {
		fmt.Fprint(w, "404 Page Not Found: ", req.URL)
	}
}
```

```mod[./elf/go.mod]
module elf
go 1.22.2
```

```go[./main.go]
package main

import (
	"elf"
	"fmt"
	"net/http"
)

func main() {
	r := elf.New()
	r.GET("/", func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte("url.path: " + req.RequestURI))
	})

	r.GET("hello", func(w http.ResponseWriter, req *http.Request) {
		fmt.Fprintln(w, "hello,elf")
	})

	r.POST("hello", func(w http.ResponseWriter, req *http.Request) {
		fmt.Fprintln(w, "hello,elf")
	})

	r.Run(":8080")
}
```

```mod[./go.mod]
module elf-web
go 1.22.2
require elf v0.0.0
replace elf => ./elf
```

:::



