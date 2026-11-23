import type { FastifyRequest } from 'fastify'
import type { ProductService } from '../services/product.service.js'
import { ProductValidator } from '../validators/product.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class ProductController {
  constructor(private readonly service: ProductService) {}

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.list(page, limit, search)
  }

  create = (request: FastifyRequest) => this.service.create(ProductValidator.parse(request.body))

  update = (request: FastifyRequest) =>
    this.service.update(
      DataValidator.code(DataValidator.object(request.body).cn_produto),
      ProductValidator.parse(request.body),
    )
}
