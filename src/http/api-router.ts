import { ApiResponse } from './api-response.js'

import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { AuthMiddleware } from '../middlewares/auth.middleware.js'
import type { TAccessRule } from '../interfaces/access.js'

type ApiHandler = (request: FastifyRequest) => unknown | Promise<unknown>

export class ApiRouter {
  constructor(
    private readonly app: FastifyInstance,
    private readonly auth: AuthMiddleware,
  ) {}

  post(path: string, handler: ApiHandler, access: readonly TAccessRule[] | null, status: 200 | 201 = 201) {
    this.app.post(path, {
      preHandler: this.auth.forAccess(access),
      handler: async (request, reply) => ApiResponse.success(reply, await handler(request), status),
    })
  }
}
