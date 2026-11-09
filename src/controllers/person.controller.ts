import type { FastifyRequest } from 'fastify'

import type { PersonService } from '../services/person.service.js'

import { PaginationValidator } from '../validators/pagination.validator.js'
import { PersonValidator } from '../validators/person.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class PersonController {
  constructor(private readonly service: PersonService) {}

  paramList = () => this.service.paramList()
  findById = (request: FastifyRequest) =>
    this.service.findById(DataValidator.id(DataValidator.object(request.body).cn_pessoa))

  customer = (request: FastifyRequest) => {
    const { cn_pessoa, cn_ordem_servico } = DataValidator.object(request.body)
    const orderId = cn_ordem_servico === undefined ? undefined : DataValidator.id(cn_ordem_servico)
    return this.service.customer(DataValidator.id(cn_pessoa), orderId)
  }

  create = (request: FastifyRequest) => this.service.create(PersonValidator.parse(request.body))

  update = (request: FastifyRequest) =>
    this.service.update(
      DataValidator.id(DataValidator.object(request.body).cn_pessoa),
      PersonValidator.parse(request.body),
    )

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.list(page, limit, search)
  }
}
