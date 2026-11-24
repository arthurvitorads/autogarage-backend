import type { FastifyRequest } from 'fastify'
import type { CategoriaServicoService } from '../services/categoria-servico.service.js'
import { CategoriaServicoValidator } from '../validators/categoria-servico.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class CategoriaServicoController {
  constructor(private readonly service: CategoriaServicoService) {}

  view = () => this.service.view()

  manutInc = (request: FastifyRequest) =>
    this.service.manutInc(CategoriaServicoValidator.parse(request.body))

  manutAlt = (request: FastifyRequest) =>
    this.service.manutAlt(
      DataValidator.code(DataValidator.object(request.body).cn_categoria_servico),
      CategoriaServicoValidator.parse(request.body),
    )
}
