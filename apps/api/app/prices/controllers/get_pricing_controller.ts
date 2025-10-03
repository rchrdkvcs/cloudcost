import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import PricingService from '#prices/services/pricing_service'
import vine from '@vinejs/vine'
import LlmService from '../../llm/services/llm_service.js'

@inject()
export default class GetPricingController {
  constructor(
    protected pricingService: PricingService,
    protected llmService: LlmService
  ) {}

  static validators = vine.compile(
    vine.object({
      provider: vine.array(vine.string()).optional(),
      region: vine.array(vine.string()).optional(),
      cpu: vine.number(),
      ramGb: vine.number(),
      customPrompt: vine.string().optional(),
    })
  )

  async execute({ request }: HttpContext) {
    const data = await request.validateUsing(GetPricingController.validators)

    const allPlans = await this.pricingService.getPlans({
      providers: data.provider,
      regions: data.region,
      minCpu: data.cpu,
      maxCpu: data.cpu,
      minRam: data.ramGb,
      maxRam: data.ramGb,
    })

    const llmRecomendation = await this.llmService.getBestPlans(allPlans, data.customPrompt)

    // Exclure les recommandations de la liste complète pour éviter les doublons
    const recommendationIds = new Set(llmRecomendation.map((plan) => plan.id))
    const plans = allPlans.filter((plan) => !recommendationIds.has(plan.id))

    // Convertir les modèles Lucid en objets JSON simples
    return {
      llmRecomendation: llmRecomendation.map((plan) => plan.serialize()),
      plans: plans.map((plan) => plan.serialize()),
    }
  }
}
