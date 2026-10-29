import type { ApiRouter } from '../http/api-router.js'
import type { CatalogController } from '../controllers/catalog.controller.js'

export class CatalogRoutes {
  constructor(private readonly controller: CatalogController) {}

  register(router: ApiRouter) {
    router.get('/produtos', this.controller.products)
    router.post('/produtos', this.controller.createProduct)
    router.post('/produtos/:id', this.controller.updateProduct, 200)
    router.get('/servicos', this.controller.services)
    router.post('/servicos', this.controller.createService)
    router.post('/servicos/:id', this.controller.updateService, 200)
    router.get('/cadastrosAuxiliares', this.controller.auxiliaries)
    router.post('/cadastrosAuxiliares', this.controller.createAuxiliary)
    router.post('/cadastrosAuxiliares/:id', this.controller.updateAuxiliary, 200)
  }
}
