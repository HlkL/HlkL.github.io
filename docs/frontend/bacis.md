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

<div style="text-align: center;"><img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1726587654-8f320867ca3628b0d87e485c6d95193ac7ee5c21.jpg%40336w_190h_1c_%21web-video-rcmd-cover-20240917234054775.avif"></div>

​    <a href="#" style="text-decoration: none;">超链接去除下划线</a>

:::



### 背景属性

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



