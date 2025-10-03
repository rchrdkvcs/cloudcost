import type { HttpContext } from '@adonisjs/core/http'

export default class MeController {
  async execute({ auth, response }: HttpContext) {
    return response.ok({ user: auth.user })
  }
}