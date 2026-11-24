import type { FastifyRequest } from 'fastify'
import type { MarcaService } from '../services/marca.service.js'
import { MarcaValidator } from '../validators/marca.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class MarcaController {
  constructor(private readonly service: MarcaService) {}

  view = () => this.service.view()

  manutInc = (request: FastifyRequest) => this.service.manutInc(MarcaValidator.parse(request.body))

  manutAlt = (request: FastifyRequest) =>
    this.service.manutAlt(
      DataValidator.code(DataValidator.object(request.body).cn_marca),
      MarcaValidator.parse(request.body),
    )
}
