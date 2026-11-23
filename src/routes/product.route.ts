import type { ApiRouter } from '../http/api-router.js'
import type { ProductController } from '../controllers/product.controller.js'

export class ProductRoutes {
  constructor(private readonly controller: ProductController) {}

  register(router: ApiRouter) {
    router.post('/produtos/listar', this.controller.list, [['CADASTROS', 2]], 200)
    router.post('/produtos', this.controller.create, [['CADASTROS', 1]])
    router.post('/produtos/atualizar', this.controller.update, [['CADASTROS', 1]], 200)
  }
}
