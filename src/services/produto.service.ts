import { ApiResponse } from '../http/api-response.js'
import type { ProdutoRepository } from '../repositories/produto.repository.js'
import type { IManutProduto } from '../interfaces/produto.js'
import { ProdutoModel } from '../models/produto.model.js'

export class ProdutoService {
  constructor(
    private readonly repository: Pick<
      ProdutoRepository,
      'view' | 'manutInc' | 'manutAlt'
    >,
  ) {}

  async view(page: number, limit: number, search: string) {
    const { produtos, total } = await this.repository.view(page, limit, search)

    return ApiResponse.page({
      dados: produtos.map(ProdutoModel.paraResposta),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async manutInc(values: IManutProduto) {
    return ProdutoModel.paraResposta(await this.repository.manutInc(values))
  }

  async manutAlt(id: number, values: IManutProduto) {
    return ProdutoModel.paraResposta(await this.repository.manutAlt(id, values))
  }
}
