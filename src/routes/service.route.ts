import type { ApiRouter } from '../http/api-router.js'
import type { ServiceController } from '../controllers/service.controller.js'

export class ServiceRoutes {
  constructor(private readonly controller: ServiceController) {}

  register(router: ApiRouter) {
    router.post('/servicos/listar', this.controller.list, [['CADASTROS', 2]], 200)
    router.post('/servicos', this.controller.create, [['CADASTROS', 1]])
    router.post('/servicos/atualizar', this.controller.update, [['CADASTROS', 1]], 200)
  }
}
