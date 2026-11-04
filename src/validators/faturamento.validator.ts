import { ApiError } from '../interfaces/error.js'
import type { IManutVenda, IFiltroRelatorio } from '../interfaces/faturamento.js'
import { DataValidator } from './data.validator.js'
import { OrderValidator } from './order.validator.js'

export class FaturamentoValidator {
  static create(body: unknown): IManutVenda {
    const data = DataValidator.object(body)
    const ordem = data.cn_ordem_servico == null ? null : DataValidator.id(data.cn_ordem_servico)
    const chave = DataValidator.text(data.ca_chave_requisicao, 'a chave da requisição')
    if (!/^[a-f0-9-]{36}$/i.test(chave))
      throw new ApiError(400, 'Chave da requisição inválida.')
    if (ordem && data.itens !== undefined && (!Array.isArray(data.itens) || data.itens.length))
      throw new ApiError(400, 'Os itens da venda por O.S. são definidos pela ordem.')
    if (!ordem && (!Array.isArray(data.itens) || !data.itens.length || data.itens.length > 200))
      throw new ApiError(400, 'Informe entre 1 e 200 itens para a venda.')
    return {
      cn_pessoa: DataValidator.id(data.cn_pessoa), cn_ordem_servico: ordem,
      an_obs: DataValidator.text(data.an_obs, 'a observação', false), ca_chave_requisicao: chave,
      itens: ordem ? [] : (data.itens as unknown[]).map(item => OrderValidator.item(item)),
    }
  }

  static filters(query: unknown): IFiltroRelatorio {
    const data = DataValidator.object(query ?? {})
    const inicio = new Date(DataValidator.text(data.inicio, 'a data inicial'))
    const fim = new Date(DataValidator.text(data.fim, 'a data final'))
    if (!Number.isFinite(inicio.getTime()) || !Number.isFinite(fim.getTime()) || inicio > fim)
      throw new ApiError(400, 'Período inválido.')
    if (data.ordem !== undefined && data.ordem !== 'asc' && data.ordem !== 'desc')
      throw new ApiError(400, 'Ordenação inválida.')
    return { inicio, fim, ordem: data.ordem === 'asc' ? 'asc' : 'desc' }
  }
}
