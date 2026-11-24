import type { ApiRouter } from '../http/api-router.js'
import type { EnderecoController } from '../controllers/endereco.controller.js'

export class EnderecoRoutes {
  constructor(private readonly controller: EnderecoController) {}

  register(router: ApiRouter) {
    router.post('/end/estados/domain', this.controller.domain, [['CADASTROS', 2]], 200)
  }
}
