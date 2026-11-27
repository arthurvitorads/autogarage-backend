import type { ApiRouter } from '../http/api-router.js'
import type { CategoriaServicoController } from '../controllers/categoria-servico.controller.js'

export class CategoriaServicoRoutes {
  constructor(private readonly controller: CategoriaServicoController) {}

  register(router: ApiRouter) {
    router.post('/categoriasServico/view', this.controller.view, [['CADASTROS', 2]], 200)
    router.manut(
      '/categoriasServico/manut',
      'cn_categoria_servico',
      this.controller.manutInc,
      this.controller.manutAlt,
      [['CADASTROS', 1]],
    )
  }
}
