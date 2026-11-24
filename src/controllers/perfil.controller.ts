import type { FastifyRequest } from 'fastify'

import type { PerfilService } from '../services/perfil.service.js'
import { PerfilValidator } from '../validators/perfil.validator.js'

import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'
import { ApiError } from '../interfaces/error.js'

export class PerfilController {
  constructor(private readonly service: PerfilService) {}

  consultarAcessos = (request: FastifyRequest) =>
    this.service.consultarAcessos(DataValidator.id(DataValidator.object(request.body).cn_perfil))

  manutAcessos = (request: FastifyRequest) => {
    const { id, levels } = PerfilValidator.access(request.body)
    if (request.session?.cn_perfil === id.toString() && levels.ADMINISTRACAO !== 1)
      throw new ApiError(409, 'Seu próprio perfil precisa manter acesso total à Administração.')
    return this.service.manutAcessos(id, levels)
  }

  view = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.view(page, limit, search)
  }

  domain = () => {
    return this.service.domain()
  }

  manutInc = (request: FastifyRequest) => {
    return this.service.manutInc(PerfilValidator.parse(request.body))
  }

  manutAlt = (request: FastifyRequest) => {
    const id = DataValidator.id(DataValidator.object(request.body).cn_perfil)

    const values = PerfilValidator.parse(request.body)
    if (request.session?.cn_perfil === id.toString() && !values.bo_sts_reg)
      throw new ApiError(409, 'Seu próprio perfil precisa permanecer ativo.')
    return this.service.manutAlt(id, values)
  }
}
