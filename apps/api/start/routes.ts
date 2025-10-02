/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const GetPricingController = () => import('#prices/controllers/get_pricing_controller')
const GetHealthController = () => import('#health/controllers/get_health_controller')

router.get('/', async () => {
  return { message: 'hello world' }
})

router.get('/health', [GetHealthController, 'execute']).as('health')
router.get('/pricing', [GetPricingController, 'execute']).as('pricing')
