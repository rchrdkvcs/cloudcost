<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const headerItems = computed<NavigationMenuItem[]>(() => [
  {
    label: "Accueil",
    icon: "lucide:home",
    to: "/",
  },
  {
    label: "Comparer",
    icon: "lucide:compass",
    to: "/simulate",
  },
]);
</script>

<template>
  <UHeader>
    <template #title>
      <h1>CloudCost</h1>
    </template>

    <UNavigationMenu :items="headerItems" />
  </UHeader>
</template>

<style scoped></style>
