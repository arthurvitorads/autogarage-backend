import type { PerfilController } from '../controllers/perfil.controller.js'
import type { ApiRouter } from '../http/api-router.js'

export class PerfilRoutes {
  constructor(private readonly controller: PerfilController) {}

  register(router: ApiRouter) {
    router.post('/perfil/view', this.controller.view, [['ADMINISTRACAO', 2]], 200)
    router.post('/perfil/domain', this.controller.domain, [['ADMINISTRACAO', 2]], 200)
    router.manut('/perfil/manut', 'cn_perfil', this.controller.manutInc, this.controller.manutAlt, [
      ['ADMINISTRACAO', 1],
    ])
    router.post(
      '/perfil/acessos/consultar',
      this.controller.consultarAcessos,
      [['ADMINISTRACAO', 2]],
      200,
    )
    router.post('/perfil/acessos/manut', this.controller.manutAcessos, [['ADMINISTRACAO', 1]], 200)
  }
}
