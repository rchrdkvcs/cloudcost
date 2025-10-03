import CloudPlan from '#prices/models/cloud_plan'

export default class LlmService {
  public async getBestPlans(plans: CloudPlan[], _customPrompt?: string) {
    // Grouper les plans par provider
    const plansByProvider = plans.reduce(
      (acc, plan) => {
        if (!acc[plan.provider]) {
          acc[plan.provider] = []
        }
        acc[plan.provider].push(plan)
        return acc
      },
      {} as Record<string, CloudPlan[]>
    )

    // Pour chaque provider, calculer un score et prendre le meilleur
    const bestPerProvider = Object.entries(plansByProvider).map(([_provider, providerPlans]) => {
      // Calculer un score pour chaque plan : (CPU + RAM) / prix
      const scored = providerPlans.map((plan) => ({
        plan,
        score: (plan.cpu + plan.ramGb) / plan.priceMonthly,
      }))

      // Trier par score décroissant et prendre le meilleur
      scored.sort((a, b) => b.score - a.score)

      return scored[0].plan
    })

    // Trier les meilleurs plans par score décroissant
    const finalScored = bestPerProvider.map((plan) => ({
      plan,
      score: (plan.cpu + plan.ramGb) / plan.priceMonthly,
    }))

    finalScored.sort((a, b) => b.score - a.score)

    return finalScored.map((item) => item.plan)
  }
}
