import process from 'node:process'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxthub/core', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  hub: {
    db: {
      dialect: 'sqlite',
      driver: 'd1-http',
      connection: {
        databaseId: process.env.NUXT_HUB_CLOUDFLARE_DATABASE_ID!,
      },
    },
  },
})
