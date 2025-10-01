import type { createTuyau } from '@tuyau/client'
import type { api } from '@aduxt/api/api'

declare module '#app' {
  interface NuxtApp {
    $tuyau: ReturnType<typeof createTuyau<typeof api>>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $tuyau: ReturnType<typeof createTuyau<typeof api>>
  }
}

export {}