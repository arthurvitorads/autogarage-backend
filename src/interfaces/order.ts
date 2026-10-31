export type TStatusOrder = 'ABERTO' | 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO'
export type TAcaoOrder = 'INICIAR' | 'FINALIZAR' | 'CANCELAR'

export interface IFiltroOrder {
  status?: TStatusOrder
  classificacao?: bigint
  inicio?: Date
  fim?: Date
}

export interface IMovimentoOrder {
  acao: TAcaoOrder
  an_motivo_cancelamento: string
}

export interface IManutClassificacaoOrder {
  an_descr: string
  ca_cor: string
  bo_padrao: boolean
}

export interface IManutOrder {
  cn_pessoa: bigint
  cn_classificacao_os: bigint
  dt_entrada: Date
  dt_previsao: Date | null
  an_responsavel: string
  an_placa: string
  an_marca: string
  an_modelo: string
  nu_ano: number | null
  an_cor: string
  qt_quilometragem: number | null
  an_solicitacao: string
  an_obs: string
}

export interface IManutItemOrder {
  ca_tipo: 'PRODUTO' | 'SERVICO'
  cn_produto: number | null
  cn_servico: number | null
  qt_quantidade: number
  vl_unitario: number
}
