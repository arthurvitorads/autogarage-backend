import type { ApiRouter } from '../http/api-router.js'
import type { FaturamentoController } from '../controllers/faturamento.controller.js'

export class FaturamentoRoutes {
  constructor(private readonly controller: FaturamentoController) {}

  register(router: ApiRouter) {
    router.post('/faturamento/vendas/view', this.controller.view, [['FATURAMENTO', 2]], 200)
    router.post('/faturamento/vendas/detalhar', this.controller.detalhar, [['FATURAMENTO', 2]], 200)
    router.post('/faturamento/vendas/manut', this.controller.manutInc, [['FATURAMENTO', 1]])
  }
}
