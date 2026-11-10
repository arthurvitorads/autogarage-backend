import { ApiResponse } from '../http/api-response.js'
import { OrderModel } from '../models/order.model.js'
import { ApiError } from '../interfaces/error.js'
import type { IOrderRepository } from '../repositories/order.repository.js'
import type {
  IManutOrder,
  IManutClassificacaoOrder,
  IManutItemOrder,
  IFiltroOrder,
  IMovimentoOrder,
} from '../interfaces/order.js'

export class OrderService {
  constructor(private readonly order: IOrderRepository) {}

  async classificationList() {
    return (await this.order.classificationList()).map(OrderModel.toParamResponse)
  }

  async classifications() {
    return (await this.order.classificationList()).map(OrderModel.classification)
  }

  async saveClassification(id: bigint | null, values: IManutClassificacaoOrder) {
    return OrderModel.classification(await this.order.saveClassification(id, values))
  }

  async list(page: number, limit: number, search: string, filters: IFiltroOrder = {}) {
    const { ordens, total } = await this.order.list(page, limit, search, filters)
    return ApiResponse.page({
      dados: ordens.map(OrderModel.toResponse),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async findById(id: bigint) {
    const ordem = await this.order.findById(id)
    if (!ordem) throw new ApiError(404, 'Ordem de serviço não encontrada.')
    return OrderModel.toResponse(ordem)
  }

  async billableOrders(page: number, limit: number) {
    const { response } = await this.list(page, limit, '', { billable: true })
    const { dados: orders, pagination } = response
    return ApiResponse.page({
      pagination,
      dados: orders.map(({ cn_ordem_servico, cn_pessoa, nu_numero, an_cliente, ca_status, itens }) => ({
        cn_ordem_servico,
        cn_pessoa,
        nu_numero,
        an_cliente,
        ca_status,
        itens: itens.map(({ ca_tipo, an_descr, qt_quantidade, vl_unitario, vl_total }) => ({
          ca_tipo,
          an_descr,
          qt_quantidade,
          vl_unitario,
          vl_total,
        })),
      })),
    })
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

  async timeItem(ordemId: bigint, itemId: bigint, acao: 'INICIAR' | 'PAUSAR' | 'FINALIZAR') {
    return OrderModel.item(await this.order.timeItem(ordemId, itemId, acao))
  }
}
