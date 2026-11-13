import { ApiResponse } from './api-response.js'

import type { FastifyContextConfig, FastifyInstance, FastifyRequest } from 'fastify'
import type { AuthMiddleware } from '../middlewares/auth.middleware.js'
import type { TAccessRule } from '../interfaces/access.js'

type TApiHandler = (request: FastifyRequest) => unknown

export class ApiRouter {
  constructor(
    private readonly app: FastifyInstance,
    private readonly auth: AuthMiddleware,
  ) {}

  post(
    path: string,
    handler: TApiHandler,
    access: readonly TAccessRule[] | null,
    status: 200 | 201 = 201,
    config?: FastifyContextConfig,
  ) {
    this.app.post(path, {
      ...(config ? { config } : {}),
      preHandler: this.auth.forAccess(access),
      handler: async (request, reply) => reply.code(status).send(ApiResponse.success(await handler(request))),
    })
  }
}
