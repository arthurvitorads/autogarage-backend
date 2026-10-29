export interface IUpdateUser {
  an_nome: string
  bo_sts_reg: boolean
  cn_perfil?: bigint | null
}

export interface ICreateUser {
  an_nome: string
  an_email: string
  ca_senha: string
  bo_sts_reg: boolean
  cn_perfil?: bigint | null
}
