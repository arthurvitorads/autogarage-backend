import { ApiResponse } from '../http/api-response.js'
import type { IFaturamentoRepository } from '../repositories/faturamento.repository.js'
import type { IManutVenda } from '../interfaces/faturamento.js'
import { FaturamentoModel } from '../models/faturamento.model.js'
import { ApiError } from '../interfaces/error.js'

export class FaturamentoService {
  constructor(private readonly faturamento: IFaturamentoRepository) {}

  async list(page: number, limit: number, search: string) {
    const { vendas, total } = await this.faturamento.list(page, limit, search)
    return ApiResponse.page({
      dados: vendas.map(FaturamentoModel.toResponse),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async findById(id: bigint) {
    const venda = await this.faturamento.findById(id)
    if (!venda) throw new ApiError(404, 'Venda não encontrada.')
    return FaturamentoModel.toResponse(venda)
  }

  async create(values: IManutVenda, uid: string) {
    return FaturamentoModel.toResponse(await this.faturamento.create(values, uid))
  }
}
