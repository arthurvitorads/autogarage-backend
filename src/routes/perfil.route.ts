import type { PerfilController } from '../controllers/perfil.controller.js'
import type { ApiRouter } from '../http/api-router.js'

export class PerfilRoutes {
  constructor(private readonly controller: PerfilController) {}

  register(router: ApiRouter) {
    router.post('/perfil/listar', this.controller.list, [['ADMINISTRACAO', 2]], 200)
    router.post('/paramPerfil', this.controller.paramList, [['ADMINISTRACAO', 2]], 200)
    router.post('/perfil', this.controller.create, [['ADMINISTRACAO', 1]])
    router.post('/perfil/atualizar', this.controller.update, [['ADMINISTRACAO', 1]], 200)
    router.post('/perfil/acessos/consultar', this.controller.access, [['ADMINISTRACAO', 2]], 200)
    router.post('/perfil/acessos/atualizar', this.controller.saveAccess, [['ADMINISTRACAO', 1]], 200)
  }
}
