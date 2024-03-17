import { defineConfig } from 'vitepress'
import { set_sidebar } from "./utils/auto_sidebar.mjs";

export default defineConfig({
  title: "学习笔记",
  description: "年轻是我们唯一拥有权利去编织梦想的时光",
  head: [["link", { rel: "icon", href: "/logo.png" }]],
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
    math: true,
  },

  themeConfig: {
    outline: [2, 6],
    logo: '/logo.png',
    nav: [
      // { text: 'Home', link: '/' },
      {
        text: '文档', items: [
          { text: 'Java', link: '/java/' },
          { text: '前端', link: '/frontend/' },
          { text: '框架', link: '/framework/' },
          { text: 'DevOps', link: '/devops/' },
          { text: '中间件', link: '/center/' },
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
      "/frontend/": set_sidebar("/frontend"),
      "/framework/": set_sidebar("/framework"),
      "/devops/": set_sidebar("/devops"),
      "/center/": set_sidebar("/center"),
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

})
