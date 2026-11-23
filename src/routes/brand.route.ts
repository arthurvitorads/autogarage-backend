import type { ApiRouter } from '../http/api-router.js'
import type { BrandController } from '../controllers/brand.controller.js'

export class BrandRoutes {
  constructor(private readonly controller: BrandController) {}

  register(router: ApiRouter) {
    router.post('/marcas/list', this.controller.list, [['CADASTROS', 2]], 200)
    router.post('/marcas', this.controller.create, [['CADASTROS', 1]])
    router.post('/marcas/update', this.controller.update, [['CADASTROS', 1]], 200)
  }
}
