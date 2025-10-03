import type { HttpContext } from '@adonisjs/core/http'

export default class LogoutController {
  async execute({ auth, response }: HttpContext) {
    await auth.use('api').invalidateToken()
    return response.ok({ message: 'Logged out successfully' })
  }
}