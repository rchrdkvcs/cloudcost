<script setup lang="ts">
const links = ref([
  {
    label: "Comparer les offres",
    to: "/simulate",
    icon: "i-lucide-search",
  },
]);
</script>

<template>
  <UPageHero
    title="Trouvez l'offre cloud parfaite pour votre projet"
    description="Comparez les prix et performances des principaux fournisseurs cloud en quelques clics. Économisez jusqu'à 70% sur votre infrastructure."
    :links="links"
  />
  <UPageSection
    id="features"
    title="Comparez les solutions cloud, API par API"
    description="Accédez à une analyse détaillée des offres cloud majeures (AWS, Azure, GCP et plus), comparées ligne par ligne sur leurs API, performances, prix et cas d’usage."
    :features="[
      {
        icon: 'i-lucide-rocket',
        title:
          'L’intelligence artificielle qui déniche la meilleure offre pour vous',
        description:
          'Notre IA analyse automatiquement vos besoins et recommande la solution cloud la plus adaptée — en fonction de vos priorités : coût, scalabilité, latence ou intégration.',
      },
      {
        icon: 'lucide:refresh-cw',
        title: 'Des benchmarks à jour, automatisés et transparents',
        description:
          'Fini les tableaux dépassés : notre moteur surveille en temps réel les changements de pricing, latence, couverture régionale et disponibilités des APIs cloud.',
      },
      {
        icon: 'lucide:braces',
        title: 'Un comparateur pensé pour les développeurs et décideurs tech',
        description:
          'UI claire, infos techniques précises, outils d’aide à la décision intégrés : gagnez du temps et évitez les erreurs dans vos choix d’infrastructure.',
      },
      {
        icon: 'i-lucide-blocks',
        title: 'Explorez plus vite avec nos scénarios d’usage prêts à l’emploi',
        description:
          'Sélectionnez un cas d’usage (IA, IoT, data streaming, etc.) et voyez immédiatement quelles solutions cloud performent le mieux pour ce besoin spécifique.',
      },
      {
        icon: 'lucide:link',
        title: 'Connectez votre stack, comparez avec vos vraies données',
        description:
          'Importez vos logs, configs ou workloads via API pour une analyse personnalisée. Voyez comment chaque provider se comporte dans votre contexte réel.',
      },
      {
        icon: 'lucide:laptop-minimal-check',
        title: 'Des insights IA, pas des tableaux statiques',
        description:
          'Notre moteur IA ne se contente pas de comparer : il explique, prédit et recommande. Découvrez ce que les tableaux Excel ne vous diront jamais sur vos choix cloud.',
      },
    ]"
  />
</template>
