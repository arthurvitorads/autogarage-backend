import type { ApiRouter } from '../http/api-router.js'
import type { ServiceCategoryController } from '../controllers/service-category.controller.js'

export class ServiceCategoryRoutes {
  constructor(private readonly controller: ServiceCategoryController) {}

  register(router: ApiRouter) {
    router.post('/categoriasServico/listar', this.controller.list, [['CADASTROS', 2]], 200)
    router.post('/categoriasServico', this.controller.create, [['CADASTROS', 1]])
    router.post('/categoriasServico/atualizar', this.controller.update, [['CADASTROS', 1]], 200)
  }
}
