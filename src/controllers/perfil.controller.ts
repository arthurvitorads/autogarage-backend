import type { FastifyRequest } from 'fastify'

import type { PerfilService } from '../services/perfil.service.js'
import { PerfilValidator } from '../validators/perfil.validator.js'

import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class PerfilController {
  constructor(private readonly service: PerfilService) {}

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.list(page, limit, search)
  }

  paramList = () => {
    return this.service.paramList()
  }

  create = (request: FastifyRequest) => {
    return this.service.create(PerfilValidator.parse(request.body))
  }

  update = (request: FastifyRequest) => {
    const id = DataValidator.id(DataValidator.object(request.body).cn_perfil)

    return this.service.update(id, PerfilValidator.parse(request.body))
  }
}
