import type { FaturamentoService } from './services/faturamento.service.js'
import { FaturamentoController } from './controllers/faturamento.controller.js'
import { FaturamentoRoutes } from './routes/faturamento.route.js'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'

import { AuthController } from './controllers/auth.controller.js'
import { UsuarioController } from './controllers/usuario.controller.js'
import { PerfilController } from './controllers/perfil.controller.js'
import { OrdemServicoController } from './controllers/ordem-servico.controller.js'
import { PessoaController } from './controllers/pessoa.controller.js'

import { AuthMiddleware } from './middlewares/auth.middleware.js'

import { ApiResponse } from './http/api-response.js'

import { ApiRouter } from './http/api-router.js'

import { AuthRoutes } from './routes/auth.route.js'
import { UsuarioRoutes } from './routes/usuario.route.js'
import { PerfilRoutes } from './routes/perfil.route.js'
import { OrdemServicoRoutes } from './routes/ordem-servico.route.js'
import { PessoaRoutes } from './routes/pessoa.route.js'
import { EnderecoRoutes } from './routes/endereco.route.js'
import { EnderecoController } from './controllers/endereco.controller.js'
import type { EnderecoService } from './services/endereco.service.js'

import type { AuthService } from './services/auth.service.js'
import type { UsuarioService } from './services/usuario.service.js'
import type { PerfilService } from './services/perfil.service.js'
import type { OrdemServicoService } from './services/ordem-servico.service.js'
import type { PessoaService } from './services/pessoa.service.js'
import type { CatalogoService } from './services/catalogo.service.js'
import { CatalogoController } from './controllers/catalogo.controller.js'
import { CatalogoRoutes } from './routes/catalogo.route.js'

export class Application {
  readonly server

  constructor(
    auth: AuthService,
    usuarios: UsuarioService,
    perfil: PerfilService,
    ordemServico: OrdemServicoService,
    pessoa: PessoaService,
    catalogo: CatalogoService,
    faturamento: FaturamentoService,
    endereco: EnderecoService,
    logger = true,
    rotasCadastro: readonly { register(router: ApiRouter): void }[] = [],
  ) {
    this.server = Fastify({ logger })
    this.server.setErrorHandler(ApiResponse.error)
    this.server.setNotFoundHandler((_request, reply) => {
      return ApiResponse.sendError(
        reply,
        404,
        'Erro inexperado ao executar o processo: Endpoint inválido ou inexistente.',
      )
    })
    this.server.register(cors, { origin: true })
    this.server.register(helmet)

    this.server.register(rateLimit, { global: false })
    this.server.register(async (server) => {
      const router = new ApiRouter(server, new AuthMiddleware(auth))

      new AuthRoutes(new AuthController(auth)).register(router)
      new UsuarioRoutes(new UsuarioController(usuarios)).register(router)
      new PerfilRoutes(new PerfilController(perfil)).register(router)
      new OrdemServicoRoutes(new OrdemServicoController(ordemServico)).register(router)
      new PessoaRoutes(new PessoaController(pessoa)).register(router)
      new EnderecoRoutes(new EnderecoController(endereco)).register(router)
      new CatalogoRoutes(new CatalogoController(catalogo)).register(router)
      for (const routes of rotasCadastro) routes.register(router)
      new FaturamentoRoutes(new FaturamentoController(faturamento)).register(router)
    })
  }
}
