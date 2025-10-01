import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import PricingService from '#prices/services/pricing_service'

@inject()
export default class GetPricingController {
  constructor(protected pricingService: PricingService) {}

  async execute({}: HttpContext) {
    return await this.pricingService.fetchAll({
      minRam: 8,
      maxRam: 8,
      operatingSystem: 'Linux',
    })
  }
}
