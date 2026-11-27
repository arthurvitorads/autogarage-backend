import type { IManutItemOrdemServico } from './ordem-servico.js'

export interface IManutVenda {
  cn_pessoa: bigint
  cn_ordem: bigint | null
  an_obs: string
  ca_chave_requisicao: string
  itens: IManutItemOrdemServico[]
}
