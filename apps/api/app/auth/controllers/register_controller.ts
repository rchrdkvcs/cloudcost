import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import vine from '@vinejs/vine'

export default class RegisterController {
  static validator = vine.compile(
    vine.object({
      fullName: vine.string().trim().minLength(2).optional(),
      email: vine.string().trim().email().normalizeEmail(),
      password: vine.string().minLength(8).maxLength(64),
    })
  )

  async execute({ request, response }: HttpContext) {
    const data = await request.validateUsing(RegisterController.validator)

    const user = await User.create(data)
    const token = await User.accessTokens.create(user)

    return response.created({
      message: 'User registered successfully',
      token: token.value!.release(),
      user,
    })
  }
}