import { OrderModel } from '../models/order.model.js'
import { ApiError } from '../interfaces/error.js'
import type { IOrderRepository } from '../repositories/order.repository.js'
import type { IManutOrder, IManutStatusOrder, IManutItemOrder } from '../interfaces/order.js'

export class OrderService {
  constructor(private readonly order: IOrderRepository) {}

  async statusList() {
    return { order: (await this.order.statusList()).map(OrderModel.toParamResponse) }
  }

  async statuses() {
    return { status: (await this.order.statusList()).map(OrderModel.status) }
  }

  async saveStatus(id: bigint | null, values: IManutStatusOrder) {
    return OrderModel.status(await this.order.saveStatus(id, values))
  }

  async list(page: number, limit: number, search: string) {
    const { ordens, total } = await this.order.list(page, limit, search)
    return {
      ordens: ordens.map(OrderModel.toResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      }
    }
  }

  async findById(id: bigint) {
    const ordem = await this.order.findById(id)
    if (!ordem)
      throw new ApiError(404, 'Ordem de serviço não encontrada.')
    return OrderModel.toResponse(ordem)
  }

  async saveOrder(id: bigint | null, values: IManutOrder) {
    return OrderModel.toResponse(await this.order.saveOrder(id, values))
  }

  async saveItem(ordemId: bigint, itemId: bigint | null, values: IManutItemOrder) {
    return OrderModel.item(await this.order.saveItem(ordemId, itemId, values))
  }

  removeItem(ordemId: bigint, itemId: bigint) {
    return this.order.removeItem(ordemId, itemId)
  }
}
