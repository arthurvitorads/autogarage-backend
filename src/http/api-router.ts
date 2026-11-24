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
    status: 200 | 201 | ((request: FastifyRequest) => 200 | 201) = 201,
    config?: FastifyContextConfig,
    bodyLimit?: number,
  ) {
    this.app.post(path, {
      ...(config ? { config } : {}),
      ...(bodyLimit === undefined ? {} : { bodyLimit }),
      preHandler: this.auth.forAccess(access),
      handler: async (request, reply) => {
        const statusCode = typeof status === 'function' ? status(request) : status
        return reply.code(statusCode).send(ApiResponse.success(await handler(request)))
      },
    })
  }

  manut(
    path: string,
    chave: string,
    inc: TApiHandler,
    alt: TApiHandler,
    acesso: readonly TAccessRule[],
    bodyLimit?: number,
  ) {
    const isAlteracao = ({ body }: FastifyRequest) =>
      body !== null && typeof body === 'object' && Object.hasOwn(body, chave)

    this.post(
      path,
      (request) => (isAlteracao(request) ? alt(request) : inc(request)),
      acesso,
      (request) => (isAlteracao(request) ? 200 : 201),
      undefined,
      bodyLimit,
    )
  }
}
