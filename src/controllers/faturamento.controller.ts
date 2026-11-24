import type { FastifyRequest } from 'fastify'
import type { FaturamentoService } from '../services/faturamento.service.js'
import { FaturamentoValidator } from '../validators/faturamento.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { ApiError } from '../interfaces/error.js'

export class FaturamentoController {
  constructor(private readonly service: FaturamentoService) {}

  view = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)
    return this.service.view(page, limit, search)
  }

  detalhar = (request: FastifyRequest) =>
    this.service.detalhar(DataValidator.id(DataValidator.object(request.body).cn_venda))

  manutInc = (request: FastifyRequest) => {
    if (!request.firebaseUser?.uid) throw new ApiError(401, 'Usuário não autenticado.')
    return this.service.manutInc(FaturamentoValidator.manutInc(request.body), request.firebaseUser.uid)
  }
}
