import type { ApiRouter } from '../http/api-router.js'
import type { CatalogController } from '../controllers/catalog.controller.js'

export class CatalogRoutes {
  constructor(private readonly controller: CatalogController) {}

  register(router: ApiRouter) {
    router.post('/produtos/listar', this.controller.products, 200)
    router.post('/produtos', this.controller.createProduct)
    router.post('/produtos/atualizar', this.controller.updateProduct, 200)
    router.post('/servicos/listar', this.controller.services, 200)
    router.post('/servicos', this.controller.createService)
    router.post('/servicos/atualizar', this.controller.updateService, 200)
    router.post('/cadastrosAuxiliares/listar', this.controller.auxiliaries, 200)
    router.post('/cadastrosAuxiliares', this.controller.createAuxiliary)
    router.post('/cadastrosAuxiliares/atualizar', this.controller.updateAuxiliary, 200)
  }
}
