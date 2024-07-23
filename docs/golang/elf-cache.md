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
	"elf-cache/elf/lru"
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

