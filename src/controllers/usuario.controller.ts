import type { FastifyRequest } from 'fastify'
import type { UsuarioService } from '../services/usuario.service.js'
import { UsuarioValidator } from '../validators/usuario.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'
import { ApiError } from '../interfaces/error.js'

export class UsuarioController {
  constructor(private readonly service: UsuarioService) {}

  view = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.view(page, limit, search)
  }

  manutInc = (request: FastifyRequest) => {
    return this.service.manutInc(UsuarioValidator.manutInc(request.body), request.log)
  }

  manutAlt = (request: FastifyRequest) => {
    const { cn_usuario, ...values } = DataValidator.object(request.body)
    const id = UsuarioValidator.id(cn_usuario)
    const user = UsuarioValidator.manutAlt(values)
    if (
      request.session?.cn_usuario === id.toString() &&
      (!user.bo_sts_reg ||
        (user.cn_perfil !== undefined && user.cn_perfil?.toString() !== request.session.cn_perfil))
    )
      throw new ApiError(409, 'Sua própria conta precisa permanecer ativa e com o perfil atual.')
    return this.service.manutAlt(id, user, request.log)
  }
}
