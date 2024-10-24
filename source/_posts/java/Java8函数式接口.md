---
title: java8函数式接口
date: 2023-05-09 22:21:57
updated: 2023-05-09 22:21:57
tags:
  - java
---

函数接口有一个很简单的定义就是只有`一个抽象函数`的接口，函数接口使用注解 `@FunctionalInterface `进行声明（注解声明不是必须的，如果没有注解，也是只有一个抽象函数，依旧会被认为是函数接口）。多一个或者少一个抽象函数都不能定义为函数接口，如果使用了函数接口注解又不止一个抽象函数，那么编译器会拒绝编译。函数接口在使用时候可以隐式的转换成 Lambda 表达式。

`Java 8` 中很多有很多不同功能的函数接口定义，都放在了 `Java 8` 新增的 `java.util.function` 包内。下面是一些关于 `Java 8` 中函数接口功能的描述。

|        函数式接口        |                             描述                             |
| :----------------------: | :----------------------------------------------------------: |
|      **BiConsumer**      |     代表了一个接受两个输入参数的操作，并且不返回任何结果     |
|      **BiFunction**      |      代表了一个接受两个输入参数的方法，并且返回一个结果      |
|    **BinaryOperator**    | 代表了一个作用于于两个同类型操作符的操作，并且返回了操作符同类型的结果 |
|     **BiPredicate**      |             代表了一个两个参数的 boolean 值方法              |
|   **BooleanSupplier**    |                代表了 boolean 值结果的提供方                 |
|       **Consumer**       |            代表了接受一个输入参数并且无返回的操作            |
| **DoubleBinaryOperator** | 代表了作用于两个 double 值操作符的操作，并且返回了一个 double 值的结果。 |
|    **DoubleConsumer**    |      代表一个接受 double 值参数的操作，并且不返回结果。      |
|    **DoubleFunction**    |        代表接受一个 double 值参数的方法，并且返回结果        |
|   **DoublePredicate**    |         代表一个拥有 double 值参数的 boolean 值方法          |
|    **DoubleSupplier**    |                代表一个 double 值结构的提供方                |
| **DoubleToIntFunction**  |      接受一个 double 类型输入，返回一个 int 类型结果。       |
| **DoubleToLongFunction** |       接受一个 double 类型输入，返回一个 long 类型结果       |
| **DoubleUnaryOperator**  |    接受一个参数同为类型 double, 返回值类型也为 double 。     |
|       **Function**       |               接受一个输入参数，返回一个结果。               |
|  **IntBinaryOperator**   |       接受两个参数同为类型 int, 返回值类型也为 int 。        |
|     **IntConsumer**      |           接受一个 int 类型的输入参数，无返回值 。           |
|     **IntFunction**      |          接受一个 int 类型输入参数，返回一个结果 。          |
|     **IntPredicate**     |        接受一个 int 输入参数，返回一个布尔值的结果。         |
|     **IntSupplier**      |               无参数，返回一个 int 类型结果。                |
| **IntToDoubleFunction**  |      接受一个 int 类型输入，返回一个 double 类型结果 。      |
|  **IntToLongFunction**   |       接受一个 int 类型输入，返回一个 long 类型结果。        |
|   **IntUnaryOperator**   |       接受一个参数同为类型 int, 返回值类型也为 int 。        |
|  **LongBinaryOperator**  |       接受两个参数同为类型 long, 返回值类型也为 long。       |
|     **LongConsumer**     |           接受一个 long 类型的输入参数，无返回值。           |
|     **LongFunction**     |          接受一个 long 类型输入参数，返回一个结果。          |
|    **LongPredicate**     |       接受一个 long 输入参数，返回一个布尔值类型结果。       |
|     **LongSupplier**     |             无参数，返回一个结果 long 类型的值。             |
| **LongToDoubleFunction** |      接受一个 long 类型输入，返回一个 double 类型结果。      |
|  **LongToIntFunction**   |       接受一个 long 类型输入，返回一个 int 类型结果。        |
|  **LongUnaryOperator**   |       接受一个参数同为类型 long, 返回值类型也为 long。       |
|  **ObjDoubleConsumer**   | 接受一个 object 类型和一个 double 类型的输入参数，无返回值。 |
|    **ObjIntConsumer**    |  接受一个 object 类型和一个 int 类型的输入参数，无返回值。   |
|   **ObjLongConsumer**    |  接受一个 object 类型和一个 long 类型的输入参数，无返回值。  |
|      **Predicate**       |            接受一个输入参数，返回一个布尔值结果。            |
|       **Supplier**       |                    无参数，返回一个结果。                    |
|  **ToDoubleBiFunction**  |          接受两个输入参数，返回一个 double 类型结果          |
|   **ToDoubleFunction**   |          接受一个输入参数，返回一个 double 类型结果          |
|   **ToIntBiFunction**    |          接受两个输入参数，返回一个 int 类型结果。           |
|    **ToIntFunction**     |          接受一个输入参数，返回一个 int 类型结果。           |
|   **ToLongBiFunction**   |          接受两个输入参数，返回一个 long 类型结果。          |
|    **ToLongFunction**    |          接受一个输入参数，返回一个 long 类型结果。          |
|    **UnaryOperator**     |           接受一个参数为类型 T, 返回值类型也为 T。           |

# Function

**Function** 接口位于包 `java.util.function` 下。 `Function` 接口中定义了一个 `R apply(T t)` 方法，它可以接受一个泛型 T 对象，返回一个泛型 R 对象，即参数类型和返回类型可以不同。

Java 8 源码

```java
@FunctionalInterface
public interface Function<T, R> {

    R apply(T t);

    default <V> Function<V, R> compose(Function<? super V, ? extends T> before) {
        Objects.requireNonNull(before);
        return (V v) -> apply(before.apply(v));
    }

    default <V> Function<T, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (T t) -> after.apply(apply(t));
    }

    static <T> Function<T, T> identity() {
        return t -> t;
    }
}
```

## apply()方法

**<font color = "green">示例：</font>** 输入一个字符串 `<T> String`， 返回字符串的大写形式 `<R> String`。

```java
@Test
void functionTestApply() {
    Function<String, String> toUpperCase = str -> str.toUpperCase();
    String result = toUpperCase.apply("www.hglll.top");
    FunctionTest.log.info(result);
}
```

## andThen()方法

**<font color = "green">示例：</font>** 输入一个字符串，获取字符串的长度，然后乘上 2。

```java
@Test
void functionTestAndThen() {
    Function<String, Integer> len = str -> str.length();
    Function<Integer, Integer> doubleLen = num -> num * 2;
    FunctionTest.log.info(len.andThen(doubleLen).apply("hglll.com").toString());
}
```

# Supplier

`Supplier` 无参数，返回值类型为泛型 T。`Supplier` 使用场景比较单一。`Supplier` 由于没有参数输入，所以多用于对象创建，类似于一个**对象创建工厂**。可以使用 `Lambda` 方式创建任意对象，也可以使用**对象构造方法**的方法引用创对象

Java 8 源码

```java
package java.util.function;

@FunctionalInterface
public interface Supplier<T> {

    T get();
}
```

**<font color = "green">示例：</font>** 

```java
@Test
void supplierTestGet() {
    User user = this.userFactory(() -> new User());
    SupplierTest.log.info(user.toString());
}

@NotNull
private User userFactory(@NotNull Supplier<? extends User> supplier) {
    User user = supplier.get();
    user.setAge(12);
    user.setName("张三");
    return user;
}

@Data
static final class User {
    private String name;
    private Integer age;
}
```

# BiFunction

`BiFunction` 和 `Function` 函数接口十分相似，它可以接受两个不同类型的参数（泛型 T 类型和 泛型 U 类型），然后返回一个其他类型的值（泛型 R 类型）。

Java 8源码

```java
package java.util.function;

import java.util.Objects;

@FunctionalInterface
public interface BiFunction<T, U, R> {

    R apply(T t, U u);

    default <V> BiFunction<T, U, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (T t, U u) -> after.apply(apply(t, u));
    }
}
```

**<font color = "green">示例：</font>** 接收两个字符串，返回字符串的长度和

```java
@Test
void biFunctionTest_1() {
    BiFunction<String, String, Integer> lengthFun = (s1, s2) -> s1.length() + s2.length();
    Integer length = lengthFun.apply("BiFunction", "test");
    log.info("字符串长度：{}", length);
}
```

输出结果

![image-20230509222157628](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675791-202305092222713.png)

## BiFunction 和 Function

`BiFunction` 中的 `andThen` 方法可以接收一个 `Function` 参数，使用 `andThen` 时的运算逻辑，是把 `BiFunction` 的结果传入 `Function` 运算。

**<font color = "green">示例 1：</font>** 使用 `BiFunction` ，输入两个字符串，返回两个字符串的长度和；长度和输入到 `Function`，拼接上字符串 ” 长度和：“ 返回，然后输出这个结果。

```java
@Test
void biFunctionTest_2() {
    // 两个字符串长度和
    BiFunction<String, String, Integer> lengthBiFun = (s1, s2) -> s1.length() + s2.length();
    Function<Integer, String> function = s -> "字符串长度:" + s;
    String result = lengthBiFun.andThen(function).apply("BiFunction", "Function");
    log.info(result);
}
```

输出结果

![image-20230509222807151](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675797-202305092228982.png)

**<font color = "green">示例 2：</font>** 

```java
@Test
void biFunctionTest_3() {
    String result = Study1ApplicationTests.convert("BiFunction",
                                                   "Function",
                                                   (s1, s2) -> s1.length() + s2.length(),
                                                   r1 -> "字符串长度:" + r1);
    log.info(result);
}

public static <T1, T2, R1, R2> R2 convert(T1 t1,
                                          T2 t2,
                                          BiFunction<T1, T2, R1> biFunction,
                                          Function<R1, R2> function) {
    return biFunction.andThen(function).apply(t1, t2);
}
```

## 工厂模式

要创建的对象类

```java
@Data
@AllArgsConstructor
static final class User {
    private String name;
    private Integer age;
}
```

对象创建工厂

```java
public static <R extends User> User userFactory(String name,
                                                Integer age,
                                                BiFunction<String, Integer, R> biFunction) {
    return biFunction.apply(name, age);
}
```

**<font color = "green">示例：</font>** 

```java
@Test
void biFunctionTest_4() {
    User user1 = BiFunctionTest.userFactory("张三", 13, User::new);
    User user2 = BiFunctionTest.userFactory("李四", 18, User::new);
    BiFunctionTest.log.info(user1.toString());
    BiFunctionTest.log.info(user2.toString());
}
```

输出结果

|   BiFunctionTest.User(name=张三, age=13)   |
| :----------------------------------------: |
| **BiFunctionTest.User(name=李四, age=18)** |

>   `User::new` 输入两个参数，要有对应的构造函数 `public User(String name, Integer age)` 与之对应。

## 扩展

**<font color = "green">示例：</font>** 构建一个可以过滤指定集合条件的 `filter` 方法

```java
@Test
void biFunctionTest_5() {
    List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
    // 筛选 2 的倍数
    List<Integer> result1 = filter(list, 2, this::divisible);
    BiFunctionTest.log.info(result1.toString());
    // 筛选 3 的倍数
    List<Integer> result2 = filter(list, 3, this::divisible);
    BiFunctionTest.log.info(result2.toString());
    // 筛选 4 的倍数
    List<Integer> result3 = filter(list, 4, this::divisible);
    BiFunctionTest.log.info(result3.toString());
    // 筛选长度为 4 的字符串
    List<String> stringList = Arrays.asList("java", "node", "c++", "rust");
    List<String> stringList1 = filter(stringList, 4, (s, n) -> s.length() == 4 ? true : null);
    BiFunctionTest.log.info(stringList1.toString());
}

/**
 * n1 / n2 是否可以除尽
 */
private Boolean divisible(Integer n1, Integer n2) {
    if (n1 % n2 == 0) {
        return true;
    }
    return null;
}

/**
 * 过滤集合 List 中，符合 BiFunction<T, U, R> biFunction 的元素
 */
private <T, U, R> List<T> filter(List<T> list,
                                 U u,
                                 BiFunction<T, U, R> biFunction) {
    List<T> resultList = new ArrayList<>();
    for (T t : list) {
        if (biFunction.apply(t, u) != null) {
            resultList.add(t);
        }
    }
    return resultList;
}
```

输出结果

![image-20230509230232779](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675808-202305092302358.png)

# BiPredicate

`BiPredicate` 和 `Predicate` 函数接口一样，都是返回一个布尔类型，唯一不同的是 `Predicate` 接受一个参数，而 `BiPredicate` 可以接受两个不同类型的参数。

Java 8 中源码

```java
package java.util.function;

import java.util.Objects;
@FunctionalInterface
public interface BiPredicate<T, U> {
    boolean test(T t, U u);

    default BiPredicate<T, U> and(BiPredicate<? super T, ? super U> other) {
        Objects.requireNonNull(other);
        return (T t, U u) -> test(t, u) && other.test(t, u);
    }

    default BiPredicate<T, U> negate() {
        return (T t, U u) -> !test(t, u);
    }

    default BiPredicate<T, U> or(BiPredicate<? super T, ? super U> other) {
        Objects.requireNonNull(other);
        return (T t, U u) -> test(t, u) || other.test(t, u);
    }
}
```

## test()方法

**<font color = "green">示例：</font>** 判断字符串长度是否是指定长度

```java
@Test
void biPredicateTest_test() {
    // 判断字符串的长度是否是指定长度
    BiPredicate<String, Integer> biFunction = (s, i) -> s.length() == i;
    System.out.println(biFunction.test("Java", 3));
    System.out.println(biFunction.test("Java", 4));
    System.out.println(biFunction.test("www.baidu.com", 10));
    System.out.println(biFunction.test("www.hglll.top", 14));
}
```

输出结果：**false	true	false	false**

## and()方法

**<font color = "green">示例：</font>** 判断字符串是否以指定字符开头且以指定字符结束

```java
@Test
void biPredicateTest_and() {
    BiPredicate<String, String> startPredicate = (s1, s2) -> s1.startsWith(s2);
    BiPredicate<String, String> endPredicate = (s1, s2) -> s1.endsWith(s2);
    boolean test = startPredicate.and(endPredicate).test("hglll", "w");
    System.out.println(test);
    boolean test1 = startPredicate.and(endPredicate).test("wsw", "w");
    System.out.println(test1);
}
```

输出结果：**false	true**

## BiPredicate 作为参数

**<font color = "green">示例：</font>**  使用 `BiPredicate` 作为参数，实现对 List 集合的过滤操作

```java
@Data
@AllArgsConstructor
static final class User {
    private String name;
    private Integer age;
}
@Test
void biPredicateTest() {
    List<User> list = new ArrayList<>();
    list.add(new User("张三", 23));
    list.add(new User("李四", 27));
    list.add(new User("赵六", 17));
    list.add(new User("五六七", 45));
    BiPredicate<String, Integer> age = (n, a) -> a == 2;
    BiPredicate<String, Integer> name = (n, a) -> "李四".equals(n);
    BiPredicate<String, Integer> ageAndName = (n, a) -> "五六七".equals(n) || a == 2;
    System.out.println(BiPredicateTest.filter(list, age));
    System.out.println(BiPredicateTest.filter(list, name));
    System.out.println(BiPredicateTest.filter(list, ageAndName));
}
public static <T extends User> List<T> filter(List<T> list, BiPredicate<String, Integer> biPredicate) {
    return list.stream()
            .filter(user -> biPredicate.test(user.getName(), user.getAge()))
            .collect(Collectors.toList());
}
```

输出结果

![image-20230509232542272](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675817-202305092325982.png)

# UnaryOperator

`UnaryOperator` 函数接口是 `Function` 函数接口的扩展，它可以传入一个泛型 T 参数，返回一个泛型 T 结果。

Java 8 源码

```java
package java.util.function;

@FunctionalInterface
public interface UnaryOperator<T> extends Function<T, T> {

    static <T> UnaryOperator<T> identity() {
        return t -> t;
    }
}
```

## apply()方法

**<font color = "green">示例：</font>**  分别使用 `UnaryOperator` 和 `Function` 把字符串转换为大写形式。

```java
@Test
void unaryOperatorTestApply() {
    Function<String, String> upperFun1 = s -> s.toUpperCase();
    UnaryOperator<String> upperFun2 = s -> s.toUpperCase();

    String res1 = upperFun1.apply("hglll.top");
    String res2 = upperFun2.apply("hglll.top");

    UnaryOperatorTest.log.info(res1);
    UnaryOperatorTest.log.info(res2);
}
```

输出结果：HGLLL.TOP	HGLLL.TOP

## identify()方法

不做任何处理，直接返回参数本身，和 `Function.identify()` 效果一样。

**<font color = "green">示例：</font>**  把字符串集合转换成 key 为大写字符串，value 为字符串本身的 Map（使用 identity 方法返回本身）。

```java
@Test
void unaryOperatorTestIdentity() {
    Function<String, String> upperFun1 = s -> s.toUpperCase();
    UnaryOperator<String> upperFun2 = s -> s.toUpperCase();

    List<String> list = Arrays.asList("java", "node", "c++", "rust", "hglll.top");

    Map<String, String> map1 = list.stream()
        .collect(Collectors.toMap(upperFun1::apply, Function.identity()));

    Map<String, String> map2 = list.stream()
        .collect(Collectors.toMap(upperFun2::apply, UnaryOperator.identity()));

    Map<String, String> map3 = list.stream()
        .collect(Collectors.toMap(upperFun2::apply, t -> t));

    UnaryOperatorTest.log.info(map1.toString());
    UnaryOperatorTest.log.info(map2.toString());
    UnaryOperatorTest.log.info(map3.toString());
}
```

## UnaryOperator 作为参数

**<font color = "green">示例 1：</font>**  使用 `UnaryOperator` 作为参数，修改 List 集合中每个元素。

```java
@Test
void unaryOperatorTestParam() {
    List<String> list = Arrays.asList("java", "node", "c++", "rust", "hglll.top");
    UnaryOperator<String> upperFun = s -> s.toUpperCase();
    List<String> resultList = this.map(list, upperFun);
    UnaryOperatorTest.log.info(resultList.toString());

    List<Integer> intList = Arrays.asList(1, 2, 3, 4, 5);
    UnaryOperator<Integer> doubleInt = i -> i * 2;
    List<Integer> integers = map(intList, doubleInt);
    UnaryOperatorTest.log.info(integers.toString());
}

private <T> List<T> map(List<T> list, UnaryOperator<T> unaryOperator) {
    List<T> resultList = new ArrayList<>();
    for (T t : list) {
        resultList.add(unaryOperator.apply(t));
    }
    return resultList;
}
```

**<font color = "green">示例 2：</font>**  使用 `UnaryOperator` 作为参数，修改 List 集合中每个元素，先转大写，再截取前三位。

```java
@Test
void unaryOperatorTestMultiParam() {
    List<String> list = Arrays.asList("java", "node", "c++", "rust", "hglll.top");
    // 转大写
    UnaryOperator<String> upperFun = s -> s.toUpperCase();
    // 截取 3 位
    UnaryOperator<String> subFun = s -> s.substring(0, 3);
    List<String> resultList = this.map(list, upperFun, subFun);
    UnaryOperatorTest.log.info(resultList.toString());
}

private <T> List<T> map(List<T> list, UnaryOperator<T>... unaryOperator) {
    List<T> resultList = new ArrayList<>();
    for (T t : list) {
        for (UnaryOperator<T> operator : unaryOperator) {
            t = operator.apply(t);
        }
        resultList.add(t);
    }
    return resultList;
}
```

