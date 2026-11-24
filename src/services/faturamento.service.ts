import { ApiResponse } from '../http/api-response.js'
import type { IFaturamentoRepository } from '../repositories/faturamento.repository.js'
import type { IManutVenda } from '../interfaces/faturamento.js'
import { FaturamentoModel } from '../models/faturamento.model.js'
import { ApiError } from '../interfaces/error.js'

export class FaturamentoService {
  constructor(private readonly faturamento: IFaturamentoRepository) {}

  async view(page: number, limit: number, search: string) {
    const { vendas, total } = await this.faturamento.view(page, limit, search)
    return ApiResponse.page({
      dados: vendas.map(FaturamentoModel.paraResposta),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async detalhar(id: bigint) {
    const venda = await this.faturamento.detalhar(id)
    if (!venda) throw new ApiError(404, 'Venda não encontrada.')
    return FaturamentoModel.paraResposta(venda)
  }

  async manutInc(values: IManutVenda, uid: string) {
    return FaturamentoModel.paraResposta(await this.faturamento.manutInc(values, uid))
  }
}
