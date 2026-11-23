import type { ApiRouter } from '../http/api-router.js'
import type { ProductCategoryController } from '../controllers/product-category.controller.js'

export class ProductCategoryRoutes {
  constructor(private readonly controller: ProductCategoryController) {}

  register(router: ApiRouter) {
    router.post('/categoriasProduto/listar', this.controller.list, [['CADASTROS', 2]], 200)
    router.post('/categoriasProduto', this.controller.create, [['CADASTROS', 1]])
    router.post('/categoriasProduto/atualizar', this.controller.update, [['CADASTROS', 1]], 200)
  }
}
