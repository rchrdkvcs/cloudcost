import CloudPlan from '#prices/models/cloud_plan'

export default class LlmService {
  public async getBestPlans(plans: CloudPlan[], _customPrompt?: string) {
    // Grouper par provider
    const byProvider = plans.reduce(
      (acc, plan) => {
        if (!acc[plan.provider]) {
          acc[plan.provider] = []
        }
        acc[plan.provider].push(plan)
        return acc
      },
      {} as Record<string, CloudPlan[]>
    )

    const selected: CloudPlan[] = []

    // Pour chaque provider, sélectionner le meilleur rapport qualité/prix
    for (const providerPlans of Object.values(byProvider)) {
      // Calculer un score pour chaque plan : (CPU + RAM) / prix
      const scored = providerPlans.map((plan) => ({
        plan,
        score: (plan.cpu + plan.ramGb) / plan.priceMonthly,
      }))

      // Trier par score décroissant et prendre le meilleur
      scored.sort((a, b) => b.score - a.score)

      if (scored[0]) {
        selected.push(scored[0].plan)
      }
    }

    return selected
  }
}
