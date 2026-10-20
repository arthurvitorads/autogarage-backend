import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'

import { AuthController } from './controllers/auth.controller.js'
import { UserController } from './controllers/user.controller.js'

import { AuthMiddleware } from './middlewares/auth.middleware.js'

import { ApiResponse } from './http/api-response.js'

import { ApiRouter } from './http/api-router.js'

import { AuthRoutes } from './routes/auth.route.js'
import { UserRoutes } from './routes/user.route.js'

import type { AuthService } from './services/auth.service.js'
import type { UserService } from './services/user.service.js'

export class Application {
  readonly server

  constructor(
    auth: AuthService,
    users: UserService,
    logger = true
  ) {
    this.server = Fastify({ logger })

    this.server.setErrorHandler(ApiResponse.error)

    this.server.setNotFoundHandler((_request, reply) => {
      return reply.code(404).send(
        {
          sucesso: false,
          code: 404,
          erro: 'Erro inexperado ao executar o processo: Endpoint inválido ou inexistente.'
        }
      )
    })

    this.server.register(cors, { origin: true })

    this.server.register(helmet)

    //rateLimit
    this.server.register(rateLimit, { max: 8, timeWindow: 30_000 })

    this.server.register(async (server) => {
      const router = new ApiRouter(server, new AuthMiddleware(auth))

      new AuthRoutes(new AuthController(auth)).register(router)
      new UserRoutes(new UserController(users)).register(router)
    })
  }
}
