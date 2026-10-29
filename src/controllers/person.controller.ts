import type { FastifyRequest } from 'fastify'

import type { PersonService } from '../services/person.service.js'

import { PaginationValidator } from '../validators/pagination.validator.js'
import { PersonValidator } from '../validators/person.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class PersonController {
  constructor(private readonly service: PersonService) {}

  paramList = () => this.service.paramList()

  create = (request: FastifyRequest) => this.service.create(PersonValidator.parse(request.body))

  update = (request: FastifyRequest) => this.service.update(
    DataValidator.id((request.params as {
      id: string
    }).id), PersonValidator.parse(request.body),
  )

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.query)

    return this.service.list(page, limit, search)
  }
}
