export interface IManutProduto {
  an_nome: string
  an_referencia: string
  an_categoria: string
  an_marca: string
  ca_unidade: string
  vl_custo: number
  vl_venda: number
  qt_estoque: number
  qt_estoque_min: number
  an_obs: string
  bo_sts_reg: boolean
}

export interface IManutServico {
  an_nome: string
  an_categoria: string
  vl_preco: number
  nu_tempo_estimado: number | null
  an_obs: string
  bo_sts_reg: boolean
}

export interface IManutCadastroAuxiliar {
  ca_tipo: 'CATEGORIA_PRODUTO' | 'CATEGORIA_SERVICO' | 'MARCA' | 'UNIDADE'
  an_descr: string
  ca_sigla: string
}
