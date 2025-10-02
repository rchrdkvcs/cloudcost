// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/image"],
  css: ["~/assets/styles/main.css"],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    public: {
      // Override via NUXT_PUBLIC_API_BASE, defaults to local API
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3333",
    },
  },
});
