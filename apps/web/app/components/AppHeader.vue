<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { user, logout, isAuthenticated } = useAuth()

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

const handleLogout = async () => {
  await logout()
  navigateTo('/login')
}
</script>

<template>
  <UHeader>
    <template #title>
      <h1>CloudCost</h1>
    </template>

    <UNavigationMenu :items="headerItems" />

    <template #right>
      <div v-if="isAuthenticated" class="flex items-center gap-3">
        <span class="text-sm">{{ user?.email }}</span>
        <UButton
          icon="lucide:log-out"
          variant="ghost"
          color="neutral"
          @click="handleLogout"
        >
          Déconnexion
        </UButton>
      </div>
      <div v-else class="flex items-center gap-2">
        <UButton to="/login" variant="ghost" color="neutral">
          Connexion
        </UButton>
        <UButton to="/register" color="primary">
          S'inscrire
        </UButton>
      </div>
    </template>
  </UHeader>
</template>

<style scoped></style>
