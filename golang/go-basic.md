# 数据类型

Go语言（Golang）是一种静态类型语言，变量的类型在编译时就已经确定。

![image-20240620204201253](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1718887321-image-20240620204201253.png)


**<font color=green>示例</font>**

```go
package main

import (
	"fmt"
)

func main() {
	// 布尔型
	var b bool = true

	// 整型
	var i int = 42

	// 浮点型
	var f float64 = 3.14

	// 字符串
	var s string = "Hello, Go!"

	// 数组
	var arr [3]int = [3]int{1, 2, 3}

	// 切片
	var sl []int = []int{4, 5, 6}

	// 映射
	var m map[string]int = map[string]int{"foo": 1, "bar": 2}

	// 结构体
	type Person struct {
		Name string
		Age  int
	}
	var p Person = Person{"Alice", 30}

	// 指针
	var ptr *int = &i

	// 接口
	var any interface{} = "can be any type"

	// 打印变量
	fmt.Println(b, i, f, s, arr, sl, m, p, *ptr, any)
}
```

**数字字面量语法**

Go1.13版本之后引入了数字字面量语法，这样便于开发者以二进制、八进制或十六进制浮点数的格式定义数字，例如：

`v := 0b00101101`， 代表二进制的 101101，相当于十进制的 45。

`v := 0o377`，代表八进制的 377，相当于十进制的 255。

`v := 0x1p-2`，代表十六进制的 1 除以 2²，也就是 0.25。

而且还允许用 `_` 来分隔数字， `v := 123_456` 表示 v 的值等于 123456。



## 数组(Array)

数组是值类型，赋值和传参会复制整个数组。因此改变副本的值，不会改变本身的值。

**数组定义**

```go
//数组会初始化为int类型的零值
var testArray [3]int
//使用指定的初始值完成初始化
var numArray = [3]int{1, 2}
//使用指定的初始值完成初始化
var cityArray = [3]string{"北京", "上海", "深圳"}
var cityArray = [...]string{"北京", "上海", "深圳"}
//使用指定索引值的方式来初始化数组
a := [...]int{1: 1, 3: 5}

//二维数组定义，维数组只有第一层可以使用...来让编译器推导数组长度。
a := [3][2]string{
  {"北京", "上海"},
  {"广州", "深圳"},
  {"成都", "重庆"},
}
```

**数组遍历**

```go
func main() {
	var a = [...]string{"北京", "上海", "深圳"}
	// 方法1：for循环遍历
	for i := 0; i < len(a); i++ {
		fmt.Println(a[i])
	}

	// 方法2：for range遍历
	for index, value := range a {
		fmt.Println(index, value)
	}
}
```



## 切片(Slice)

切片（Slice）是一个拥有相同类型元素的可变长度的序列。它是基于数组类型做的一层封装。它非常灵活，支持自动扩容。切片是一个引用类型，它的内部结构包含`地址`、`长度`和`容量`。切片一般用于快速地操作一块数据集合。

**<font color=green>切片定义示例</font>**

```go
func main() {
	// 切片定义: 数组引用
	var arr [5]int = [...]int{1, 2, 3, 4, 5}
	// 左闭右开
	arrRef := arr[0:3]
	fmt.Printf("arr: %v\n", arr)
	fmt.Printf("arrRef: %v\n", arrRef)
	// 修改数组的元素
	modifyArrItem(arr)
	fmt.Printf("after arr modify: %v\n", arr)
	// 传入数组指针修改数组元素
	modifyByPointer(&arr)
	fmt.Printf("use pointer modify after arr: %v\n", arr)

	// 修改切片，会改变原数组值
	arrRef[0] = 45
	fmt.Printf("modify origin arr after slice: %v\n", arr)

	// 修改原数组的值，切片也会跟着改变
	arr[0] = 34
	fmt.Printf("arrRef: %v\n", arrRef)

	// 使用make定义切片
	var slice []int = make([]int, 5, 10)
	fmt.Printf("slice: %v\n", slice)

	// 方式三
	var slice2 []int = []int{1,2,3,4,5}
	fmt.Printf("slice2: %v\n", slice2)
	
	// 执行结果
	// arr: [1 2 3 4 5]
	// arrRef: [1 2 3]
	// after arr modify: [1 2 3 4 5]
	// use pointer modify after arr: [123 2 3 4 5]
	// modify origin arr after slice: [45 2 3 4 5]
	// arrRef: [34 2 3]
	// slice: [0 0 0 0 0]
	// slice2: [1 2 3 4 5]
}

// 函数形参接收数组必须写明数组长度
func modifyArrItem(arr [5]int) {
	arr[0] = 123
}

func modifyByPointer(arr *[5]int) {
	(*arr)[0] = 123
}
```

**<font color=red>切片的本质就是对底层数组的封装，它包含了三个信息：底层数组的指针、切片的长度（len）和切片的容量（cap）。</font>**

数组`a := [8]int{0, 1, 2, 3, 4, 5, 6, 7}`，切片`s1 := a[:5]`，相应示意图：

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1718036817-slice_01.png" alt="slice_01" style="zoom: 33%;" />

切片`s2 := a[3:6]`，相应示意图：

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1718036894-slice_02.png" alt="slice_02" style="zoom:33%;" />

切片之间是不能比较的，不能使用`==`操作符来判断两个切片是否含有全部相等元素。 切片唯一合法的比较操作是和`nil`比较。 一个`nil`值的切片并没有底层数组，一个`nil`值的切片的长度和容量都是0。但是一个长度和容量都是0的切片不一定是`nil`。

```go
var s1 []int         //len(s1)=0;cap(s1)=0;s1==nil
s2 := []int{}        //len(s2)=0;cap(s2)=0;s2!=nil
s3 := make([]int, 0) //len(s3)=0;cap(s3)=0;s3!=nil
```



## 映射(Map)

map是一种无序的基于`key-value`的数据结构，Go语言中的map是引用类型，必须初始化才能使用。定义语法:`make(map[KeyType]ValueType, [cap])`

```go
map := make(map[string]int, 8)
```



## 结构体(Struct)

结构体定义

```go
type person struct {
	name string
	city string
	age  int8
}

// 匿名结构体
var user struct{Name string; Age int}
```

创建结构体

```go
var s1 student
var s2 student = student{}
var s3 student = student{"wangwu",15}
var s4 *student = new(student)
var s5 *student = &student{}
```

结构体初始化

```go
p1 := person{
	name: "小王子",
	city: "北京",
	age:  18,
}

p2 := &person{
	name: "小王子",
	city: "北京",
	age:  18,
}

p3 := &person{
	"小王子",
	"北京",
	28,
}
```

结构体方法定义

```go
type Person struct {
	Name string
	Age  int
}

func (person Person) sayHello() {
	fmt.Println("hello,", person.Name)
}

func (person *Person) setName(name string) {
	person.Name = name
}

func (person Person) String() string {
	return fmt.Sprintf("person = {Name : %s, Age : %d}", person.Name, person.Age)
}
func main() {
	person := Person{"zhansan", 12}
	person.sayHello()
	fmt.Println(person)
	person.setName("lisi")
	fmt.Println(person)
	fmt.Println(&person)
}

// hello, zhansan
// person = {Name : zhansan, Age : 12}
// person = {Name : lisi, Age : 12}
// person = {Name : lisi, Age : 12}
```

结构体序列化

```go
type person struct {
	Name string `json:"name"`
	Age  int `json:"age"`
}

var person person = person{"tom",23}
jsonStr, _ := json.Marshal(person)
fmt.Println(string(jsonStr))	// {"name":"tom","age":23}
```

结构体中字段大写开头表示可公开访问，小写表示私有（仅在定义当前结构体的包中可访问）。`Tag` 是结构体的元信息，可以在运行的时候通过反射的机制读取出来。 `Tag`在结构体字段的后方定义，由一对**反引号**包裹起来。**<font color=red>为结构体编写`Tag`时，必须严格遵守键值对的规则。结构体标签的解析代码的容错能力很差，一旦格式写错，编译和运行时都不会提示任何错误，通过反射也无法正确取值。</font>**

**[Go结构体的内存对齐](https://www.liwenzhou.com/posts/Go/struct-memory-layout/)**



## 指针(Pointer)

Go语言中的指针不能进行偏移和运算，**只需记住两个符号：`&`（取地址）和`*`（根据地址取值）。**

**<font color=green>示例</font>**

```go
func main() {
	a := 10
	b := &a
	fmt.Printf("a:%d ptr:%p\n", a, &a) // a:10 ptr:0xc00001a078
	fmt.Printf("b:%p type:%T\n", b, b) // b:0xc00001a078 type:*int
	fmt.Println(&b)                    // 0xc00000e018
  c := *b 													 // 指针取值（根据指针去内存取值）
	fmt.Printf("type of c:%T\n", c)    // type of c:int
	fmt.Printf("value of c:%v\n", c)   // value of c:10
}
```

- 对变量进行取地址（&）操作，可以获得这个变量的指针变量。
- 指针变量的值是指针地址。
- 对指针变量进行取值（*）操作，可以获得指针变量指向的原变量的值。

`b := &a` 内存示意图

![mi](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1718377990-ptr.png)

### new
- `new(T)`分配T类型的零值内存空间并返回指向该内存空间的指针，即返回`*T`类型的值。
- `new`用于分配值类型（如：数组、结构体等），并将其初始化为零值。
- `new`不会对内存进行额外的初始化操作，仅仅是分配内存。

**<font color=green>示例</font>**

```go
type MyStruct struct {
    a int
    b string
}

p := new(MyStruct) // p 是 *MyStruct 类型的指针
fmt.Println(p)     // 输出: &{0 ""}
```

### make
- `make(T, args)`用于创建并初始化slice、map或channel类型的数据结构。
- `make`返回的是T类型的值（而不是指针），这些值已经被初始化过，可以直接使用。
- `make`会进行额外的初始化操作，具体取决于传递的参数。

**<font color=green>示例</font>**

```go
// 创建一个长度为10的slice
s := make([]int, 10)
fmt.Println(s) // 输出: [0 0 0 0 0 0 0 0 0 0]

// 创建一个初始容量为10的map
m := make(map[string]int, 10)
fmt.Println(m) // 输出: map[]

// 创建一个带缓冲区大小为10的channel
c := make(chan int, 10)
fmt.Println(c) // 输出: 0xc000072060
```

- `new`用于分配内存，返回指向新分配的零值内存的指针，适用于值类型。
- `make`用于创建和初始化slice、map和channel，返回的是这些类型的值，并进行了必要的初始化。



## 接口(Interface)

 go 语言实现接口没有 implement 关键字，只需要定义与接口名称一致，且定义与所实现接口的全部抽象方法即可，鸭子类型。

定义

```go
type 接口类型名 interface{
    方法名1( 参数列表1 ) 返回值列表1
    方法名2( 参数列表2 ) 返回值列表2
    …
}

type game interface {
	start()
	end()
}
```

**<font color=green>示例</font>**

```go
type game interface {
	start()
	end()
}

type lol struct {
}

func (lol lol) start() {
	fmt.Println("开始游戏")
}

func (lol lol) end() {
	fmt.Println("结束游戏")
}

type computer struct{
}

func (computer *computer) work(game game) {
	game.start()
	game.end()
}

func work(game game)  {
	game.start()
	game.end()
}

func main()  {
	lol := lol{}
	computer := computer{}
	computer.work(lol)
	work(lol)
}
```



## 函数(Function)

定义

```go
func 函数名(参数)(返回值){
    函数体
}
```

**<font color=green>示例</font>**

```go
func calc(x int, y int) int {
	return x + y
}
// 省略形参类型
func calc(x, y int) int {
	return x + y
}
// 可变参数（切片）
func calc(x ...int) int {
}
// 多个返回值
func calc(x, y int) (int, int) {
	sum := x + y
	sub := x - y
	return sum, sub
}
// 返回值命名
func calc(x, y int) (sum, sub int) {
	sum = x + y
	sub = x - y
	return
}
```

### 函数类型

可以使用`type`关键字来定义一个函数类型

```go
type calculation func(int, int) int
```

上面语句定义了一个`calculation`类型，它是一种函数类型，这种函数接收两个int类型的参数并且返回一个int类型的返回值。凡是满足这个条件的函数都是calculation类型的函数。

```go
func add(x, y int) int {
	return x + y
}

func sub(x, y int) int {
	return x - y
}
```

add和sub都能赋值给calculation类型的变量。

```go
func main() {
	var c calculation               // 声明一个calculation类型的变量c
	c = add                         // 把add赋值给c
	fmt.Printf("type of c:%T\n", c) // type of c:main.calculation
	fmt.Println(c(1, 2))            // 像调用add一样调用c

	f := add                        // 将函数add赋值给变量f
	fmt.Printf("type of f:%T\n", f) // type of f:func(int, int) int
	fmt.Println(f(10, 20))          // 像调用add一样调用f
}
```

### 高阶函数

函数作为参数

```go
func add(x, y int) int {
	return x + y
}
func calc(x, y int, op func(int, int) int) int {
	return op(x, y)
}
func main() {
	ret2 := calc(10, 20, add)
	fmt.Println(ret2) //30
}
```

函数作为返回值

```go
func do(s string) (func(int, int) int, error) {
	switch s {
	case "+":
		return add, nil
	case "-":
		return sub, nil
	default:
		err := errors.New("无法识别的操作符")
		return nil, err
	}
}
```

### 闭包

参考博文：https://juejin.cn/post/6844903793771937805

```go
func addUpper() func() int {
	var num int

	// 匿名函数引用外部变量
	return func() int {
		num++
		return num
	}

}

func makeSuffix(suffix string) func(string) string {
	return func(name string) string {
		if strings.HasSuffix(name, suffix) {
			return name
		}
		return name + suffix
	}
}
```

#### 内存逃逸

参考博文：https://zhuanlan.zhihu.com/p/672733054

### defer

Go语言中的`defer`语句会将其后面跟随的语句进行延迟处理。在`defer`归属的函数即将返回时，将延迟处理的语句按`defer`定义的逆序进行执行，先被`defer`的语句最后被执行，最后被`defer`的语句，最先被执行。

![defer执行时机](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1718381325-defer.png)

**`defer` `panic` `recover`<font color=green>使用示例</font>**

```go
func main() {
	throwError()
}

func catchError() int {
	defer func() {
		err := recover()
		if err != nil {
			fmt.Println(err)
		}
	}()

	num1 := 1
	num2 := 0
	return num1 / num2
}

func customizeError(name string) error {
	if name == "" {
		return errors.New("name is null")
	}
	return nil
}

func throwError()  {
	err := customizeError("")
	if err != nil {
		fmt.Println(err)
		panic(err)
	}
}
```



# 流程控制

Go语言中最常用的流程控制有`if`和`for`，没有`while`语法，而`switch`和`goto`主要是为了简化代码、降低重复代码而生的结构，属于扩展类的流程控制。Go语言规定与`if`匹配的左括号`{`必须与`if和表达式`放在同一行，`{`放在其他位置会触发编译错误,其他流程控制也是如此。

**if**条件判断还有一种特殊的写法，可以在 if 表达式之前添加一个执行语句，再根据变量值进行判断

```go
if score := 65; score >= 90 {
  fmt.Println("A")
}
```

**for range**

```go
for i := range 5 {
	fmt.Println(i)
}
```

**switch**每个`case` 默认存在`break`，一个分支可以有多个值，多个case值中间使用英文逗号分隔。分支还可以使用表达式，这时候switch语句后面不需要再跟判断变量。

```go
func switchTest() {
	switch n := 7; n {
	case 1, 3, 5, 7, 9:
		fmt.Println("奇数")
	case n < 1:
		fmt.Println(n)
	default:
		fmt.Println(n)
	}
}
```

`fallthrough`语法可以执行满足条件的case的下一个case

```go
func switchTest() {
	s := "a"
	switch {
	case s == "a":
		fmt.Println("a")
		fallthrough
	case s == "b":
		fmt.Println("b")
	default:
		fmt.Println("...")
	}
}
// a
// b
```



# flag

Go语言内置的`flag`包实现了命令行参数的解析。

只是简单的想要获取命令行参数，可以使用`os.Args`来获取命令行参数，在使用 `go run main.go` 时，在命令后面添加参数以空格隔开，输入回车键结束。

```go
func args() {
	args := os.Args
	for _, str := range args {
		fmt.Println(str)
	}
}
```

flag包支持的命令行参数类型有`bool`、`int`、`int64`、`uint`、`uint64`、`float` `float64`、`string`、`duration`。

```go
func main() {
	var name string
	var pwd string
	var port int
	flag.StringVar(&name, "u", "", "用户名为空")
	flag.StringVar(&pwd, "pwd", "", "密码为空")
	flag.IntVar(&port, "p", 0, "端口")

	flag.Parse()

	fmt.Printf("用户名: %s,用户密码: %s,端口号: %d\n", name, pwd, port)
}
```



# log

log包定义了Logger类型，该类型提供了一些格式化输出的方法。本包也提供了一个预定义的“标准”logger，可以通过调用函数`Print系列`(Print|Printf|Println）、`Fatal系列`（Fatal|Fatalf|Fatalln）、和`Panic系列`（Panic|Panicf|Panicln）来使用。logger会打印每条日志信息的日期、时间，默认输出到系统的标准错误。Fatal系列函数会在写入日志信息后调用os.Exit(1)。Panic系列函数会在写入日志信息后panic。

```go
func main()  {
	log.Println("这是一条很普通的日志。")
	log.Printf("这是一条%s日志。\n", "普通")
	log.Fatalln("这是一条会触发fatal的日志。")
	log.Panicln("这是一条会触发panic的日志。")
}

// 2024/06/16 15:24:17 这是一条很普通的日志。
// 2024/06/16 15:24:17 这是一条普通日志。
// 2024/06/16 15:24:17 这是一条会触发fatal的日志。
// exit status 1
```



## 配置logger

`log`标准库中的`Flags`函数会返回标准logger的输出配置，而`SetFlags`函数用来设置标准logger的输出配置。

```go
func Flags() int
func SetFlags(flag int)
```

**flag选项**

```go
const (
    // 控制输出日志信息的细节，不能控制输出的顺序和格式。
    // 输出的日志在每一项后会有一个冒号分隔
    Ldate         = 1 << iota     // 日期：2009/01/23
    Ltime                         // 时间：01:23:23
    Lmicroseconds                 // 微秒级别的时间：01:23:23.123123（用于增强Ltime位）
    Llongfile                     // 文件全路径名+行号： /a/b/c/d.go:23
    Lshortfile                    // 文件名+行号：d.go:23（会覆盖掉Llongfile）
    LUTC                          // 使用UTC时间
    LstdFlags     = Ldate | Ltime // 标准logger的初始值
)
```

**配置日志前缀**

```go
func Prefix() string
func SetPrefix(prefix string)
```

**配置日志输出位置**

```go
func SetOutput(w io.Writer)
```

**创建logger**

```go
func New(out io.Writer, prefix string, flag int) *Logger
```

**<font color=green>示例</font>**

:::code-group

```go
func logPrintf() {
	log.Println("这是一条很普通的日志。")
	log.Printf("这是一条%s日志。\n", "普通")
	log.Fatalln("这是一条会触发fatal的日志。")
	log.Panicln("这是一条会触发panic的日志。")
	// 2024/06/16 15:24:17 这是一条很普通的日志。
	// 2024/06/16 15:24:17 这是一条普通日志。
	// 2024/06/16 15:24:17 这是一条会触发fatal的日志。
	// exit status 1
}
```

```go[格式化输出]
func flagLogPrintf()  {
	log.SetFlags(log.Llongfile | log.Lmicroseconds | log.Ldate)
	log.Println("这是一条很普通的日志。")
	log.SetPrefix("golang-log")
	log.Println("这是一条很普通的日志。")
	// 2024/06/16 15:35:32.254653 /Users/hougen/code/golang/learn/log/main.go:11: 这是一条很普通的日志。
	//golang-log2024/06/16 15:36:40.563437 /Users/hougen/code/golang/learn/log/main.go:14: 这是一条很普通的日志。
}
```

```go[输出到文件]
func outLog2File()  {
	logFile, err := os.OpenFile("./xx.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		fmt.Println("open log file failed, err:", err)
		return
	}
	log.SetOutput(logFile)
	log.SetFlags(log.Llongfile | log.Lmicroseconds | log.Ldate)
	log.Println("这是一条输出到文件的日志。")
}
```

```go[自定义日志输出]
func createLogPrintf() {
	logger := log.New(os.Stdout, "go-log-", log.Lshortfile|log.Ldate|log.Ltime)
	logger.Println("这是自定义的logger记录的日志。")
	// go-log-2024/06/16 15:41:02 main.go:15: 这是自定义的logger记录的日志。
}
```

:::

# time

参考博文：https://www.liwenzhou.com/posts/Go/go-time/



# file

参考博文：https://www.liwenzhou.com/posts/Go/file/



# 包管理

参考博文：https://www.liwenzhou.com/posts/Go/package/



# net/http

**<font color=green>Hello world</font>**

```go
func greet(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World! %s", time.Now())
}

func main() {
	http.HandleFunc("/", greet)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
}
```

基本的http/https请求

```go
http.Get("http://example.com/")
http.Post("http://example.com/upload", "image/jpeg", &buf)
http.PostForm("http://example.com/form", url.Values{"key": {"Value"}, "id": {"123"}})

// 完整实例
func sendGetRequest()  {
	resp, err := http.Get("https://www.github.com")
	if err != nil {
		fmt.Println(err)
	}
 	defer resp.Body.Close()
	respBoby := make([]byte, 1024)
	resp.Body.Read(respBoby)
	fmt.Println(string(respBoby))
}
```

**<font color=green>Get请求收发示例</font>**

:::code-group

```go[client]
func sendGetRequestWithParam()  {
	param := url.Values{}
	param.Set("uid","13")
	url, err := url.ParseRequestURI("http://127.0.0.1:8080/get")
	if err != nil {
		fmt.Println(err)
	}

	url.RawQuery = param.Encode()
	resp, err := http.Get(url.String())
	if err != nil {
		fmt.Println(err)
	}

	defer resp.Body.Close()
	res, _ := ioutil.ReadAll(resp.Body)
	fmt.Printf(string(res))
}
```

```go[server]
func get() {
	http.HandleFunc("/get", func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()
		fmt.Printf("r.Method: %v\n", r.Method)
		query := r.URL.Query()
		fmt.Printf("query.Get(\"uid\"): %v\n", query.Get("uid"))
		answer := `{"status": "ok"}`
		w.Write([]byte(answer))
	})

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Printf("err: %v\n", err)
	}
}
```

:::

**<font color=green>Post请求收发示例</font>**

:::code-group

```go[client]
func sendPostRequest()  {
	url := "http://127.0.0.1:8080/post"
	// 表单数据
	//contentType := "application/x-www-form-urlencoded"
	//data := "name=张三&age=18"
	contentType := "application/json"
	data := `{"name":"张三","age":18}`
	resp, err := http.Post(url, contentType, strings.NewReader(data))
	if err != nil {
		fmt.Printf("post failed, err:%v\n", err)
		return
	}
	defer resp.Body.Close()
	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("get resp failed, err:%v\n", err)
		return
	}
	fmt.Println(string(b))
}
```

```go[server]
func post()  {
	http.HandleFunc("/post",func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()
		// 1. 请求类型是application/x-www-form-urlencoded时解析form数据
		// r.ParseForm()
		// fmt.Println(r.PostForm) // 打印form数据
		// fmt.Println(r.PostForm.Get("name"), r.PostForm.Get("age"))
		// 2. 请求类型是application/json时从r.Body读取数据
		b, err := ioutil.ReadAll(r.Body)
		if err != nil {
			fmt.Printf("read request.Body failed, err:%v\n", err)
			return
		}
		fmt.Println(string(b))
		answer := `{"status": "ok"}`
		w.Write([]byte(answer))
	})

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		return
	}

}
```

:::

## 自定义

管理HTTP客户端的头域、重定向策略和其他设置。自定义Client。

```go
client := &http.Client{
	CheckRedirect: redirectPolicyFunc,
}
resp, err := client.Get("http://example.com")

req, err := http.NewRequest("GET", "http://example.com", nil)

req.Header.Add("If-None-Match", `W/"wyzzy"`)
resp, err := client.Do(req)
```

管理代理、TLS配置、keep-alive、压缩和其他设置。自定义Transport。

```go
tr := &http.Transport{
	TLSClientConfig:    &tls.Config{RootCAs: pool},
	DisableCompression: true,
}
client := &http.Client{Transport: tr}
resp, err := client.Get("https://example.com")
```

**Client和Transport类型都可以安全的被多个goroutine同时使用。应该一次建立、多次重用。**

自定义server。

```go
s := &http.Server{
	Addr:           ":8080",
	Handler:        myHandler,
	ReadTimeout:    10 * time.Second,
	WriteTimeout:   10 * time.Second,
	MaxHeaderBytes: 1 << 20,
}
log.Fatal(s.ListenAndServe())
```

