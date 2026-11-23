import type { FastifyRequest } from 'fastify'
import type { ProductCategoryService } from '../services/product-category.service.js'
import { ProductCategoryValidator } from '../validators/product-category.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class ProductCategoryController {
  constructor(private readonly service: ProductCategoryService) {}

  list = () => this.service.list()

  create = (request: FastifyRequest) =>
    this.service.create(ProductCategoryValidator.parse(request.body))

  update = (request: FastifyRequest) =>
    this.service.update(
      DataValidator.code(DataValidator.object(request.body).cn_categoria_produto),
      ProductCategoryValidator.parse(request.body),
    )
}
