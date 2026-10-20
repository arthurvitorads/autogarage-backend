import type { PerfilController } from '../controllers/perfil.controller.js'
import type { ApiRouter } from '../http/api-router.js'

export class PerfilRoutes {
  constructor(private readonly controller: PerfilController) {}

  register(router: ApiRouter) {
    router.get('/perfil', this.controller.list)
    router.post('/perfil', this.controller.create)
    router.post('/perfil/:id', this.controller.update, 200)
  }
}
