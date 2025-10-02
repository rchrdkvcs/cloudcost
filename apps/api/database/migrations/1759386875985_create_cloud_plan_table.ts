import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cloud_plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('provider')
      table.string('name')
      table.string('region')
      table.string('operating_system').defaultTo('Linux')
      table.integer('cpu')
      table.float('ram_gb')
      table.float('storage_gb').nullable()
      table.float('bandwidth_tb').nullable()
      table.float('price_hourly')
      table.float('price_monthly')
      table.string('type')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
