import type { FastifyRequest } from 'fastify'
import type { RelatorioService } from '../services/relatorio.service.js'
import { PaginationValidator } from '../validators/pagination.validator.js'
import { FaturamentoValidator } from '../validators/faturamento.validator.js'

export class RelatorioController {
  constructor(private readonly service: RelatorioService) {}

  tempos = (request: FastifyRequest) => {
    const { page, limit } = PaginationValidator.parse(request.query)
    return this.service.tempos(page, limit, FaturamentoValidator.filters(request.query))
  }

  vendas = (request: FastifyRequest) => {
    const { page, limit } = PaginationValidator.parse(request.query)
    return this.service.vendas(page, limit, FaturamentoValidator.filters(request.query))
  }
}
