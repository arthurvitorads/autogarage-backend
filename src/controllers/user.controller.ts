import type { FastifyRequest } from 'fastify'
import type { UserService } from '../services/user.service.js'
import { UserValidator } from '../validators/user.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'
import { ApiError } from '../interfaces/error.js'

export class UserController {
  constructor(private readonly service: UserService) {}

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.list(page, limit, search)
  }

  create = (request: FastifyRequest) => {
    return this.service.create(UserValidator.create(request.body), request.log)
  }

  update = (request: FastifyRequest) => {
    const { cn_usuario, ...values } = DataValidator.object(request.body)
    const id = UserValidator.id(cn_usuario)
    const user = UserValidator.update(values)
    if (
      request.session?.cn_usuario === id.toString() &&
      (!user.bo_sts_reg ||
        (user.cn_perfil !== undefined && user.cn_perfil?.toString() !== request.session.cn_perfil))
    )
      throw new ApiError(409, 'Sua própria conta precisa permanecer ativa e com o perfil atual.')
    return this.service.update(id, user, request.log)
  }
}
