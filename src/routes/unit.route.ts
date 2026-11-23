import type { ApiRouter } from '../http/api-router.js'
import type { UnitController } from '../controllers/unit.controller.js'

export class UnitRoutes {
  constructor(private readonly controller: UnitController) {}

  register(router: ApiRouter) {
    router.post('/unidades/listar', this.controller.list, [['CADASTROS', 2]], 200)
    router.post('/unidades', this.controller.create, [['CADASTROS', 1]])
    router.post('/unidades/atualizar', this.controller.update, [['CADASTROS', 1]], 200)
  }
}
