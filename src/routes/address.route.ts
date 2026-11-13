import type { ApiRouter } from '../http/api-router.js'
import type { AddressController } from '../controllers/address.controller.js'

export class AddressRoutes {
  constructor(private readonly controller: AddressController) {}

  register(router: ApiRouter) {
    router.post('/end/estados', this.controller.listStates, [['CADASTROS', 2]], 200)
  }
}
