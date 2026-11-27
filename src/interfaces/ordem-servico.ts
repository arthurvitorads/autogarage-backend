export type TStatusOrdemServico = 'ABERTO' | 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO'
export type TAcaoOrdemServico = 'INICIAR' | 'FINALIZAR' | 'CANCELAR'

export interface IFiltroOrdemServico {
  status?: TStatusOrdemServico[]
  classificacao?: bigint[]
  marca?: string[]
  modelo?: string[]
  inicio?: Date
  fim?: Date
  billable?: boolean
}

export interface IMovimentoOrdemServico {
  acao: TAcaoOrdemServico
  an_motivo_cancelamento: string
}

export interface IManutClassificacaoOrdemServico {
  an_descr: string
  ca_cor: string
}

export interface IManutOrdemServico {
  cn_pessoa: bigint
  cn_responsaveis?: bigint[]
  cn_classificacao_os: bigint
  dt_entrada: Date
  dt_previsao: Date | null
  an_placa: string
  an_marca: string
  an_modelo: string
  nu_ano: number | null
  an_cor: string
  qt_quilometragem: number | null
  an_solicitacao: string
  an_obs: string
  evidencias?: IManutEvidenciaOrdemServico[]
  descricoes_evidencias?: { cn_evidencia: bigint; an_descr: string }[]
}

export interface IManutEvidenciaOrdemServico {
  an_nome: string
  an_descr: string
  ca_mime: string
  bl_imagem: Uint8Array<ArrayBuffer>
}

export const MAX_ORDER_EVIDENCES = 5
export const MAX_ORDER_EVIDENCE_BYTES = 1024 * 1024

export interface IManutItemOrdemServico {
  ca_tipo: 'PRODUTO' | 'SERVICO'
  cn_produto: number | null
  cn_servico: number | null
  qt_quantidade: number
  vl_unitario: number
}
