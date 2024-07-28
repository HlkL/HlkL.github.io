## 缓存淘汰算法

[缓存淘汰算法和Redis的缓存淘汰策略](https://juejin.cn/post/7097507667626688543)

### FIFO(First In First Out)

先进先出，也就是淘汰缓存中最老(最早添加)的记录。FIFO 认为，最早添加的记录，其不再被使用的可能性比刚添加的可能性大。这种算法的实现也非常简单，创建一个队列，新增记录添加到队尾，每次内存不够时，淘汰队首。但是很多场景下，部分记录虽然是最早添加但也最常被访问，而不得不因为呆的时间太长而被淘汰。这类数据会被频繁地添加进缓存，又被淘汰出去，导致缓存命中率降低。

### LFU(Least Frequently Used)

最少使用，也就是淘汰缓存中访问频率最低的记录。LFU 认为，如果数据过去被访问多次，那么将来被访问的频率也更高。LFU 的实现需要维护一个按照访问次数排序的队列，每次访问，访问次数加1，队列重新排序，淘汰时选择访问次数最少的即可。LFU 算法的命中率是比较高的，但缺点也非常明显，维护每个记录的访问次数，对内存的消耗是很高的；另外，如果数据的访问模式发生变化，LFU 需要较长的时间去适应，也就是说 LFU 算法受历史数据的影响比较大。例如某个数据历史上访问次数奇高，但在某个时间点之后几乎不再被访问，但因为历史访问次数过高，而迟迟不能被淘汰。

### LRU(Least Recently Used)

最近最少使用，相对于仅考虑时间因素的 FIFO 和仅考虑访问频率的 LFU，LRU 算法可以认为是相对平衡的一种淘汰算法。LRU 认为，如果数据最近被访问过，那么将来被访问的概率也会更高。LRU 算法的实现非常简单，维护一个队列，如果某条记录被访问了，则移动到队尾，那么队首则是最近最少访问的数据，淘汰该条记录即可。(当前框架采用lru淘汰策略)



### 算法实现

![数据结构](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1721569886-lru.jpg)

- 绿色的是字典(map)，存储键和值的映射关系。这样根据某个键(key)查找对应的值(value)的复杂是`O(1)`，在字典中插入一条记录的复杂度也是`O(1)`。
- 红色的是双向链表(double linked list)实现的队列。将所有的值放到双向链表中，这样，当访问到某个值时，将其移动到队尾的复杂度是`O(1)`，在队尾新增一条记录以及删除一条记录的复杂度均为`O(1)`。



::: details **<font color=6EEEEE>查看代码实现</font>**

**数据结构**

```go
package lru

import "container/list"

type Cache[T Value] struct {
	maxBytes  int // 最大内存设置为0则没有淘汰策略
	nBytes    int
	ll        *list.List
	cache     map[string]*list.Element
	OnEvicted func(key string, value T)
}

type Value interface {
	Size() int
}

// 双向链表节点数据类型
type entry[T Value] struct {
	key   string
	value T
}

func (c *Cache[T]) Size() int {
	return c.ll.Len()
}
```

- 字典使用 `map[string]*list.Element` 定义，键是字符串，值是双向链表中对应节点的指针。
- `maxBytes` 是允许使用的最大内存，`nbytes` 是当前已使用的内存，`OnEvicted` 是某条记录被移除时的回调函数，可以为 nil。
- 键值对 `entry` 是双向链表节点的数据类型，在链表中仍保存每个值对应的 key 的好处在于，淘汰队首节点时，需要用 key 从字典中删除对应的映射。
- 为了通用性，我们允许值是实现了 `Value` 接口的任意[泛型](https://www.kunkkawu.com/archives/shen-ru-li-jie-golang-de-fan-xing)，该接口只包含了一个方法 `Size() int`，用于返回值所占用的内存大小。
- 当前数据结构中的双向列表使用[Go 语言标准库实现的双向链表](https://pkg.go.dev/container/list)`list.List`



**功能函数&[测试](https://geektutu.com/post/quick-go-test.html)**

::: code-group

```go[New]
func New[T Value](maxBytes int, onEvicted func(string, T)) *Cache[T] {
	return &Cache[T]{
		maxBytes:  maxBytes,
		ll:        list.New(),
		cache:     make(map[string]*list.Element),
		OnEvicted: onEvicted,
	}
}
```

```go[Get]
func (c *Cache[T]) Get(key string) (v T, ok bool) {
	if element, ok := c.cache[key]; ok {
		c.ll.MoveToBack(element)
		entry := element.Value.(*entry[T])
		return entry.value, true
	}

	return
}
```

```go[RemoveOldest]
func (c *Cache[T]) RemoveOldest() {
	element := c.ll.Front()
	if element != nil {
		// 删除队列元素
		c.ll.Remove(element)

		// 删除map数据
		entry := element.Value.(*entry[T])
		delete(c.cache, entry.key)
		c.nBytes -= entry.value.Size() + len(entry.key)
		if c.OnEvicted != nil {
			c.OnEvicted(entry.key, entry.value)
		}
	}
}
```

```go[Add]
func (c *Cache[T]) Add(key string, value T) {
	if element, ok := c.cache[key]; ok {
		c.ll.MoveToBack(element)
		entry := element.Value.(*entry[T])
		c.nBytes += value.Size() - entry.value.Size()
		element.Value = entry
	} else {
		element := c.ll.PushBack(&entry[T]{key: key, value: value})
		c.cache[key] = element
		c.nBytes += len(key) + value.Size()
	}

	// 淘汰旧数据
	for c.maxBytes != 0 && c.maxBytes < c.nBytes {
		c.RemoveOldest()
	}
}
```

```go[TestGet]
package lru

import (
	"reflect"
	"testing"
)

type String string
func (d String) Size() int {
	return len(d)
}

func TestGet(t *testing.T) {
	lru := New[String](0, nil)
	lru.Add("key1", String("1234"))
	if v, ok := lru.Get("key1"); !ok || v != "1234" {
		t.Fatalf("cache hit key1=1234 failed")
	}
	if _, ok := lru.Get("key2"); ok {
		t.Fatalf("cache miss key2 failed")
	}
}
```

```go[TestRemoveOldest]
func TestRemoveOldest(t *testing.T) {
	k1, k2, k3 := "key1", "key2", "k3"
	v1, v2, v3 := "value1", "value2", "v3"
	cap := len(k1 + k2 + v1 + v2)
	lru := New[String](cap, nil)
	lru.Add(k1, String(v1))
	lru.Add(k2, String(v2))
	lru.Add(k3, String(v3))

	if _, ok := lru.Get("key1"); ok || lru.Size() != 2 {
		t.Fatalf("Removeoldest key1 failed")
	}
}
```

```go[TestOnEvicted]
func TestOnEvicted(t *testing.T) {
	keys := make([]string, 0)
	callback := func(key string, value String) {
		keys = append(keys, key)
	}
	lru := New(10, callback)
	lru.Add("key1", String("123456"))
	lru.Add("k2", String("k2"))
	lru.Add("k3", String("k3"))
	lru.Add("k4", String("k4"))

	expect := []string{"key1", "k2"}

	if !reflect.DeepEqual(expect, keys) {
		t.Fatalf("Call OnEvicted failed, expect keys equals to %s", expect)
	}
}
```

:::



## 单机并发缓存

在多线程下并发访问缓存可能会存在一些安全问题，本节使用 `sync.Mutex` 保证在单机下的并发安全。

::: details **<font color=red>多线程并发安全问题</font>**

```go
var set = make(map[int]bool)

func printOnce(num int) {
	if _, exist := set[num]; !exist {
		fmt.Println(num)
	}
	set[num] = true
}

func main() {
	for i := 0; i < 10; i++ {
		go printOnce(100)
	}
	time.Sleep(time.Second)
}

```

运行结果

```md
100
100
```

有时候打印 2 次，有时候打印 4 次，有时候还会触发 panic，因为对同一个数据结构`set`的访问冲突了。接下来用互斥锁的`Lock()`和`Unlock()` 方法将冲突的部分包裹起来:

```go
func printOnce(num int) {
	m.Lock()
	defer m.Unlock()
	if _, exist := set[num]; !exist {
		fmt.Println(num)
	}
	set[num] = true
}
```

运行结果

```md
100
```

相同的数字只会被打印一次。当一个协程调用了 `Lock()` 方法时，其他协程被阻塞了，直到`Unlock()`调用将锁释放。因此被包裹部分的代码就能够避免冲突，实现互斥。

:::



### only read view

```go
package elf

type OnlyReadView struct {
	b []byte
}

func (v OnlyReadView) Size() int {
	return len(v.b)
}

func (v OnlyReadView) String() string {
	return string(v.b)
}

func (v OnlyReadView) ByteSlice() []byte {
	return cloneBytes(v.b)
}

func cloneBytes(b []byte) []byte {
	c := make([]byte, len(b))
	copy(c, b)
	return c
}
```

- OnlyReadView 只有一个数据成员，`b []byte`，b 将会存储真实的缓存值。选择 byte 类型是为了能够支持任意的数据类型的存储，例如字符串、图片等。
- `b` 是只读的，使用 `ByteSlice()` 方法返回一个拷贝，防止缓存值被外部程序修改。



### cache

```go
package elf

import (
	"elf/lru"
	"sync"
)

type cache[T lru.Value] struct {
	mu         sync.Mutex
	lru        *lru.Cache[T]
	cacheBytes int
}

func (c *cache[OnlyReadView]) add(key string, value OnlyReadView) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.lru == nil {
		c.lru = lru.New[OnlyReadView](c.cacheBytes, nil)
	}

	c.lru.Add(key, value)
}

func (c *cache[OnlyReadView]) get(key string) (v OnlyReadView, ok bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.lru == nil {
		return
	}

	if v, ok := c.lru.Get(key); ok {
		return v, true
	}

	return
}
```



### group

Group 是框架最核心的数据结构，负责与用户的交互，并且控制缓存值存储和获取的流程。

```md
                            是
接收 key --> 检查是否被缓存 -----> 返回缓存值 ⑴
                |  否                         是
                |-----> 是否应当从远程节点获取 -----> 与远程节点交互 --> 返回缓存值 ⑵
                            |  否
                            |-----> 调用`回调函数`，获取值并添加到缓存 --> 返回缓存值 ⑶
```

项目主体结构

```md
elf/
  |--lru/
      |--lru.go  					// lru 缓存淘汰策略
  |--onlyreadview.go				// 缓存值的抽象与封装
  |--cache.go    					// 并发控制
  |--elfcache.go 					// 负责与外部交互，控制缓存存储和获取的主流程
```

**设置源数据来源回调函数**

```go
type Getter interface {
	Get(key string) ([]byte, error)
}

type GetterFunc func(key string) ([]byte, error)

func (g GetterFunc) Get(key string) ([]byte, error) {
	return g(key)
}
```

- 定义接口 Getter 和 回调函数 `Get(key string)([]byte, error)`，参数是 key，返回值是 []byte。
- 定义函数类型 GetterFunc，并实现 Getter 接口的 `Get` 方法。
- 函数类型实现某一个接口，称之为[接口型函数](https://geektutu.com/post/7days-golang-q1.html)，接口型函数只能应用于接口内部只定义了一个方法的情况。方便使用者在调用时既能够传入函数作为参数，也能够传入实现了该接口的结构体作为参数。



::: details **测试**

```go
func TestGetter(t *testing.T) {
	var f Getter = GetterFunc(func(key string) ([]byte, error) {
		return []byte(key), nil
	})

	expect := []byte("key")
	if v, _ := f.Get("key"); !reflect.DeepEqual(v, expect) {
		t.Errorf("callback failed")
	}
}
```

:::



::: details **Group**

**数据结构定义**

```go
type Group[T OnlyReadView] struct {
	name      string
	getter    Getter
	mainCache cache[OnlyReadView]
}

var (
	mu     sync.RWMutex
	groups = make(map[string]*Group[OnlyReadView])
)

func NewGroup[T OnlyReadView](name string, cacheBytes int, getter Getter) *Group[OnlyReadView] { // [!code focus]
	if getter == nil {
		panic("nil Getter")
	}

	g := &Group[OnlyReadView]{
		name:   name,
		getter: getter,
		mainCache: cache[OnlyReadView]{
			cacheBytes: cacheBytes,
		},
	}

	mu.Lock()
	defer mu.Unlock()
	groups[name] = g

	return g
}

func GetGroup[T OnlyReadView](name string) *Group[OnlyReadView] {
	mu.RLock()
	defer mu.RUnlock()
	return groups[name]
}
```

- 一个 Group 可以认为是一个缓存的命名空间，每个 Group 拥有一个唯一的名称 `name`。比如可以创建三个 Group，缓存学生的成绩命名为 scores，缓存学生信息的命名为 info，缓存学生课程的命名为 courses。
- 第二个属性是 `getter Getter`，即缓存未命中时获取源数据的回调(callback)。
- 构建函数 `NewGroup` 用来实例化 Group，并且将 group 存储在全局变量 `groups` 中。
- `GetGroup` 用来特定名称的 Group，这里使用了只读锁 `RLock()`，因为不涉及任何冲突变量的写操作。

> `NewGroup[T OnlyReadView](name string, cacheBytes int, getter Getter)` 将某个/某几个方法封装为 interface{}，一般是为了获得更好的语义性和通用性。函数作为参数，是固定的，接口作为参数，便于扩展（接口内新增方法）。使用 `GetterFunc` 是一个接口型函数，自己是一个函数类型，同时实现了接口 `Getter`。因此，参数 getter 既支持传入实现了接口 `Getter` 的结构体，也支持直接传入函数（可以被转换为GetterFunc类型）。

**核心功能**

```go
func (g *Group[T]) Get(key string) (OnlyReadView, error) {
	if key == "" {
		return OnlyReadView{}, fmt.Errorf("key is required")
	}

	if v, ok := g.mainCache.get(key); ok {
		fmt.Println("[ElfCache hit]")
		return v, nil
	}

	return g.load(key)
}

func (g *Group[T]) load(key string) (OnlyReadView, error) {
	return g.getLocally(key)
}

func (g *Group[T]) getLocally(key string) (OnlyReadView, error) {
	bytes, error := g.getter.Get(key)
	if error != nil {
		return OnlyReadView{}, error
	}

	value := OnlyReadView{b: cloneBytes(bytes)} // [!code focus]
	g.populateCache(key, value)
	return value, nil
}

func (g *Group[T]) populateCache(key string, value OnlyReadView) {
	g.mainCache.add(key, value)
}
```

- 流程 ⑴ ：从 mainCache 中查找缓存，如果存在则返回缓存值。
- 流程 ⑶ ：缓存不存在，则调用 load 方法，load 调用 getLocally（分布式场景下会调用 getFromPeer 从其他节点获取），getLocally 调用用户回调函数 `g.getter.Get()` 获取源数据，并且将源数据添加到缓存 mainCache 中（通过 populateCache 方法）

> `value := OnlyReadView{b: cloneBytes(bytes)}` 防止缓存值被外部程序修改。bytes 是切片，切片不会深拷贝。保存时复制一份，防止外部程序仍旧持有切片的控制权，保存后，切片被外部程序修改。

**功能测试**

```go
var db = map[string]string{
	"Tom":  "630",
	"Jack": "589",
	"Sam":  "567",
}

func TestGet(t *testing.T) {
	loadCounts := make(map[string]int, len(db))
	gee := NewGroup("scores", 2<<10, GetterFunc(
		func(key string) ([]byte, error) {
			log.Println("[SlowDB] search key", key)
			if v, ok := db[key]; ok {
				if _, ok := loadCounts[key]; !ok {
					loadCounts[key] = 0
				}
				loadCounts[key] += 1
				return []byte(v), nil
			}
			return nil, fmt.Errorf("%s not exist", key)
		}))

	for k, v := range db {
		if view, err := gee.Get(k); err != nil || view.String() != v {
			t.Fatal("failed to get value of Tom")
		} // load from callback function
		if _, err := gee.Get(k); err != nil || loadCounts[k] > 1 {
			t.Fatalf("cache %s miss", k)
		} // cache hit
	}

	if view, err := gee.Get("unknown"); err == nil {
		t.Fatalf("the value of unknow should be empty, but %s got", view)
	}
}
```

输出结果

```md
=== RUN   TestGet
2024/07/23 21:53:37 [SlowDB] search key Tom
[ElfCache hit]
2024/07/23 21:53:37 [SlowDB] search key Jack
[ElfCache hit]
2024/07/23 21:53:37 [SlowDB] search key Sam
[ElfCache hit]
2024/07/23 21:53:37 [SlowDB] search key unknown
--- PASS: TestGet (0.00s)
PASS
ok      elf-cache/elf   (cached)
```

:::



## http服务端

分布式缓存需要实现节点间通信，建立基于 HTTP 的通信机制是比较常见和简单的做法。如果一个节点启动了 HTTP 服务，那么这个节点就可以被其他节点访问。

::: details **查看代码**

http数据结构

```go
const BASE_PATH = "/elfcache/"

type HTTPPool struct {
	// 记录自己的地址，包括主机名/IP 和端口
	self     string
	// 节点间通讯地址前缀
	basePath string
}

func NewHTTPPool(self string) *HTTPPool {
	return &HTTPPool{
		self:     self,
		basePath: BASE_PATH,
	}
}
```

核心函数

```go
func (p *HTTPPool) Log(format string, v ...interface{}) {
	log.Printf("[Server %s] %s", p.self, fmt.Sprintf(format, v...))
}

func (p *HTTPPool) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if !strings.HasPrefix(r.URL.Path, p.basePath) {
		panic("HTTPPool serving unexpected path: " + r.URL.Path)
	}
	p.Log("%s %s", r.Method, r.URL.Path)
	// /<basepath>/<groupname>/<key> required
	parts := strings.SplitN(r.URL.Path[len(p.basePath):], "/", 2)
	if len(parts) != 2 {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	groupName := parts[0]
	key := parts[1]

	group := GetGroup(groupName)
	if group == nil {
		http.Error(w, "no such group: "+groupName, http.StatusNotFound)
		return
	}

	view, err := group.Get(key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Write(view.b)
}
```

- ServeHTTP 首先判断访问路径的前缀是否是 `basePath`，不是返回错误。
- 约定访问路径格式为 `/<basepath>/<groupname>/<key>`，通过 groupname 得到 group 实例，再使用 `group.Get(key)` 获取缓存数据。
- 最终使用 `w.Write()` 将缓存值作为 httpResponse 的 body 返回。

:::

功能测试

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"elf"
)

var db = map[string]string{
	"Tom":  "630",
	"Jack": "589",
	"Sam":  "567",
}

func main() {
	elf.NewGroup[elf.OnlyReadView]("scores", 2<<10, elf.GetterFunc(
		func(key string) ([]byte, error) {
			log.Println("[SlowDB] search key", key)
			if v, ok := db[key]; ok {
				return []byte(v), nil
			}
			return nil, fmt.Errorf("%s not exist", key)
		}))

	addr := "localhost:9999"
	peers := elf.NewHTTPPool(addr)
	log.Println("elfcache is running at", addr)
	log.Fatal(http.ListenAndServe(addr, peers))
}
```

请求示例输出

```
http://localhost:9999/elfcache/scores/tom
>> tom not exist
http://localhost:9999/elfcache/scores/Jack
>> 589
```



## 一致性哈希

**参考博文:** [https://developer.aliyun.com/article/1082388](https://developer.aliyun.com/article/1082388)

在分布式缓存中，当一个节点接收到请求，如果该节点并没有存储缓存值，应该从那个节点获取数据？当前节点，还是其他节点。假设包括当前在内一共有 10 个节点，当一个节点接收到请求时，随机选择一个节点，由该节点从数据源获取数据。

假设第一次随机选取了节点 1 ，节点 1 从数据源获取到数据的同时缓存该数据；那第二次，只有 1/10 的可能性再次选择节点 1, 有 9/10 的概率选择了其他节点，如果选择了其他节点，就意味着需要再一次从数据源获取数据，一般来说，这个操作是很耗时的。这样做，一是缓存效率低，二是各个节点上存储着相同的数据，浪费了大量的存储空间。**对缓存数据的key进行hash运算后取模，N是机器的数量；运算后的结果映射对应集群中的节点。**

![hash select peer](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1722174622-hash_select.jpg)

简单求取 Hash 值解决了缓存性能的问题，但是没有考虑节点数量变化的场景。假设，移除了其中一台节点，只剩下 9 个，那么之前 `hash(key) % 10` 变成了 `hash(key) % 9`，也就意味着几乎缓存值对应的节点都发生了改变。即几乎所有的缓存值都失效了。节点在接收到对应的请求时，均需要重新去数据源获取数据，容易引起 `缓存雪崩`。



### 算法原理

一致性哈希算法将 key 映射到 2^32 的空间中，将这个数字首尾相连，形成一个环。

- 计算节点/机器(通常使用节点的名称、编号和 IP 地址)的哈希值，放置在环上。
- 计算 key 的哈希值，放置在环上，顺时针寻找到的第一个节点，就是应选取的节点/机器。
- 当增加或者删除一台服务器时，受影响的数据仅仅是新添加或删除的服务器到其环空间中前一台的服务器（也就是顺着逆时针方向遇到的第一台服务器）之间的数据，其他都不会受到影响。

![一致性哈希添加节点 consistent hashing add peer](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1722174781-add_peer.jpg)

环上有 peer2，peer4，peer6 三个节点，`key11`，`key2`，`key27` 均映射到 peer2，`key23` 映射到 peer4。此时，如果新增节点/机器 peer8，假设它新增位置如图所示，那么只有 `key27` 从 peer2 调整到 peer8，其余的映射均没有发生改变。一致性哈希算法，在新增/删除节点时，只需要重新定位该节点附近的一小部分数据，而不需要重新定位所有的节点。

::: danger

由于哈希计算的随机性，导致一致性哈希算法存在一个致命问题：数据倾斜，，也就是说大多数访问请求都会集中少量几个节点的情况。特别是节点太少情况下，容易因为节点分布不均匀造成数据访问的冷热不均。这就失去了集群和负载均衡的意义。

:::

为了解决数据倾斜的问题，一致性哈希算法引入了虚拟节点机制，即对每一个物理服务节点映射多个虚拟节点，将这些虚拟节点计算哈希值并映射到哈希环上，当请求找到某个虚拟节点后，将被重新映射到具体的物理节点。虚拟节点越多，哈希环上的节点就越多，数据分布就越均匀，从而避免了数据倾斜的问题。



::: details **算法实现**

**数据结构**

```go
package consistenthash

import "hash/crc32"

// 哈希值计算函数
type Hash func(b []byte) uint32

type Map struct {
	hash     Hash
	replicas int
	keys     []int
	hashMap  map[int]string
}

func New(replicas int, fn Hash) *Map {
	m := &Map{
		replicas: replicas,
		hash: fn,
		hashMap: map[int]string{},
	}

	if m.hash == nil {
		m.hash = crc32.ChecksumIEEE
	}

	return m
}
```

- hash：哈希函数，用于生成节点的哈希值。允许用于替换成自定义的 Hash 函数，默认为 `crc32.ChecksumIEEE` 算法。
- replicas：虚拟节点的倍数，每个实际节点会有多个虚拟节点。
- keys：排序后的哈希环上的所有虚拟节点的哈希值。
- hashMap：虚拟节点的哈希值到实际节点的映射。



**机器节点添加函数**

```go
func (m *Map) Add(keys ...string) {
	for _, key := range keys {
		for i := 0; i < m.replicas; i++ {
			hash := int(m.hash([]byte(strconv.Itoa(i) + key)))
			m.keys = append(m.keys, hash)
			m.hashMap[hash] = key
		}
	}
	sort.Ints(m.keys)
}
```

- 遍历每个需要添加的节点标识 key。

- 对于每个节点标识，生成多个虚拟节点，计算它们的哈希值，并添加到哈希环中。

- 维护一个从虚拟节点哈希值到实际节点标识的映射 hashMap。

- 对所有的虚拟节点哈希值进行排序，以便后续的节点查找操作。



**节点获取函数**

```go
func (m *Map) Get(key string) string {
	if len(m.keys) == 0 {
		return ""
	}

	hash := int(m.hash([]byte(key)))

	// 使用二分查找在哈希环中找到第一个大于或等于该哈希值的虚拟节点位置。
	idx := sort.Search(len(m.keys), func(i int) bool {
		return m.keys[i] >= hash
	})

	return m.hashMap[idx % len(m.keys)]
}
```

**功能测试**

```go
func TestHashing(t *testing.T) {
	hash := New(3, func(key []byte) uint32 {
		i, _ := strconv.Atoi(string(key))
		return uint32(i)
	})

	hash.Add("6", "4", "2")
	fmt.Printf("t: %v\n", hash.keys)

	testCases := map[string]string{
		"2":  "2",
		"11": "2",
		"23": "4",
		"27": "2",
	}

	for k, v := range testCases {
		if hash.Get(k) != v {
			fmt.Printf("Asking for %s, should have yielded %s\n", k, v)
		}
	}

	// Adds 8, 18, 28
	hash.Add("8")

	// 27 should now map to 8.
	testCases["18"] = "8"

	for k, v := range testCases {
		if hash.Get(k) != v {
			fmt.Printf("Asking for %s, should have yielded %s\n", k, v)
		}
	}

}
```

输出结果

```
=== RUN   TestHashing
t: [2 4 6 12 14 16 22 24 26]
Asking for 2, should have yielded 2
Asking for 11, should have yielded 2
Asking for 23, should have yielded 4
Asking for 27, should have yielded 2
Asking for 2, should have yielded 2
Asking for 11, should have yielded 2
Asking for 23, should have yielded 4
Asking for 27, should have yielded 2
Asking for 18, should have yielded 8
--- PASS: TestHashing (0.00s)
PASS
ok      elf/consistenthash      0.735s
```

:::
