import type { ApiRouter } from '../http/api-router.js'
import type { RelatorioController } from '../controllers/relatorio.controller.js'

export class RelatorioRoutes {
  constructor(private readonly controller: RelatorioController) {}

  register(router: ApiRouter) {
    router.post('/relatorios/tempos-servicos', this.controller.tempos, 200)
    router.post('/relatorios/vendas', this.controller.vendas, 200)
  }
}
