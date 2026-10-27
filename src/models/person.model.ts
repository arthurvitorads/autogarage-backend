import type { CadPessoa } from "@prisma/client";

export class PersonModel {
  static toResponse(pessoa: CadPessoa) {
    return { 
      ...pessoa, 
      cn_pessoa: 
      pessoa.cn_pessoa.toString() 
    };
  }

  static toParamResponse(pessoa: {
    cn_pessoa: bigint
    an_descr: string
  }) {
    return {
      id: pessoa.cn_pessoa.toString(),
      an_descr: pessoa.an_descr,
    }
  }
}
