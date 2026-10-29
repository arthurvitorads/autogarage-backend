import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'

import { AuthController } from './controllers/auth.controller.js'
import { UserController } from './controllers/user.controller.js'
import { PerfilController } from './controllers/perfil.controller.js'
import { OrderController } from './controllers/order.controller.js'
import { PersonController } from './controllers/person.controller.js'

import { AuthMiddleware } from './middlewares/auth.middleware.js'

import { ApiResponse } from './http/api-response.js'

import { ApiRouter } from './http/api-router.js'

import { AuthRoutes } from './routes/auth.route.js'
import { UserRoutes } from './routes/user.route.js'
import { PerfilRoutes } from './routes/perfil.route.js'
import { OrderRoutes } from './routes/order.route.js'
import { PersonRoutes } from './routes/person.route.js'

import type { AuthService } from './services/auth.service.js'
import type { UserService } from './services/user.service.js'
import type { PerfilService } from './services/perfil.service.js'
import type { OrderService } from './services/order.service.js'
import type { PersonService } from './services/person.service.js'
import type { CatalogService } from './services/catalog.service.js'
import { CatalogController } from './controllers/catalog.controller.js'
import { CatalogRoutes } from './routes/catalog.route.js'

export class Application {
  readonly server

  constructor(
    auth: AuthService,
    users: UserService,
    perfil: PerfilService,
    order: OrderService,
    person: PersonService,
    catalog: CatalogService,
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
    this.server.register(rateLimit, { max: 80, timeWindow: 30_000 })
    this.server.register(async (server) => {
      const router = new ApiRouter(server, new AuthMiddleware(auth))

      new AuthRoutes(new AuthController(auth)).register(router)
      new UserRoutes(new UserController(users)).register(router)
      new PerfilRoutes(new PerfilController(perfil)).register(router)
      new OrderRoutes(new OrderController(order)).register(router)
      new PersonRoutes(new PersonController(person)).register(router)
      new CatalogRoutes(new CatalogController(catalog)).register(router)
    })
  }
}
