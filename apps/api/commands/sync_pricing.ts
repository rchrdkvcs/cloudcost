import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import PricingService, { type CloudProvider } from '#prices/services/pricing_service'
import CloudPlan from '#prices/models/cloud_plan'
import db from '@adonisjs/lucid/services/db'

export default class SyncPricing extends BaseCommand {
  static commandName = 'sync:pricing'
  static description = 'Synchronize cloud pricing data from external APIs to database'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.array({ description: 'Specific providers to sync (AWS, DigitalOcean, Hetzner, etc.)' })
  declare providers: CloudProvider[]

  @flags.boolean({ description: 'Clear existing data before syncing', alias: 'c' })
  declare clear: boolean

  async run() {
    const pricingService = new PricingService()

    if (this.clear) {
      this.logger.info('Clearing existing pricing data...')
      await CloudPlan.query().delete()
      this.logger.success('Existing data cleared')
    }

    this.logger.info('Fetching pricing data from external APIs...')

    const plans = await pricingService.fetchAll({
      providers: this.providers,
    })

    this.logger.info(`Found ${plans.length} plans`)

    if (plans.length === 0) {
      this.logger.warning('No plans to sync')
      return
    }

    this.logger.info('Saving to database...')

    // Utiliser une transaction et des insertions par batch pour de meilleures performances
    const batchSize = 100
    let inserted = 0

    await db.transaction(async (trx) => {
      for (let i = 0; i < plans.length; i += batchSize) {
        const batch = plans.slice(i, i + batchSize)

        await CloudPlan.createMany(
          batch.map((plan) => ({
            provider: plan.provider,
            name: plan.name,
            region: plan.region,
            operatingSystem: plan.operating_system || 'Linux',
            cpu: plan.cpu,
            ramGb: plan.ram_gb,
            storageGb: plan.storage_gb ?? null,
            bandwidthTb: plan.bandwidth_tb ?? null,
            priceHourly: plan.price_hourly,
            priceMonthly: plan.price_monthly,
            type: plan.type,
          })),
          { client: trx }
        )

        inserted += batch.length
        this.logger.info(`Progress: ${inserted}/${plans.length} plans inserted`)
      }
    })

    this.logger.success(`Successfully synced ${inserted} pricing plans`)
  }
}