import type { IManutItemOrder } from './order.js'

export interface IManutVenda {
  cn_pessoa: bigint
  cn_ordem_servico: bigint | null
  an_obs: string
  ca_chave_requisicao: string
  itens: IManutItemOrder[]
}

export interface IFiltroRelatorio {
  inicio: Date
  fim: Date
  ordem: 'asc' | 'desc'
}
