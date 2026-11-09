import type { FastifyRequest } from 'fastify'
import type { UserService } from '../services/user.service.js'
import { UserValidator } from '../validators/user.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

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
    return this.service.update(id, UserValidator.update(values), request.log)
  }
}
