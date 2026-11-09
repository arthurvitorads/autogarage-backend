import type { ApiRouter } from '../http/api-router.js'
import type { FaturamentoController } from '../controllers/faturamento.controller.js'

export class FaturamentoRoutes {
  constructor(private readonly controller: FaturamentoController) {}

  register(router: ApiRouter) {
    router.post('/faturamento/vendas/listar', this.controller.list, [['FATURAMENTO', 2]], 200)
    router.post('/faturamento/vendas/detalhar', this.controller.findById, [['FATURAMENTO', 2]], 200)
    router.post('/faturamento/vendas', this.controller.create, [['FATURAMENTO', 1]])
  }
}
