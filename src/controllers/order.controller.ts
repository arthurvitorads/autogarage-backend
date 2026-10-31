import type { FastifyRequest } from 'fastify'
import type { OrderService } from '../services/order.service.js'
import { OrderValidator } from '../validators/order.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class OrderController {
  constructor(private readonly service: OrderService) {}

  classificationList = () => this.service.classificationList()

  classifications = () => this.service.classifications()

  createClassification = (request: FastifyRequest) => this.service.saveClassification(null, OrderValidator.classification(request.body))

  updateClassification = (request: FastifyRequest) => this.service.saveClassification(this.id(request), OrderValidator.classification(request.body))

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.query)
    return this.service.list(page, limit, search, OrderValidator.filters(request.query))
  }

  findById = (request: FastifyRequest) => this.service.findById(this.id(request))

  move = (request: FastifyRequest) => this.service.move(this.id(request), OrderValidator.movement(request.body))

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
