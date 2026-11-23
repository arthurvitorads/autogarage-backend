import type { FastifyRequest } from 'fastify'
import type { ServiceService } from '../services/service.service.js'
import { ServiceValidator } from '../validators/service.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.list(page, limit, search)
  }

  create = (request: FastifyRequest) => this.service.create(ServiceValidator.parse(request.body))

  update = (request: FastifyRequest) =>
    this.service.update(
      DataValidator.code(DataValidator.object(request.body).cn_servico),
      ServiceValidator.parse(request.body),
    )
}
