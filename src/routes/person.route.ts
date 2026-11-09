import type { ApiRouter } from '../http/api-router.js'

import type { PersonController } from '../controllers/person.controller.js'

export class PersonRoutes {
  constructor(private readonly controller: PersonController) {}

  register(router: ApiRouter) {
    router.post('/pessoa/listar', this.controller.list, 200)
    router.post('/pessoa/detalhar', this.controller.findById, 200)
    router.post('/paramPessoa', this.controller.paramList, 200)
    router.post('/pessoa', this.controller.create)
    router.post('/pessoa/atualizar', this.controller.update, 200)
  }
}
