import type { FastifyRequest } from 'fastify'

import type { PerfilService } from '../services/perfil.service.js'
import { PerfilValidator } from '../validators/perfil.validator.js'

import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'
import { ApiError } from '../interfaces/error.js'

export class PerfilController {
  constructor(private readonly service: PerfilService) {}

  access = (request: FastifyRequest) =>
    this.service.access(DataValidator.id(DataValidator.object(request.body).cn_perfil))

  saveAccess = (request: FastifyRequest) => {
    const { id, levels } = PerfilValidator.access(request.body)
    if (request.session?.cn_perfil === id.toString() && levels.ADMINISTRACAO !== 1)
      throw new ApiError(409, 'Seu próprio perfil precisa manter acesso total à Administração.')
    return this.service.saveAccess(id, levels)
  }

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

    const values = PerfilValidator.parse(request.body)
    if (request.session?.cn_perfil === id.toString() && !values.bo_sts_reg)
      throw new ApiError(409, 'Seu próprio perfil precisa permanecer ativo.')
    return this.service.update(id, values)
  }
}
