import type { HttpContext } from '@adonisjs/core/http'

export default class GetHealthController {
  execute({}: HttpContext) {
    return { hello: 'world' }
  }
}
