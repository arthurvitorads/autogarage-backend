import type { CadEndereco, CadPessoa } from '@prisma/client'

export class PersonModel {
  static toResponse(pessoa: CadPessoa & {
    endereco?: CadEndereco | null
  }) {
    return {
      ...pessoa,
      cn_pessoa: pessoa.cn_pessoa.toString(),
      nm_comissao_percentual: Number(pessoa.nm_comissao_percentual ?? 0),
      endereco: pessoa.endereco ? {
        ...pessoa.endereco,
        cn_endereco: pessoa.endereco.cn_endereco.toString(),
        cn_pessoa: pessoa.endereco.cn_pessoa.toString(),
      } : null,
    }
  }
}
