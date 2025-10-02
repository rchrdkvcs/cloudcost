import { defineNuxtPlugin } from "#imports";
import { createTuyau } from "@tuyau/client";
import { api } from "@aduxt/api/api";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const tuyauClient = createTuyau({
    api,
    baseUrl: config.public.apiBase,
  });

  return {
    provide: {
      tuyau: tuyauClient,
    },
  };
});
