import type { ApiRouter } from '../http/api-router.js'
import type { UnidadeController } from '../controllers/unidade.controller.js'

export class UnidadeRoutes {
  constructor(private readonly controller: UnidadeController) {}

  register(router: ApiRouter) {
    router.post('/unidades/view', this.controller.view, [['CADASTROS', 2]], 200)
    router.manut('/unidades/manut', 'cn_unidade', this.controller.manutInc, this.controller.manutAlt, [['CADASTROS', 1]])
  }
}
