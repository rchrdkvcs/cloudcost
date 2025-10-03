<script setup lang="ts">
const { login } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
})

const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await login(form.value.email, form.value.password)
    await router.push('/')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de la connexion'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <h1 class="text-3xl font-bold mb-6 text-center">Connexion</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
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
          Se connecter
        </UButton>

        <p class="text-center text-sm">
          Pas de compte ?
          <NuxtLink to="/register" class="text-primary font-medium">
            S'inscrire
          </NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>