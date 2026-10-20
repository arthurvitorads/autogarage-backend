import type { UserController } from '../controllers/user.controller.js'
import type { ApiRouter } from '../http/api-router.js'

export class UserRoutes {
  constructor(private readonly controller: UserController) {}

  register(router: ApiRouter) {
    router.get('/usuarios', this.controller.list)
    router.post('/usuarios', this.controller.create)
    router.post('/usuarios/:id', this.controller.update, 200)
  }
}
