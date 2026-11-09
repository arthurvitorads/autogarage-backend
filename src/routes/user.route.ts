import type { UserController } from '../controllers/user.controller.js'
import type { ApiRouter } from '../http/api-router.js'

export class UserRoutes {
  constructor(private readonly controller: UserController) {}

  register(router: ApiRouter) {
    router.post('/usuarios/listar', this.controller.list, 200)
    router.post('/usuarios', this.controller.create)
    router.post('/usuarios/atualizar', this.controller.update, 200)
  }
}
