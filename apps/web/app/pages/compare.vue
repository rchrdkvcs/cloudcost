<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type ProviderType = 'VM' | 'Container' | 'Serverless'

interface FormData {
  name: string
  region: string
  os: string
  cpu: number
  ram_gb: number
  storage_gb: number
  bandwidth_tb: number
  bandwidth_mbps: number
  price_monthly: number
  price_hourly: number
  price_target: number
  instance_class: 'dédié' | 'partagé' | 'host dédié'
  type: ProviderType
}

const route = useRoute()
const formData = ref<FormData | null>(null)

onMounted(() => {
  const params = route.query
  if (params.data) {
    try {
      formData.value = JSON.parse(decodeURIComponent(params.data as string))
    } catch (err) {
      console.error('Erreur parsing query.data', err)
    }
  }
})

const rows = computed(() => {
  const f = formData.value
  if (!f) return [] as Array<{ label: string; value: string }>
  return [
    { label: 'Nom de l’offre', value: f.name },
    { label: 'Type', value: f.type },
    { label: 'Région', value: f.region },
    { label: "Système d'exploitation", value: f.os },
    { label: 'CPU (vCPU)', value: String(f.cpu) },
    { label: 'RAM (GB)', value: String(f.ram_gb) },
    { label: 'Stockage (GB)', value: String(f.storage_gb) },
    { label: 'Bande passante (TB)', value: String(f.bandwidth_tb) },
    { label: 'Bande passante (Mbps)', value: String(f.bandwidth_mbps) },
    { label: "Type d'instance", value: f.instance_class },
    { label: 'Budget cible (€/mois)', value: `€${f.price_target}` },
    { label: 'Prix mensuel actuel', value: `€${f.price_monthly}` },
    { label: 'Prix horaire actuel', value: `€${f.price_hourly}` },
  ]
})

// Pricing compare logic
const { fetchPricing, loading, error, bestPlansByProvider, plans } = usePricing()

async function onCompare() {
  if (!formData.value) return
  const cpu = Number(formData.value.cpu)
  const ramGb = Number(formData.value.ram_gb)
  const region = String(formData.value.region || '')

  if (!Number.isFinite(cpu) || !Number.isFinite(ramGb) || !region) {
    // Afficher un message d'erreur côté UI au lieu d'appeler l'API
    ;(error as any).value = 'Veuillez renseigner un CPU, une RAM et une région valides.'
    return
  }

  await fetchPricing({
    cpu,
    ramGb,
    regions: [region],
  })
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Comparaison - Récapitulatif</h1>

    <div v-if="!formData" class="text-sm text-gray-600">
      Aucune donnée à afficher. Veuillez compléter le formulaire de simulation.
    </div>

    <div v-else class="overflow-x-auto rounded border">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Champ</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="row in rows" :key="row.label">
            <td class="px-4 py-2 text-sm text-gray-700">{{ row.label }}</td>
            <td class="px-4 py-2 text-sm text-gray-900">{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex items-center gap-3">
      <UButton :loading="loading" color="primary" @click="onCompare" label="Comparer les offres" />
      <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
    </div>

    <div v-if="Object.keys(bestPlansByProvider).length" class="mt-6">
      <h2 class="text-lg font-medium mb-2">Meilleures offres par fournisseur</h2>
      <div class="overflow-x-auto rounded border">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offre</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPU</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RAM (GB)</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix mensuel (€)</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="(plan, provider) in bestPlansByProvider" :key="provider">
              <td class="px-4 py-2 text-sm text-gray-700">{{ provider }}</td>
              <td class="px-4 py-2 text-sm text-gray-900">{{ plan.name }}</td>
              <td class="px-4 py-2 text-sm">{{ plan.cpu }}</td>
              <td class="px-4 py-2 text-sm">{{ plan.ram_gb }}</td>
              <td class="px-4 py-2 text-sm">€{{ plan.price_monthly }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="plans.length" class="mt-8">
      <h2 class="text-lg font-medium mb-2">Toutes les offres correspondantes</h2>
      <div class="overflow-x-auto rounded border">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offre</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Région</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPU</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RAM (GB)</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix horaire (€)</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix mensuel (€)</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="plan in plans" :key="`${plan.provider}-${plan.name}-${plan.region}`">
              <td class="px-4 py-2 text-sm text-gray-700">{{ plan.provider }}</td>
              <td class="px-4 py-2 text-sm text-gray-900">{{ plan.name }}</td>
              <td class="px-4 py-2 text-sm">{{ plan.region }}</td>
              <td class="px-4 py-2 text-sm">{{ plan.cpu }}</td>
              <td class="px-4 py-2 text-sm">{{ plan.ram_gb }}</td>
              <td class="px-4 py-2 text-sm">€{{ plan.price_hourly }}</td>
              <td class="px-4 py-2 text-sm">€{{ plan.price_monthly }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

