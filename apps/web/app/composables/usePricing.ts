import { ref, computed } from 'vue'

export interface CloudPlan {
  provider: string
  name: string
  region: string
  cpu: number
  ram_gb: number
  storage_gb?: number
  bandwidth_tb?: number
  price_hourly: number
  price_monthly: number
  type: string
}

export interface PricingOptions {
  cpu?: number
  ramGb?: number
  providers?: string[]
  regions?: string[]
}

export function usePricing() {
  const plans = ref<CloudPlan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const config = useRuntimeConfig()

  const fetchPricing = async (options: PricingOptions = {}) => {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()

      if (options.cpu !== undefined) queryParams.append('cpu', options.cpu.toString())
      if (options.ramGb !== undefined) queryParams.append('ramGb', options.ramGb.toString())
      if (options.providers?.length) {
        options.providers.forEach((p) => queryParams.append('provider', p))
      }
      if (options.regions?.length) {
        options.regions.forEach((r) => queryParams.append('region', r))
      }

      // Utiliser la base API configurable (NUXT_PUBLIC_API_BASE)
      const base = config.public.apiBase?.replace(/\/$/, '') || ''
      const apiUrl = `${base}/pricing?${queryParams.toString()}`

      const response = await $fetch<{ plans: CloudPlan[] }>(apiUrl)
      plans.value = response.plans || []
    } catch (err) {
      console.error('Erreur API pricing:', err)
      
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          error.value = 'API backend non accessible. Vérifiez que le serveur API est démarré sur le port 3333.'
        } else if (err.message.includes('fetch')) {
          error.value = 'Erreur de connexion à l\'API. Vérifiez que l\'API backend est démarrée.'
        } else {
          error.value = `Erreur API: ${err.message}`
        }
      } else {
        error.value = 'Erreur lors du chargement des prix'
      }
    } finally {
      loading.value = false
    }
  }

  // Grouper les plans par fournisseur
  const plansByProvider = computed(() => {
    const grouped: Record<string, CloudPlan[]> = {}
    plans.value.forEach(plan => {
      if (!grouped[plan.provider]) {
        grouped[plan.provider] = []
      }
      grouped[plan.provider]?.push(plan)
    })
    return grouped
  })

  // Trouver le meilleur plan pour chaque fournisseur
  const bestPlansByProvider = computed(() => {
    const bestPlans: Record<string, CloudPlan> = {}
    
    Object.entries(plansByProvider.value).forEach(([provider, providerPlans]) => {
      if (providerPlans && providerPlans.length > 0) {
        // Trier par prix mensuel croissant
        const sorted = [...providerPlans].sort((a, b) => a.price_monthly - b.price_monthly)
        const bestPlan = sorted[0]
        if (bestPlan) {
          bestPlans[provider] = bestPlan
        }
      }
    })
    
    return bestPlans
  })

  // Calculer les économies par rapport à un prix de référence
  const calculateSavings = (plan: CloudPlan, referencePrice: number) => {
    const savings = referencePrice - plan.price_monthly
    const percentage = referencePrice > 0 ? (savings / referencePrice) * 100 : 0
    return { savings, percentage }
  }

  return {
    plans,
    loading,
    error,
    fetchPricing,
    plansByProvider,
    bestPlansByProvider,
    calculateSavings
  }
}
