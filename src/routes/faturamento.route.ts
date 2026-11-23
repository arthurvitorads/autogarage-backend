import type { ApiRouter } from '../http/api-router.js'
import type { FaturamentoController } from '../controllers/faturamento.controller.js'

export class FaturamentoRoutes {
  constructor(private readonly controller: FaturamentoController) {}

  register(router: ApiRouter) {
    router.post('/faturamento/vendas/list', this.controller.list, [['FATURAMENTO', 2]], 200)
    router.post('/faturamento/vendas/details', this.controller.findById, [['FATURAMENTO', 2]], 200)
    router.post('/faturamento/vendas', this.controller.create, [['FATURAMENTO', 1]])
  }
}
