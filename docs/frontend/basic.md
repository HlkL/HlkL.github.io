# html

**HTML**（超文本标记语言——HyperText Markup Language）是构成 Web 世界的一砖一瓦。它定义了网页内容的含义和结构。除 HTML 以外的其他技术则通常用来描述一个网页的表现与展示效果（如 [CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS)），或功能与行为（如 [JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)）。











# css

**层叠样式表**（Cascading Style Sheets，缩写为 **CSS**）是一种[样式表](https://developer.mozilla.org/zh-CN/docs/Web/API/StyleSheet)语言，用来描述 [HTML](https://developer.mozilla.org/zh-CN/docs/Web/HTML) 或 [XML](https://developer.mozilla.org/zh-CN/docs/Web/XML/XML_introduction)（包括如 [SVG](https://developer.mozilla.org/zh-CN/docs/Web/SVG)、[MathML](https://developer.mozilla.org/zh-CN/docs/Web/MathML) 或 [XHTML](https://developer.mozilla.org/zh-CN/docs/Glossary/XHTML) 之类的 XML 分支语言）文档的呈现方式。CSS 描述了在屏幕、纸质、音频等其他媒体上的元素应该如何被渲染的问题。





## 选择器

1. **标签，类选择器**

::: code-group

```html
<div class="red">red</div>
<div class="orange">orange</div>
```

```css
/* 标签选择器 */
div {
    font-size: 30px;
}

/* 类选择器 */
.red {
    width: 100px;
    height: 100px;
    background-color: red;
}
.orange {
    width: 200px;
    height: 200px;
    background-color: orange;
}
```

:::

**代码效果：**

<style>
.red {
    width: 100px;
    height: 100px;
    background-color: red;
}
.orange {
    width: 200px;
    height: 200px;
    background-color: orange;
}
</style>

<div class="red">red</div>
<div class="orange">orange</div>



2. 通配符，id选择器

::: code-group

```html
<div id="text">id选择器</div>
<div>通配符选择器</div>
```

```css
* {
    font-size: 20px;
}

#text {
    color: red;
}
```

:::

**代码效果：**

<font size=20px>id选择器<br></font>

<font size=20px color=red>通配符选择器</font>

3. **复合选择器**

::: code-group

```html
<div>
    <span>
        后代选择器--孩子
    </span>
    <div>
        <span>后代选择器--孙子</span>
    </div>
</div>

<div>
    <p>
        子代选择器
    </p>
</div>

<div class="class">
    div标签1
</div>
<div>
    div标签2
</div>
<p class="class">p标签</p>

<span class="class">
    伪类选择器测试
</span>
```

```css
/* 后代选择器 */
div span {
    background-color: skyblue;
}

/* 子代选择器 */
div>p {
    color: red;
}

/* 交集选择器 */
div.class {
    width: 100px;
    height: 100px;
    background-color: skyblue;
}

/* 伪类选择器 */
span.class:hover {
    font-size: 30px;
    color: red;
}
/* 结构伪类选择器 */
li:last-child {
    background: #ff0;
}

li:nth-child(3) {
    background: #0f0;
}

/* 伪元素选择器 */
li::before {
    background: pink;
    counter: "asdas"
}
```

:::

**代码效果：**

<div>
    <span style="background-color: skyblue;">
        后代选择器--孩子
    </span>
    <div>
        <span style="background-color: skyblue;">后代选择器--孙子</span>
    </div>
</div>

<div>
    <p style="color: red;">
        子代选择器
    </p>
</div>

<div style="width: 100px; height: 100px; background-color: blue;">
    div标签1
</div>
<div>
    div标签2
</div>
<p>p标签</p>

<span style="font-size: 16px;" class="class" onmouseover="this.style.fontSize='30px'; this.style.color='red';" onmouseout="this.style.fontSize='16px'; this.style.color='black';">
    伪类选择器测试
</span>



::: tip 选中标签的范围越大，优先级越低。

:::

## 字体修饰属性

::: code-group

```html
<p class="font1">测试字体一</p>
<div class="font2">测试字体二</div>
<h1>标题一</h1>

<div class="img">
    <img src="https://i2.hdslb.com/bfs/archive/8f320867ca3628b0d87e485c6d95193ac7ee5c21.jpg@336w_190h_1c_!web-video-rcmd-cover.avif">
</div>

<a href="#">超链接去除下划线</a>
```

```css{12}
.font1 {
    /* 字体大小必须得有单位，不然不生效，浏览器默认字体大小为16px */
    font-size: 20px;
    /* 字体粗细 */
    font-weight: 700;
    /* 斜体 */
    font-style: normal;
    /* 行高 */
    line-height: 20px;

    /* 简写 是否倾斜，是否加粗，字号(必须)/行高 字体(必须) */
    /* font: italic 100 20px/100px 楷体; */
    /* 文本缩进 */
    text-indent: 3em;
}

.font2 {
    height: 100px;
    background-color: skyblue;
    line-height: 100px;
}

h1 {
    /* 文本对齐 */
    text-align: center;
}

.img {
    text-align: center;
}

a {
    text-decoration: none;
}
```

:::

::: details **代码效果**

<p style="font-size: 20px; font-weight: 700; font-style: normal; line-height: 20px; text-indent: 3em;">测试字体一</p>

<div style="height: 100px; background-color: skyblue; line-height: 100px;">
        测试字体二
    </div>

<h1 style="text-align: center;">标题一</h1>

<div style="text-align: center;"><img src="https://scpic3.chinaz.net/files/default/imgs/2023-10-10/9a81121313435261_s.jpg"></div>

​    <a href="#" style="text-decoration: none;">超链接去除下划线</a>

:::



## 背景属性

| 描述           |         属性          |               属性值                |
| :------------- | :-------------------: | :---------------------------------: |
| 背景色         |   background-color    |                                     |
| 背景图         |   background-image    |                url()                |
| 背景图平铺方式 |   background-repeat   | no-repeat,repeat, repeat-x,repeat-y |
| 背景图位置     |  background-position  |    top,bottom,left,right,center     |
| 背景图缩放     |    background-size    |            contain,cover            |
| 背景图固定     | background-attachment |                fixed                |
| 背景复合属性   |      background       |   各个属性按空格隔开，不区分顺序    |

::: code-group

```html
<div>
    div标签
</div>
```

```css
div{
    width: 370px;
    height: 370px;

    background-color: pink;
    background-image: url(https://scpic3.chinaz.net/files/default/imgs/2023-10-10/9a81121313435261_s.jpg);
    /* background-repeat: no-repeat; */
    background-repeat: no-repeat;

    /* 默认位置 */
    background-position: left top;
  	background-position: 50px;
    background-position: center;

    /* 图片和盒子的宽高一样停止缩放 */
    background-size: contain;
    /* 图片完全覆盖盒子 */
    background-size: cover;
    /* 图片与盒子宽比 */
    background-size: 110%;
    /* 固定背景图 */
    background-attachment: fixed;
}
```

:::



::: tip **关键字设置背景图片位置，可以颠倒顺序。只写一个关键字，另外一个为居中。数字只写一个值表示水平方向，垂直方向为居中。**

:::

**代码效果：**

<div style="width: 370px; height: 370px; background-color: pink; background-image: url('https://scpic3.chinaz.net/files/default/imgs/2023-10-10/9a81121313435261_s.jpg'); background-repeat: no-repeat; background-position: center;">div标签 </div>



<div style="background-image: url('https://scpic3.chinaz.net/files/default/imgs/2023-10-10/9a81121313435261_s.jpg'); background-attachment: fixed;"><p>背景图固定测试文字</p> </div>



## 显示模式

1. **块级元素**

::: code-group

```html
<div class="red">块级元素div标签</div>
<div class="orange">块级元素div标签</div>
```

```css
div,
img {
    width: 100px;
    height: 100px;
}

.red {
    background-color: red;
}

.orange {
    background-color: orange;
}
```

::: tip 块级独占一行，宽度默认为父级宽度100%，加宽高生效

:::



2. **行内元素**

::: code-group

```html
<span class="pink">行内元素</span>
<span class="skyblue">span标签</span>
```

```css
.skyblue {
    background-color: skyblue;
}

.pink {
    background-color: pink;
}
```

::: tip 行内元素一行共存多个，加宽高不生效

:::



3. **行内块元素**

::: code-group

```html
<img src="https://scpic3.chinaz.net/files/default/imgs/2023-10-10/9a81121313435261_s.jpg">
<img src="https://scpic3.chinaz.net/files/default/imgs/2023-10-10/9a81121313435261_s.jpg">
```

```css
img {
    width: 100px;
    height: 100px;
}
```

::: tip 行内块元素一行共存多个，宽高由内容决定，加宽高生效

:::



::: details **代码效果**

<div>
    <div style="width: 100px; height: 100px; background-color: red;">块级元素div标签</div>
    <div style="width: 100px; height: 100px; background-color: orange;">块级元素div标签</div>
    <span style="background-color: pink;">行内元素</span>
    <span style="background-color: skyblue;">span标签</span>
    <img src="https://scpic3.chinaz.net/files/default/imgs/2023-10-10/9a81121313435261_s.jpg" style="width: 100px; height: 100px;">
    <img src="https://scpic3.chinaz.net/files/default/imgs/2023-10-10/9a81121313435261_s.jpg" style="width: 100px; height: 100px;">
</div>

:::



4. **转化显示模式**

> 属性名： ***display***

|    属性值    |  效果  |
| :----------: | :----: |
|    block     |  块级  |
| inline-block | 行内块 |
|    inline    |  行内  |



## 盒子模型

```css
div {
    width: 200px;
    height: 200px;
    background: pink;

    /* 内边框 */
    padding: 20px;

    /* 边框线 */
    border: 1px dashed #000;
    border-top: 2px solid #000;
    border-bottom: 2px dotted #0f0;
    border-left: 2px dashed #fff;
    border-right: 2px solid orange;

    /* 外边框 */
    margin: 20px;
    margin: 0 auto;

    /* 盒子尺寸，内减模式，浏览器自动计算 */
    box-sizing: border-box;

      /* 圆角设置 */
    border-radius: 20px;
}
```

::: tip **盒子的内边框属性可以通过最多四个简化参数由上到左顺时针设置，缺少的属性与它的对立面一致。padding和border会撑着盒子。两个垂直相邻盒子会合并在一起，如果配置了外边距，则会取两个盒子外边距的最大值。行内元素无法改变垂直边距，只能通过行高设置。**

:::



**代码效果：**

<div style="width: 200px; height: 200px; background: pink; padding: 20px; border-top: 2px solid #000; border-bottom: 2px dotted #0f0; border-left: 2px dashed #fff; border-right: 2px solid orange; margin: 0 auto; box-sizing: border-box; border-radius: 20px;"></div>

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1727629910-image-20240930011150554.png" alt="image-20240930011150554" style="zoom:50%;" />

```css
.button {
    width: 100px;
    height: 40px;
    margin: 0 auto;
    background-color: skyblue;
    border-radius: 10px;

    box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.5);
}
```

**代码效果**

<div style="width: 100px; height: 40px; margin: 0 auto; background-color: skyblue; border-radius: 10px; box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.5);"></div>

## 浮动

::: code-group

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

li {
    list-style: none;
}

.product {
    width: 550px;
    height: 300px;
    margin: 40px auto;

    background-color: pink;
}

.left {
    width: 110px;
    height: 300px;
    float: left;


    background-color: skyblue;
}

.right {
    width: 435px;
    height: 300px;
    float: right;
}

.right li {
    width: 100px;
    height: 145px;
    float: left;
    margin: 0 5px;
    margin-bottom: 10px;

    background-color: orange;
}

.right li:nth-child(4n) {
    margin-right: 0px;
}

```

```html
<div class="product">
    <div class="left"></div>
    <div class="right">
        <ul>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ul>
    </div>
</div>
```

:::

**代码效果：**

<div style="width: 550px; height: 300px; margin: 40px auto; background-color: pink;">
  <div style="width: 110px; height: 300px; float: left; background-color: skyblue;"></div>
  <div style="width: 435px; height: 300px; float: right;">
      <ul style="margin: 0; padding: 0; box-sizing: border-box;">
          <li style="width: 100px; height: 145px; float: left; margin: 0 5px 10px 5px; background-color: orange; list-style: none;"></li>
          <li style="width: 100px; height: 145px; float: left; margin: 0 5px 10px 5px; background-color: orange; list-style: none;"></li>
          <li style="width: 100px; height: 145px; float: left; margin: 0 5px 10px 5px; background-color: orange; list-style: none;"></li>
          <li style="width: 100px; height: 145px; float: left; margin: 0 0 10px 5px; background-color: orange; list-style: none;"></li>
          <li style="width: 100px; height: 145px; float: left; margin: 0 5px 10px 5px; background-color: orange; list-style: none;"></li>
          <li style="width: 100px; height: 145px; float: left; margin: 0 5px 10px 5px; background-color: orange; list-style: none;"></li>
          <li style="width: 100px; height: 145px; float: left; margin: 0 5px 10px 5px; background-color: orange; list-style: none;"></li>
          <li style="width: 100px; height: 145px; float: left; margin: 0 0 10px 5px; background-color: orange; list-style: none;"></li>
      </ul>
  </div>
</div>



**清除浮动**

1. 额外标签法:在父元素内容的最后添加一个块级元素，设置CSS 属性 `clear: both`

2. 单伪元素法

```css
clearfix: :after {
  content: "";
  display: block;
  clear: both;
}
```

3. 双伪元素法

```css
clearfix::before,
clearfix::after {
  content: ""
  display: table;
}

clearfix::after {
  clear: both;
}
```

4. 父元素添加 CSS 属性 `overflow: hidden`



## flex

![image-20241001010124588](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1727715684-image-20241001010124588.png)

**主轴与侧轴对齐方式**

```html
<div class="box">
    <div></div>
    <div></div>
    <div></div>
</div>
```

**主轴对齐(默认左对齐)：** `justify-content`

```css{5-9,12-14}
.box {
    height: 120px;
    display: flex;
    	/* 左 */
    justify-content: flex-start;
    	/* 右对齐 */
    justify-content: flex-end;
      /* 居中对齐 */
    justify-content: center;

  
    justify-content: space-between;
    justify-content: space-around;
    justify-content: space-evenly;
    border: 1px solid pink;
}

.box div {
    width: 130px;
    height: 60px;
    background-color: orange;
}
```

`flex-start`

<div style="height: 120px; display: flex; justify-content: flex-start; border: 1px solid pink;">
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
</div>

`flex-end`

<div style="height: 120px; display: flex; justify-content: flex-end; border: 1px solid pink;">
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
</div>

`center`

<div style="height: 120px; display: flex; justify-content: center; border: 1px solid pink;">
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
</div>

`space-between`

<div style="height: 120px; display: flex; justify-content: space-between; border: 1px solid pink;">
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
</div>

`space-around`

<div style="height: 120px; display: flex; justify-content: space-around; border: 1px solid pink;">
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
</div>

`space-evenly`

<div style="height: 120px; display: flex; justify-content: space-evenly; border: 1px solid pink;">
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
    <div style="width: 90px; height: 60px; background-color: orange;"></div>
</div>

 **侧轴对齐:** `align-items`对齐全部元素， `align-self` 对齐选中元素

```css{6-8,13,17}
.box {
    height: 120px;
    display: flex;
    justify-content: center;

    align-items: center;
    align-items: flex-start;
    align-items: flex-end;
    border: 1px solid pink;
}

.box div:nth-child(2) {
    align-self: center;
}

.box div:nth-child(3) {
    align-self: start;
}

.box div {
    width: 130px;
    height: 60px;

    background-color: orange;
}
```

`align-items: center;`

<div style="height: 120px; display: flex; justify-content: center; align-items: center; border: 1px solid pink;">
    <div style="width: 130px; height: 60px; background-color: orange;"></div>
    <div style="width: 130px; height: 60px; background-color: orange;"></div>
    <div style="width: 130px; height: 60px; background-color: orange;"></div>
</div>

`align-items: flex-start`

<div style="height: 120px; display: flex; justify-content: center; align-items: start; border: 1px solid pink;">
    <div style="width: 130px; height: 60px; background-color: orange;"></div>
    <div style="width: 130px; height: 60px; background-color: orange;"></div>
    <div style="width: 130px; height: 60px; background-color: orange;"></div>
</div>

`align-items: flex-end`

<div style="height: 120px; display: flex; justify-content: center; align-items: end; border: 1px solid pink;">
    <div style="width: 130px; height: 60px; background-color: orange;"></div>
    <div style="width: 130px; height: 60px; background-color: orange;"></div>
    <div style="width: 130px; height: 60px; background-color: orange;"></div>
</div>

`align-self`

<div style="height: 120px; display: flex; justify-content: center; align-items: flex-end; border: 1px solid pink;">
    <div style="width: 130px; height: 60px; background-color: orange;"></div>
    <div style="width: 130px; height: 60px; background-color: orange; align-self: center;"></div>
    <div style="width: 130px; height: 60px; background-color: orange; align-self: flex-start;"></div>
</div>



**修改主轴方向：** `flex-direction: column;` 修改主轴方向为水平方向，侧轴方向自动变为垂直方向。

::: code-group

```html
<div class="media">
    <div></div>
    <span>媒体</span>
</div>
```

```css{6}
.media {
    width: 100px;
    height: 100px;
    display: flex;

    flex-direction: column;
    justify-content: center;
    align-items: center;

    border: 1px solid black;
}

.media div {
    width: 30px;
    height: 30px;
    background-color: pink;
}

.media span {
    font-size: 15px;
}
```

:::

**代码效果：**

<div style="width: 100px; height: 100px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid black;">
    <div style="width: 30px; height: 30px; background-color: pink;"></div>
    <span style="font-size: 15px;">媒体</span>
</div>



