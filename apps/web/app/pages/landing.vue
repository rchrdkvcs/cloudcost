<template>
  <UApp>
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/landing" class="text-lg font-semibold tracking-tight">CloudCost</NuxtLink>
        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink to="/landing" class="text-sm text-gray-900 font-medium">Accueil</NuxtLink>
          <NuxtLink to="/simulate" class="text-sm text-gray-600 hover:text-gray-900">Comparer</NuxtLink>
        </nav>
        <div class="flex items-center gap-2">
          <UButton to="/login" variant="soft" color="neutral" label="Connexion" />
        </div>
      </div>
    </header>

    <section class="bg-gradient-to-b from-gray-50 to-white border-b">
      <div class="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">Comparez vos coûts cloud en quelques clics</h1>
        <p class="mt-4 text-gray-600 max-w-2xl">Simulez votre configuration (CPU, RAM, stockage, bande passante) et trouvez instantanément l’offre la plus économique parmi plusieurs fournisseurs.</p>
        <div class="mt-8 flex items-center gap-3">
          <UButton size="lg" color="primary" label="Créer une simulation" to="/simulate" />
          <UButton size="lg" variant="soft" color="neutral" label="En savoir plus" to="/landing#features" />
        </div>
      </div>
    </section>

    <section id="features" class="max-w-6xl mx-auto px-4 py-12 grid gap-6 md:grid-cols-3">
      <div class="p-6 rounded-lg border bg-white">
        <h3 class="font-semibold">Rapide</h3>
        <p class="mt-2 text-sm text-gray-600">Saisissez vos besoins et obtenez une estimation immédiate.</p>
      </div>
      <div class="p-6 rounded-lg border bg-white">
        <h3 class="font-semibold">Multi-fournisseurs</h3>
        <p class="mt-2 text-sm text-gray-600">Comparez entre plusieurs providers pour optimiser vos coûts.</p>
      </div>
      <div class="p-6 rounded-lg border bg-white">
        <h3 class="font-semibold">Transparence</h3>
        <p class="mt-2 text-sm text-gray-600">Détails clairs des prix mensuels et horaires.</p>
      </div>
    </section>
  </UApp>
  <footer class="border-t bg-white">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between text-sm text-gray-600">
      <p>© {{ new Date().getFullYear() }} CloudCost</p>
      <nav class="flex items-center gap-4">
        <NuxtLink to="/landing" class="hover:text-gray-900">Accueil</NuxtLink>
        <NuxtLink to="/simulate" class="hover:text-gray-900">Comparer</NuxtLink>
      </nav>
    </div>
  </footer>
  
</template>


