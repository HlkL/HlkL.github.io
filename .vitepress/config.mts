import { withMermaid } from "vitepress-plugin-mermaid"
import { AutoSidebar } from "./utils/AutoSidebar.mjs";
import timeline from "vitepress-markdown-timeline";
import taskLists from 'markdown-it-task-checkbox'

export default withMermaid({
  title: "学习笔记",
  description: "学习日志",
  head: [
    ["link", { rel: "icon", href: "/icon.png" }],
    ["link", { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/@docsearch/css@3" }],
    // ['script', { type: "text/javascript", src: '/js/anime.min.js' }],
    // ['script', { type: "text/javascript", src: '/js/fireworks.js' }],
  ],
  lang: 'zh-CN', // 语言
  // lastUpdated: true,// 最后更新时间
  cleanUrls: true, //纯净链接,去除在默认情况下Vitepress的链接以 .html 结尾
  appearance: 'dark',// 默认深色模式
  markdown: {
    // lineNumbers: true, // 代码行数显示
    math: true,//数学公式
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true
    },
    //时间线
    config: (md) => {
      //时间线
      md.use(timeline);
      //任务列表
      md.use(taskLists, {
        disabled: true,
        divWrap: false,
        divClass: 'checkbox',
        idPrefix: 'cbx_',
        ulClass: 'task-list',
        liClass: 'task-list-item',
      })
    },
  },
  //站点地图
  sitemap: {
    hostname: 'https://www.hougen.fun',
  },
  // locales: {//国际化
  //   root: {
  //     label: '简体中文',
  //     lang: 'Zh_CN',
  //   },
  //   en: {
  //     label: 'English',
  //     lang: 'en',
  //     link: '/en/',
  //   },
  //   fr: {
  //     label: 'French',
  //     lang: 'fr',
  //     link: '/fr/',
  //   }
  // },
  themeConfig: {
    logo: '/icon.png',
    returnToTopLabel: '返回顶部', //返回顶部文字修改
    sidebarMenuLabel: '目录', //侧边栏文字更改(移动端)
    darkModeSwitchLabel: '深浅模式',
    outline: {
      level: [1, 4], // 显示2-4级标题
      label: '当前页大纲' // 文字显示
    },
    // editLink: {
    //   pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path', // 改成自己的仓库
    //   text: '在GitHub编辑本页'
    // },
    //自定义上下页名
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    // 广告
    // carbonAds: {
    //   code: '...',
    //   placement: '...',
    // },
    nav: [
      {
        text: 'Docs', items: [
          { text: 'Java', link: '/docs/java/' },
          { text: 'Golang', link: '/docs/golang/' },
          { text: '前端', link: '/docs/frontend/' },
          { text: '框架', link: '/docs/framework/' },
          { text: 'DevOps', link: '/docs/devops/' },
          { text: '中间件', link: '/docs/middleware/' },
          { text: '其他', link: '/docs/other/' },
        ]
      },
    ],

    sidebar: {
      "/docs/java/": AutoSidebar("/docs/java"),
      "/docs/golang/": AutoSidebar("/docs/golang"),
      "/docs/frontend/": AutoSidebar("/docs/frontend"),
      "/docs/framework/": AutoSidebar("/docs/framework"),
      "/docs/devops/": AutoSidebar("/docs/devops"),
      "/docs/middleware/": AutoSidebar("/docs/middleware"),
      "/docs/other/": AutoSidebar("/docs/other"),
    },

    search: {
      // provider: 'local',
      provider: 'algolia',
      options: {
        appId: '41AKMNBQQ4',
        apiKey: '9873076cd6001ca24a681f4295fc10ed',
        indexName: 'hougen'
      }
    },

    mermaid: {
      // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options
    },
    // optionally set additional config for plugin itself with MermaidPluginConfig
    mermaidPlugin: {
      class: "mermaid my-class", // set additional css classes for parent container 
    },

  }
})

