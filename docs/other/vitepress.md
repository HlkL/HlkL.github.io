[VitePress](https://vitepress.dev/zh/) 使用 Markdown 编写的源内容，生成可以轻松部署在任何地方的静态 HTML 页面。

## 安装依赖

**在目录中打开终端输入初始化指令**

```sh
npm i -D vitepress
```

**初始化向导**

```sh
npx vitepress init
```

::: details 文件位置存放到 `./` 下

```sh
T   Welcome to VitePress!
|
o  Where should VitePress initialize the config?
|  ./
|
o  Site title:
|  My Awesome Project
|
o  Site description:
|  A VitePress Site
|
o  Theme:
|  Default Theme
|
o  Use TypeScript for config and theme files?
|  Yes
|
o  Add VitePress npm scripts to package.json?
|  Yes
|
—  Done! Now run npm run docs:dev and start writing.
```

修改脚本命令 

```json
"scripts": {
  "docs:dev": "vitepress dev",
  "docs:build": "vitepress build",
  "docs:preview": "vitepress preview"
}
```

:::

**git忽略项** 

添加 `.gitignore` 文件，主要用于上传到github时，忽略这些文件不上传

```bash
echo node_modules >> .gitignore

echo cache >> .gitignore

echo dist >> .gitignore
```

**启动**

```sh
npm run docs:dev
```

::: details **<font color=#6DD3E3>修改启动端口</font>** 

```json
"scripts": {
	"docs:preview": "vitepress preview docs --port 8080"
}
```

:::

## 配置

搭建完成后，可以看到一个已经完善的目录,在此基础上进行修改和新增。

::: details  **<font color=#6DD3E3>编辑`config.ts`</font>** 

```json
export default defineConfig({
  title: "title",
  description: "description",
  head: [
    ["link", { rel: "icon", href: "/icon.png" }],
  ],
  lang: 'zh-CN', // 语言
  lastUpdated: true,// 最后更新时间
  cleanUrls: true, //纯净链接,去除在默认情况下Vitepress的链接以 .html 结尾
  markdown: {
    lineNumbers: true, // 代码行数显示
    math: true,//数学公式
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true
    },
  },
  //站点地图
  sitemap: {
    hostname: 'https://www.hougen.fun',
  },
  locales: {//国际化
   root: {
     label: '简体中文',
     lang: 'Zh_CN',
   },
   en: {
     label: 'English',
     lang: 'en',
     link: '/en/',
   },
   fr: {
     label: 'French',
     lang: 'fr',
     link: '/fr/',
   }
  },
  themeConfig: {
    logo: '/icon.png',
    returnToTopLabel: '返回顶部', //返回顶部文字修改
    sidebarMenuLabel: '目录', //侧边栏文字更改(移动端)
    darkModeSwitchLabel: '深浅模式',
    outline: {
      level: [1, 4], // 显示2-4级标题
      label: '当前页大纲' // 文
    },
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path', // 改成自己的仓库
      text: '在GitHub编辑本页'
    },
    //自定义上下页名
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    // 广告
    carbonAds: {
      code: '...',
      placement: '...',
    },
  }
})
```

**导航栏以及自动侧边栏配置**

引入 `./vitepress/utils/AutoSidebar.js` 脚本。

```js
import path from "node:path";
import fs from "node:fs";

// 文件根目录
const DIR_PATH = path.resolve();
// 白名单,过滤不是文章的文件和文件夹
const WHITE_LIST = [
  "index.md",
  ".vitepress",
  "node_modules",
  ".idea",
  "assets",
];

// 判断是否是文件夹
const isDirectory = (path) => fs.lstatSync(path).isDirectory();

// 取差值
const intersections = (arr1, arr2) =>
  Array.from(new Set(arr1.filter((item) => !new Set(arr2).has(item))));

// 把方法导出直接使用
function getList(params, path1, pathname) {
  // 存放结果
  const res = [];
  // 开始遍历params
  for (let file in params) {
    // 拼接目录
    const dir = path.join(path1, params[file]);
    // 判断是否是文件夹
    const isDir = isDirectory(dir);
    if (isDir) {
      // 如果是文件夹,读取之后作为下一次递归参数
      const files = fs.readdirSync(dir);
      res.push({
        text: params[file],
        collapsible: true,
        items: getList(files, dir, `${pathname}/${params[file]}`),
      });
    } else {
      // 获取名字
      const name = path.basename(params[file]);
      // 排除非 md 文件
      const suffix = path.extname(params[file]);
      if (suffix !== ".md") {
        continue;
      }
      res.push({
        text: name,
        link: `${pathname}/${name}`,
      });
    }
  }
  // 对name做一下处理，把后缀删除
  res.map((item) => {
    item.text = item.text.replace(/\.md$/, "");
  });
  return res;
}

export const AutoSidebar = (pathname) => {
  const dirPath = path.join(DIR_PATH, pathname);
  const files = fs.readdirSync(dirPath);
  const items = intersections(files, WHITE_LIST);
  return getList(items, dirPath, pathname);
};
```

在`config.ts` 中导入。

```ts
import { AutoSidebar } from "./utils/AutoSidebar.mjs";    // [!code focus]

nav: [
  {
    text: 'Docs', items: [
      { text: 'Java', link: '/docs/java/' },
      { text: 'Golang', link: '/docs/golang/' },
      { text: '前端', link: '/docs/frontend/' },
      { text: '框架', link: '/docs/framework/' },
      { text: 'DevOps', link: '/docs/devops/' },
      { text: '中间件', link: '/docs/middleware/' },
      { text: 'Juc', link: '/docs/juc/' },
      { text: '其他', link: '/docs/other/' },
    ]
  },
],

sidebar: {
  "/docs/java/": AutoSidebar("/docs/java"),
  "/docs/golang/": AutoSidebar("/docs/golang"),
  "/docs/frontend/": AutoSidebar("/docs/frontend/"),
  "/docs/framework/": AutoSidebar("/docs/framework"),
  "/docs/devops/": AutoSidebar("/docs/devops"),
  "/docs/middleware/": AutoSidebar("/docs/middleware"),
  "/docs/juc/": AutoSidebar("/docs/juc"),
  "/docs/other/": AutoSidebar("/docs/other"),
},
```

:::

**社交链接**

```ts
export default defineConfig({

  themeConfig: {
    //社交链接
    socialLinks: [ 
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }, 
      { icon: 'twitter', link: 'https://twitter.com/' }, 
      { icon: 'discord', link: 'https://chat.vitejs.dev/' },  
    ], 
  },

})
```

::: details  **<font color=#6DD3E3>vitepress自带的其他社交图标</font>** 

```ts
/* node_modules\vitepress\types\default-theme.d.ts */
export type SocialLinkIcon =
    | 'discord'
    | 'facebook'
    | 'github'
    | 'instagram'
    | 'linkedin'
    | 'mastodon'
    | 'slack'
    | 'twitter'
    | 'x'
    | 'youtube'
    | { svg: string }
```

:::



**搜索框**

::: code-group

```ts[local]
export default defineConfig({
  themeConfig: {
    search: { 
      provider: 'local'
    }, 
  },
})
```

```ts[algolia]
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '41AKMNBQQ4',
        apiKey: '9873076cd6001ca24a681f4295fc10ed',
        indexName: 'hougen'
      }
    },
  },
})
```

:::



**编辑本页**

```ts
export default defineConfig({

  themeConfig: {
    //编辑本页
    editLink: { 
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path', // 改成自己的仓库
      text: '在GitHub编辑本页'
    }, 
  },

})
```



## 美化&插件

**容器** 可以通过其类型、标题和内容来定义

输入

```md
::: info
这是一条信息，info后面的文字可修改
:::

::: tip 说明
这是一个提示，tip后面的文字可修改
:::

::: warning 警告
这是一条警告，warning后面的文字可修改
:::

::: danger 危险
这是一个危险警告，danger后面的文字可修改
:::

::: details **<font color=#6DD3E3>修改Badge颜色</font>**

:::
```

输出

::: info
这是一条信息，info后面的文字可修改
:::

::: tip 说明
这是一个提示，tip后面的文字可修改
:::

::: warning 警告
这是一条警告，warning后面的文字可修改
:::

::: danger 危险
这是一个危险警告，danger后面的文字可修改
:::

::: details **<font color=#6DD3E3>修改Badge颜色</font>**

```css
var.css:root {
    --vp-c-brand-1: #18794e;
    --vp-c-brand-2: #299764;
    --vp-c-brand-3: #30a46c;
}

.dark {
    --vp-c-brand-1: #3dd68c;
    --vp-c-brand-2: #30a46c;
    --vp-c-brand-3: #298459;
}

.vp-doc a {
    text-decoration: none;
}

h1 {
    background: #1352a0;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

}

.medium-zoom-overlay {
    z-index: 20;
}

.medium-zoom-image {
    z-index: 9999 !important;
}


/* 提示框背景颜色 */
:root {
    --vp-custom-block-tip-bg: var(--vp-c-green-soft);
}

/* 提示框 */
.custom-block.tip {
    border-color: var(--vp-c-green-2);
}

/* 警告框 */
.custom-block.warning {
    border-color: var(--vp-c-yellow-2);
}

/* 危险框 */
.custom-block.danger {
    border-color: var(--vp-c-red-2);
}

/* 详情框 */
.custom-block.details {
    border-color: #6DD3E3;
}


/* 引用块 */
.vp-doc blockquote {
    border-radius: 5px;
    padding: 10px 16px;
    background-color: var(--vp-badge-danger-bg);
    position: relative;
    border-left: 4px solid #e95f59;
}
```

:::

**Badge组件**

输入

```md
* VitePress <Badge type="info" text="default" />
* VitePress <Badge type="tip" text="^1.9.0" />
* VitePress <Badge type="warning" text="beta" />
* VitePress <Badge type="danger" text="caution" />
```

::: details **<font color=#6DD3E3>输出</font>**

* VitePress <Badge type="info" text="default" />
* VitePress <Badge type="tip" text="^1.9.0" />
* VitePress <Badge type="warning" text="beta" />
* VitePress <Badge type="danger" text="caution" />

:::



**代码块**

行高亮

````md
```ts{2-3,5}
export default defineConfig({
  lang: 'zh-CN',
  title: "VitePress",
  titleTemplate: '另起标题覆盖title',
})
```
````

::: details **<font color=#6DD3E3>输出</font>**

```ts{2-3,5}
export default defineConfig({
  lang: 'zh-CN',
  title: "VitePress",
  titleTemplate: '另起标题覆盖title',
})
```

:::



**聚焦代码** 在某一行后添加 `// [!code focus]` 注释会聚焦该行，并模糊代码的其他部分。

````md
```ts
export default defineConfig({
  lang: 'zh-CN',
  title: "VitePress",	//[!code focus]
  titleTemplate: '另起标题覆盖title',
})
```
````

::: details **<font color=#6DD3E3>输出</font>**

```ts
export default defineConfig({
  lang: 'zh-CN',
  title: "VitePress",	// [!code focus]
  titleTemplate: '另起标题覆盖title',
})
```

:::

### 视图过渡

扩展默认主题以在切换颜色模式时提供自定义过渡动画。

```vue
<!-- .vitepress/theme/Layout.vue -->

<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
})
</script>

<template>
  <DefaultTheme.Layout />
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style
```

::: details **<font color=#6DD3E3>效果</font>**

![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1720941230-appearance-toggle-transition.webp)

:::



### 视频播放器组件

安装`vue` 以及 `less` 

```sh
npm add -D vue
npm add -D less
```

在 `theme` 目录中 创建 `components`文件夹，然后创建 `Video.vue`

::: details **查看代码**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
interface Props {
  src: string // 视频文件地址，支持网络地址 https 和相对地址
  poster?: string // 视频封面地址，支持网络地址 https 和相对地址
  second?: number // 在未设置封面时，自动截取视频第 second 秒对应帧作为视频封面
  autoplay?: boolean // 视频就绪后是否马上播放，优先级高于preload
  controls?: boolean // 是否向用户显示控件，比如进度条，全屏等
  loop?: boolean // 视频播放完成后，是否循环播放
  muted?: boolean // 是否静音
  preload?: 'auto'|'metadata'|'none' // 是否在页面加载后载入视频，如果设置了autoplay属性，则preload将被忽略
  showPlay?: boolean // 播放暂停时是否显示播放器中间的暂停图标
  fit?: 'none'|'fill'|'contain'|'cover' // video的poster默认图片和视频内容缩放规则
}
const props = withDefaults(defineProps<Props>(), {
  src: '',
  poster: '',
  second: 0.5,
  /*
    参考 MDN 自动播放指南：https://developer.mozilla.org/zh-CN/docs/Web/Media/Autoplay_guide
    Autoplay 功能
    据新政策，媒体内容将在满足以下至少一个的条件下自动播放：
    1.音频被静音或其音量设置为 0
    2.用户和网页已有交互行为（包括点击、触摸、按下某个键等等）
    3.网站已被列入白名单；如果浏览器确定用户经常与媒体互动，这可能会自动发生，也可能通过首选项或其他用户界面功能手动发生
    4.自动播放策略应用到<iframe>或者其文档上
    autoplay：由于目前在最新版的Chrome浏览器（以及所有以Chromium为内核的浏览器）中，
    已不再允许自动播放音频和视频。就算你为video或audio标签设置了autoplay属性也一样不能自动播放！
    解决方法：设置视频 autoplay 时，视频必须设置为静音 muted: true 即可实现自动播放，
    然后用户可以使用控制栏开启声音，类似某宝商品自动播放的宣传视频逻辑
  */
  autoplay: false,
  controls: true,
  loop: false,
  muted: false,
  /*
    preload可选属性：
    auto: 一旦页面加载，则开始加载视频;
    metadata: 当页面加载后仅加载视频的元数据（例如长度），建议使用metadata，以便视频自动获取第一帧作为封面poster
    none: 页面加载后不应加载视频
  */
  preload: 'auto',
  showPlay: true,
  /*
    fit可选属性：
    none: 保存原有内容，不进行缩放;
    fill: 不保持原有比例，内容拉伸填充整个内容容器;
    contain: 保存原有比例，内容以包含方式缩放;
    cover: 保存原有比例，内容以覆盖方式缩放
  */
  fit: 'contain'
})
// 参考文档：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video
const veoPoster = ref(props.poster)
const originPlay = ref(true)
const hidden = ref(false) // 是否隐藏播放器中间的播放按钮
// 为模板引用标注类型
const veo = ref<HTMLVideoElement | null>(null) // 声明一个同名的模板引用

/*
  loadeddata 事件在媒体当前播放位置的视频帧（通常是第一帧）加载完成后触发
  preload为none时不会触发
*/
function getPoster () { // 在未设置封面时，自动截取视频0.5s对应帧作为视频封面
  // 由于不少视频第一帧为黑屏，故设置视频开始播放时间为0.5s，即取该时刻帧作为封面图
  veo.value!.currentTime = props.second
  // 创建canvas元素
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  // canvas画图
  canvas.width = veo.value!.videoWidth
  canvas.height = veo.value!.videoHeight
  ctx?.drawImage(veo.value!, 0, 0, canvas.width, canvas.height)
  // 把canvas转成base64编码格式
  veoPoster.value = canvas.toDataURL('image/png')
}
function onPlay () {
  if (originPlay.value) {
    veo.value!.currentTime = 0
    originPlay.value = false
  }
  if (props.autoplay) {
    veo.value?.pause()
  } else {
    hidden.value = true
    veo.value?.play()
  }
}
function onPause () {
  hidden.value = false
}
function onPlaying () {
  hidden.value = true
}
onMounted(() => {
  if (props.autoplay) {
    hidden.value = true
    originPlay.value = false
  }
  /*
    自定义设置播放速度，经测试：
    在vue2中需设置：this.$refs.veo.playbackRate = 2
    在vue3中需设置：veo.value.defaultPlaybackRate = 2
  */
  // veo.value.defaultPlaybackRate = 2
})
</script>

<template>
  <div class="m-video" :class="{'u-video-hover': !hidden}">
    <video
      ref="veo"
      :style="`object-fit: ${fit};`"
      :src="src"
      :poster="veoPoster"
      :autoplay="autoplay"
      :controls="!originPlay && controls"
      :loop="loop"
      :muted="autoplay || muted"
      :preload="preload"
      crossorigin="anonymous"
      @loadeddata="poster ? () => false : getPoster()"
      @pause="showPlay ? onPause() : () => false"
      @playing="showPlay ? onPlaying() : () => false"
      @click.prevent.once="onPlay"
      v-bind="$attrs">
      您的浏览器不支持video标签。
    </video>
    <span v-show="originPlay || showPlay" class="m-icon-play" :class="{'hidden': hidden}">
      <svg class="u-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34">
      <path d="M28.26,11.961L11.035,0.813C7.464-1.498,3,1.391,3,6.013v21.974c0,4.622,4.464,7.511,8.035,5.2L28.26,22.039
          C31.913,19.675,31.913,14.325,28.26,11.961z"></path>
      </svg>        
    </span>
  </div>
</template>

<style lang="less" scoped>
.m-video {
  display: inline-block;
  position: relative;
  background: #000;
  cursor: pointer;
  width: 100%;
  height: 100%;
  .m-icon-play {
    display: inline-block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, .6);
    pointer-events: none;
    transition: background-color .3s;
    .u-svg {
      display: inline-block;
      fill: #FFF;
      width: 29px;
      height: 34px;
      margin-top: 23px;
      margin-left: 27px;
    }
  }
  .hidden {
    opacity: 0;
  }
}
.u-video-hover {
  &:hover {
    .m-icon-play {
      background-color: rgba(0, 0, 0, .7);
    }
  }
}
</style>
```

在`index.ts` 中注册全局组件

```ts
/* .vitepress\theme\index.ts */
import Video from "./components/Video.vue"

export default {
  extends: DefaultTheme,
  enhanceApp({app}) {
    // 注册全局组件
    app.component('Video' , Video)
  }
}
```

:::

输入

```md
<Video
    src="lol.mp4"
    :width="666.67"
    :height="375"
    :second="3" />
```

<Video
    src="/video/lol.mp4"
    :width="666.67"
    :height="375"
    :second="3" />






### 时间线

```sh
npm add -D vitepress-markdown-timeline
```

在 `config.mts` 中注册 markdown 解析插件

```ts
import timeline from "vitepress-markdown-timeline"; 

export default {
  markdown: { 
    //时间线
    config: (md) => {
      md.use(timeline);
    },
  }, 
}
```

在 `.vitepress/theme/index.ts` 中引入时间线样式

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'

// 只需添加以下一行代码，引入时间线样式
import "vitepress-markdown-timeline/dist/theme/index.css";

export default {
  extends: DefaultTheme,
}
```

**使用示例**

```md
::: timeline 2023-04-24
- 一个非常棒的开源项目 H5-Dooring 目前 star 3.1k
  - 开源地址 https://github.com/MrXujiang/h5-Dooring
  - 基本介绍 http://h5.dooring.cn/doc/zh/guide/
- 《深入浅出webpack》 http://webpack.wuhaolin.cn/
:::

::: timeline 2023-04-23
:::
```

::: timeline 2023-04-24
- 一个非常棒的开源项目 H5-Dooring 目前 star 3.1k
  - 开源地址 https://github.com/MrXujiang/h5-Dooring
  - 基本介绍 http://h5.dooring.cn/doc/zh/guide/
- 《深入浅出webpack》 http://webpack.wuhaolin.cn/
:::

::: timeline 2023-04-23

:::



### 谷歌分析

仓库：https://github.com/ZhongxuYang/vitepress-plugin-google-analytics

```sh
npm add -D vitepress-plugin-google-analytics
```



### 图片缩放

```sh
npm add -D medium-zoom
```

::: details **插件配置**

在 `.vitepress/theme/index.ts` 添加如下代码，并保存。

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'

import mediumZoom from 'medium-zoom';
import { onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vitepress';

export default {
  extends: DefaultTheme,

  setup() {
    const route = useRoute();
    const initZoom = () => {
      // mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' }); // 默认
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' }); // 不显式添加{data-zoomable}的情况下为所有图像启用此功能
    };
    onMounted(() => {
      initZoom();
    });
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );
  },

}
```

点击图片后，还是能看到导航栏，加一个遮挡样式，在 `.vitepress/theme/style/var.css` 中加入如下代码，并保存。

```css
/* .vitepress/theme/style/var.css */

.medium-zoom-overlay {
  z-index: 20;
}

.medium-zoom-image {
  z-index: 9999 !important;
}
```

![image-20240714154923209](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1720943363-image-20240714154923209.png)

:::



### 评论

- **[Gitalk](https://gitalk.github.io/)**
- **[Giscus](https://giscus.app/zh-CN)**

Giscus 是一个基于 GitHub Discussion 的评论系统，启用简便，进 Giscus App官网：https://github.com/apps/giscus 点击 `Install` 安装。

- 选择 `Only select repositories`，再指定一个开启讨论的仓库。

  ::: tip 注意

  仓库必须是公开的，私有的不行，想单独放评论，可以新建一个仓库。

  :::

- 进入要开启讨论的仓库，点设置 - 勾选讨论 `Settings - discussions`

- [生成数据](https://giscus.app/zh-CN) 输入自己的仓库链接，满足条件会提示可用。下拉到 Discussion 分类我们按推荐的选 `Announcements` ，懒加载评论也可以勾选下。

- 保存脚本数据

  ```js{2-5}
  <script src="https://giscus.app/client.js"
          data-repo="Yiov/vitepress-doc"
          data-repo-id="R_******"
          data-category="Announcements"
          data-category-id="DIC_******"
          data-mapping="pathname"
          data-strict="0"
          data-reactions-enabled="1"
          data-emit-metadata="0"
          data-input-position="bottom"
          data-theme="preferred_color_scheme"
          data-lang="zh-CN"
          data-loading="lazy"
          crossorigin="anonymous"
          async>
  </script>
  ```

**安装**

```sh
npm add -D vitepress-plugin-comment-with-giscus
```

::: details **在 `.vitepress/theme/index.ts` 中配置**

将之前获取的4个关键数据填入，其他保持默认保存。

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
import { useData, useRoute } from 'vitepress';

export default {
  extends: DefaultTheme,

  setup() {
    // Get frontmatter and route
    const { frontmatter } = useData();
    const route = useRoute();
        
    // giscus配置
    giscusTalk({
      repo: 'your github repository', //仓库
      repoId: 'your repository id', //仓库ID
      category: 'Announcements', // 讨论分类
      categoryId: 'your category id', //讨论分类ID
      mapping: 'pathname',
      inputPosition: 'bottom',
      lang: 'zh-CN',
      }, 
      {
        frontmatter, route
      },
      //默认值为true，表示已启用，此参数可以忽略；
      //如果为false，则表示未启用
      //您可以使用“comment:true”序言在页面上单独启用它
      true
    );

}
```

:::



## 插槽配置

参考博客： https://vitepress.yiov.top/layout.html