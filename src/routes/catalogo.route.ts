import type { ApiRouter } from '../http/api-router.js'
import type { CatalogoController } from '../controllers/catalogo.controller.js'

export class CatalogoRoutes {
  constructor(private readonly controller: CatalogoController) {}

  register(router: ApiRouter) {
    router.post(
      '/catalogo/param',
      this.controller.param,
      [
        ['ORDEM_SERVICO', 1],
        ['FATURAMENTO', 1],
      ],
      200,
    )
  }
}
