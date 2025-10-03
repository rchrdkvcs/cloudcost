<script setup lang="ts">
const { register } = useAuth()
const router = useRouter()

const form = ref({
  fullName: '',
  email: '',
  password: '',
})

const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  error.value = ''
  loading.value = true

  try {
    await register(form.value.email, form.value.password, form.value.fullName || undefined)
    await router.push('/')
  } catch (e: any) {
    error.value = e.response?.data?.message || "Erreur lors de l'inscription"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <h1 class="text-3xl font-bold mb-6 text-center">Inscription</h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nom complet (optionnel)</label>
          <UInput
            v-model="form.fullName"
            type="text"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="votre@email.com"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Mot de passe</label>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
          />
          <p class="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <UButton
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="loading"
          block
        >
          S'inscrire
        </UButton>

        <p class="text-center text-sm">
          Déjà un compte ?
          <NuxtLink to="/login" class="text-primary font-medium">
            Se connecter
          </NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>