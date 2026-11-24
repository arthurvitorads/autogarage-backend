import type { ApiRouter } from '../http/api-router.js'
import type { ProdutoController } from '../controllers/produto.controller.js'

export class ProdutoRoutes {
  constructor(private readonly controller: ProdutoController) {}

  register(router: ApiRouter) {
    router.post('/produtos/view', this.controller.view, [['CADASTROS', 2]], 200)
    router.manut('/produtos/manut', 'cn_produto', this.controller.manutInc, this.controller.manutAlt, [['CADASTROS', 1]])
  }
}
