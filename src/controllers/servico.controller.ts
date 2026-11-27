import type { FastifyRequest } from 'fastify'
import type { ServicoService } from '../services/servico.service.js'
import { ServicoValidator } from '../validators/servico.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class ServicoController {
  constructor(private readonly service: ServicoService) {}

  view = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.view(page, limit, search)
  }

  manutInc = (request: FastifyRequest) =>
    this.service.manutInc(ServicoValidator.parse(request.body))

  manutAlt = (request: FastifyRequest) =>
    this.service.manutAlt(
      DataValidator.code(DataValidator.object(request.body).cn_servico),
      ServicoValidator.parse(request.body),
    )
}
