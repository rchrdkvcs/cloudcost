<script setup lang="ts">
const tuyau = useTuyau();

const form = ref({
  cpu: 4,
  ramGb: 16,
  provider: [] as string[],
  region: [] as string[],
  customPrompt: "",
});

const providers = [
  { value: "AWS", label: "Amazon Web Services", icon: "i-lucide-cloud" },
  { value: "Azure", label: "Microsoft Azure", icon: "i-lucide-cloud" },
  { value: "GCP", label: "Google Cloud Platform", icon: "i-lucide-cloud" },
  { value: "Hetzner", label: "Hetzner", icon: "i-lucide-server" },
  { value: "DigitalOcean", label: "DigitalOcean", icon: "i-lucide-droplet" },
];

const regions = [
  { value: "eu-west-1", label: "Europe (Ouest)", icon: "i-lucide-map-pin" },
  { value: "eu-central-1", label: "Europe (Centre)", icon: "i-lucide-map-pin" },
  { value: "us-east-1", label: "USA (Est)", icon: "i-lucide-map-pin" },
  { value: "us-west-1", label: "USA (Ouest)", icon: "i-lucide-map-pin" },
  {
    value: "ap-southeast-1",
    label: "Asie (Sud-Est)",
    icon: "i-lucide-map-pin",
  },
];

const { data, refresh, status } = await useAsyncData(
  "pricing",
  () =>
    tuyau.$route("pricing").$get({
      query: {
        cpu: form.value.cpu,
        ramGb: form.value.ramGb,
        provider:
          form.value.provider.length > 0 ? form.value.provider : undefined,
        region: form.value.region.length > 0 ? form.value.region : undefined,
        customPrompt: form.value.customPrompt || undefined,
      },
    }),
  {
    immediate: true,
  },
);

const showForm = ref(true)

const handleSearch = () => {
  refresh();
  showForm.value = false;
};

const tiers = computed(() => {
  if (
    !data.value?.data?.llmRecomendation ||
    data.value?.data?.llmRecomendation.length === 0
  ) {
    return [];
  }

  return data.value.data.llmRecomendation.map((plan: any, index: number) => ({
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
  if (
    !data.value?.data?.llmRecomendation ||
    data.value?.data?.llmRecomendation.length === 0
  ) {
    return [];
  }

  const tiersMap = data.value.data.llmRecomendation.reduce(
    (acc: any, plan: any) => {
      acc[plan.id || `plan-${plan.provider}-${plan.name}`] = plan;
      return acc;
    },
    {},
  );

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

      <!-- Search Form -->
      <UCard v-if="showForm">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sliders" class="text-xl" />
            <h2 class="text-xl font-semibold">Configurez vos besoins</h2>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Ressources -->
          <div class="flex flex-col gap-6">
            <!-- CPU -->
            <div>
              <label class="block text-sm font-medium mb-3">CPU (vCPU)</label>
              <div class="overflow-x-auto pb-2">
                <div class="flex gap-3 w-max p-1">
                  <UCard
                    v-for="cpu in [1, 2, 4, 8, 16, 32, 64]"
                    :key="cpu"
                    :ui="{ body: 'p-3' }"
                    :class="[
                      'cursor-pointer transition-all min-w-32 max-h-16',
                      form.cpu === cpu
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted',
                    ]"
                    @click="form.cpu = cpu"
                  >
                    <div class="flex items-center gap-2 text-center">
                      <UIcon name="i-lucide-cpu" class="text-2xl" />
                      <p class="font-medium">{{ cpu }} vCPU</p>
                      <UIcon
                        v-if="form.cpu === cpu"
                        name="i-lucide-check-circle"
                        class="text-primary text-xl"
                      />
                    </div>
                  </UCard>
                </div>
              </div>
            </div>

            <!-- RAM -->
            <div>
              <label class="block text-sm font-medium mb-3">RAM (GB)</label>
              <div class="overflow-x-auto pb-2">
                <div class="flex gap-3 w-max p-1">
                  <UCard
                    v-for="ram in [2, 4, 8, 16, 32, 64, 128, 256]"
                    :key="ram"
                    :ui="{ body: 'p-3' }"
                    :class="[
                      'cursor-pointer transition-all min-w-32 min-h-16',
                      form.ramGb === ram
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted',
                    ]"
                    @click="form.ramGb = ram"
                  >
                    <div class="flex items-center gap-2 text-center">
                      <UIcon name="i-lucide-memory-stick" class="text-2xl" />
                      <p class="font-medium">{{ ram }} GB</p>
                      <UIcon
                        v-if="form.ramGb === ram"
                        name="i-lucide-check-circle"
                        class="text-primary text-xl"
                      />
                    </div>
                  </UCard>
                </div>
              </div>
            </div>
          </div>

          <!-- Providers -->
          <div>
            <label class="block text-sm font-medium mb-3">
              Fournisseurs cloud (optionnel)
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <UCard
                v-for="provider in providers"
                :key="provider.value"
                :ui="{
                  body: 'p-3',
                }"
                :class="[
                  'cursor-pointer transition-all',
                  form.provider.includes(provider.value)
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted',
                ]"
                @click="
                  form.provider.includes(provider.value)
                    ? (form.provider = form.provider.filter(
                        (p) => p !== provider.value,
                      ))
                    : form.provider.push(provider.value)
                "
              >
                <div class="flex items-center gap-3">
                  <UIcon :name="provider.icon" class="text-2xl" />
                  <div class="flex-1">
                    <p class="font-medium">{{ provider.label }}</p>
                  </div>
                  <UIcon
                    v-if="form.provider.includes(provider.value)"
                    name="i-lucide-check-circle"
                    class="text-primary text-xl"
                  />
                </div>
              </UCard>
            </div>
          </div>

          <!-- Regions -->
          <div>
            <label class="block text-sm font-medium mb-3">
              Régions (optionnel)
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <UCard
                v-for="region in regions"
                :key="region.value"
                :ui="{
                  body: 'p-3',
                }"
                :class="[
                  'cursor-pointer transition-all',
                  form.region.includes(region.value)
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted',
                ]"
                @click="
                  form.region.includes(region.value)
                    ? (form.region = form.region.filter(
                        (r) => r !== region.value,
                      ))
                    : form.region.push(region.value)
                "
              >
                <div class="flex items-center gap-3">
                  <UIcon :name="region.icon" class="text-2xl" />
                  <div class="flex-1">
                    <p class="font-medium">{{ region.label }}</p>
                  </div>
                  <UIcon
                    v-if="form.region.includes(region.value)"
                    name="i-lucide-check-circle"
                    class="text-primary text-xl"
                  />
                </div>
              </UCard>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <UButton
              @click="handleSearch"
              color="primary"
              size="lg"
              :loading="status === 'pending'"
              :disabled="status === 'pending'"
            >
              <UIcon name="i-lucide-sparkles" class="mr-2" />
              Rechercher
            </UButton>
            <UButton
              @click="
                form = {
                  cpu: 4,
                  ramGb: 16,
                  provider: [],
                  region: [],
                  customPrompt: '',
                };
                handleSearch();
              "
              variant="ghost"
              color="neutral"
              size="lg"
            >
              Réinitialiser
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Loading State -->
      <div v-if="status === 'pending'" class="text-center py-12">
        <UIcon
          name="i-lucide-loader-2"
          class="animate-spin text-5xl text-primary mb-4"
        />
        <p class="text-lg font-medium text-gray-700">
          L'IA analyse les meilleures offres...
        </p>
        <p class="text-sm text-gray-500 mt-2">
          Cela peut prendre quelques secondes
        </p>
      </div>

      <!-- Results -->
      <div v-else-if="tiers.length > 0" class="space-y-6 w-full">
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
