import { defineConfig } from 'vitepress'
import { set_sidebar } from "./utils/auto_sidebar.mjs";	// 改成自己的路径

export default defineConfig({
  title: "学习笔记",
  description: "年轻是我们唯一拥有权利去编织梦想的时光",
  head: [["link", { rel: "icon", href: "/logo.png" }]],
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
    math: true,
    lazyLoading: true
  },

  themeConfig: {
    outline: [2, 6],
    logo: '/logo.png',
    nav: [
      // { text: 'Home', link: '/' },
      {
        text: 'Docs', items: [
          { text: 'Languag', link: '/languag/' },
          { text: 'Backend', link: '/backend/' },
          { text: 'Frontend', link: '/frontend/' },
          { text: 'Other', link: '/other/' },
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
      "/languag": set_sidebar("/languag"),
      "/backend": set_sidebar("/backend"),
      "/frontend": set_sidebar("/frontend"),
      "/other": set_sidebar("/other"),
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

  mermaid: {
    // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options
  },
  mermaidPlugin: {
    class: "mermaid my-class", // set additional css classes for parent container
  },

})
