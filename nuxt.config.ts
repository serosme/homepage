export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxthub/core', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false,
  },
  hub: {
    db: 'sqlite',
  },
})
