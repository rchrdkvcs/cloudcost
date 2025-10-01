import router from '@adonisjs/core/services/router'

const LoginController = () => import('#auth/controllers/login_controller')

router.get('/auth/login', [LoginController, 'execute']).as('auth.login')
