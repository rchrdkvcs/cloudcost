<script setup lang="ts">
const tuyau = useTuyau();
const { data } = await tuyau.$route("pricing").$get({
  query: {
    cpu: 4,
    ramGb: 16,
  },
});

const tiers = computed(() => {
  if (!data?.llmRecomendation || data.llmRecomendation.length === 0) {
    return [];
  }

  return data.llmRecomendation.map((plan: any, index: number) => ({
    id: plan.id || `plan-${index}`,
    title: plan.provider,
    description: plan.name,
    price: `${plan.priceMonthly.toFixed(2)}€`,
    billingCycle: "/mois",
    billingPeriod: `${plan.priceHourly.toFixed(4)}€/heure`,
    badge: index === 0 ? "Recommandé" : undefined,
    button: {
      label: "Choisir cette offre",
      variant: index === 0 ? "subtle" : undefined,
    },
    highlight: index === 0,
  }));
});

const sections = computed(() => {
  if (!data?.llmRecomendation || data.llmRecomendation.length === 0) {
    return [];
  }

  const tiersMap = data.llmRecomendation.reduce((acc: any, plan: any) => {
    acc[plan.id || `plan-${plan.provider}-${plan.name}`] = plan;
    return acc;
  }, {});

  return [
    {
      title: "Ressources",
      features: [
        {
          title: "CPU (vCPU)",
          tiers: Object.keys(tiersMap).reduce((acc: any, key) => {
            acc[key] = tiersMap[key].cpu;
            return acc;
          }, {}),
        },
        {
          title: "RAM (GB)",
          tiers: Object.keys(tiersMap).reduce((acc: any, key) => {
            acc[key] = tiersMap[key].ramGb;
            return acc;
          }, {}),
        },
        {
          title: "Stockage (GB)",
          tiers: Object.keys(tiersMap).reduce((acc: any, key) => {
            acc[key] = tiersMap[key].storageGb || "N/A";
            return acc;
          }, {}),
        },
        {
          title: "Bande passante (TB)",
          tiers: Object.keys(tiersMap).reduce((acc: any, key) => {
            acc[key] = tiersMap[key].bandwidthTb || "N/A";
            return acc;
          }, {}),
        },
      ],
    },
    {
      title: "Informations",
      features: [
        {
          title: "Région",
          tiers: Object.keys(tiersMap).reduce((acc: any, key) => {
            acc[key] = tiersMap[key].region;
            return acc;
          }, {}),
        },
        {
          title: "Système d'exploitation",
          tiers: Object.keys(tiersMap).reduce((acc: any, key) => {
            acc[key] = tiersMap[key].operatingSystem;
            return acc;
          }, {}),
        },
        {
          title: "Type",
          tiers: Object.keys(tiersMap).reduce((acc: any, key) => {
            acc[key] = tiersMap[key].type;
            return acc;
          }, {}),
        },
      ],
    },
  ];
});
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center space-y-3">
        <h1 class="text-4xl font-bold">Comparez les offres cloud</h1>
        <p class="text-lg text-gray-600">
          Trouvez la meilleure solution cloud selon vos besoins
        </p>
      </div>

      <!-- Results -->
      <div v-if="tiers.length > 0" class="space-y-6 w-full">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold">
            {{ tiers.length }} offre{{
              tiers.length > 1 ? "s" : ""
            }}
            recommandée{{ tiers.length > 1 ? "s" : "" }}
          </h2>
          <UBadge color="primary" variant="subtle">
            <UIcon name="i-lucide-sparkles" class="mr-1" />
            IA recommandée
          </UBadge>
        </div>

        <UPricingTable :tiers="tiers" :sections="sections" />

        <div class="flex justify-end">
          <UButton
            to="/simulate/details"
            color="neutral"
            variant="ghost"
            label="Voir le détail"
            icon="lucide:arrow-right"
          />
        </div>
      </div>

      <div v-else class="text-center py-16">
        <UIcon name="i-lucide-search-x" class="text-6xl text-gray-400 mb-4" />
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          Aucune recommandation disponible
        </h3>
        <p class="text-gray-500">
          Essayez de modifier vos critères de recherche
        </p>
      </div>
    </div>
  </UContainer>
</template>
