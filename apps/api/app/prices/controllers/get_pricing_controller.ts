import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import PricingService from '#prices/services/pricing_service'
import LlmService from '../../llm/services/llm_service.js'

@inject()
export default class GetPricingController {
  constructor(
    protected pricingService: PricingService,
    protected llmService: LlmService
  ) {}

  async execute({ request, response }: HttpContext) {
    const toArray = (value: unknown): string[] | undefined => {
      if (value === undefined || value === null) return undefined
      return Array.isArray(value) ? (value as string[]) : [String(value)]
    }

    const cpuRaw = request.input('cpu')
    const ramGbRaw = request.input('ramGb')
    const providers = toArray(request.input('provider'))
    const regions = toArray(request.input('region'))
    const customPrompt = request.input('customPrompt') as string | undefined

    const cpu = Number(cpuRaw)
    const ramGb = Number(ramGbRaw)

    if (!Number.isFinite(cpu) || !Number.isFinite(ramGb)) {
      return response.status(422).send({
        error: 'Invalid query: cpu and ramGb must be numbers',
      })
    }

    const plans = await this.pricingService.getPlans({
      providers,
      regions,
      minCpu: cpu,
      maxCpu: cpu,
      minRam: ramGb,
      maxRam: ramGb,
    })

    const llmRecomendation = await this.llmService.getBestPlans(plans, customPrompt)

    return { llmRecomendation, plans }
  }
}
