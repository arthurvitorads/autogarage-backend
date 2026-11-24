import type { FastifyRequest } from 'fastify'
import type { CategoriaProdutoService } from '../services/categoria-produto.service.js'
import { CategoriaProdutoValidator } from '../validators/categoria-produto.validator.js'
import { DataValidator } from '../validators/data.validator.js'

export class CategoriaProdutoController {
  constructor(private readonly service: CategoriaProdutoService) {}

  view = () => this.service.view()

  manutInc = (request: FastifyRequest) =>
    this.service.manutInc(CategoriaProdutoValidator.parse(request.body))

  manutAlt = (request: FastifyRequest) =>
    this.service.manutAlt(
      DataValidator.code(DataValidator.object(request.body).cn_categoria_produto),
      CategoriaProdutoValidator.parse(request.body),
    )
}
