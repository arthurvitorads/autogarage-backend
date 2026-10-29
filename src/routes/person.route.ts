import type { ApiRouter } from '../http/api-router.js'

import type { PersonController } from '../controllers/person.controller.js'

export class PersonRoutes {
  constructor(private readonly controller: PersonController) {}

  register(router: ApiRouter) {
    router.get('/pessoa', this.controller.list)
    router.get('/paramPessoa', this.controller.paramList)
    router.post('/pessoa', this.controller.create)
    router.post('/pessoa/:id', this.controller.update, 200)
  }
}
