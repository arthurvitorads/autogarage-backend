import type { UsuarioController } from '../controllers/usuario.controller.js'
import type { ApiRouter } from '../http/api-router.js'

export class UsuarioRoutes {
  constructor(private readonly controller: UsuarioController) {}

  register(router: ApiRouter) {
    router.post('/usuarios/view', this.controller.view, [['ADMINISTRACAO', 2]], 200)
    router.manut(
      '/usuarios/manut',
      'cn_usuario',
      this.controller.manutInc,
      this.controller.manutAlt,
      [['ADMINISTRACAO', 1]],
    )
  }
}
