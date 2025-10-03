export default defineNuxtRouteMiddleware(async (to) => {
  const { token, fetchUser, user } = useAuth()

  // Si pas de token, rediriger vers login
  if (!token.value) {
    return navigateTo('/login')
  }

  // Si on a un token mais pas d'utilisateur, le récupérer
  if (!user.value) {
    await fetchUser()
  }

  // Si toujours pas d'utilisateur après fetch, rediriger vers login
  if (!user.value) {
    return navigateTo('/login')
  }
})