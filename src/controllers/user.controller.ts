import type { FastifyRequest } from 'fastify';
import type { UserService } from '../services/user.service.js';
import { UserValidator } from '../validators/user.validator.js';
import { PaginationValidator } from '../validators/pagination.validator.js';

export class UserController {
  constructor(private readonly service: UserService) {}

  list = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.query);
    return this.service.list(page, limit, search);
  };

  create = (request: FastifyRequest) => this.service.create(UserValidator.create(request.body), request.log);

  update = (request: FastifyRequest) => {
    const id = UserValidator.id((request.params as { id: string }).id);
    return this.service.update(id, UserValidator.update(request.body), request.log);
  };
}
