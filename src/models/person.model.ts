import type { CadEndereco, CadPessoa } from '@prisma/client'

export class PersonModel {
  static toResponse(
    pessoa: CadPessoa & {
      endereco?: CadEndereco | null
    },
  ) {
    return {
      ...pessoa,
      cn_pessoa: pessoa.cn_pessoa.toString(),
      nm_comissao_func: Number(pessoa.nm_comissao_func ?? 0),
      endereco: pessoa.endereco
        ? {
            ...pessoa.endereco,
            cn_endereco: pessoa.endereco.cn_endereco.toString(),
            cn_pessoa: pessoa.endereco.cn_pessoa.toString(),
          }
        : null,
    }
  }

  static toListResponse(pessoa: Parameters<typeof PersonModel.toResponse>[0]) {
    const fisica = pessoa.ca_tipo === 'PF'
    const cpf = pessoa.ca_cpf?.replace(/\D/g, '') ?? ''
    const cnpj = pessoa.ca_cnpj?.replace(/[^a-z\d]/gi, '').toUpperCase() ?? ''
    const telefone = pessoa.an_telefone?.replace(/\D/g, '') ?? ''
    const categorias = [
      pessoa.bo_categ_cliente ? 'Cliente' : '',
      pessoa.bo_categ_func ? 'Funcionário' : '',
    ].filter(Boolean)
    const dateOptions = { timeZone: 'America/Sao_Paulo' }

    return {
      ...PersonModel.toResponse(pessoa),
      nome: (fisica ? pessoa.an_nome : pessoa.an_razao_social) ?? '',
      tipo: fisica ? 'Física' : 'Jurídica',
      documento: fisica
        ? cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
        : cnpj.replace(/^([A-Z\d]{2})([A-Z\d]{3})([A-Z\d]{3})([A-Z\d]{4})(\d{2})$/, '$1.$2.$3/$4-$5'),
      telefone: /^(\d{10}|\d{11})$/.test(telefone)
        ? telefone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
        : pessoa.an_telefone ?? '',
      categorias: categorias.join(', '),
      status: pessoa.bo_sts_reg ? 'Ativo' : 'Inativo',
      inclusao: pessoa.dt_inc?.toLocaleString('pt-BR', dateOptions) ?? '',
      alteracao: pessoa.dt_alt?.toLocaleString('pt-BR', dateOptions) ?? '',
    }
  }
}
