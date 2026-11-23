import type { ApiRouter } from '../http/api-router.js'
import type { CatalogController } from '../controllers/catalog.controller.js'

export class CatalogRoutes {
  constructor(private readonly controller: CatalogController) {}

  register(router: ApiRouter) {
    router.post(
      '/paramCatalogo',
      this.controller.itemOptions,
      [
        ['ORDEM_SERVICO', 1],
        ['FATURAMENTO', 1],
      ],
      200,
    )
  }
}
