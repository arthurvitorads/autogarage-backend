import type { ApiRouter } from '../http/api-router.js'
import type { CatalogController } from '../controllers/catalog.controller.js'

export class CatalogRoutes {
  constructor(private readonly controller: CatalogController) {}

  register(router: ApiRouter) {
    router.post('/produtos/listar', this.controller.products, [['CADASTROS', 2]], 200)
    router.post('/produtos', this.controller.createProduct, [['CADASTROS', 1]])
    router.post('/produtos/atualizar', this.controller.updateProduct, [['CADASTROS', 1]], 200)
    router.post('/servicos/listar', this.controller.services, [['CADASTROS', 2]], 200)
    router.post('/servicos', this.controller.createService, [['CADASTROS', 1]])
    router.post('/servicos/atualizar', this.controller.updateService, [['CADASTROS', 1]], 200)
    router.post('/cadastrosAuxiliares/listar', this.controller.auxiliaries, [['CADASTROS', 2]], 200)
    router.post('/paramCatalogo', this.controller.itemOptions, [['ORDEM_SERVICO', 1], ['FATURAMENTO', 1]], 200)
    router.post('/cadastrosAuxiliares', this.controller.createAuxiliary, [['CADASTROS', 1]])
    router.post('/cadastrosAuxiliares/atualizar', this.controller.updateAuxiliary, [['CADASTROS', 1]], 200)
  }
}
