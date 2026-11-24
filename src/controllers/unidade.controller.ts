import type { FastifyRequest } from 'fastify'
import type { UnidadeService } from '../services/unidade.service.js'
import { UnidadeValidator } from '../validators/unidade.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class UnidadeController {
  constructor(private readonly service: UnidadeService) {}

  view = () => this.service.view()

  manutInc = (request: FastifyRequest) => this.service.manutInc(UnidadeValidator.parse(request.body))

  manutAlt = (request: FastifyRequest) =>
    this.service.manutAlt(
      DataValidator.code(DataValidator.object(request.body).cn_unidade),
      UnidadeValidator.parse(request.body),
    )
}
