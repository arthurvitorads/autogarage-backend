import { OrderModel } from '../models/order.model.js'
import { ApiError } from '../interfaces/error.js'
import type { IOrderRepository } from '../repositories/order.repository.js'
import type { IManutOrder, IManutClassificacaoOrder, IManutItemOrder, IFiltroOrder, IMovimentoOrder } from '../interfaces/order.js'

export class OrderService {
  constructor(private readonly order: IOrderRepository) {}

  async classificationList() {
    return { order: (await this.order.classificationList()).map(OrderModel.toParamResponse) }
  }

  async classifications() {
    return { classificacoes: (await this.order.classificationList()).map(OrderModel.classification) }
  }

  async saveClassification(id: bigint | null, values: IManutClassificacaoOrder) {
    return OrderModel.classification(await this.order.saveClassification(id, values))
  }

  async list(page: number, limit: number, search: string, filters: IFiltroOrder = {}) {
    const { ordens, total } = await this.order.list(page, limit, search, filters)
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

  async move(id: bigint, values: IMovimentoOrder) {
    return OrderModel.toResponse(await this.order.move(id, values))
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
