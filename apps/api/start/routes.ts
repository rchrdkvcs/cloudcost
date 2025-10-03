/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const GetPricingController = () => import('#prices/controllers/get_pricing_controller')
const GetHealthController = () => import('#health/controllers/get_health_controller')
const LoginController = () => import('#auth/controllers/login_controller')
const RegisterController = () => import('#auth/controllers/register_controller')
const LogoutController = () => import('#auth/controllers/logout_controller')
const MeController = () => import('#auth/controllers/me_controller')

router.get('/health', [GetHealthController, 'execute']).as('health')
router.get('/pricing', [GetPricingController, 'execute']).as('pricing')

// Auth routes
router
  .group(() => {
    router.post('/login', [LoginController, 'execute']).as('auth.login')
    router.post('/register', [RegisterController, 'execute']).as('auth.register')
    router
      .post('/logout', [LogoutController, 'execute'])
      .as('auth.logout')
      .use(middleware.auth({ guards: ['api'] }))
    router
      .get('/me', [MeController, 'execute'])
      .as('auth.me')
      .use(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/auth')
