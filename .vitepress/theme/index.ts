import GiscusTalk from 'vitepress-plugin-comment-with-giscus';
import GoogleAnalytics from 'vitepress-plugin-google-analytics'
import DefaultTheme from 'vitepress/theme'
import MediumZoom from 'medium-zoom';
import Video from "./components/Video.vue"
import Appearance from "./components/Appearance.vue"

import { h, onMounted, watch, nextTick } from 'vue'
import { useData, useRoute } from 'vitepress'

import './style/index.css'
// 引入时间线样式
import "vitepress-markdown-timeline/dist/theme/index.css";

export default {
  extends: DefaultTheme,
  Layout: Appearance,
  enhanceApp({ app, router, siteData }) {
    app.component('Video', Video),
      GoogleAnalytics({
        id: 'G-81FGNJWNQ8', //跟踪ID，在analytics.google.com注册即可
      })
  },

  setup() {
    const route = useRoute();
    const { frontmatter } = useData();
    const initZoom = () => {
      MediumZoom('.main img', { background: 'var(--vp-c-bg)' }); // 不显式添加{data-zoomable}的情况下为所有图像启用此功能
    };
    onMounted(() => {
      initZoom();
    });
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );

    // giscus配置
    GiscusTalk({
      repo: 'HlkL/HlkL.github.io', //仓库
      repoId: 'R_kgDOLhRf7A', //仓库ID
      category: 'Announcements', // 讨论分类
      categoryId: 'DIC_kwDOLhRf7M4CgxJS', //讨论分类ID
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
  },


}
