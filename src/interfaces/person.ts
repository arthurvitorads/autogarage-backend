export interface IManutEndereco {
  ca_cep: string
  an_logradouro: string
  an_numero: string
  an_complemento: string
  an_bairro: string
  an_cidade: string
  ca_uf: string
}

export interface IManutPerson {
  ca_tipo: 'PF' | 'PJ'
  an_nome: string | null
  ca_cpf: string | null
  ca_cnpj: string | null
  an_razao_social: string | null
  an_nome_fantasia: string | null
  an_email: string
  an_telefone: string
  bo_categ_cliente: boolean
  bo_categ_func: boolean
  an_cargo: string
  nm_comissao_percentual: number
  bo_sts_reg: boolean
  endereco: IManutEndereco
}
