import type { FastifyRequest } from 'fastify'

import type { PersonService } from '../services/person.service.js'

import { PaginationValidator } from '../validators/pagination.validator.js'

export class PersonController {
  constructor(private readonly service: PersonService) {}

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.query)

    return this.service.list(page, limit, search)
  }
}
