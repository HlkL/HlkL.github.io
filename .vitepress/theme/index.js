import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import gitalkLayout from "./components/gitalkLayout.vue"
import switchAppearance from "./components/switchAppearance.vue"
import './style.css'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
    })
  },
  enhanceApp({ app, router, siteData }) {
    // ...
  },

  Layout: gitalkLayout,
  // Layout: switchAppearance,
}
