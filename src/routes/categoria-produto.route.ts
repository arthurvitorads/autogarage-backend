import type { ApiRouter } from '../http/api-router.js'
import type { CategoriaProdutoController } from '../controllers/categoria-produto.controller.js'

export class CategoriaProdutoRoutes {
  constructor(private readonly controller: CategoriaProdutoController) {}

  register(router: ApiRouter) {
    router.post('/categoriasProduto/view', this.controller.view, [['CADASTROS', 2]], 200)
    router.manut('/categoriasProduto/manut', 'cn_categoria_produto', this.controller.manutInc, this.controller.manutAlt, [['CADASTROS', 1]])
  }
}
