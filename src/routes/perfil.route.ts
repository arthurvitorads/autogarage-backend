import type { PerfilController } from '../controllers/perfil.controller.js'
import type { ApiRouter } from '../http/api-router.js'

export class PerfilRoutes {
  constructor(private readonly controller: PerfilController) {}

  register(router: ApiRouter) {
    router.post('/perfil/listar', this.controller.list, 200)
    router.post('/paramPerfil', this.controller.paramList, 200)
    router.post('/perfil', this.controller.create)
    router.post('/perfil/atualizar', this.controller.update, 200)
  }
}
