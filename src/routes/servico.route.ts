import type { ApiRouter } from '../http/api-router.js'
import type { ServicoController } from '../controllers/servico.controller.js'

export class ServicoRoutes {
  constructor(private readonly controller: ServicoController) {}

  register(router: ApiRouter) {
    router.post('/servicos/view', this.controller.view, [['CADASTROS', 2]], 200)
    router.manut(
      '/servicos/manut',
      'cn_servico',
      this.controller.manutInc,
      this.controller.manutAlt,
      [['CADASTROS', 1]],
    )
  }
}
