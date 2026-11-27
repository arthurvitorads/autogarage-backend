import type { FastifyRequest } from 'fastify'
import type { ProdutoService } from '../services/produto.service.js'
import { ProdutoValidator } from '../validators/produto.validator.js'
import { DataValidator } from '../validators/data.validator.js'
import { PaginationValidator } from '../validators/pagination.validator.js'

export class ProdutoController {
  constructor(private readonly service: ProdutoService) {}

  view = (request: FastifyRequest) => {
    const { page, limit, search } = PaginationValidator.parse(request.body)

    return this.service.view(page, limit, search)
  }

  manutInc = (request: FastifyRequest) =>
    this.service.manutInc(ProdutoValidator.parse(request.body))

  manutAlt = (request: FastifyRequest) =>
    this.service.manutAlt(
      DataValidator.code(DataValidator.object(request.body).cn_produto),
      ProdutoValidator.parse(request.body),
    )
}
