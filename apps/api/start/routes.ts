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

router.get('/pricing', [GetPricingController, 'execute']).as('pricing')
