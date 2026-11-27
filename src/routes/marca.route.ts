import type { ApiRouter } from '../http/api-router.js'
import type { MarcaController } from '../controllers/marca.controller.js'

export class MarcaRoutes {
  constructor(private readonly controller: MarcaController) {}

  register(router: ApiRouter) {
    router.post('/marcas/view', this.controller.view, [['CADASTROS', 2]], 200)
    router.manut('/marcas/manut', 'cn_marca', this.controller.manutInc, this.controller.manutAlt, [
      ['CADASTROS', 1],
    ])
  }
}
