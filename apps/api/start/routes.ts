/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const GetHealthController = () => import('#health/controllers/get_health_controller')

router.get('/health', [GetHealthController, 'execute']).as('health')
