import type { UserController } from '../controllers/user.controller.js'
import type { ApiRouter } from '../http/api-router.js'

export class UserRoutes {
  constructor(private readonly controller: UserController) {}

  register(router: ApiRouter) {
    router.post('/usuarios/listar', this.controller.list, [['ADMINISTRACAO', 2]], 200)
    router.post('/usuarios', this.controller.create, [['ADMINISTRACAO', 1]])
    router.post('/usuarios/atualizar', this.controller.update, [['ADMINISTRACAO', 1]], 200)
  }
}
