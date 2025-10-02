import env from '#start/env'
import CloudPlan from '#prices/models/cloud_plan'

interface LlmResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  done_reason: string
  context: string[]
  total_duration: number
  load_duration: number
  prompt_eval_count: number
  prompt_eval_duration: number
  eval_count: number
  eval_duration: number
}

export default class LlmService {
  public async getBestPlans(plans: CloudPlan[], customPrompt?: string) {
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

    // Pour chaque provider, demander au LLM de choisir le meilleur
    for (const [provider, providerPlans] of Object.entries(byProvider)) {
      const plansList = providerPlans
        .map(
          (p, i) =>
            `${i + 1}. {"id": "${p.id}", "provider": "${p.provider}", "name": "${p.name}", "cpu": ${p.cpu}, "ram_gb": ${p.ramGb}, "price_monthly": ${p.priceMonthly}}`
        )
        .join('\n')

      const llmPrompt = `Tu es un assistant spécialisé dans l'analyse de serveurs cloud.

      Voici les serveurs ${provider} disponibles :

      ${plansList}

      ${customPrompt || 'Choisis le meilleur serveur selon le rapport coût/performance.'}
      Retourne uniquement l'objet JSON complet et valide avec l'option sélectionnée.`

      const llm = env.get('LLM_ENDPOINT')
      const response = (await fetch(llm, {
        method: 'POST',
        body: JSON.stringify({
          model: 'gemma:2b',
          prompt: llmPrompt,
          stream: false,
        }),
      }).then((res) => res.json())) as LlmResponse

      const text = response.response.trim()
      const match = text.match(/\{[\s\S]*?\}/)

      if (match) {
        const selectedPlan = JSON.parse(match[0])
        const plan = providerPlans.find((p) => p.id === selectedPlan.id)
        if (plan) {
          selected.push(plan)
        }
      }
    }

    return selected
  }
}
