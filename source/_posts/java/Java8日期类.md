---
title: java 8 LocalDate、LocalDateTime 时间处理
date: 2023-05-12 23:35:25
updated: 2023-05-12 23:35:25
tags:
  - java
---


Jdk8 带来了全新的时间处理工具类，用于代替之前存在缺陷的时间处理。新的时间处理相比之前更加简单好用。

常用的类

|    时间相关类     |            介绍            |
| :---------------: | :------------------------: |
|   LocalDateTime   | 时间处理类，最高精确到纳秒 |
|     LocalDate     |  时间处理类，最高精确到天  |
| DateTimeFormatter |         时间格式化         |
|      ZoneId       |         时区设置类         |

## 时间获取

使用不同的类可以获取不同精度的时间。

```java
@Test
void getDate() {
    // 当前精确时间
    LocalDateTime now = LocalDateTime.now();
    NewDateClassTest.log.info("当前精确时间：" + now);
    NewDateClassTest.log.info("当前精确时间：" + now.getYear() + "-" + now.getMonthValue() + "-" + now.getDayOfMonth() + " " + now.getHour() + "-" + now.getMinute() + "-" + now.getSecond());

    // 获取当前日期
    LocalDate localDate = LocalDate.now();
    NewDateClassTest.log.info("当前日期：" + localDate);
    NewDateClassTest.log.info("当前日期：" + localDate.getYear() + "-" + localDate.getMonthValue() + "-" + localDate.getDayOfMonth());

    // 获取当天时间
    LocalTime localTime = LocalTime.now();
    NewDateClassTest.log.info("当天时间：" + localTime);
    NewDateClassTest.log.info("当天时间：" + localTime.getHour() + ":" + localTime.getMinute() + ":" + localTime.getSecond());

    // 有时区的当前精确时间
    ZonedDateTime nowZone = LocalDateTime.now().atZone(ZoneId.systemDefault());
    NewDateClassTest.log.info("当前精确时间（有时区）：" + nowZone);
    NewDateClassTest.log.info("当前精确时间（有时区）：" + nowZone.getYear() + "-" + nowZone.getMonthValue() + "-" + nowZone.getDayOfMonth() + " " + nowZone.getHour() + "-" + nowZone.getMinute() + "-" + nowZone.getSecond());
}
```

结果输出

![image-20230512235256306](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675829-202305122352745.png)

## 时间创建

可以指定年月日时分秒创建一个时间类，也可以使用字符串直接转换成时间。

```java
@Test
void createTime() {
    LocalDateTime ofTime = LocalDateTime.of(2019, 10, 1, 8, 8, 8);
    NewDateClassTest.log.info("当前精确时间：" + ofTime);

    LocalDate localDate = LocalDate.of(2019, 10, 01);
    NewDateClassTest.log.info("当前日期：" + localDate);

    LocalTime localTime = LocalTime.of(12, 01, 01);
    NewDateClassTest.log.info("当天时间：" + localTime);
}
```

结果输出

>   当前精确时间：2019-10-01T08:08:08
>   当前日期：2019-10-01
>   当天时间：12:01:01

## 时间转换

```java
@Test
public void convertTimeTest() {
    LocalDateTime parseTime = LocalDateTime.parse("2019-10-01T22:22:22.222");
    NewDateClassTest.log.info("字符串时间转换：" + parseTime);

    LocalDate formatted = LocalDate.parse("20190101", DateTimeFormatter.BASIC_ISO_DATE);
    NewDateClassTest.log.info("字符串时间转换-指定格式：" + formatted);

    // Date 转换成 LocalDateTime
    Date date = new Date();
    ZoneId zoneId = ZoneId.systemDefault();
    NewDateClassTest.log.info("Date 转换成 LocalDateTime：" + LocalDateTime.ofInstant(date.toInstant(), zoneId));

    // LocalDateTime 转换成 Date
    LocalDateTime localDateTime = LocalDateTime.now();
    Date toDate = Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    NewDateClassTest.log.info("LocalDateTime 转换成 Date：" + toDate);

    // 当前时间转时间戳
    long epochMilli = LocalDateTime.now().toInstant(ZoneOffset.of("+8")).toEpochMilli();
    NewDateClassTest.log.info("当前时间转时间戳：" + epochMilli);
    // 时间戳转换成时间
    LocalDateTime epochMilliTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMilli), ZoneId.systemDefault());
    NewDateClassTest.log.info("时间戳转换成时间：" + epochMilliTime);
}
```

结果输出

![image-20230513000043141](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675834-202305130000646.png)

## 时间格式化

```java
@Test
public void formatTest() {
    LocalDateTime now = LocalDateTime.now();
    NewDateClassTest.log.info("当前时间：" + now);
    NewDateClassTest.log.info("格式化后：" + now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
    NewDateClassTest.log.info("格式化后：" + now.format(DateTimeFormatter.ISO_LOCAL_DATE));
    NewDateClassTest.log.info("格式化后：" + now.format(DateTimeFormatter.ISO_LOCAL_TIME));
    NewDateClassTest.log.info("格式化后：" + now.format(DateTimeFormatter.ofPattern("YYYY-MM-dd hh:mm:ss")));
}
```

输出结果

![image-20230513000403505](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675839-202305130004601.png)

## 时间比较

```java
@Test
public void diffTest() {
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime yestory = now.minusDays(1);
    NewDateClassTest.log.info(now + "在" + yestory + "之后吗?" + now.isAfter(yestory));
    NewDateClassTest.log.info(now + "在" + yestory + "之前吗?" + now.isBefore(yestory));

    // 时间差
    long day = yestory.until(now, ChronoUnit.DAYS);
    long month = yestory.until(now, ChronoUnit.MONTHS);
    long hours = yestory.until(now, ChronoUnit.HOURS);
    long minutes = yestory.until(now, ChronoUnit.MINUTES);
    NewDateClassTest.log.info("相差月份" + month);
    NewDateClassTest.log.info("相差天数" + day);
    NewDateClassTest.log.info("相差小时" + hours);
    NewDateClassTest.log.info("相差分钟" + minutes);

    // 距离2024年还有多少天？
    LocalDate year2024 = LocalDate.of(2023, 12, 30);
    LocalDate nowDate = LocalDate.now();
    NewDateClassTest.log.info("距离2024年还有：" + nowDate.until(year2024, ChronoUnit.DAYS) + "天");
}
```

输出结果

>   相差月份0
>   相差天数1
>   相差小时24
>   相差分钟1440
>   距离2024年还有：231天

## 时间加减

```java
@Test
void calcTest() {
    LocalDateTime now = LocalDateTime.now();
    NewDateClassTest.log.info("当前时间：" + now);
    LocalDateTime plusTime = now.plusMonths(1).plusDays(1).plusHours(1).plusMinutes(1).plusSeconds(1);
    NewDateClassTest.log.info("增加1月1天1小时1分钟1秒时间后：" + plusTime);
    LocalDateTime minusTime = now.minusMonths(2);
    NewDateClassTest.log.info("减少2个月时间后：" + minusTime);
}
```

输出结果

>   当前时间：2023-05-13T00:10:10.801248200
>   增加1月1天1小时1分钟1秒时间后：2023-06-14T01:11:11.801248200
>   减少2个月时间后：2023-03-13T00:10:10.801248200

## 扩展

```java
@Test
void extendTest() {
    // LocalDateTime 本月第一天
    // 当前精确时间
    LocalDateTime now = LocalDateTime.now();
    // LocalDateTime 本月第一天
    // 方法1
    LocalDateTime firstDay = now.withDayOfMonth(1);
    NewDateClassTest.log.info("本月第一天：" + firstDay);
    // 方法2
    firstDay = now.with(TemporalAdjusters.firstDayOfMonth());
    NewDateClassTest.log.info("本月第一天：" + firstDay);

    // 当前精确时间
    LocalDateTime now1 = LocalDateTime.now();
    // LocalDateTime 本月最后一天
    LocalDateTime lastDay = now1.with(TemporalAdjusters.lastDayOfMonth());
    NewDateClassTest.log.info("本月最后一天:" + lastDay);

    // 当前精确时间
    LocalDateTime now2 = LocalDateTime.now();
    // LocalDateTime 当天最后一秒
    // 方法1
    LocalDateTime lastSecondOfDay1 = now2.withHour(23).withMinute(59).withSecond(59);
    NewDateClassTest.log.info("当天最后一秒：" + lastSecondOfDay1);
    // 方法2
    LocalDateTime lastSecondOfDay2 = LocalDateTime.now().with(LocalTime.MAX);
    NewDateClassTest.log.info("当天最后一秒：" + lastSecondOfDay2);


    // 当前精确时间
    LocalDateTime now3 = LocalDateTime.now();
    // 是否闰年
    NewDateClassTest.log.info("今年是否闰年：" + Year.isLeap(now3.getYear()));

}
```

输出结果

>   本月第一天：2023-05-01T00:14:49.124017200
>   本月第一天：2023-05-01T00:14:49.124017200
>   本月最后一天:2023-05-31T00:14:49.126574200
>   当天最后一秒：2023-05-13T23:59:59.126574200
>   当天最后一秒：2023-05-13T23:59:59.999999999
>   今年是否闰年：false

