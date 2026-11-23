import type { FastifyRequest } from 'fastify'
import type { ServiceCategoryService } from '../services/service-category.service.js'
import { ServiceCategoryValidator } from '../validators/service-category.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class ServiceCategoryController {
  constructor(private readonly service: ServiceCategoryService) {}

  list = () => this.service.list()

  create = (request: FastifyRequest) =>
    this.service.create(ServiceCategoryValidator.parse(request.body))

  update = (request: FastifyRequest) =>
    this.service.update(
      DataValidator.code(DataValidator.object(request.body).cn_categoria_servico),
      ServiceCategoryValidator.parse(request.body),
    )
}
