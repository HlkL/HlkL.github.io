import { withMermaid } from "vitepress-plugin-mermaid"
import { set_sidebar } from "./utils/auto_sidebar.mjs";

export default withMermaid({
  title: "学习笔记",
  description: "年轻是我们唯一拥有权利去编织梦想的时光",
  head: [
    ["link", { rel: "icon", href: "/icon.png" }],
    ['script', { type: "text/javascript", src: '/js/anime.min.js' }],
    ['script', { type: "text/javascript", src: '/js/fireworks.js' }],
  ],
  lastUpdated: true,
  markdown: {
    // lineNumbers: true,
    math: true,
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true
    }
  },

  themeConfig: {
    outline: [1, 6],
    logo: '/icon.png',
    nav: [
      // { text: 'Home', link: '/' },
      {
        text: 'Docs', items: [
          { text: 'Java', link: '/java/' },
          { text: 'Golang', link: '/golang/' },
          { text: '前端', link: '/frontend/' },
          { text: '框架', link: '/framework/' },
          { text: 'DevOps', link: '/devops/' },
          { text: '中间件', link: '/middleware/' },
          { text: 'JUC', link: '/juc/' },
          { text: '其他', link: '/other/' },
        ]
      },
    ],

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],

    //自动配置左侧边栏
    sidebar: {
      "/java/": set_sidebar("/java"),
      "/golang/": set_sidebar("/golang"),
      "/frontend/": set_sidebar("/frontend"),
      "/framework/": set_sidebar("/framework"),
      "/devops/": set_sidebar("/devops"),
      "/middleware/": set_sidebar("/middleware"),
      "/juc/": set_sidebar("/juc"),
      "/other/": set_sidebar("/other"),
    },

    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com' }
    // ],

    //底部配置
    // footer: {
    //   copyright: "Copyright @ 2024 hougen"
    // }

    // 搜索框
    search: {
      provider: "local"
    },
  },

  // your existing vitepress config...
  // optionally, you can pass MermaidConfig
  mermaid: {
    // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options
  },
  // optionally set additional config for plugin itself with MermaidPluginConfig
  mermaidPlugin: {
    class: "mermaid my-class", // set additional css classes for parent container 
  },


})
