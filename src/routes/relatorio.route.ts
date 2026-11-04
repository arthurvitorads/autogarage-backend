import type { ApiRouter } from '../http/api-router.js'
import type { RelatorioController } from '../controllers/relatorio.controller.js'

export class RelatorioRoutes {
  constructor(private readonly controller: RelatorioController) {}

  register(router: ApiRouter) {
    router.get('/relatorios/tempos-servicos', this.controller.tempos)
    router.get('/relatorios/vendas', this.controller.vendas)
  }
}
