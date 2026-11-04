import type { ApiRouter } from '../http/api-router.js'
import type { FaturamentoController } from '../controllers/faturamento.controller.js'

export class FaturamentoRoutes {
  constructor(private readonly controller: FaturamentoController) {}

  register(router: ApiRouter) {
    router.get('/faturamento/vendas', this.controller.list)
    router.get('/faturamento/vendas/:id', this.controller.findById)
    router.post('/faturamento/vendas', this.controller.create)
  }
}
