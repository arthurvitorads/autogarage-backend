import type { FastifyRequest } from 'fastify'

import type { PerfilService } from '../services/perfil.service.js'
import type { IManutPerfil } from '../interfaces/perfil.js'

import { UserValidator } from '../validators/user.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class PerfilController {
  constructor(private readonly service: PerfilService) {}

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.query)

    return this.service.list(page, limit, search)
  }

  paramList = () => {
    return this.service.paramList()
  }

  create = (request: FastifyRequest) => {
    this.service.create(request.body as IManutPerfil)
  }

  update = (request: FastifyRequest) => {
    const id = UserValidator.id((request.params as { id: string }).id)

    return this.service.update(id, request.body as IManutPerfil)
  }
}
