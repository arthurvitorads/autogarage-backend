import { ApiResponse } from './api-response.js'

import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { AuthMiddleware } from '../middlewares/auth.middleware.js'

type ApiHandler = (request: FastifyRequest) => unknown | Promise<unknown>

export class ApiRouter {
  constructor(
    private readonly app: FastifyInstance,
    private readonly auth: AuthMiddleware,
  ) {}

  post(path: string, handler: ApiHandler, status: 200 | 201 = 201) {
    this.app.post(path, {
      preHandler: this.auth.handle,
      handler: async (request, reply) => ApiResponse.success(reply, await handler(request), status),
    })
  }
}
