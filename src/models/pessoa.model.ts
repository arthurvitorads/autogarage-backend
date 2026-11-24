import type { CadEndereco, CadPessoa } from '@prisma/client'

export class PessoaModel {
  static paraResposta(
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
            cn_estado: pessoa.endereco.cn_estado?.toString() ?? null,
            cn_pessoa: pessoa.endereco.cn_pessoa.toString(),
          }
        : null,
    }
  }
}
