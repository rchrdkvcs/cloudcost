import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { ulid } from 'ulid'

export default class CloudPlan extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare provider: string

  @column()
  declare name: string

  @column()
  declare region: string

  @column({ columnName: 'operating_system', serializeAs: 'operating_system' })
  declare operatingSystem: string

  @column()
  declare cpu: number

  @column({ columnName: 'ram_gb', serializeAs: 'ram_gb' })
  declare ramGb: number

  @column({ columnName: 'storage_gb', serializeAs: 'storage_gb' })
  declare storageGb: number | null

  @column({ columnName: 'bandwidth_tb', serializeAs: 'bandwidth_tb' })
  declare bandwidthTb: number | null

  @column({ columnName: 'price_hourly', serializeAs: 'price_hourly' })
  declare priceHourly: number

  @column({ columnName: 'price_monthly', serializeAs: 'price_monthly' })
  declare priceMonthly: number

  @column()
  declare type: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateId(cloudPlan: CloudPlan) {
    cloudPlan.id = ulid()
  }
}
