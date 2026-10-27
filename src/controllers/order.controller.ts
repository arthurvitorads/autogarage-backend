import type { OrderService } from '../services/order.service.js'

export class OrderController {
  constructor(private readonly service: OrderService) {}

  statusList = () => {
    return this.service.statusList()
  }
}
