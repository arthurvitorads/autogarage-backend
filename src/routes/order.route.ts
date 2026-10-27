import type { OrderController } from '../controllers/order.controller.js'

import type { ApiRouter } from '../http/api-router.js'

export class OrderRoutes {
  constructor(private readonly controller: OrderController) {}

  register(router: ApiRouter) {
    router.get('/ordemStatus', this.controller.statusList)
  }
}
