
import { OrderModel } from '../models/order.model.js'

import type { IOrderRepository } from '../repositories/order.repository.js'

export class OrderService {
  constructor(
    private readonly order: IOrderRepository,
  ) {}

  async statusList() {
    const order = await this.order.statusList()

    return {
      order: order.map(OrderModel.toParamResponse),
    }
  }
}
