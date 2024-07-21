## hello,elf-web

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

- **`http.Response`**

  - **表示服务器对 HTTP 请求的响应。** 它包含了响应的所有信息。

  - **由服务器创建并发送给客户端。** 

  - **通常由 `http.Client` 的方法返回，例如 `http.Get` 或 `http.Post`。** 可以使用 `http.Response` 的字段和方法来访问响应的各个部分。

- **`http.ResponseWriter`**

     - **<font color=red>是一个接口(指向底层具体类型值的指针)</font>，表示 HTTP 响应的编写器。** 服务器使用它来构建发送给客户端的响应。

     - **作为参数传递给 HTTP 处理程序函数。** 处理程序函数可以使用 `http.ResponseWriter` 的方法来设置响应的状态码、头信息和写入响应体数据。

     - **不会直接创建 `http.Response` 对象。** 相反，它提供方法来设置响应的各个部分，最终由 Go 的 `net/http` 包使用这些信息来构建 `http.Response` 并发送给客户端。


> `http.Response` 是服务器发送给客户端的完整响应，你可以读取它来获取响应信息。
>
> `http.ResponseWriter` 是一个接口，服务器用它来构建发送给客户端的响应，你可以使用它来设置响应信息。



## http.Handler

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



## elf

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
		w.WriteHeader(http.StatusNotFound)
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



## context

对Web服务来说，构造一个完整的响应，需要考虑消息头(Header)和消息体(Body)，而 Header 包含了状态码(StatusCode)，消息类型(ContentType)等几乎每次请求都需要设置的信息。因此，如果不进行有效的封装，那么框架的用户将需要写大量重复(~如以下代码所示~)，繁杂的代码，而且容易出错。

```go
obj = map[string]interface{}{
    "name": "tom",
    "password": "1234",
}
w.Header().Set("Content-Type", "application/json")
w.WriteHeader(http.StatusOK)
encoder := json.NewEncoder(w)
if err := encoder.Encode(obj); err != nil {
    http.Error(w, err.Error(), 500)
}
```

封装`*http.Request`和`http.ResponseWriter` 使得 web 框架的使用和扩展更加方便，是现代 web 开发中的一种最佳实践。

1. **简化代码**：将 HTTP 请求和响应的处理逻辑封装到 Context 中，使得业务逻辑代码更简洁。

2. **提高代码可读性**：通过封装，代码变得更具结构化，开发者可以更直观地理解每个方法的功能。
3. **代码重用性**：封装后的方法可以在项目中的不同地方重复使用，减少代码冗余。

4. **方便扩展**：如果需要添加新的功能或改进现有功能，只需修改 Context 及其方法即可，不需要改动其他业务逻辑代码。

5. **一致性**：通过统一的接口处理不同类型的响应（如 JSON、HTML、纯文本等），确保响应的一致性和可维护性。

::: details **<font color="#6DD3E3">封装Context</font>**

```go
// ./elf/context.go
package elf

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// 用于快捷构建json数据
type H map[string]interface{}

type Context struct {
	Writer     http.ResponseWriter // 构建响应
	Req        *http.Request       // http请求
	Path       string              // 请求路径
	Method     string              // 请求方式
	StatusCode int                 // 响应状态码
}

// 实例化上下文
func newContext(w http.ResponseWriter, req *http.Request) *Context {
	return &Context{
		Writer: w,
		Req:    req,
		Path:   req.URL.Path,
		Method: req.Method,
	}
}

func (context *Context) SetHeader(key string, value string) {
	context.Writer.Header().Add(key, value)
}

func (context *Context) SetStatus(code int) {
	context.StatusCode = code
	context.Writer.WriteHeader(code)
}

func (context *Context) Form(key string) string {
	return context.Req.FormValue(key)
}

func (context *Context) Query(key string) string {
	return context.Req.URL.Query().Get(key)
}

// 构建响应数据
func (context *Context) String(code int, format string, values ...interface{}) {
	context.SetHeader("Context-Type", "text/plain")
	context.SetStatus(code)
	context.Writer.Write([]byte(fmt.Sprintf(format, values...)))
}

func (c *Context) Json(code int, obj interface{}) {
	c.SetHeader("Context-Type", "application/json")
	c.SetStatus(code)
	encoding := json.NewEncoder(c.Writer)
	if err := encoding.Encode(obj); err != nil {
		http.Error(c.Writer, err.Error(), http.StatusInternalServerError)
	}
}

func (c *Context) Data(code int, data []byte) {
	c.SetStatus(code)
	c.Writer.Write(data)
}

func (c *Context) Html(code int, html string) {
	c.SetHeader("Context-Type", "text/html")
	c.SetStatus(code)
	c.Writer.Write([]byte(html))
}
```

:::



## router

封装路由相关的方法和结构，`router.go`，方便对 `router` 的功能进行增强。

::: details **<font color="#6DD3E3">封装Router</font>**

::: code-group 

```go[router]
// ./elf/router.go
package elf

import (
	"log"
	"net/http"
	"strings"
)

const (
	patternPrefix  = "/"
	routeSeparator = "-"
)

type router struct {
	handlers map[string]HandlerFunc
}

func newRouter() *router {
	return &router{
		handlers: make(map[string]HandlerFunc),
	}
}

func (r *router) addRouter(method string, pattern string, handler HandlerFunc) {
	// 如果 pattern 不以 '/' 开头，则在前面拼接 '/'
	if !strings.HasPrefix(pattern, patternPrefix) {
		pattern = patternPrefix + pattern
	}
	key := method + routeSeparator + pattern
	log.Printf("[elf] Route %4s - %s", method, pattern)
	r.handlers[key] = handler
}

func (r *router) handle(c *Context) {
	key := c.Method + routeSeparator + c.Path
	if handler, ok := r.handlers[key]; ok {
		handler(c)
	} else {
		c.String(http.StatusNotFound, "404 NOT FOUND: %s\n", c.Path)
	}
}
```

```go[elf.go]
package elf

import (
	"net/http"
)

// 定义框架使用的请求处理函数类型
type HandlerFunc func(c *Context)

type Engine struct {
	// 路由
	router *router
}

// 创建实例
func New() *Engine {
	return &Engine{router: newRouter()}
}

func (engine *Engine) addRouter(method string, pattern string, handler HandlerFunc) {
	engine.router.addRouter(method, pattern, handler)
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
	c := newContext(w, req)
	engine.router.handle(c)
}
```

```go[main]
func main() {
	r := elf.New()

	r.GET("/html", func(c *elf.Context) {
		c.Html(http.StatusOK, "<h1>hello,elf</h1>")
	})

	r.GET("json", func(c *elf.Context) {
		c.Json(http.StatusOK, elf.H{
			"msg": "ok",
		})
	})

	r.GET("/data", func(c *elf.Context) {
		c.Data(http.StatusOK, []byte("hello,elf"))
	})

	r.GET("/query", func(c *elf.Context) {
		name := c.Query("name")
		age := c.Query("age")
		c.String(http.StatusOK, "user is %s, age is %s", name, age)
	})

	r.POST("/save", func(c *elf.Context) {
		name := c.Form("name")
		age := c.Form("age")
		c.Json(http.StatusOK, elf.H{
			"msg":  "ok",
			"name": name,
			"age":  age,
		})
	})

	r.Run(":8080")
}
```

:::

### trie tree

前缀树用于保存关联数组，其中的键通常是字符串。与二叉查找树不同，键不是直接保存在节点中，而是由节点在树中的位置决定。一个节点的所有子孙都有相同的前缀，也就是这个节点对应的字符串，而根节点对应空字符串。一般情况下，不是所有的节点都有对应的值，只有叶子节点和部分内部节点所对应的键才有相关的值。

![trie tree](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1720332523-trie_eg.jpg)

::: details **<font color=green>代码实现</font>**

::: code-group

```go[trie]
type Node struct {
	next   map[rune]*Node
	isWord bool
}

type Trie struct {
	size int
	root *Node
}

func NewTrie() *Trie {
	return &Trie{
		size: 0,
		root: &Node{
			isWord: false,
			next:   make(map[rune]*Node),
		},
	}
}

func (t *Trie) Insert(word string) {
	node := t.root
	for _, ch := range word {
		if _, ok := node.next[ch]; !ok {
			node.next[ch] = &Node{
				isWord: false,
				next:   map[rune]*Node{},
			}
		}
		node = node.next[ch]
	}

	if !node.isWord {
		node.isWord = true
		t.size += 1
	}
}

func (t *Trie) SearchWord(word string) bool {
	node := t.root
	for _, ch := range word {
		if _, ok := node.next[ch]; !ok {
			return false
		}
		node = node.next[ch]
	}

	return node.isWord
}

func (t *Trie) StartWith(prefix string) bool {
	node := t.root
	for _, ch := range prefix {
		if _, ok := node.next[ch]; !ok {
			return false
		}
		node = node.next[ch]
	}

	return true
}

func (t *Trie) WordQuantity() int {
	return t.size
}
```

```go[test]
trie := elf.NewTrie()
words := []string{"hello", "golang", "gin", "elf", "gorm", "java", "spring", "mysql", "redis", "kafka"}

for _, word := range words {
  trie.Insert(word)
}

fmt.Printf("trie.size: %v\n", trie.WordQuantity())

fmt.Println("==================search word========================")
fmt.Printf("search word for 'hello' %v\n", trie.SearchWord("hello"))
fmt.Printf("search word for 'world' %v\n", trie.SearchWord("world"))
fmt.Printf("search word for 'golang' %v\n", trie.SearchWord("golang"))

fmt.Println("==================search prefix======================")
fmt.Printf("search prefix for 'go' %v\n", trie.StartWith("go"))
fmt.Printf("search prefix for 'ha' %v\n", trie.StartWith("ha"))

// trie.size: 10
// ==================search word========================
// search word for 'hello' true
// search word for 'world' false
// search word for 'golang' true
// ==================search prefix======================
// search prefix for 'go' true
// search prefix for 'ha' false
```

:::

**HTTP请求的路径是由`/`分隔的多段构成的，因此，每一段可以作为前缀树的一个节点。可通过树结构优化动态路由匹配。**

::: details **<font color="#6DD3E3">Trie实现</font>**

::: code-group

```go[node]
type node struct {
	pattern  string
	part     string
	children []*node
	isWild   bool // 是否为通配符匹配
}
```

```go[match and insert]
// 匹配当前 node 的孩子节点的 part，用于后续的插入操作。
// 匹配当前传入的 part 参数的分片部分在前缀树中不存在会创建节点并递归向下创建子节点，存在则将当前part追加到节点的后面，作为子节点。
func (n *node) matchFirst(part string) *node {

	for _, child := range n.children {
		if child.part == part || child.isWild {
			return child
		}
	}

	return nil
}

func (n *node) insert(pattern string, parts []string, height int) {
	if len(parts) == height {
		n.pattern = pattern
		return
	}

	part := parts[height]
	child := n.matchFirst(part)
	// 当前树中没有 part 叶子节点
	if child == nil {
		child = &node{
			part:   part,
			isWild: part[0] == ':' || part[0] == '*',
		}
		n.children = append(n.children, child)
	}

	child.insert(pattern, parts, height+1)
}
```

```go[match and search]
func (n *node) matchChildren(part string) []*node {
	nodes := make([]*node, 0)
	for _, child := range n.children {
		if child.part == part || child.isWild {
			nodes = append(nodes, child)
		}
	}

	return nodes
}

func (n *node) search(parts []string, height int) *node {
	if len(parts) == height || strings.HasPrefix(n.part, "*") {
		if n.pattern == "" {
			return nil
		}
		return n
	}

	part := parts[height]
	children := n.matchChildren(part)
	for _, child := range children {
		rst := child.search(parts, height+1)
		if rst != nil {
			return rst
		}
	}

	return nil
}
```

:::

- **插入节点：** 递归查找每层节点，如果没有匹配当前part的节点，则新建一个。需注意的是，对于路径/p/:lang/doc，只有在第三层doc节点时，pattern才会设置为/p/:lang/doc，p和:lang节点的pattern属性为空。因此，匹配结束时可以通过n.pattern == ““来判断路由规则是否匹配成功。例如，/p/python虽匹配到:lang，但由于:lang的pattern为空，因此匹配失败。

- **查询节点：** 同样递归查询每层节点。退出条件为：匹配到*，匹配失败，或匹配到第len(parts)层节点。



::: details **<font color="#6DD3E3">将Trie加入路由中</font>**

```go
type router struct {
	roots    map[string]*node       // key: 请求方式
	handlers map[string]HandlerFunc // key:	请求方式 + ‘-’ + 路由
}

func newRouter() *router {
	return &router{
		roots:    make(map[string]*node),
		handlers: make(map[string]HandlerFunc),
	}
}

func parsePattern(pattern string) []string {
	split := strings.Split(pattern, patternPrefix)

	parts := make([]string, 0)
	for _, item := range split {
		if item != "" {
			parts = append(parts, item)
			if item[0] == '*' {
				break
			}
		}
	}
	return parts
}

func (r *router) addRouter(method string, pattern string, handler HandlerFunc) {
	// 如果 pattern 不以 '/' 开头，则在前面拼接 '/'
	if !strings.HasPrefix(pattern, patternPrefix) {
		pattern = patternPrefix + pattern
	}

	log.Printf("[elf] Route %s - %s", method, pattern)
	if _, ok := r.roots[method]; !ok {
		r.roots[method] = &node{}
	}
	parts := parsePattern(pattern)
	r.roots[method].insert(pattern, parts, 0)

	key := method + routeSeparator + pattern
	r.handlers[key] = handler
}


func (r *router) getRouter(method string, path string) (*node, map[string]string) {
	searchParts := parsePattern(path)
	root, ok := r.roots[method]
	if !ok {
		return nil, nil
	}

	params := make(map[string]string)
	node := root.search(searchParts, 0)
	if node != nil {
		parts := parsePattern(node.pattern)
		for index, part := range parts {
			if part[0] == ':' {
				params[part[1:]] = searchParts[index]
			}

			if part[0] == '*' && len(part) > 1 {
				params[part[1:]] = strings.Join(searchParts[index:], "/")
				break
			}
		}
	}

	return node, params
}

func (r *router) handle(c *Context) {
	node, params := r.getRouter(c.Method, c.Path)
	if node != nil {
		c.Params = params
		key := c.Method + routeSeparator + node.pattern
		r.handlers[key](c)
	} else {
		c.String(http.StatusNotFound, "404 NOT FOUND: %s\n", c.Path)
	}
}
```

:::

使用 `roots` 存储每种请求方式的 Trie 树根节点，使用 `handlers` 存储每种请求方式的 HandlerFunc。在 `getRoute` 函数中，解析 `:` 和 `*` 两种匹配符，并返回一个包含参数的 map。例如，`/p/go/doc` 匹配到 `/p/:lang/doc`，解析结果为 `{lang: "go"}`；`/static/css/geektutu.css` 匹配到 `/static/*filepath`，解析结果为 `{filepath: "css/geektutu.css"}`。



### group

使用 `RouterGroup` 提供了一种有效的机制来组织和管理 Web 应用程序的路由，使代码更加模块化、易于维护和扩展。

::: details **<font color="#6EEEEE">查看代码</font>**

```go
type RouterGroup struct {
	prefix     string
	middleware []HandlerFunc
	parent     *RouterGroup
	engine     *Engine // 所有组共享一个实例
}

type Engine struct {
  // 嵌套实现继承
	*RouterGroup
	// 路由
	router *router
	groups []*RouterGroup
}

// 创建实例
func New() *Engine {
	engine := &Engine{router: newRouter()}
	engine.RouterGroup = &RouterGroup{engine: engine}
	engine.groups = []*RouterGroup{engine.RouterGroup}
	return engine
}

func (group *RouterGroup) Group(prefix string) *RouterGroup {
	newGroup := &RouterGroup{
		prefix: prefix,
		parent: group,
		engine: group.engine,
	}

	group.engine.groups = append(group.engine.groups, newGroup)
	return newGroup
}

func (group *RouterGroup) addRouter(method string, pattern string, handler HandlerFunc) {
	group.engine.router.addRouter(method, group.prefix+pattern, handler)
}

func (group *RouterGroup) GET(pattern string, handler HandlerFunc) {
	group.addRouter("GET", pattern, handler)
}

func (group *RouterGroup) POST(pattern string, handler HandlerFunc) {
	group.addRouter("POST", pattern, handler)
}
```

:::

**GitHub仓库:** https://github.com/HlkL/golang-learn/tree/elf-web

