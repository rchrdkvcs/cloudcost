import type { createTuyau } from "@tuyau/client";
import type { api } from "@aduxt/api/api";

export const useTuyau = () => {
  const { $tuyau } = useNuxtApp();
  return $tuyau as ReturnType<typeof createTuyau<typeof api>>;
};
