<script setup lang="ts">
const links = ref([
  {
    label: "Comparer les offres",
    to: "/simulate",
    icon: "i-lucide-search",
  },
  {
    label: "Documentation API",
    to: "/docs",
    color: "neutral",
    variant: "subtle",
    trailingIcon: "i-lucide-arrow-right",
  },
]);
const cards = ref([
  {
    title: "Prix en temps réel",
    description:
      "Accédez aux tarifs actualisés de AWS, Azure, Hetzner, Scaleway et DigitalOcean en temps réel.",
    icon: "i-lucide-trending-up",
    to: "/simulate",
  },
  {
    title: "Filtres avancés",
    description:
      "Filtrez par CPU, RAM, région, système d'exploitation et trouvez l'offre qui correspond exactement à vos besoins.",
    icon: "i-lucide-filter",
    to: "/simulate",
  },
  {
    title: "Comparaison simplifiée",
    description:
      "Comparez les offres de plusieurs fournisseurs côte à côte pour prendre la meilleure décision.",
    icon: "i-lucide-bar-chart-3",
    to: "/simulate",
  },
]);
</script>

<template>
  <UContainer>
    <UPageHero
      title="Trouvez l'offre cloud parfaite pour votre projet"
      description="Comparez les prix et performances des principaux fournisseurs cloud en quelques clics. Économisez jusqu'à 70% sur votre infrastructure."
      :links="links"
    />

    <UPageGrid>
      <UPageCard v-for="(card, index) in cards" :key="index" v-bind="card" />
    </UPageGrid>
  </UContainer>
</template>
