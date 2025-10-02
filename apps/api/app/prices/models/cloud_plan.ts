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

  @column()
  declare operatingSystem: string

  @column()
  declare cpu: number

  @column()
  declare ramGb: number

  @column()
  declare storageGb: number | null

  @column()
  declare bandwidthTb: number | null

  @column()
  declare priceHourly: number

  @column()
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
