import type { FastifyRequest } from 'fastify'
import type { OrderService } from '../services/order.service.js'
import { OrderValidator } from '../validators/order.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class OrderController {
  constructor(private readonly service: OrderService) {}

  statusList = () => this.service.statusList()

  statuses = () => this.service.statuses()

  createStatus = (request: FastifyRequest) => this.service.saveStatus(null, OrderValidator.status(request.body))

  updateStatus = (request: FastifyRequest) => this.service.saveStatus(this.id(request), OrderValidator.status(request.body))

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.query)
    return this.service.list(page, limit, search)
  }

  findById = (request: FastifyRequest) => this.service.findById(this.id(request))

  create = (request: FastifyRequest) => this.service.saveOrder(null, OrderValidator.order(request.body))

  update = (request: FastifyRequest) => this.service.saveOrder(this.id(request), OrderValidator.order(request.body))

  createItem = (request: FastifyRequest) => this.service.saveItem(this.id(request), null, OrderValidator.item(request.body))

  updateItem = (request: FastifyRequest) => this.service.saveItem(this.id(request), this.itemId(request), OrderValidator.item(request.body))

  removeItem = (request: FastifyRequest) => this.service.removeItem(this.id(request), this.itemId(request))

  private id(request: FastifyRequest) {
    return DataValidator.id((request.params as {
      id: string
    }).id)
  }

  private itemId(request: FastifyRequest) {
    return DataValidator.id((request.params as {
      itemId: string
    }).itemId)
  }
}
