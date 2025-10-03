import CloudPlan from '#prices/models/cloud_plan'

export default class LlmService {
  public async getBestPlans(plans: CloudPlan[], _customPrompt?: string) {
    // Calculer un score pour tous les plans : (CPU + RAM) / prix
    const scored = plans.map((plan) => ({
      plan,
      score: (plan.cpu + plan.ramGb) / plan.priceMonthly,
    }))

    // Trier par score décroissant
    scored.sort((a, b) => b.score - a.score)

    // Retourner les 4 meilleurs plans (ou moins si pas assez de plans)
    return scored.slice(0, 4).map((item) => item.plan)
  }
}
