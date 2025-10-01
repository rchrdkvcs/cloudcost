import { defineNuxtPlugin } from "#imports";
import { createTuyau } from "@tuyau/client";
import { api } from "@aduxt/api/api";

export default defineNuxtPlugin(() => {
  const tuyauClient = createTuyau({
    api,
    baseUrl: "http://localhost:3333",
  });

  return {
    provide: {
      tuyau: tuyauClient,
    },
  };
});
