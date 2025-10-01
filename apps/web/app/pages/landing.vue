<template>
  <section class="bg-gradient-to-b from-gray-50 to-white border-b">
    <div class="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
        Comparez vos coûts cloud en quelques clics
      </h1>
      <p class="mt-4 text-gray-600 max-w-2xl">
        Simulez votre configuration (CPU, RAM, stockage, bande passante) et
        trouvez instantanément l’offre la plus économique parmi plusieurs
        fournisseurs.
      </p>
      <div class="mt-8 flex items-center gap-3">
        <UButton
          size="lg"
          color="primary"
          label="Créer une simulation"
          to="/simulate"
        />
        <UButton
          size="lg"
          variant="soft"
          color="neutral"
          label="En savoir plus"
          to="/landing#features"
        />
      </div>
    </div>
  </section>

  <section
    id="features"
    class="max-w-6xl mx-auto px-4 py-12 grid gap-6 md:grid-cols-3"
  >
    <div class="p-6 rounded-lg border bg-white">
      <h3 class="font-semibold">Rapide</h3>
      <p class="mt-2 text-sm text-gray-600">
        Saisissez vos besoins et obtenez une estimation immédiate.
      </p>
    </div>
    <div class="p-6 rounded-lg border bg-white">
      <h3 class="font-semibold">Multi-fournisseurs</h3>
      <p class="mt-2 text-sm text-gray-600">
        Comparez entre plusieurs providers pour optimiser vos coûts.
      </p>
    </div>
    <div class="p-6 rounded-lg border bg-white">
      <h3 class="font-semibold">Transparence</h3>
      <p class="mt-2 text-sm text-gray-600">
        Détails clairs des prix mensuels et horaires.
      </p>
    </div>
  </section>
</template>
